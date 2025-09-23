# 🚨 Критически важные доработки для развертывания Express.ms

[![Critical](https://img.shields.io/badge/Critical-Required-red.svg)]()
[![Security](https://img.shields.io/badge/Security-Mandatory-orange.svg)]()
[![Express.ms](https://img.shields.io/badge/Express.ms-Integration-blue.svg)](https://express.ms/)

> **ВНИМАНИЕ:** Эти доработки ОБЯЗАТЕЛЬНЫ для развертывания в Express.ms. Без них система не будет работать в корпоративной среде.

## 📋 Содержание

- [SSL сертификаты](#-ssl-сертификаты)
- [Фаервол и безопасность](#-фаервол-и-безопасность)
- [Учетные данные Express.ms](#-учетные-данные-expressms)
- [Active Directory интеграция](#-active-directory-интеграция)
- [DNS настройки](#-dns-настройки)
- [Мониторинг и алерты](#-мониторинг-и-алерты)
- [Резервное копирование](#-резервное-копирование)
- [Альтернативы для тестирования](#-альтернативы-для-тестирования)

## 🔒 SSL сертификаты

### ❌ Проблема
**Express.ms требует HTTPS для всех соединений.** Без SSL сертификата:
- Webhook не будет работать
- Безопасность данных нарушена
- Не пройдет корпоративная проверку безопасности

### ✅ Решение

#### 1. Получение SSL сертификата

**Вариант A: Let's Encrypt (бесплатно, рекомендуется)**
```bash
# Установка certbot
sudo apt update
sudo apt install certbot nginx

# Получение сертификата
sudo certbot --nginx -d your-domain.com

# Автоматическое обновление
sudo crontab -e
# Добавьте: 0 12 * * * /usr/bin/certbot renew --quiet
```

**Вариант B: Самоподписанный (для тестирования)**
```bash
# Создание самоподписанного сертификата
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes

# Размещение в директории
mkdir -p ssl/
mv key.pem ssl/private.key
mv cert.pem ssl/certificate.crt
```

#### 2. Настройка Nginx с SSL

```nginx
# /etc/nginx/sites-available/expressbot
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL конфигурация
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Безопасность
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    
    # Express.js API
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Express.ms Bot webhook
    location /webhook {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 3. Проверка SSL

```bash
# Проверка сертификата
openssl x509 -in ssl/certificate.crt -text -noout

# Проверка через браузер
curl -I https://your-domain.com

# Тест SSL Labs
# Перейдите на https://www.ssllabs.com/ssltest/
```

##️ Фаервол и безопасность

### ❌ Проблема
**Без фаервола система уязвима для атак.** Необходимо:
- Контролировать доступ к портам
- Защищать от внешних атак
- Соответствовать корпоративным стандартам

### ✅ Решение

#### 1. Настройка UFW (Ubuntu)

```bash
# Установка UFW
sudo apt install ufw

# Базовые правила безопасности
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Разрешенные порты
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw allow 8080/tcp comment 'Express.ms Bot'

# Включение фаервола
sudo ufw enable

# Проверка статуса
sudo ufw status verbose
```

#### 2. Настройка iptables (CentOS/RHEL)

```bash
# Создание скрипта настройки
cat > /etc/iptables/rules.v4 << 'EOF'
*filter
:INPUT DROP [0:0]
:FORWARD DROP [0:0]
:OUTPUT ACCEPT [0:0]

# Разрешенные соединения
-A INPUT -i lo -j ACCEPT
-A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# SSH
-A INPUT -p tcp --dport 22 -j ACCEPT

# HTTP/HTTPS
-A INPUT -p tcp --dport 80 -j ACCEPT
-A INPUT -p tcp --dport 443 -j ACCEPT

# Express.ms Bot
-A INPUT -p tcp --dport 8080 -j ACCEPT

# Логирование заблокированных пакетов
-A INPUT -m limit --limit 5/min -j LOG --log-prefix "iptables denied: " --log-level 7

COMMIT
EOF

# Применение правил
iptables-restore < /etc/iptables/rules.v4
```

#### 3. Дополнительная безопасность

```bash
# Отключение неиспользуемых служб
sudo systemctl disable apache2
sudo systemctl disable mysql

# Настройка fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Настройка SSH
sudo nano /etc/ssh/sshd_config
# Установите: PermitRootLogin no, PasswordAuthentication no
sudo systemctl restart ssh
```

## 🔑 Учетные данные Express.ms

### ❌ Проблема
**Без учетных данных Express.ms бот не сможет подключиться к корпоративному мессенджеру.**

### ✅ Решение

#### 1. Получение доступа к Express.ms

**Шаг 1: Обращение к администратору**
```
Тема: Запрос на создание бота для системы заказа рейсов

Уважаемый [Имя администратора],

Прошу создать бота в системе Express.ms со следующими параметрами:

Название: ExpressBOT
Описание: Система заказа рейсов для сотрудников
Команды: /start, /help, /status, /cancel
Webhook URL: https://your-domain.com:8080
Порт: 8080

После создания прошу предоставить:
- BOT_ID
- SECRET_KEY
- HOST (адрес сервера Express.ms)

С уважением,
[Ваше имя]
```

**Шаг 2: Создание бота (если есть доступ)**
1. Войдите в Express.ms под учетной записью администратора
2. Перейдите в раздел "Чат-боты" или "BotX"
3. Нажмите "Создать бота"
4. Заполните форму с указанными параметрами
5. Скопируйте полученные данные

#### 2. Настройка переменных окружения

```bash
# Создание .env.express
cat > .env.express << 'EOF'
# Express.ms настройки
EXPRESS_BOT_ID=bot_1234567890abcdef
EXPRESS_SECRET_KEY=sk_abcdef1234567890
EXPRESS_HOST=https://your-company.express.ms
EXPRESS_PORT=8080

# Express API настройки
EXPRESS_API_URL=https://your-domain.com

# Логирование
LOG_LEVEL=INFO
LOG_FILE=express_bot.log
EOF

# Установка прав доступа
chmod 600 .env.express
```

## 🏢 Active Directory интеграция

### ❌ Проблема
**Express.ms требует интеграции с корпоративной системой аутентификации.**

### ✅ Решение

#### 1. Создание учетной записи AD

**Обращение к администратору AD:**
```
Тема: Создание учетной записи для ExpressBOT

Уважаемый [Имя администратора AD],

Прошу создать учетную запись для бота ExpressBOT со следующими правами:

Имя пользователя: expressbot
Группы: ExpressBotUsers, Domain Users
Права: Чтение списка пользователей, доступ к группам
Пароль: [Сгенерировать сложный пароль]

Учетная запись будет использоваться для:
- Аутентификации в Express.ms
- Получения списка пользователей
- Проверки прав доступа

С уважением,
[Ваше имя]
```

#### 2. Настройка LDAP подключения

```python
# ldap_config.py
import ldap
from ldap.filter import escape_filter_chars

class LDAPAuth:
    def __init__(self, server, base_dn, user_dn, password):
        self.server = server
        self.base_dn = base_dn
        self.user_dn = user_dn
        self.password = password
        self.conn = None
    
    def connect(self):
        try:
            self.conn = ldap.initialize(self.server)
            self.conn.simple_bind_s(self.user_dn, self.password)
            return True
        except ldap.LDAPError as e:
            print(f"LDAP connection error: {e}")
            return False
    
    def get_users(self, group_name):
        if not self.conn:
            return []
        
        try:
            search_filter = f"(&(objectClass=user)(memberOf=CN={group_name},{self.base_dn}))"
            result = self.conn.search_s(self.base_dn, ldap.SCOPE_SUBTREE, search_filter)
            return result
        except ldap.LDAPError as e:
            print(f"LDAP search error: {e}")
            return []
```

## 🌍 DNS настройки

### ❌ Проблема
**Express.ms требует корректного DNS разрешения для webhook.**

### ✅ Решение

#### 1. Настройка DNS записей

**A-запись:**
```
Тип: A
Имя: expressbot
Значение: [IP адрес сервера]
TTL: 3600
```

**CNAME (если используется поддомен):**
```
Тип: CNAME
Имя: bot.your-domain.com
Значение: expressbot.your-domain.com
TTL: 3600
```

#### 2. Проверка DNS

```bash
# Проверка A-записи
nslookup expressbot.your-domain.com

# Проверка CNAME
nslookup bot.your-domain.com

# Проверка с сервера Express.ms
dig @8.8.8.8 expressbot.your-domain.com
```

## 📊 Мониторинг и алерты

### ❌ Проблема
**Без мониторинга невозможно отследить проблемы в продакшене.**

### ✅ Решение

#### 1. Настройка мониторинга

```bash
# Создание скрипта мониторинга
cat > monitor.sh << 'EOF'
#!/bin/bash

# Проверка API
if ! curl -f https://your-domain.com/health > /dev/null 2>&1; then
    echo "API недоступен!" | mail -s "ExpressBOT Alert" admin@your-domain.com
    # Отправка в Slack/Telegram
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 ExpressBOT API недоступен!"}' \
        https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
fi

# Проверка бота
if ! pgrep -f "express_bot.py" > /dev/null; then
    echo "Express.ms бот не запущен!" | mail -s "ExpressBOT Alert" admin@your-domain.com
fi

# Проверка дискового пространства
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Диск заполнен на ${DISK_USAGE}%!" | mail -s "ExpressBOT Alert" admin@your-domain.com
fi
EOF

chmod +x monitor.sh

# Добавление в crontab (каждые 5 минут)
echo "*/5 * * * * /path/to/monitor.sh" | crontab -
```

#### 2. Настройка логирования

```javascript
// В src/logger.js
const winston = require('winston');
const SlackHook = require('winston-slack-webhook-transport');

const logger = winston.createLogger({
  level: 'info',
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
      maxsize: 10485760,
      maxFiles: 5
    }),
    new SlackHook({
      webhookUrl: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
      channel: '#alerts',
      level: 'error'
    })
  ]
});
```

## 💾 Резервное копирование

### ❌ Проблема
**Без резервного копирования возможна потеря данных.**

### ✅ Решение

#### 1. Автоматическое резервное копирование

```bash
# Создание скрипта резервного копирования
cat > backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/expressbot"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="expressbot_backup_$DATE.tar.gz"

# Создание директории
mkdir -p $BACKUP_DIR

# Создание резервной копии
tar -czf $BACKUP_DIR/$BACKUP_FILE \
    --exclude=node_modules \
    --exclude=logs \
    --exclude=.git \
    /opt/expressbot

# Загрузка в облачное хранилище
rclone copy $BACKUP_DIR/$BACKUP_FILE remote:expressbot-backups/

# Удаление старых копий (старше 30 дней)
find $BACKUP_DIR -name "expressbot_backup_*.tar.gz" -mtime +30 -delete

echo "Резервная копия создана: $BACKUP_FILE"
EOF

chmod +x backup.sh

# Добавление в crontab (ежедневно в 2:00)
echo "0 2 * * * /opt/expressbot/backup.sh" | crontab -
```

## 🧪 Альтернативы для тестирования

### Если нет доступа к Express.ms:

#### 1. Локальное тестирование
```bash
# Запуск только веб-версии
npm start
# Откройте http://localhost:3000/messenger.html
```

#### 2. Tunnel сервисы
```bash
# ngrok для HTTPS туннеля
ngrok http 3000
# Получите: https://abc123.ngrok.io

# В Express.ms укажите webhook: https://abc123.ngrok.io:8080
```

#### 3. Тестовая среда
```bash
# Создание тестового сертификата
openssl req -x509 -newkey rsa:2048 -keyout test-key.pem -out test-cert.pem -days 365 -nodes

# Запуск с тестовым сертификатом
node index.js --ssl-key=test-key.pem --ssl-cert=test-cert.pem
```

## 📋 Чек-лист готовности

### Критически важно (БЕЗ ЭТОГО НЕ РАБОТАЕТ):
- [ ] **SSL сертификат** установлен и работает
- [ ] **Фаервол** настроен и активен
- [ ] **Учетные данные Express.ms** получены
- [ ] **DNS** настроен корректно

### Важно для продакшена:
- [ ] **Active Directory** интеграция настроена
- [ ] **Мониторинг** работает
- [ ] **Резервное копирование** настроено
- [ ] **Логирование** централизовано

### Для тестирования:
- [ ] **Локальная версия** работает
- [ ] **ngrok туннель** настроен
- [ ] **Тестовые сертификаты** созданы

## 🚨 Срочные действия

### Если нужно запустить СЕЙЧАС:

1. **Используйте ngrok:**
   ```bash
   ngrok http 3000
   # Скопируйте HTTPS URL
   ```

2. **Создайте тестовый сертификат:**
   ```bash
   openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes
   ```

3. **Запустите локально:**
   ```bash
   npm start
   # Откройте http://localhost:3000/messenger.html
   ```

### Для продакшена (в течение недели):

1. **Получите SSL сертификат** (Let's Encrypt)
2. **Настройте фаервол** (UFW/iptables)
3. **Обратитесь к администратору** за учетными данными Express.ms
4. **Настройте мониторинг** и резервное копирование

---

## 📞 Поддержка

При возникновении проблем:

- **Документация Express.ms:** [docs.express.ms](https://docs.express.ms)
- **GitHub Issues:** [Создать Issue](https://github.com/your-username/expressbot-github/issues)

- **Telegram:** [@communicado](https://t.me/communicado)
- **Email:** A.Sokolyanskiy@rossiya-airlines.com

---

**⚠️ ВНИМАНИЕ:** Без выполнения критически важных доработок система не будет работать в Express.ms!

*Последнее обновление: 21 сентября 2025*
