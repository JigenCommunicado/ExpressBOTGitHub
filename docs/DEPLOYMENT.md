# 🚀 Руководство по развертыванию ExpressBOT

[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
[![PM2](https://img.shields.io/badge/PM2-Ready-green.svg)](https://pm2.keymetrics.io/)
[![Express.ms](https://img.shields.io/badge/Express.ms-Integrated-orange.svg)](https://express.ms/)

> Полное руководство по развертыванию системы ExpressBOT в различных средах

## 📋 Содержание

- [Предварительные требования](#-предварительные-требования)
- [Подготовка к развертыванию](#-подготовка-к-развертыванию)
- [Варианты развертывания](#-варианты-развертывания)
- [Конфигурация Express.ms](#-конфигурация-expressms)
- [Мониторинг и логирование](#-мониторинг-и-логирование)
- [Устранение неполадок](#-устранение-неполадок)
- [Обновление системы](#-обновление-системы)
- [Резервное копирование](#-резервное-копирование)

## 🔧 Предварительные требования

### Системные требования

#### Минимальные требования:
- **CPU:** 1 ядро
- **RAM:** 512MB
- **Диск:** 1GB свободного места
- **Сеть:** Стабильное интернет-соединение

#### Рекомендуемые требования:
- **CPU:** 2+ ядра
- **RAM:** 2GB+
- **Диск:** 5GB+ свободного места
- **Сеть:** Высокоскоростное соединение

### Программное обеспечение

#### Для Express.js сервера:
- **Node.js:** 18.0.0 или выше
- **npm:** 8.0.0 или выше
- **Git:** для клонирования репозитория

#### Для Express.ms бота:
- **Python:** 3.11.0 или выше
- **pip:** для установки зависимостей

#### Для Docker развертывания:
- **Docker:** 20.10.0 или выше
- **Docker Compose:** 2.0.0 или выше

#### Для PM2 развертывания:
- **PM2:** 5.0.0 или выше
- **Node.js:** 18.0.0 или выше

### Учетные данные Express.ms

Перед развертыванием необходимо получить:
- **BOT_ID** - идентификатор бота
- **SECRET_KEY** - секретный ключ
- **HOST** - хост Express.ms сервера
- **PORT** - порт для webhook (обычно 8080)

## 🛠️ Подготовка к развертыванию

### 1. Клонирование репозитория

```bash
# Клонирование репозитория
git clone https://github.com/your-username/expressbot-github.git
cd expressbot-github

# Проверка версии Node.js
node --version

# Проверка версии Python
python --version
```

### 2. Создание необходимых директорий

```bash
# Создание директорий для данных и логов
mkdir -p data logs

# Установка прав доступа
chmod 755 data logs
```

### 3. Настройка переменных окружения

#### Создание .env файла для Express.js
```bash
cp .env.example .env
```

Содержимое .env:
```env
# Основные настройки
PORT=3000
NODE_ENV=production

# База данных
DATABASE_PATH=./data/orders.json

# Логирование
LOG_LEVEL=info
LOG_FILE=logs/app.log

# GitHub интеграция (опционально)
GITHUB_TOKEN=your_github_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

#### Создание .env.express файла для Express.ms бота
```bash
cp .env.express.example .env.express
```

Содержимое .env.express:
```env
# Express.ms настройки
EXPRESS_BOT_ID=your_bot_id_here
EXPRESS_SECRET_KEY=your_secret_key_here
EXPRESS_HOST=your_express_host
EXPRESS_PORT=8080

# Express API настройки
EXPRESS_API_URL=http://localhost:3000

# Логирование
LOG_LEVEL=INFO
LOG_FILE=express_bot.log
```

## 🚀 Варианты развертывания

### Вариант 1: Локальное развертывание (Для тестирования)

#### Установка зависимостей
```bash
# Установка Node.js зависимостей
npm install

# Установка Python зависимостей
pip install -r requirements-express.txt
```

#### Запуск системы
```bash
# Терминал 1: Express.js сервер
npm start

# Терминал 2: Express.ms бот
python express_bot.py
```

#### Проверка работы
```bash
# Проверка API
curl http://localhost:3000/api/orders/stats

# Проверка веб-интерфейса
# Откройте http://localhost:3000/messenger.html
```

### Вариант 2: Docker развертывание (Рекомендуется)

#### Создание Dockerfile для Express.js
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Копирование package.json и установка зависимостей
COPY package*.json ./
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Создание пользователя
RUN addgroup -g 1001 -S nodejs
RUN adduser -S expressbot -u 1001

# Создание директорий
RUN mkdir -p data logs
RUN chown -R expressbot:nodejs data logs

# Переключение на пользователя
USER expressbot

# Открытие порта
EXPOSE 3000

# Запуск приложения
CMD ["npm", "start"]
```

#### Создание Dockerfile для Express.ms бота
```dockerfile
# Dockerfile.express
FROM python:3.11-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Копирование requirements и установка Python зависимостей
COPY requirements-express.txt .
RUN pip install --no-cache-dir -r requirements-express.txt

# Копирование исходного кода
COPY express_bot.py config.py ./

# Создание пользователя
RUN useradd -m -u 1000 botuser
RUN chown -R botuser:botuser /app

# Переключение на пользователя
USER botuser

# Запуск бота
CMD ["python", "express_bot.py"]
```

#### Docker Compose конфигурация
```yaml
# docker-compose.yml
version: '3.8'

services:
  express-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_PATH=./data/orders.json
      - LOG_LEVEL=info
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/orders/stats"]
      interval: 30s
      timeout: 10s
      retries: 3

  express-bot:
    build:
      context: .
      dockerfile: Dockerfile.express
    environment:
      - EXPRESS_BOT_ID=${EXPRESS_BOT_ID}
      - EXPRESS_SECRET_KEY=${EXPRESS_SECRET_KEY}
      - EXPRESS_HOST=${EXPRESS_HOST}
      - EXPRESS_PORT=${EXPRESS_PORT}
      - EXPRESS_API_URL=http://express-api:3000
      - LOG_LEVEL=INFO
    depends_on:
      express-api:
        condition: service_healthy
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - express-api
    restart: unless-stopped
```

#### Запуск Docker контейнеров
```bash
# Сборка и запуск
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Проверка статуса
docker-compose ps

# Остановка
docker-compose down
```

### Вариант 3: PM2 развертывание (Для продакшена)

#### Установка PM2
```bash
# Глобальная установка PM2
npm install -g pm2

# Проверка установки
pm2 --version
```

#### Создание ecosystem файла
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'expressbot-api',
      script: 'index.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_PATH: './data/orders.json',
        LOG_LEVEL: 'info'
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'expressbot-express',
      script: 'express_bot.py',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      interpreter: 'python3',
      env: {
        EXPRESS_BOT_ID: process.env.EXPRESS_BOT_ID,
        EXPRESS_SECRET_KEY: process.env.EXPRESS_SECRET_KEY,
        EXPRESS_HOST: process.env.EXPRESS_HOST,
        EXPRESS_PORT: process.env.EXPRESS_PORT,
        EXPRESS_API_URL: 'http://localhost:3000',
        LOG_LEVEL: 'INFO'
      },
      error_file: './logs/bot-error.log',
      out_file: './logs/bot-out.log',
      log_file: './logs/bot-combined.log',
      time: true,
      max_memory_restart: '512M',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
```

#### Запуск с PM2
```bash
# Запуск приложений
pm2 start ecosystem.config.js

# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs

# Мониторинг
pm2 monit

# Настройка автозапуска
pm2 startup
pm2 save
```

### Вариант 4: Системный сервис (systemd)

#### Создание сервиса для Express.js
```ini
# /etc/systemd/system/expressbot-api.service
[Unit]
Description=ExpressBOT API Server
After=network.target

[Service]
Type=simple
User=expressbot
WorkingDirectory=/opt/expressbot
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=DATABASE_PATH=./data/orders.json
Environment=LOG_LEVEL=info

[Install]
WantedBy=multi-user.target
```

#### Создание сервиса для Express.ms бота
```ini
# /etc/systemd/system/expressbot-express.service
[Unit]
Description=ExpressBOT Express.ms Bot
After=network.target expressbot-api.service
Requires=expressbot-api.service

[Service]
Type=simple
User=expressbot
WorkingDirectory=/opt/expressbot
ExecStart=/usr/bin/python3 express_bot.py
Restart=always
RestartSec=10
Environment=EXPRESS_BOT_ID=your_bot_id
Environment=EXPRESS_SECRET_KEY=your_secret_key
Environment=EXPRESS_HOST=your_express_host
Environment=EXPRESS_PORT=8080
Environment=EXPRESS_API_URL=http://localhost:3000
Environment=LOG_LEVEL=INFO

[Install]
WantedBy=multi-user.target
```

#### Управление сервисами
```bash
# Перезагрузка systemd
sudo systemctl daemon-reload

# Запуск сервисов
sudo systemctl start expressbot-api
sudo systemctl start expressbot-express

# Включение автозапуска
sudo systemctl enable expressbot-api
sudo systemctl enable expressbot-express

# Проверка статуса
sudo systemctl status expressbot-api
sudo systemctl status expressbot-express
```

## 🤖 Конфигурация Express.ms

### 1. Создание бота в Express.ms

1. **Вход в админ-панель Express.ms**
   - Откройте браузер и перейдите на ваш домен Express.ms
   - Войдите в систему с правами администратора

2. **Создание нового бота**
   - Перейдите в раздел "Чат-боты" или "BotX"
   - Нажмите "Создать нового бота"
   - Заполните необходимые поля:
     - **Название:** ExpressBOT
     - **Описание:** Система заказа рейсов
     - **Команды:** /start, /help, /status, /cancel

3. **Получение учетных данных**
   - Скопируйте **BOT_ID**
   - Скопируйте **SECRET_KEY**
   - Запишите **HOST** (обычно ваш домен Express.ms)

### 2. Настройка webhook

1. **Настройка URL webhook**
   - В настройках бота укажите URL: `https://your-domain.com:8080`
   - Убедитесь, что порт 8080 доступен

2. **Настройка TLS (рекомендуется)**
   - Получите SSL сертификат для вашего домена
   - Настройте reverse proxy (nginx) для HTTPS

### 3. Тестирование подключения

```bash
# Проверка доступности Express.ms сервера
curl -I https://your-express-host

# Проверка webhook
curl -X POST https://your-express-host/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "connection"}'
```

## 📊 Мониторинг и логирование

### 1. Настройка логирования

#### Express.js логирование
```javascript
// В src/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

#### Python логирование
```python
# В express_bot.py
import logging
import logging.handlers

def setup_logging():
    logger = logging.getLogger('expressbot')
    logger.setLevel(logging.INFO)
    
    # Создание обработчика для файла
    file_handler = logging.handlers.RotatingFileHandler(
        'express_bot.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    
    # Создание форматтера
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    
    return logger
```

### 2. Мониторинг системы

#### Health Check endpoints
```javascript
// В index.js
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  };
  
  res.json(health);
});

app.get('/health/detailed', async (req, res) => {
  try {
    const stats = await messengerBotAPI.getOrderStats();
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'OK',
      orders: stats.data
    };
    
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
```

#### Мониторинг с PM2
```bash
# Просмотр метрик
pm2 monit

# Просмотр логов в реальном времени
pm2 logs --lines 100

# Перезапуск приложения
pm2 restart expressbot-api

# Перезагрузка конфигурации
pm2 reload ecosystem.config.js
```

### 3. Алерты и уведомления

#### Настройка алертов
```bash
# Создание скрипта мониторинга
cat > monitor.sh << 'EOF'
#!/bin/bash

# Проверка API
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "API недоступен!" | mail -s "ExpressBOT Alert" admin@your-domain.com
fi

# Проверка бота
if ! pgrep -f "express_bot.py" > /dev/null; then
    echo "Express.ms бот не запущен!" | mail -s "ExpressBOT Alert" admin@your-domain.com
fi
EOF

chmod +x monitor.sh

# Добавление в crontab
echo "*/5 * * * * /path/to/monitor.sh" | crontab -
```

## 🐛 Устранение неполадок

### Частые проблемы

#### 1. Порт занят
```bash
# Поиск процесса, использующего порт
lsof -i :3000
lsof -i :8080

# Завершение процесса
kill -9 PID

# Или изменение порта в .env
PORT=3001
```

#### 2. Ошибки базы данных
```bash
# Проверка прав доступа
ls -la data/
chmod 755 data/
chown expressbot:expressbot data/

# Проверка JSON файла
cat data/orders.json | jq .

# Восстановление из резервной копии
cp data/orders.json.backup data/orders.json
```

#### 3. Express.ms бот не подключается
```bash
# Проверка учетных данных
echo $EXPRESS_BOT_ID
echo $EXPRESS_SECRET_KEY

# Проверка подключения к Express.ms
curl -I https://$EXPRESS_HOST

# Проверка логов бота
tail -f express_bot.log
```

#### 4. API не отвечает
```bash
# Проверка статуса сервера
curl http://localhost:3000/health

# Проверка логов
tail -f logs/app.log

# Перезапуск сервера
pm2 restart expressbot-api
```

### Диагностические команды

```bash
# Проверка всех сервисов
systemctl status expressbot-api expressbot-express

# Проверка портов
netstat -tlnp | grep -E ':(3000|8080)'

# Проверка дискового пространства
df -h

# Проверка памяти
free -h

# Проверка процессов
ps aux | grep -E '(node|python)'
```

## 🔄 Обновление системы

### 1. Обновление кода

```bash
# Создание резервной копии
cp -r /opt/expressbot /opt/expressbot.backup.$(date +%Y%m%d)

# Остановка сервисов
pm2 stop all
# или
systemctl stop expressbot-api expressbot-express

# Обновление кода
git pull origin main

# Установка новых зависимостей
npm install
pip install -r requirements-express.txt

# Запуск сервисов
pm2 start all
# или
systemctl start expressbot-api expressbot-express
```

### 2. Обновление Docker контейнеров

```bash
# Остановка контейнеров
docker-compose down

# Обновление образов
docker-compose pull

# Пересборка и запуск
docker-compose up -d --build
```

### 3. Миграция данных

```bash
# Создание резервной копии данных
cp data/orders.json data/orders.json.backup.$(date +%Y%m%d)

# Выполнение миграции (если необходимо)
node scripts/migrate.js

# Проверка целостности данных
node scripts/verify-data.js
```

## 💾 Резервное копирование

### 1. Автоматическое резервное копирование

```bash
# Создание скрипта резервного копирования
cat > backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/expressbot"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="expressbot_backup_$DATE.tar.gz"

# Создание директории для резервных копий
mkdir -p $BACKUP_DIR

# Создание резервной копии
tar -czf $BACKUP_DIR/$BACKUP_FILE \
    --exclude=node_modules \
    --exclude=logs \
    --exclude=.git \
    /opt/expressbot

# Удаление старых резервных копий (старше 30 дней)
find $BACKUP_DIR -name "expressbot_backup_*.tar.gz" -mtime +30 -delete

echo "Резервная копия создана: $BACKUP_FILE"
EOF

chmod +x backup.sh

# Добавление в crontab (ежедневно в 2:00)
echo "0 2 * * * /opt/expressbot/backup.sh" | crontab -
```

### 2. Восстановление из резервной копии

```bash
# Остановка сервисов
pm2 stop all

# Восстановление из резервной копии
tar -xzf /opt/backups/expressbot/expressbot_backup_YYYYMMDD_HHMMSS.tar.gz -C /

# Запуск сервисов
pm2 start all
```

### 3. Синхронизация с удаленным хранилищем

```bash
# Установка rclone
curl https://rclone.org/install.sh | sudo bash

# Настройка rclone
rclone config

# Синхронизация с облачным хранилищем
rclone sync /opt/backups/expressbot remote:expressbot-backups
```

## 📋 Чек-лист развертывания

### Перед развертыванием:
- [ ] Получены учетные данные Express.ms
- [ ] Настроены переменные окружения
- [ ] Установлены все зависимости
- [ ] Созданы необходимые директории
- [ ] Настроено логирование

### После развертывания:
- [ ] API отвечает на запросы
- [ ] Веб-интерфейс доступен
- [ ] Express.ms бот подключается
- [ ] Логи записываются корректно
- [ ] Мониторинг настроен
- [ ] Резервное копирование работает

### Тестирование:
- [ ] Создание заказа через веб-интерфейс
- [ ] Создание заказа через Express.ms бота
- [ ] Просмотр заказов в админ-панели
- [ ] Обновление статуса заказа
- [ ] Экспорт данных

---

**Готово к развертыванию!** 🚀

## 📚 Дополнительно
- [Полная документация](../README.md)
- [Техническая документация](TECHNICAL_DOCS.md)
- [Критические требования](CRITICAL_DEPLOYMENT_REQUIREMENTS.md)
- [Чек-лист соответствия Express.ms](EXPRESS_MS_COMPLIANCE_CHECKLIST.md)

## 📞 Поддержка

Для получения дополнительной помощи:

- **Документация Express.ms:** [docs.express.ms](https://docs.express.ms)
- **Telegram:** [@communicado](https://t.me/communicado)
- **Email:** A.Sokolyanskiy@rossiya-airlines.com
- **GitHub Issues:** [Создать Issue](https://github.com/your-username/expressbot-github/issues)


