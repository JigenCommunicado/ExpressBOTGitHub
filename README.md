# ExpressBOT - Система заказа рейсов для Express.ms

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18+-blue.svg)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-yellow.svg)](https://python.org/)
[![Express.ms](https://img.shields.io/badge/Express.ms-BotX-orange.svg)](https://express.ms/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Ready%20to%20Use-success.svg)]()

> Полнофункциональная система для заказа рейсов с интеграцией в мессенджер Express.ms, веб-интерфейсом и административной панелью

> **⚠️ ВАЖНО:** Перед развертыванием в Express.ms обязательно прочитайте [критически важные доработки](CRITICAL_DEPLOYMENT_REQUIREMENTS.md) - без них система не будет работать в корпоративной среде!

## 📋 Содержание

- [Описание](#-описание)
- [Возможности](#-возможности)
- [Архитектура](#-архитектура)
- [Быстрый старт](#-быстрый-старт)
- [Установка](#-установка)
- [Конфигурация](#-конфигурация)
- [Использование](#-использование)
- [API Документация](#-api-документация)
- [Express.ms интеграция](#-expressms-интеграция)
- [Развертывание](#-развертывание)
- [Мониторинг](#-мониторинг)
- [Разработка](#-разработка)
- [Поддержка](#-поддержка)

## 🎯 Описание

ExpressBOT - это современная система для заказа рейсов, специально разработанная для интеграции с мессенджером Express.ms. Система включает в себя интерактивного чат-бота, веб-интерфейс, REST API и административную панель для полного управления процессом заказа рейсов.

### Ключевые особенности:
- 🤖 **Express.ms Bot** - нативная интеграция через BotX платформу
- 🌐 **Веб-интерфейс** - для тестирования и альтернативного доступа
- 💾 **JSON база данных** - для надежного хранения заказов
- 🔌 **REST API** - для интеграции с внешними системами
- 📊 **Административная панель** - для управления заказами
- 🔒 **Валидация данных** - на всех уровнях системы

## ✨ Возможности

### 🤖 Express.ms Bot
- **Нативная интеграция** с мессенджером Express.ms
- **Пошаговый процесс заказа** с интуитивным интерфейсом
- **Интерактивные кнопки** для быстрого выбора
- **Сохранение состояния** пользователя между сессиями
- **Уведомления** о статусе заказов
- **Команды управления** (/start, /help, /status, /cancel)

### 🌐 Веб-интерфейс
- **Messenger Bot** - веб-версия для тестирования
- **Административная панель** - управление заказами
- **Адаптивный дизайн** - для всех устройств
- **Экспорт данных** - в различных форматах
- **Статистика в реальном времени**

### 💾 Система хранения данных
- **JSON база данных** для хранения заказов
- **Автоматическое сохранение** при подтверждении
- **Уникальные ID заказов** для отслеживания
- **Статистика заказов** по статусам
- **Резервное копирование** данных

### 🔌 API и интеграция
- **REST API** для всех операций с заказами
- **Асинхронная обработка** сообщений
- **Логирование** всех операций
- **Обработка ошибок** с понятными сообщениями
- **CORS поддержка** для веб-интерфейса

## 🏗️ Архитектура

### Общая схема системы
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express.ms    │    │   Express.js    │    │   JSON Database │
│                 │◄──►│     Server      │◄──►│                 │
│  BotX Platform  │    │                 │    │  orders.json    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   MessengerBot  │
                        │                 │
                        │  - Обработка    │
                        │  - Валидация    │
                        │  - Состояние    │
                        └─────────────────┘
```

### Структура проекта
```
ExpressBOTGitHub/
├── src/                          # Исходный код
│   ├── messengerBot.js           # Логика Messenger Bot
│   ├── messengerBotAPI.js        # API для Messenger Bot
│   ├── database.js               # Управление JSON базой данных
│   ├── webhookHandler.js         # Обработка GitHub webhooks
│   ├── botCommands.js            # Команды бота
│   ├── admin.js                  # Административные функции
│   ├── adminCommands.js          # Команды администратора
│   ├── github.js                 # GitHub API интеграция
│   ├── logger.js                 # Система логирования
│   └── testFunctions.js          # Тестовые функции
├── public/                       # Веб-интерфейсы
│   ├── messenger.html            # Интерфейс мессенджера
│   ├── orders.html               # Административная панель
│   ├── admin.html                # Админ панель
│   └── favicon.ico               # Иконка сайта
├── docs/                         # Документация
│   ├── PROJECT_SUMMARY.md        # Сводка проекта
│   ├── QUICK_START.md            # Быстрый старт
│   ├── EXAMPLES.md               # Примеры использования
│   ├── USER_GUIDE.md             # Руководство пользователя
│   ├── TECHNICAL_DOCS.md         # Техническая документация
│   ├── DEPLOYMENT.md             # Руководство по развертыванию
│   ├── CRITICAL_DEPLOYMENT_REQUIREMENTS.md # Критические требования
│   └── EXPRESS_MS_COMPLIANCE_CHECKLIST.md  # Чек-лист соответствия
├── deployment/                   # Готовые конфигурации
│   ├── nginx/                    # Nginx конфигурации
│   ├── systemd/                  # Systemd сервисы
│   ├── scripts/                  # Скрипты развертывания
│   ├── docker/                   # Docker конфигурации
│   ├── templates/                # Шаблоны для администраторов
│   └── env.express.example       # Пример переменных окружения
├── data/                         # База данных
│   └── orders.json               # JSON база данных заказов
├── package.json                  # Node.js зависимости
├── ecosystem.config.js           # PM2 конфигурация
├── Dockerfile                    # Docker образ
├── index.js                      # Главный файл приложения
└── README.md                     # Основная документация
```

### Компоненты системы

#### 1. Express.js Server (`index.js`)
- Основной веб-сервер
- Обработка HTTP запросов
- Маршрутизация API
- Статические файлы

#### 2. MessengerBot (`src/messengerBot.js`)
- Логика обработки сообщений
- Управление состоянием пользователя
- Валидация введенных данных
- Генерация ответов

#### 3. DatabaseManager (`src/database.js`)
- Управление JSON базой данных
- CRUD операции с заказами
- Статистика и аналитика

#### 4. Express.ms Bot (`express_bot.py`)
- Интеграция с Express.ms через BotX
- Обработка команд и сообщений
- Синхронизация с Express.js API

## 🚀 Быстрый старт

### Предварительные требования

#### Для Express.js сервера:
- Node.js 18+
- npm 9+

#### Для Express.ms бота:
- Python 3.11+
- pip

#### Для Express.ms интеграции:
- Аккаунт в Express.ms
- Доступ к BotX платформе
- BOT_ID и SECRET_KEY

### Установка

1. **Клонирование репозитория**
```bash
git clone https://github.com/your-username/expressbot-github.git
cd expressbot-github
```

2. **Установка Node.js зависимостей**
```bash
npm install
```

3. **Установка Python зависимостей**
```bash
pip install -r requirements-express.txt
```

4. **Настройка переменных окружения**
```bash
# Node.js настройки
cp .env.example .env

# Express.ms настройки
cp .env.express.example .env.express
```

5. **Создание необходимых директорий**
```bash
mkdir -p data logs
```

### Запуск системы

#### Вариант 1: Автоматическое развертывание (Рекомендуется)
```bash
# Запуск скрипта развертывания
sudo chmod +x deployment/scripts/deploy.sh
sudo ./deployment/scripts/deploy.sh production
```

#### Вариант 2: Docker развертывание
```bash
# Продакшен
docker-compose -f deployment/docker/docker-compose.prod.yml up -d

# Разработка
docker-compose -f deployment/docker/docker-compose.dev.yml up -d
```

#### Вариант 3: PM2 развертывание
```bash
# Установка PM2
npm install -g pm2

# Запуск
pm2 start ecosystem.config.js

# Мониторинг
pm2 monit
```

#### Вариант 4: Локальный запуск (для тестирования)
```bash
# Терминал 1: Express.js сервер
npm start

# Терминал 2: Express.ms бот (если есть учетные данные)
python express_bot.py
```

## ⚙️ Конфигурация

### Переменные окружения

#### .env (Express.js сервер)
```env
# Основные настройки
PORT=3000
NODE_ENV=production

# GitHub настройки (опционально)
GITHUB_TOKEN=your_github_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# База данных
DATABASE_PATH=./data/orders.json

# Логирование
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

#### .env.express (Express.ms бот)
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

### Настройка Express.ms

1. **Создание бота в Express.ms**
   - Зайдите в админ-панель Express.ms
   - Перейдите в раздел "Чат-боты"
   - Создайте нового бота
   - Получите `BOT_ID` и `SECRET_KEY`

2. **Настройка webhook**
   - Укажите URL вашего сервера
   - Настройте порт (по умолчанию 8080)
   - Включите TLS для безопасности

3. **Тестирование подключения**
```bash
   # Проверка API
   curl http://localhost:3000/api/orders/stats
   
   # Проверка бота
   python express_bot.py
   ```

## 🎮 Использование

### Команды Express.ms бота

- `/start` - Начать процесс заказа рейса
- `/help` - Показать справку по командам
- `/status` - Посмотреть статус заказов
- `/cancel` - Отменить текущий заказ

### Процесс заказа рейса

1. **Выбор локации** - Москва, Санкт-Петербург, Екатеринбург, Сочи
2. **Выбор подразделения** - ОКЭ 1-3, ОЛСИТ
3. **Выбор даты вылета** - Интерактивный календарь
4. **Выбор должности** - БП, БП BS, СБЭ, ИПБ
5. **Ввод ФИО** - Полное имя сотрудника
6. **Ввод табельного номера** - Числовой идентификатор
7. **Ввод направления** - Желаемое направление полета
8. **Ввод пожеланий** - Дополнительные требования
9. **Подтверждение** - Финальная сводка и отправка

### Веб-интерфейсы

#### Messenger Bot (`http://localhost:3000/messenger.html`)
- Тестирование бота в браузере
- Отладка команд и состояний
- Просмотр истории сообщений

#### Админ-панель (`http://localhost:3000/orders.html`)
- Просмотр всех заказов
- Обновление статусов
- Экспорт данных
- Статистика заказов

## 📚 API Документация

### Основные Endpoints

#### Messenger Bot API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/messenger/message` | Обработка сообщений бота |
| GET | `/api/messenger/stats` | Статистика бота |
| GET | `/api/messenger/commands` | Доступные команды |

#### Orders API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/orders` | Получить все заказы |
| GET | `/api/orders/stats` | Статистика заказов |
| GET | `/api/orders/:orderId` | Получить заказ по ID |
| GET | `/api/orders/user/:userId` | Заказы пользователя |
| PUT | `/api/orders/:orderId/status` | Обновить статус заказа |

### Примеры запросов

#### Создание заказа через API
```bash
curl -X POST http://localhost:3000/api/messenger/message \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "message": "/start"}'
```

#### Получение статистики
```bash
curl http://localhost:3000/api/orders/stats
```

#### Обновление статуса
```bash
curl -X PUT http://localhost:3000/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

## 🤖 Express.ms интеграция

### Настройка Express.ms бота

1. **Установка зависимостей**
```bash
pip install pybotx requests python-dotenv
```

2. **Конфигурация бота**
```python
# config.py
EXPRESS_BOT_ID = "your_bot_id"
EXPRESS_SECRET_KEY = "your_secret_key"
EXPRESS_HOST = "your_express_host"
EXPRESS_PORT = 8080
```

3. **Запуск бота**
```bash
python express_bot.py
```

### Функции Express.ms бота

- **Обработка команд** - /start, /help, /status, /cancel
- **Интерактивные кнопки** - для быстрого выбора
- **Сохранение состояния** - между сессиями
- **Синхронизация с API** - через HTTP запросы
- **Логирование** - всех операций

### Примеры интеграции

#### Обработка команды /start
```python
@collector.command("/start", description="Начать заказ рейса")
async def start_command(message: IncomingMessage, bot: Bot) -> None:
    user_id = str(message.sender.user_huid)
    response = await send_to_express_api(user_id, "/start")
    await send_bot_response(message, bot, response["data"])
```

#### Обработка текстовых сообщений
```python
@collector.message
async def handle_message(message: IncomingMessage, bot: Bot) -> None:
    user_id = str(message.sender.user_huid)
    message_text = message.body
    response = await send_to_express_api(user_id, message_text)
    await send_bot_response(message, bot, response["data"])
```

## 🐳 Развертывание

### Автоматическое развертывание (Рекомендуется)

```bash
# Запуск скрипта развертывания
sudo chmod +x deployment/scripts/deploy.sh
sudo ./deployment/scripts/deploy.sh production
```

**Скрипт автоматически:**
- Создает пользователя expressbot
- Устанавливает зависимости
- Копирует конфигурации
- Настраивает systemd сервисы
- Запускает все компоненты

### Docker развертывание

```bash
# Продакшен (полная система)
docker-compose -f deployment/docker/docker-compose.prod.yml up -d

# Разработка (минимальная система)
docker-compose -f deployment/docker/docker-compose.dev.yml up -d

# Просмотр логов
docker-compose -f deployment/docker/docker-compose.prod.yml logs -f

# Остановка
docker-compose -f deployment/docker/docker-compose.prod.yml down
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

### Nginx (Reverse Proxy)

```bash
# Копирование конфигурации
sudo cp deployment/nginx/nginx.conf /etc/nginx/sites-available/expressbot
sudo ln -s /etc/nginx/sites-available/expressbot /etc/nginx/sites-enabled/

# Настройка SSL
sudo certbot --nginx -d your-domain.com

# Перезапуск Nginx
sudo systemctl reload nginx
```

## 📊 Мониторинг и логирование

### Логи
- **Express.js:** `logs/app.log`
- **Express.ms бот:** `express_bot.log`
- **Ротация:** Автоматическая при достижении 10MB
- **Уровни:** error, warn, info, debug

### Метрики
- **Заказы:** `GET /api/orders/stats`
- **Здоровье системы:** Проверка через логи
- **Производительность:** PM2 мониторинг

### Отладка
```bash
# Просмотр логов в реальном времени
tail -f logs/app.log
tail -f express_bot.log

# Запуск в debug режиме
LOG_LEVEL=debug npm start
LOG_LEVEL=DEBUG python express_bot.py
```

## 🛠️ Разработка

### Установка для разработки
```bash
# Клонирование репозитория
git clone <repository-url>
cd expressbot-github

# Установка зависимостей
npm install
pip install -r requirements-express.txt

# Запуск в режиме разработки
npm run dev
python express_bot.py
```

### Структура кода
- **Node.js:** ES6+ синтаксис, модульная архитектура
- **Python:** PEP 8, асинхронное программирование
- **Обработка ошибок** на всех уровнях
- **Валидация данных** для всех входных параметров

### Тестирование
```bash
# Node.js тесты
npm test
npm run lint
npm audit

# Python тесты
python -m pytest tests/
python -m flake8 express_bot.py
```

### Добавление новых функций

1. **Новые команды бота:**
   - Добавьте в `src/messengerBot.js`
   - Обновите `src/messengerBotAPI.js`
   - Добавьте обработку в `express_bot.py`
   - Обновите `public/messenger.html`

2. **Новые API endpoints:**
   - Добавьте в `index.js`
   - Создайте обработчик в соответствующем модуле
   - Обновите документацию

3. **Новые состояния пользователя:**
   - Добавьте в `src/messengerBot.js`
   - Обновите валидацию
   - Добавьте UI элементы

## 🔒 Безопасность

### Рекомендации
- Используйте HTTPS в продакшене
- Регулярно обновляйте зависимости
- Ограничьте доступ к админ-панели
- Используйте сильные пароли для Express.ms токенов
- Настройте firewall для портов

### Переменные окружения
- Никогда не коммитьте `.env` файлы
- Используйте разные токены для разных сред
- Регулярно ротируйте секретные ключи
- Используйте Docker secrets в продакшене

## 🐛 Устранение неполадок

### Частые проблемы

1. **Порт занят**
   ```bash
   # Найдите процесс
   lsof -i :3000
   lsof -i :8080
   
   # Завершите процесс
   kill -9 PID
   ```

2. **Ошибки базы данных**
   - Проверьте права на запись в `data/`
   - Убедитесь в корректности JSON
   - Проверьте свободное место на диске

3. **Express.ms бот не подключается**
   - Проверьте BOT_ID и SECRET_KEY
   - Убедитесь в доступности Express.ms сервера
   - Проверьте настройки firewall

4. **API не отвечает**
   - Проверьте статус Express.js сервера
   - Убедитесь в корректности URL
   - Проверьте логи приложения

### Логи отладки
```bash
# Включить debug логирование
LOG_LEVEL=debug npm start
LOG_LEVEL=DEBUG python express_bot.py
```

## 📚 Дополнительная документация

- [🚨 Критически важные доработки для развертывания](docs/CRITICAL_DEPLOYMENT_REQUIREMENTS.md) - **ОБЯЗАТЕЛЬНО К ПРОЧТЕНИЮ**
- [📁 Готовые конфигурации для развертывания](deployment/README.md) - **ВСЕ ГОТОВО К ИСПОЛЬЗОВАНИЮ**
- [Руководство по развертыванию](docs/DEPLOYMENT.md) - Подробное руководство
- [Техническая документация](docs/TECHNICAL_DOCS.md) - Технические детали
- [Чек-лист соответствия Express.ms](docs/EXPRESS_MS_COMPLIANCE_CHECKLIST.md) - Требования Express.ms
- [Руководство пользователя](docs/USER_GUIDE.md) - Для пользователей
- [Примеры использования](docs/EXAMPLES.md) - Примеры и кейсы
- [Сводка проекта](docs/PROJECT_SUMMARY.md) - Краткое описание
- [Быстрый старт](docs/QUICK_START.md) - Быстрое начало работы

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Changelog

### v1.0.0 (2025-09-21)
- ✨ Первый релиз
- 🤖 Express.ms Bot интеграция
- 🌐 Messenger Bot для заказа рейсов
- 💾 JSON база данных
- 🔌 REST API
- 🎨 Веб-интерфейсы
- 📊 Административная панель
- 🐳 Docker контейнеризация

## 🔮 Планы развития

- [ ] Интеграция с внешними системами
- [ ] Уведомления по email/SMS
- [ ] Расширенная аналитика
- [ ] Мобильное приложение
- [ ] Интеграция с календарями
- [ ] Машинное обучение для рекомендаций

## 📞 Поддержка

- **Документация Express.ms:** [docs.express.ms](https://docs.express.ms)
- **Issues:** [GitHub Issues](https://github.com/your-username/expressbot-github/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/expressbot-github/discussions)
- **Telegram:** [@communicado](https://t.me/communicado)
- **Email:** A.Sokolyanskiy@rossiya-airlines.com

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 👥 Авторы

- **JigenCommunicado** - *Основной разработчик* - [GitHub](https://github.com/JigenCommunicado) | [Telegram](https://t.me/communicado) | [Email](mailto:A.Sokolyanskiy@rossiya-airlines.com)

## 🙏 Благодарности

- Express.js команде за отличный фреймворк
- Express.ms команде за BotX платформу
- Node.js и Python сообществам за поддержку
- Всем контрибьюторам проекта

---

<div align="center">

**ExpressBOT** - Интегрированная система заказа рейсов для Express.ms

[Документация](docs/) • [Примеры](examples/) • [API](api/) • [Поддержка](support/)

</div>

