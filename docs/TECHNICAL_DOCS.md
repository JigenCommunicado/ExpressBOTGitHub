# Техническая документация ExpressBOT GitHub

## 🏗️ Архитектура системы

### Компоненты
- **Express.js Server** - основной веб-сервер (порт 3000)
- **Messenger Bot** - интерфейс для пользователей
- **JSON Database** - хранение данных в `data/orders.json`
- **Express.ms Integration** - интеграция с корпоративным мессенджером
- **Admin Panel** - управление заявками
- **Nginx** - reverse proxy и SSL терминация

### Технологии
- **Backend:** Node.js 18+, Express.js 4.18+
- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Database:** JSON файлы (легковесная альтернатива SQLite)
- **Integration:** Express.ms BotX, pybotx
- **Deployment:** Docker, PM2, Systemd, Nginx
- **Monitoring:** PM2, systemd, логирование

## 📊 API Endpoints

### Messenger Bot API
- `POST /api/messenger` - обработка сообщений бота
- `GET /api/orders` - получение всех заказов
- `GET /api/orders/user/:userId` - заказы конкретного пользователя
- `GET /api/orders/:orderId` - заказ по ID
- `PUT /api/orders/:orderId/status` - обновление статуса заказа
- `GET /api/orders/stats` - статистика заказов

### GitHub API
- `POST /api/github/webhook` - обработка GitHub webhooks
- `GET /api/github/repos` - список репозиториев
- `POST /api/github/create-issue` - создание issue
- `GET /api/github/issues` - список issues

### Административные API
- `GET /api/admin/users` - список пользователей
- `GET /api/admin/stats` - общая статистика
- `POST /api/admin/backup` - создание резервной копии

## 🔧 Конфигурация

### Переменные окружения
```bash
# Основные настройки
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# База данных
DATABASE_PATH=./data/orders.json

# GitHub интеграция
GITHUB_TOKEN=your_github_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo

# Express.ms интеграция
EXPRESS_BOT_ID=your_bot_id
EXPRESS_SECRET_KEY=your_secret_key
EXPRESS_HOST=your_host
EXPRESS_PORT=8080

# Безопасность
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

### Структура базы данных
```json
{
  "orders": [
    {
      "id": "order_1234567890",
      "userId": "user_456",
      "fullName": "Иванов Иван Иванович",
      "employeeId": "12345",
      "position": "Пилот",
      "location": "Москва",
      "department": "Летный",
      "date": "2024-01-15",
      "direction": "Москва-Санкт-Петербург",
      "wishes": "Бизнес-класс, окно",
      "status": "pending",
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z"
    }
  ]
}
```

## 🚀 Развертывание

### Docker развертывание
```bash
# Продакшен (полная система)
docker-compose -f deployment/docker/docker-compose.prod.yml up -d

# Разработка (минимальная система)
docker-compose -f deployment/docker/docker-compose.dev.yml up -d

# Сборка образа
docker build -t expressbot-api .

# Запуск контейнера
docker run -p 3000:3000 -v ./data:/app/data expressbot-api
```

### PM2 развертывание
```bash
# Установка PM2
npm install -g pm2

# Запуск всех сервисов
pm2 start ecosystem.config.js

# Мониторинг
pm2 monit

# Логи
pm2 logs

# Перезапуск
pm2 restart all
```

### Systemd развертывание
```bash
# Копирование сервисов
sudo cp deployment/systemd/expressbot-api.service /etc/systemd/system/
sudo cp deployment/systemd/expressbot-express.service /etc/systemd/system/

# Активация сервисов
sudo systemctl daemon-reload
sudo systemctl enable expressbot-api
sudo systemctl enable expressbot-express

# Запуск сервисов
sudo systemctl start expressbot-api
sudo systemctl start expressbot-express
```

### Автоматическое развертывание
```bash
# Полное развертывание
sudo chmod +x deployment/scripts/deploy.sh
sudo ./deployment/scripts/deploy.sh production
```

## 🔐 Безопасность

### Аутентификация и авторизация
- JWT токены для API
- Валидация входных данных
- Rate limiting для API endpoints
- CORS настройки

### Защита данных
- Шифрование чувствительных данных
- Безопасное хранение паролей
- Логирование всех операций
- Резервное копирование

### Сетевая безопасность
- SSL/TLS шифрование
- Firewall настройки
- Защита от DDoS атак
- Валидация webhook подписей

## 📊 Мониторинг и логирование

### Логирование
- **Уровни:** error, warn, info, debug
- **Форматы:** JSON, текстовый
- **Ротация:** по размеру и времени
- **Назначения:** файлы, консоль, syslog

### Мониторинг
- **PM2:** мониторинг процессов
- **Systemd:** статус сервисов
- **Nginx:** логи доступа
- **Custom:** скрипты мониторинга

### Метрики
- Количество заказов
- Время отклика API
- Использование памяти
- Ошибки и исключения

## 🧪 Тестирование

### Unit тесты
```bash
# Запуск тестов
npm test

# Покрытие кода
npm run test:coverage
```

### Integration тесты
```bash
# API тесты
npm run test:api

# База данных тесты
npm run test:database
```

### E2E тесты
```bash
# Полные тесты
npm run test:e2e
```

## 🔧 Разработка

### Структура проекта
```
src/
├── messengerBot.js           # Логика Messenger Bot
├── messengerBotAPI.js        # API для Messenger Bot
├── database.js               # Управление JSON базой данных
├── webhookHandler.js         # Обработка GitHub webhooks
├── botCommands.js            # Команды бота
├── admin.js                  # Административные функции
├── adminCommands.js          # Команды администратора
├── github.js                 # GitHub API интеграция
├── logger.js                 # Система логирования
└── testFunctions.js          # Тестовые функции
```

### Стиль кода
- ESLint конфигурация
- Prettier форматирование
- JSDoc документация
- Git hooks для проверки

### CI/CD
- GitHub Actions
- Автоматическое тестирование
- Деплой в staging/production
- Уведомления о статусе

## 📚 Дополнительно
- [Полная документация](../README.md)
- [Руководство по развертыванию](DEPLOYMENT.md)
- [Примеры использования](EXAMPLES.md)
- [Руководство пользователя](USER_GUIDE.md)

## 📞 Поддержка
- **Telegram:** [@communicado](https://t.me/communicado)
- **Email:** A.Sokolyanskiy@rossiya-airlines.com
- **GitHub Issues:** [Создать issue](https://github.com/your-username/expressbot-github/issues)