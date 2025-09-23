const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.logToFile = options.logToFile || false;
    this.logDir = options.logDir || './logs';
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    if (this.logToFile && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  writeToFile(level, message, meta) {
    if (!this.logToFile) return;

    const logFile = path.join(this.logDir, `${level}.log`);
    const formattedMessage = this.formatMessage(level, message, meta) + '\n';

    try {
      fs.appendFileSync(logFile, formattedMessage);
      this.rotateLogFile(logFile);
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  rotateLogFile(logFile) {
    try {
      const stats = fs.statSync(logFile);
      if (stats.size > this.maxFileSize) {
        for (let i = this.maxFiles - 1; i > 0; i--) {
          const oldFile = `${logFile}.${i}`;
          const newFile = `${logFile}.${i + 1}`;
          if (fs.existsSync(oldFile)) {
            fs.renameSync(oldFile, newFile);
          }
        }
        fs.renameSync(logFile, `${logFile}.1`);
      }
    } catch (error) {
      console.error('Error rotating log file:', error);
    }
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    switch (level) {
      case 'error':
        console.error(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'debug':
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
    this.writeToFile(level, message, meta);
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }
  webhook(event, payload, result) {
    this.info(`Webhook ${event} processed`, {
      event,
      success: result.success,
      repository: payload.repository?.full_name,
      action: payload.action
    });
  }

  command(command, args, result) {
    this.info(`Command ${command} executed`, {
      command,
      args,
      success: result.success
    });
  }

  api(method, url, statusCode, responseTime) {
    this.info(`API ${method} ${url}`, {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`
    });
  }
  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.api(req.method, req.url, res.statusCode, duration);
      });
      
      next();
    };
  }
}

module.exports = Logger;
