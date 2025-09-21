# 🚀 ExpressBOT - Руководство по развертыванию для администратора

## 📋 Содержание
1. [Системные требования](#системные-требования)
2. [Быстрый старт (Windows)](#быстрый-старт-windows)
3. [Развертывание в Docker (Linux)](#развертывание-в-docker-linux)
4. [Настройка и конфигурация](#настройка-и-конфигурация)
5. [Проверка работоспособности](#проверка-работоспособности)
6. [Управление и мониторинг](#управление-и-мониторинг)
7. [Устранение неполадок](#устранение-неполадок)
8. [Безопасность](#безопасность)

---

## 🔧 Системные требования

### Минимальные требования:
- **ОС:** Windows 10/11 или Linux (Ubuntu 20.04+)
- **RAM:** 2 GB
- **Диск:** 5 GB свободного места
- **Сеть:** Доступ к интернету

### Для Docker развертывания:
- **ОС:** Linux (Ubuntu 20.04+)
- **Docker:** версия 20.10+
- **Docker Compose:** версия 2.0+
- **PostgreSQL:** версия 15+
- **Redis:** версия 7+

---

## 🚀 Быстрый старт (Windows)

### Шаг 1: Установка Node.js
1. Скачайте Node.js с официального сайта: https://nodejs.org/
2. Выберите LTS версию (рекомендуется 18.x)
3. Установите с настройками по умолчанию
4. Проверьте установку:
   ```cmd
   node --version
   npm --version
   ```

### Шаг 2: Клонирование репозитория
1. Откройте командную строку (cmd) или PowerShell
2. Перейдите в папку, где хотите разместить бота
3. Выполните команду:
   ```cmd
   git clone https://github.com/JigenCommunicado/ExpressBOTGitHub.git
   cd ExpressBOTGitHub
   ```

### Шаг 3: Установка зависимостей
```cmd
npm install
```

### Шаг 4: Настройка конфигурации
1. Скопируйте файл конфигурации:
   ```cmd
   copy .env.example .env
   ```
2. Откройте файл `.env` в текстовом редакторе
3. Настройте переменные (см. раздел "Настройка и конфигурация")

### Шаг 5: Запуск бота
```cmd
node index.js
```

### Шаг 6: Проверка работы
1. Откройте браузер
2. Перейдите по адресу: http://localhost:3000
3. Должна открыться страница с информацией о боте

---

## 🐳 Развертывание в Docker (Linux)

### Шаг 1: Установка Docker
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Перезагрузка для применения изменений
sudo reboot
```

### Шаг 2: Установка Docker Compose
```bash
# Скачивание Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Установка прав на выполнение
sudo chmod +x /usr/local/bin/docker-compose

# Проверка установки
docker-compose --version
```

### Шаг 3: Клонирование и настройка
```bash
# Клонирование репозитория
git clone https://github.com/JigenCommunicado/ExpressBOTGitHub.git
cd ExpressBOTGitHub

# Создание файла конфигурации
cp .env.example .env

# Редактирование конфигурации
nano .env
```

### Шаг 4: Запуск через Docker Compose
```bash
# Запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f expressbot
```

---

## ⚙️ Настройка и конфигурация

### Файл .env
Создайте файл `.env` на основе `.env.example`:

```env
# Основные настройки
NODE_ENV=production
PORT=3000

# База данных (для Docker)
DATABASE_URL=postgresql://expressbot:password@postgres:5432/expressbot

# Redis (для Docker)
REDIS_URL=redis://redis:6379

# GitHub API (получите на https://github.com/settings/tokens)
GITHUB_TOKEN=your_github_token_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# Логирование
LOG_LEVEL=info
LOG_TO_FILE=true

# Безопасность
JWT_SECRET=your_very_secret_jwt_key_here
```

### Получение GitHub токена:
1. Перейдите на https://github.com/settings/tokens
2. Нажмите "Generate new token"
3. Выберите "classic" токен
4. Установите срок действия (рекомендуется 1 год)
5. Выберите права доступа:
   - `repo` - для доступа к репозиториям
   - `user` - для информации о пользователях
   - `read:org` - для информации об организациях
6. Скопируйте токен и вставьте в `.env`

---

## ✅ Проверка работоспособности

### 1. Проверка основных endpoints
```bash
# Главная страница
curl http://localhost:3000

# Health check
curl http://localhost:3000/health

# Список команд
curl http://localhost:3000/api/commands
```

### 2. Проверка админ-панели
1. Откройте браузер
2. Перейдите на http://localhost:3000/admin.html
3. Войдите с учетными данными:
   - **Логин:** admin
   - **Пароль:** admin123

### 3. Автоматическое тестирование
```bash
# Запуск тестов
node test-api.js
```

### 4. Проверка через браузер
- **Главная страница:** http://localhost:3000
- **Админ-панель:** http://localhost:3000/admin.html
- **Health Check:** http://localhost:3000/health

---

## 🔧 Управление и мониторинг

### Управление сервисом (Windows)
```cmd
# Запуск
node index.js

# Остановка
Ctrl + C

# Запуск в фоне (PowerShell)
Start-Process powershell -ArgumentList "-Command", "node index.js" -WindowStyle Minimized
```

### Управление Docker (Linux)
```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Просмотр логов
docker-compose logs -f expressbot

# Обновление
docker-compose pull
docker-compose up -d
```

### Мониторинг производительности
```bash
# Статистика контейнеров (Docker)
docker stats

# Использование ресурсов
docker-compose exec expressbot node -e "console.log(process.memoryUsage())"

# Проверка подключений
netstat -tulpn | grep :3000
```

---

## 🛠️ Устранение неполадок

### Проблема: "node не является внутренней или внешней командой"
**Решение:**
1. Переустановите Node.js
2. Перезапустите командную строку
3. Проверьте переменную PATH

### Проблема: "npm не является внутренней или внешней командой"
**Решение:**
1. Переустановите Node.js (npm входит в комплект)
2. Перезапустите командную строку

### Проблема: "Порт 3000 уже используется"
**Решение:**
1. Найдите процесс, использующий порт:
   ```cmd
   netstat -ano | findstr :3000
   ```
2. Завершите процесс:
   ```cmd
   taskkill /PID <номер_процесса> /F
   ```
3. Или измените порт в `.env` файле

### Проблема: "Ошибка подключения к базе данных"
**Решение:**
1. Проверьте, что PostgreSQL запущен
2. Проверьте строку подключения в `.env`
3. Убедитесь, что база данных создана

### Проблема: "Ошибка 401 при входе в админ-панель"
**Решение:**
1. Проверьте логин и пароль (admin/admin123)
2. Очистите кэш браузера
3. Проверьте логи сервера

### Проблема: "GitHub API не работает"
**Решение:**
1. Проверьте токен в `.env`
2. Убедитесь, что токен имеет нужные права
3. Проверьте интернет-соединение

---

## 🔒 Безопасность

### Обязательные меры безопасности:

1. **Измените пароли по умолчанию:**
   ```sql
   -- Подключитесь к PostgreSQL
   UPDATE admins SET password_hash = 'new_hashed_password' WHERE username = 'admin';
   ```

2. **Настройте файрвол:**
   ```bash
   # Разрешить только нужные порты
   sudo ufw allow 3000
   sudo ufw allow 22
   sudo ufw enable
   ```

3. **Используйте HTTPS в продакшене:**
   - Настройте SSL сертификат
   - Используйте reverse proxy (nginx)

4. **Регулярно обновляйте:**
   ```bash
   # Обновление зависимостей
   npm update
   
   # Обновление Docker образов
   docker-compose pull
   ```

5. **Настройте резервное копирование:**
   ```bash
   # Бэкап базы данных
   docker-compose exec postgres pg_dump -U expressbot expressbot > backup.sql
   ```

---

## 📞 Поддержка

### Логи и диагностика:
```bash
# Просмотр логов приложения
docker-compose logs expressbot

# Просмотр логов базы данных
docker-compose logs postgres

# Просмотр логов Redis
docker-compose logs redis
```

### Полезные команды:
```bash
# Проверка статуса всех сервисов
docker-compose ps

# Перезапуск только бота
docker-compose restart expressbot

# Просмотр использования ресурсов
docker stats

# Проверка подключений
netstat -tulpn | grep :3000
```

### Контакты для поддержки:
- **GitHub Issues:** https://github.com/JigenCommunicado/ExpressBOTGitHub/issues
- **Документация:** README.md в корне проекта

---

## 🎯 Готово!

После выполнения всех шагов у вас будет:
- ✅ Работающий ExpressBOT
- ✅ Админ-панель для управления
- ✅ API для интеграции
- ✅ Система мониторинга
- ✅ Безопасная конфигурация

**Удачного развертывания! 🚀**
