# ExpressBOT GitHub - Сводка проекта

## 🎯 Назначение
Система для автоматизации работы с GitHub через Express Messenger Bot, включающая заказ рейсов, управление заявками и интеграцию с корпоративными системами.

## 🏗️ Архитектура
- **Express.js** - основной веб-сервер (порт 3000)
- **Messenger Bot** - интерфейс для пользователей
- **JSON Database** - хранение данных в `data/orders.json`
- **Express.ms Integration** - интеграция с корпоративным мессенджером
- **Admin Panel** - управление заявками
- **Nginx** - reverse proxy и SSL терминация

## 🚀 Основные функции
1. **Заказ рейсов** - пошаговый процесс заказа через веб-интерфейс
2. **Управление заявками** - просмотр и обработка заказов
3. **Интеграция с Express.ms** - работа через корпоративный мессенджер
4. **Административная панель** - управление системой
5. **REST API** - API для интеграций и мобильных приложений
6. **Автоматическое развертывание** - готовые скрипты и конфигурации

## 📁 Структура проекта
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
└── README.md                     # Документация
```

## 🔧 Технологии
- **Backend:** Node.js, Express.js
- **Frontend:** HTML, CSS, JavaScript
- **Database:** JSON файлы
- **Integration:** Express.ms BotX, pybotx
- **Deployment:** Docker, PM2, Systemd, Nginx
- **Monitoring:** PM2, systemd, логирование

## 🚀 Быстрый старт
```bash
# Клонирование репозитория
git clone <repository-url>
cd ExpressBOTGitHub

# Установка зависимостей
npm install

# Запуск (разработка)
npm start

# Автоматическое развертывание (продакшен)
sudo ./deployment/scripts/deploy.sh production
```

## 📊 API Endpoints
- `GET /` - главная страница
- `GET /messenger` - интерфейс мессенджера
- `GET /orders` - административная панель
- `POST /api/messenger` - обработка сообщений
- `GET /api/orders` - получение заказов
- `PUT /api/orders/:id/status` - обновление статуса

## 🔐 Безопасность
- Валидация входных данных
- Логирование всех операций
- Защита от SQL инъекций (JSON база)
- CORS настройки
- Rate limiting

## 📞 Поддержка
- **Telegram:** [@communicado](https://t.me/communicado)
- **Email:** A.Sokolyanskiy@rossiya-airlines.com
- **GitHub Issues:** [Создать issue](https://github.com/your-username/expressbot-github/issues)

## 📄 Лицензия
MIT License - см. файл [LICENSE](LICENSE) для деталей.