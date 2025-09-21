const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Импорт наших модулей
const GitHubAPI = require('./src/github');
const BotCommands = require('./src/botCommands');
const WebhookHandler = require('./src/webhookHandler');
const Logger = require('./src/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Инициализация компонентов
const logger = new Logger({
  level: process.env.LOG_LEVEL || 'info',
  logToFile: process.env.LOG_TO_FILE === 'true',
  logDir: './logs'
});

const githubAPI = new GitHubAPI(process.env.GITHUB_TOKEN);
const botCommands = new BotCommands(githubAPI);
const webhookHandler = new WebhookHandler(githubAPI, botCommands);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger.middleware());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'ExpressBOT GitHub API Server',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// GitHub webhook endpoint
app.post('/webhook/github', async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const event = req.headers['x-github-event'];
    
    // Валидация подписи если настроен секрет
    if (process.env.GITHUB_WEBHOOK_SECRET) {
      const payload = JSON.stringify(req.body);
      if (!webhookHandler.validateSignature(payload, signature, process.env.GITHUB_WEBHOOK_SECRET)) {
        logger.warn('Invalid webhook signature', { signature, event });
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }
    
    // Обработка webhook события
    const result = await webhookHandler.handleWebhook(event, req.body);
    logger.webhook(event, req.body, result);
    
    res.status(200).json({ 
      message: 'Webhook processed successfully',
      event,
      result
    });
  } catch (error) {
    logger.error('Webhook processing error', { error: error.message, event: req.headers['x-github-event'] });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// API для команд бота
app.post('/api/command', async (req, res) => {
  try {
    const { command, args, context } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    const result = await botCommands.processCommand(command, args, context);
    logger.command(command, args, result);
    
    res.json(result);
  } catch (error) {
    logger.error('Command processing error', { error: error.message, command: req.body.command });
    res.status(500).json({ error: 'Command processing failed' });
  }
});

// API для получения информации о пользователе
app.get('/api/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await githubAPI.getUser(username);
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('User fetch error', { error: error.message, username: req.params.username });
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

// API для получения репозиториев пользователя
app.get('/api/user/:username/repos', async (req, res) => {
  try {
    const { username } = req.params;
    const { sort = 'updated', per_page = 30, page = 1 } = req.query;
    
    const repos = await githubAPI.getUserRepos(username, { sort, per_page: parseInt(per_page), page: parseInt(page) });
    res.json({ success: true, data: repos });
  } catch (error) {
    logger.error('User repos fetch error', { error: error.message, username: req.params.username });
    res.status(500).json({ error: 'Failed to fetch user repositories' });
  }
});

// API для получения информации о репозитории
app.get('/api/repo/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repoData = await githubAPI.getRepo(owner, repo);
    res.json({ success: true, data: repoData });
  } catch (error) {
    logger.error('Repo fetch error', { error: error.message, owner: req.params.owner, repo: req.params.repo });
    res.status(500).json({ error: 'Failed to fetch repository information' });
  }
});

// API для получения списка команд
app.get('/api/commands', (req, res) => {
  const commands = botCommands.getAvailableCommands();
  res.json({ 
    success: true, 
    data: { 
      commands,
      count: commands.length 
    } 
  });
});

// API для получения поддерживаемых webhook событий
app.get('/api/webhook/events', (req, res) => {
  const events = webhookHandler.getSupportedEvents();
  res.json({ 
    success: true, 
    data: { 
      events,
      count: events.length 
    } 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Route not found', { url: req.url, method: req.method });
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info('ExpressBOT server started', { 
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
  console.log(`🚀 ExpressBOT server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 GitHub webhook: http://localhost:${PORT}/webhook/github`);
  console.log(`🤖 Bot commands: http://localhost:${PORT}/api/commands`);
  console.log(`👤 User API: http://localhost:${PORT}/api/user/:username`);
  console.log(`📚 Repo API: http://localhost:${PORT}/api/repo/:owner/:repo`);
});

module.exports = app;
