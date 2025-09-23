# Примеры использования ExpressBOT GitHub

## 🚀 Быстрый старт

### 1. Клонирование и установка
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

## 📊 API примеры

### Получение всех заказов
```bash
curl -X GET http://localhost:3000/api/orders
```

### Получение заказов пользователя
```bash
curl -X GET http://localhost:3000/api/orders/user/user123
```

### Получение статистики заказов
```bash
curl -X GET http://localhost:3000/api/orders/stats
```

### Обновление статуса заказа
```bash
curl -X PUT http://localhost:3000/api/orders/123/status \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

### Отправка сообщения боту
```bash
curl -X POST http://localhost:3000/api/messenger \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "message": "/start"}'
```

### Получение заказа по ID
```bash
curl -X GET http://localhost:3000/api/orders/123
```

## 🐳 Docker примеры

### Запуск с Docker
```bash
# Продакшен (полная система)
docker-compose -f deployment/docker/docker-compose.prod.yml up -d

# Разработка (минимальная система)
docker-compose -f deployment/docker/docker-compose.dev.yml up -d
```

### Просмотр логов
```bash
# Все сервисы
docker-compose -f deployment/docker/docker-compose.prod.yml logs -f

# Только API
docker-compose -f deployment/docker/docker-compose.prod.yml logs -f express-api

# Только Express.ms бот
docker-compose -f deployment/docker/docker-compose.prod.yml logs -f express-bot
```

### Остановка и очистка
```bash
# Остановка
docker-compose -f deployment/docker/docker-compose.prod.yml down

# Остановка с удалением volumes
docker-compose -f deployment/docker/docker-compose.prod.yml down -v
```

## 🔧 PM2 примеры

### Запуск с PM2
```bash
# Установка PM2
npm install -g pm2

# Запуск всех сервисов
pm2 start ecosystem.config.js

# Мониторинг
pm2 monit

# Просмотр логов
pm2 logs

# Перезапуск
pm2 restart all

# Остановка
pm2 stop all
```

### Настройка автозапуска
```bash
# Генерация startup скрипта
pm2 startup

# Сохранение текущей конфигурации
pm2 save
```

## 🚀 Автоматическое развертывание

### Полное развертывание
```bash
# Запуск скрипта развертывания
sudo chmod +x deployment/scripts/deploy.sh
sudo ./deployment/scripts/deploy.sh production
```

### Резервное копирование
```bash
# Ручное резервное копирование
sudo chmod +x deployment/scripts/backup.sh
sudo ./deployment/scripts/backup.sh

# Автоматическое резервное копирование (cron)
echo "0 2 * * * /path/to/deployment/scripts/backup.sh" | sudo crontab -
```

### Мониторинг
```bash
# Проверка статуса системы
sudo chmod +x deployment/scripts/monitor.sh
sudo ./deployment/scripts/monitor.sh

# Настройка файрвола
sudo chmod +x deployment/scripts/setup-firewall.sh
sudo ./deployment/scripts/setup-firewall.sh
```

## 🔧 Конфигурация

### Переменные окружения
```bash
# .env файл
PORT=3000
LOG_LEVEL=info
DATABASE_PATH=./data/orders.json
NODE_ENV=production
```

### Nginx конфигурация
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Systemd сервисы
```bash
# Статус сервисов
sudo systemctl status expressbot-api
sudo systemctl status expressbot-express

# Логи сервисов
sudo journalctl -u expressbot-api -f
sudo journalctl -u expressbot-express -f

# Перезапуск сервисов
sudo systemctl restart expressbot-api
sudo systemctl restart expressbot-express
```

## 📱 Интеграция с Express.ms

### Настройка Python бота
```bash
# Установка зависимостей
pip install -r requirements-express.txt

# Настройка переменных окружения
cp deployment/env.express.example .env
nano .env

# Запуск бота
python express_bot.py
```

### Тестирование интеграции
```bash
# Проверка подключения к API
curl -X GET http://localhost:3000/api/orders/stats

# Отправка тестового сообщения
curl -X POST http://localhost:3000/api/messenger \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user", "message": "/start"}'
```

## 📚 Дополнительно
- [Полная документация](../README.md)
- [Техническая документация](TECHNICAL_DOCS.md)
- [Руководство пользователя](USER_GUIDE.md)
- [Быстрый старт](QUICK_START.md)

## 📞 Поддержка
- **Telegram:** [@communicado](https://t.me/communicado)
- **Email:** A.Sokolyanskiy@rossiya-airlines.com
- **GitHub Issues:** [Создать issue](https://github.com/your-username/expressbot-github/issues)