# ExpressBOT GitHub - Быстрый старт

## 🚀 Запуск за 5 минут

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd ExpressBOTGitHub
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Создание необходимых директорий
```bash
mkdir -p data logs
```

### 4. Запуск системы
```bash
# Разработка
npm start

# Или продакшен с PM2
npm install -g pm2
pm2 start ecosystem.config.js
```

### 5. Открыть в браузере
- **http://localhost:3000** - главная страница
- **http://localhost:3000/messenger** - интерфейс мессенджера
- **http://localhost:3000/orders** - административная панель
- **http://localhost:3000/admin** - админ панель

## 🐳 Docker запуск
```bash
# Продакшен
docker-compose -f deployment/docker/docker-compose.prod.yml up -d

# Разработка
docker-compose -f deployment/docker/docker-compose.dev.yml up -d
```

## 🔧 Автоматическое развертывание
```bash
# Полное развертывание на сервере
sudo chmod +x deployment/scripts/deploy.sh
sudo ./deployment/scripts/deploy.sh production
```

## ✅ Готово!
Система запущена и готова к использованию.

## 📚 Дополнительно
- [Полная документация](../README.md)
- [Техническая документация](TECHNICAL_DOCS.md)
- [Руководство по развертыванию](DEPLOYMENT.md)
- [Критические требования](CRITICAL_DEPLOYMENT_REQUIREMENTS.md)