# Руководство пользователя ExpressBOT GitHub

## 🎯 Назначение
ExpressBOT GitHub - это система для автоматизации работы с GitHub через Express Messenger Bot, включающая заказ рейсов, управление заявками и интеграцию с корпоративными системами.

## 🚀 Быстрый старт

### 1. Запуск системы
```bash
# Клонирование репозитория
git clone <repository-url>
cd ExpressBOTGitHub

# Установка зависимостей
npm install

# Создание необходимых директорий
mkdir -p data logs

# Запуск
npm start
```

### 2. Открытие интерфейсов
- **http://localhost:3000** - главная страница
- **http://localhost:3000/messenger** - интерфейс мессенджера
- **http://localhost:3000/orders** - административная панель
- **http://localhost:3000/admin** - админ панель

## 🤖 Использование Messenger Bot

### Команды бота
- `/start` - начать заказ рейса
- `/help` - помощь
- `/status` - статус заказов
- `/admin` - административные функции

### Процесс заказа рейса
1. **Выбор локации** - Москва, Санкт-Петербург, Екатеринбург
2. **Выбор подразделения** - Летный, Технический, Коммерческий
3. **Выбор даты вылета** - календарь с доступными датами
4. **Выбор должности** - Пилот, Бортпроводник, Техник
5. **Ввод ФИО** - полное имя сотрудника
6. **Ввод табельного номера** - числовой идентификатор
7. **Ввод направления** - желаемое направление полета
8. **Ввод пожеланий** - дополнительные требования
9. **Подтверждение заказа** - финальная проверка и отправка

## 📊 Административная панель

### Просмотр заказов
- **Список всех заказов** - полный список с фильтрацией
- **Фильтрация по статусу** - pending, confirmed, rejected, completed
- **Поиск по пользователю** - поиск по userId или ФИО
- **Экспорт данных** - экспорт в CSV/JSON формате
- **Статистика** - общая статистика по заказам

### Управление заказами
- **Изменение статуса** - обновление статуса заказа
- **Просмотр деталей** - полная информация о заказе
- **Удаление заказов** - удаление неактуальных заказов
- **Массовые операции** - групповое изменение статусов

## 🔧 Настройка

### Переменные окружения
```bash
# .env файл
PORT=3000
LOG_LEVEL=info
DATABASE_PATH=./data/orders.json
NODE_ENV=production
```

### Конфигурация системы
- **Настройка локаций** - добавление/удаление городов
- **Настройка подразделений** - управление отделами
- **Настройка должностей** - управление позициями
- **Настройка API** - конфигурация внешних API
- **Настройка логирования** - уровни и форматы логов

## 🐳 Развертывание

### Docker развертывание
```bash
# Продакшен
docker-compose -f deployment/docker/docker-compose.prod.yml up -d

# Разработка
docker-compose -f deployment/docker/docker-compose.dev.yml up -d
```

### Автоматическое развертывание
```bash
# Полное развертывание
sudo chmod +x deployment/scripts/deploy.sh
sudo ./deployment/scripts/deploy.sh production
```

### PM2 развертывание
```bash
# Установка PM2
npm install -g pm2

# Запуск
pm2 start ecosystem.config.js

# Мониторинг
pm2 monit
```

## 📱 Интеграция с Express.ms

### Настройка бота
```bash
# Установка Python зависимостей
pip install -r requirements-express.txt

# Настройка переменных окружения
cp deployment/env.express.example .env
nano .env

# Запуск бота
python express_bot.py
```

### Тестирование
```bash
# Проверка API
curl -X GET http://localhost:3000/api/orders/stats

# Тестовое сообщение
curl -X POST http://localhost:3000/api/messenger \
  -H "Content-Type: application/json" \
  -d '{"userId": "test", "message": "/start"}'
```

## 🔍 Мониторинг и диагностика

### Проверка статуса
```bash
# Статус сервисов
sudo systemctl status expressbot-api
sudo systemctl status expressbot-express

# Логи
sudo journalctl -u expressbot-api -f
sudo journalctl -u expressbot-express -f
```

### Резервное копирование
```bash
# Ручное резервное копирование
sudo chmod +x deployment/scripts/backup.sh
sudo ./deployment/scripts/backup.sh

# Автоматическое резервное копирование
echo "0 2 * * * /path/to/deployment/scripts/backup.sh" | sudo crontab -
```

## 🚨 Устранение неполадок

### Частые проблемы
1. **Порт занят** - проверьте, что порт 3000 свободен
2. **База данных недоступна** - проверьте права доступа к `data/orders.json`
3. **Сервис не запускается** - проверьте логи systemd
4. **API не отвечает** - проверьте статус Express.js сервера

### Логи и диагностика
```bash
# Логи приложения
tail -f logs/app.log

# Логи systemd
sudo journalctl -u expressbot-api -f

# Проверка портов
netstat -tlnp | grep :3000

# Проверка процессов
ps aux | grep node
```

## 📚 Дополнительно
- [Полная документация](../README.md)
- [Техническая документация](TECHNICAL_DOCS.md)
- [Примеры использования](EXAMPLES.md)
- [Быстрый старт](QUICK_START.md)

## 📞 Поддержка
- **Telegram:** [@communicado](https://t.me/communicado)
- **Email:** A.Sokolyanskiy@rossiya-airlines.com
- **GitHub Issues:** [Создать issue](https://github.com/your-username/expressbot-github/issues)