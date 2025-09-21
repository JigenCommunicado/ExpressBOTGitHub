# ExpressBOT - Docker развертывание

## Системные требования

- Linux ОС
- Docker
- Docker Compose
- PostgreSQL v15
- Redis v7
- Свободный порт в диапазоне 1024-65535

## Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/JigenCommunicado/ExpressBOTGitHub.git
cd ExpressBOTGitHub
```

### 2. Настройка переменных окружения
```bash
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

### 3. Запуск через Docker Compose
```bash
docker-compose up -d
```

### 4. Проверка статуса
```bash
docker-compose ps
docker-compose logs -f expressbot
```

## Доступ к приложению

- **Основное приложение:** http://localhost:3000
- **Админ-панель:** http://localhost:3000/admin.html
- **API документация:** http://localhost:3000/api/commands

### Учетные данные по умолчанию
- **Логин:** admin
- **Пароль:** admin123

## Управление контейнерами

### Остановка
```bash
docker-compose down
```

### Перезапуск
```bash
docker-compose restart
```

### Обновление
```bash
docker-compose pull
docker-compose up -d
```

### Просмотр логов
```bash
docker-compose logs -f expressbot
docker-compose logs -f postgres
docker-compose logs -f redis
```

## База данных

### Подключение к PostgreSQL
```bash
docker-compose exec postgres psql -U expressbot -d expressbot
```

### Подключение к Redis
```bash
docker-compose exec redis redis-cli
```

### Резервное копирование
```bash
docker-compose exec postgres pg_dump -U expressbot expressbot > backup.sql
```

### Восстановление
```bash
docker-compose exec -T postgres psql -U expressbot expressbot < backup.sql
```

## Мониторинг

### Статистика контейнеров
```bash
docker stats
```

### Использование ресурсов
```bash
docker-compose exec expressbot node -e "console.log(process.memoryUsage())"
```

## Безопасность

### Изменение паролей по умолчанию
1. Отредактируйте `docker-compose.yml`
2. Измените `POSTGRES_PASSWORD` и `REDIS_PASSWORD`
3. Перезапустите контейнеры

### Настройка SSL
1. Добавьте SSL сертификаты в папку `ssl/`
2. Обновите `docker-compose.yml` для использования SSL

## Масштабирование

### Горизонтальное масштабирование
```bash
docker-compose up -d --scale expressbot=3
```

### Настройка балансировщика нагрузки
Добавьте nginx конфигурацию для распределения нагрузки между экземплярами.

## Устранение неполадок

### Проверка логов
```bash
docker-compose logs expressbot
```

### Проверка подключений
```bash
docker-compose exec expressbot node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(console.log).catch(console.error);
"
```

### Пересоздание контейнеров
```bash
docker-compose down -v
docker-compose up -d
```

## Производственное развертывание

### 1. Настройка переменных окружения
```bash
export GITHUB_TOKEN=your_token
export GITHUB_WEBHOOK_SECRET=your_secret
export JWT_SECRET=your_jwt_secret
```

### 2. Запуск в production режиме
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. Настройка мониторинга
Добавьте Prometheus и Grafana для мониторинга производительности.

## Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs`
2. Проверьте статус контейнеров: `docker-compose ps`
3. Проверьте использование ресурсов: `docker stats`
4. Создайте issue в репозитории GitHub
