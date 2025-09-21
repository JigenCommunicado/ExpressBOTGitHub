# 🤖 ExpressBOT - Корпоративный админ-бот

Express.js бот для управления смарт-приложением с интеграцией GitHub API, админ-панелью и системой управления пользователями.

## 🚀 Возможности

- **🤖 Система команд бота** - работа с GitHub API
- **🔐 Админ-панель** - веб-интерфейс для управления
- **👥 Управление пользователями** - CRUD операции
- **🛡️ Система безопасности** - роли, права доступа, аудит
- **📊 Мониторинг** - статистика, логи, health check
- **🐳 Docker поддержка** - контейнеризация и оркестрация
- **📡 RESTful API** - интеграция с внешними системами

## ⚡ Быстрый старт

### Windows:
1. Скачайте Node.js с https://nodejs.org/
2. Запустите `install.bat`
3. Запустите `node index.js`
4. Откройте http://localhost:3000

### Linux:
1. Запустите `chmod +x install.sh && ./install.sh`
2. Запустите `node index.js`
3. Откройте http://localhost:3000

### Docker (Linux):
```bash
git clone https://github.com/JigenCommunicado/ExpressBOTGitHub.git
cd ExpressBOTGitHub
docker-compose up -d
```

## 🔑 Доступ к системе

- **Главная страница:** http://localhost:3000
- **Админ-панель:** http://localhost:3000/admin.html
- **Логин:** admin
- **Пароль:** admin123

## 📋 Системные требования

### Минимальные:
- Node.js 18+
- 2 GB RAM
- 5 GB свободного места

### Для Docker:
- Linux (Ubuntu 20.04+)
- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL 15+
- Redis 7+

## 🛠️ Установка

### 1. Клонирование репозитория
```bash
git clone https://github.com/JigenCommunicado/ExpressBOTGitHub.git
cd ExpressBOTGitHub
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка конфигурации
```bash
cp .env.example .env
# Отредактируйте .env файл
```

### 4. Запуск
```bash
node index.js
```

## 📡 API Endpoints

### Основные:
- `GET /` - Информация о сервере
- `GET /health` - Проверка состояния
- `GET /api/commands` - Список команд бота

### Команды бота:
- `POST /api/command` - Выполнение команд
- `GET /api/user/:username` - Информация о пользователе GitHub
- `GET /api/repo/:owner/:repo` - Информация о репозитории

### Админ API:
- `POST /api/admin/login` - Авторизация
- `GET /api/admin/stats` - Статистика системы
- `GET /api/admin/users` - Управление пользователями
- `GET /api/admin/logs` - Логи аудита

## 🔧 Конфигурация

Создайте файл `.env`:

```env
# Основные настройки
NODE_ENV=production
PORT=3000

# GitHub API
GITHUB_TOKEN=your_github_token_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# База данных (для Docker)
DATABASE_URL=postgresql://expressbot:password@postgres:5432/expressbot
REDIS_URL=redis://redis:6379

# Логирование
LOG_LEVEL=info
LOG_TO_FILE=true
```

## 🧪 Тестирование

### Автоматическое тестирование:
```bash
node test-api.js
```

### Ручное тестирование:
```bash
# Health check
curl http://localhost:3000/health

# Команды бота
curl -X POST http://localhost:3000/api/command \
  -H "Content-Type: application/json" \
  -d '{"command": "help", "args": []}'
```

## 🐳 Docker развертывание

### Запуск:
```bash
docker-compose up -d
```

### Управление:
```bash
# Статус
docker-compose ps

# Логи
docker-compose logs -f expressbot

# Остановка
docker-compose down
```

## 📚 Документация

- **DEPLOYMENT_GUIDE.md** - Подробное руководство по развертыванию
- **QUICK_START.md** - Быстрый старт
- **README-Docker.md** - Docker документация

## 🔒 Безопасность

- Хеширование паролей (SHA-256)
- Система ролей и прав доступа
- JWT-подобные сессии
- Аудит всех действий
- Валидация входных данных

## 🛠️ Устранение неполадок

### Частые проблемы:
1. **"node не найден"** → Установите Node.js
2. **"Порт занят"** → Измените PORT в .env
3. **"Ошибка 401"** → Используйте admin/admin123

### Логи:
```bash
# Docker
docker-compose logs expressbot

# Обычный запуск
node index.js
```

## 📞 Поддержка

- **GitHub Issues:** https://github.com/JigenCommunicado/ExpressBOTGitHub/issues
- **Документация:** См. файлы в корне проекта

## 📝 Лицензия

MIT License

## 👨‍💻 Автор

JigenCommunicado
