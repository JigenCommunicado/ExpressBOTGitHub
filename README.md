# ExpressBOT GitHub

Express.js бот для интеграции с GitHub API и обработки webhooks.

## 🚀 Возможности

- RESTful API сервер на Express.js
- Интеграция с GitHub API
- Обработка GitHub webhooks
- CORS поддержка
- Middleware для логирования и обработки ошибок
- Health check endpoints

## 📦 Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/JigenCommunicado/ExpressBOTGitHub.git
cd ExpressBOTGitHub
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения:
```bash
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

## 🏃‍♂️ Запуск

### Режим разработки:
```bash
npm run dev
```

### Продакшн режим:
```bash
npm start
```

## 📡 API Endpoints

- `GET /` - Информация о сервере
- `GET /health` - Проверка состояния сервера
- `POST /webhook/github` - GitHub webhook endpoint

## 🔧 Конфигурация

Создайте файл `.env` на основе `.env.example`:

```env
PORT=3000
NODE_ENV=development
GITHUB_TOKEN=your_github_token_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
```

## 📝 Лицензия

MIT License

## 👨‍💻 Автор

JigenCommunicado
