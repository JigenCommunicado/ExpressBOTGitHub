# Готовые конфигурации для развертывания

## 📁 Структура папки deployment

```
deployment/
├── nginx/                    # Nginx конфигурации
│   ├── nginx.conf            # Основная конфигурация
│   └── ssl.conf              # SSL настройки
├── systemd/                  # Systemd сервисы
│   ├── expressbot-api.service    # Express.js сервер
│   └── expressbot-express.service # Express.ms бот
├── scripts/                  # Скрипты развертывания
│   ├── deploy.sh             # Автоматическое развертывание
│   ├── backup.sh             # Резервное копирование
│   ├── monitor.sh            # Мониторинг системы
│   └── setup-firewall.sh     # Настройка файрвола
├── docker/                   # Docker конфигурации
│   ├── docker-compose.prod.yml # Продакшен
│   └── docker-compose.dev.yml  # Разработка
├── templates/                # Шаблоны для администраторов
│   ├── admin-request-expressms.md # Запрос учетных данных Express.ms
│   ├── admin-request-ad.md   # Запрос доступа к AD
│   └── ssl-setup.md          # Инструкции по SSL
└── env.express.example       # Пример переменных окружения
```

## 🚀 Быстрое развертывание

### Автоматическое развертывание (Рекомендуется)
```bash
# Запуск полного развертывания
sudo chmod +x scripts/deploy.sh
sudo ./scripts/deploy.sh production
```

**Скрипт автоматически:**
- Создает пользователя `expressbot`
- Устанавливает все зависимости
- Копирует конфигурации
- Настраивает systemd сервисы
- Запускает все компоненты
- Настраивает мониторинг

### Docker развертывание
```bash
# Продакшен (полная система)
docker-compose -f docker/docker-compose.prod.yml up -d

# Разработка (минимальная система)
docker-compose -f docker/docker-compose.dev.yml up -d

# Просмотр логов
docker-compose -f docker/docker-compose.prod.yml logs -f

# Остановка
docker-compose -f docker/docker-compose.prod.yml down
```

### PM2 развертывание
```bash
# Установка PM2
npm install -g pm2

# Запуск всех сервисов
pm2 start ecosystem.config.js

# Мониторинг
pm2 monit

# Настройка автозапуска
pm2 startup
pm2 save
```

### Ручное развертывание
```bash
# 1. Копирование конфигураций
sudo cp nginx/nginx.conf /etc/nginx/sites-available/expressbot
sudo cp systemd/*.service /etc/systemd/system/

# 2. Активация сервисов
sudo systemctl daemon-reload
sudo systemctl enable expressbot-api
sudo systemctl enable expressbot-express

# 3. Запуск сервисов
sudo systemctl start expressbot-api
sudo systemctl start expressbot-express

# 4. Настройка Nginx
sudo ln -s /etc/nginx/sites-available/expressbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📋 Предварительные требования

### Системные требования
- **OS:** Ubuntu 20.04+ или CentOS 8+
- **Node.js:** 18+
- **Python:** 3.8+
- **Nginx:** 1.18+
- **Docker:** 20.10+ (опционально)
- **PM2:** 5.0+ (опционально)

### Учетные данные (КРИТИЧНО!)
- **Express.ms BotX** учетные данные
- **SSL сертификат** (Let's Encrypt или коммерческий)
- **Доступ к Active Directory** (для корпоративной интеграции)
- **Настройка DNS** (A-запись на сервер)

## 🔧 Конфигурация

### Переменные окружения
```bash
# Копирование примера
cp env.express.example .env

# Редактирование
nano .env
```

### Nginx
Настройте домен в `nginx/nginx.conf`:
```nginx
server_name your-domain.com;
```

### SSL
Используйте `templates/ssl-setup.md` для настройки SSL.

### Firewall
```bash
# Настройка файрвола
sudo chmod +x scripts/setup-firewall.sh
sudo ./scripts/setup-firewall.sh
```

## 📊 Мониторинг

### Проверка статуса
```bash
# Статус сервисов
sudo systemctl status expressbot-api
sudo systemctl status expressbot-express

# Логи
sudo journalctl -u expressbot-api -f
sudo journalctl -u expressbot-express -f

# Мониторинг скрипт
sudo chmod +x scripts/monitor.sh
sudo ./scripts/monitor.sh
```

### Резервное копирование
```bash
# Автоматическое резервное копирование
sudo chmod +x scripts/backup.sh
sudo ./scripts/backup.sh

# Настройка cron для ежедневного бэкапа
echo "0 2 * * * /path/to/scripts/backup.sh" | sudo crontab -
```

## 🚨 Критические требования

**ОБЯЗАТЕЛЬНО ПРОЧТИТЕ:** [CRITICAL_DEPLOYMENT_REQUIREMENTS.md](../CRITICAL_DEPLOYMENT_REQUIREMENTS.md)

## 📞 Поддержка
- **Telegram:** [@communicado](https://t.me/communicado)
- **Email:** A.Sokolyanskiy@rossiya-airlines.com
- **GitHub Issues:** [Создать issue](https://github.com/your-username/expressbot-github/issues)
