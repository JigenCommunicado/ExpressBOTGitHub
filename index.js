const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Импорт наших модулей
const GitHubAPI = require('./src/github');
const BotCommands = require('./src/botCommands');
const WebhookHandler = require('./src/webhookHandler');
const Logger = require('./src/logger');
const AdminManager = require('./src/admin');
const AdminCommands = require('./src/adminCommands');

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
const adminManager = new AdminManager();
const adminCommands = new AdminCommands(adminManager);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger.middleware());

// Статические файлы
app.use(express.static('public'));

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

// ==================== АДМИН API ====================

// Middleware для проверки админ сессии
const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Требуется авторизация' });
  }

  const sessionId = authHeader.substring(7);
  const session = adminManager.validateSession(sessionId);
  
  if (!session.valid) {
    return res.status(401).json({ success: false, message: session.message });
  }

  req.adminSession = session.session;
  next();
};

// Админ аутентификация
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Необходимы username и password' });
    }

    const result = await adminManager.authenticate(username, password);
    logger.info('Admin login attempt', { username, success: result.success });
    
    res.json(result);
  } catch (error) {
    logger.error('Admin login error', { error: error.message });
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Выход из админ системы
app.post('/api/admin/logout', requireAdminAuth, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const sessionId = authHeader.substring(7);
    
    const result = adminManager.logout(sessionId);
    logger.info('Admin logout', { admin_id: req.adminSession.admin_id });
    
    res.json(result);
  } catch (error) {
    logger.error('Admin logout error', { error: error.message });
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Статистика системы
app.get('/api/admin/stats', requireAdminAuth, async (req, res) => {
  try {
    const stats = await adminManager.getSystemStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Admin stats error', { error: error.message });
    res.status(500).json({ success: false, message: 'Ошибка получения статистики' });
  }
});

// Получение пользователей
app.get('/api/admin/users', requireAdminAuth, async (req, res) => {
  try {
    const users = adminManager.getAllUsers();
    res.json({ success: true, data: { users, total: users.length } });
  } catch (error) {
    logger.error('Admin users error', { error: error.message });
    res.status(500).json({ success: false, message: 'Ошибка получения пользователей' });
  }
});

// Получение администраторов
app.get('/api/admin/admins', requireAdminAuth, async (req, res) => {
  try {
    const admins = adminManager.getAllAdmins();
    res.json({ success: true, data: { admins, total: admins.length } });
  } catch (error) {
    logger.error('Admin admins error', { error: error.message });
    res.status(500).json({ success: false, message: 'Ошибка получения администраторов' });
  }
});

// Получение логов аудита
app.get('/api/admin/logs', requireAdminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await adminManager.getAuditLogs(limit);
    res.json({ success: true, data: { logs, total: logs.length } });
  } catch (error) {
    logger.error('Admin logs error', { error: error.message });
    res.status(500).json({ success: false, message: 'Ошибка получения логов' });
  }
});

// Получение активных сессий
app.get('/api/admin/sessions', requireAdminAuth, async (req, res) => {
  try {
    const sessions = Array.from(adminManager.sessions.values());
    res.json({ success: true, data: { sessions, total: sessions.length } });
  } catch (error) {
    logger.error('Admin sessions error', { error: error.message });
    res.status(500).json({ success: false, message: 'Ошибка получения сессий' });
  }
});

// Выполнение админ команд
app.post('/api/admin/command', requireAdminAuth, async (req, res) => {
  try {
    const { command, args } = req.body;
    
    if (!command) {
      return res.status(400).json({ success: false, message: 'Команда обязательна' });
    }

    const context = { session: req.headers.authorization.substring(7) };
    const result = await adminCommands.processCommand(command, args, context);
    
    logger.command(`admin.${command}`, args, result);
    res.json(result);
  } catch (error) {
    logger.error('Admin command error', { error: error.message, command: req.body.command });
    res.status(500).json({ success: false, message: 'Ошибка выполнения команды' });
  }
});

// Создание пользователя
app.post('/api/admin/user', requireAdminAuth, async (req, res) => {
  try {
    const { username, email, role } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ success: false, message: 'Необходимы username и email' });
    }

    const result = await adminManager.createUser({ username, email, role });
    res.json(result);
  } catch (error) {
    logger.error('Admin create user error', { error: error.message });
    res.status(500).json({ success: false, message: 'Ошибка создания пользователя' });
  }
});

// Обновление пользователя
app.put('/api/admin/user/:userId', requireAdminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    const result = await adminManager.updateUser(userId, updateData);
    res.json(result);
  } catch (error) {
    logger.error('Admin update user error', { error: error.message });
    res.status(500).json({ success: false, message: 'Ошибка обновления пользователя' });
  }
});

// Удаление пользователя
app.delete('/api/admin/user/:userId', requireAdminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await adminManager.deleteUser(userId);
    res.json(result);
  } catch (error) {
    logger.error('Admin delete user error', { error: error.message });
    res.status(500).json({ success: false, message: 'Ошибка удаления пользователя' });
  }
});

// Создание администратора
app.post('/api/admin/admin', requireAdminAuth, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Необходимы username, email и password' });
    }

    const result = await adminManager.createAdmin({ username, email, password, role }, req.adminSession.role);
    res.json(result);
  } catch (error) {
    logger.error('Admin create admin error', { error: error.message });
    res.status(500).json({ success: false, message: 'Ошибка создания администратора' });
  }
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
  console.log(`🔐 Admin panel: http://localhost:${PORT}/admin.html`);
  console.log(`👨‍💼 Admin API: http://localhost:${PORT}/api/admin/*`);
  console.log(`\n🔑 Default admin credentials:`);
  console.log(`   Username: admin`);
  console.log(`   Password: admin123`);
});

module.exports = app;
