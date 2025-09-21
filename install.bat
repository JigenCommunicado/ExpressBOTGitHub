@echo off
echo ========================================
echo    ExpressBOT - Автоматическая установка
echo ========================================
echo.

echo [1/5] Проверка Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не найден!
    echo 📥 Скачайте Node.js с https://nodejs.org/
    echo 🔄 Перезапустите этот скрипт после установки
    pause
    exit /b 1
) else (
    echo ✅ Node.js найден
)

echo.
echo [2/5] Проверка npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm не найден!
    echo 🔄 Переустановите Node.js
    pause
    exit /b 1
) else (
    echo ✅ npm найден
)

echo.
echo [3/5] Установка зависимостей...
npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей!
    pause
    exit /b 1
) else (
    echo ✅ Зависимости установлены
)

echo.
echo [4/5] Создание конфигурации...
if not exist .env (
    copy .env.example .env
    echo ✅ Файл .env создан
) else (
    echo ✅ Файл .env уже существует
)

echo.
echo [5/5] Проверка готовности...
echo ✅ ExpressBOT готов к запуску!
echo.

echo ========================================
echo           🎉 УСТАНОВКА ЗАВЕРШЕНА!
echo ========================================
echo.
echo 📋 Что дальше:
echo    1. Запустите: node index.js
echo    2. Откройте: http://localhost:3000
echo    3. Админ-панель: http://localhost:3000/admin.html
echo.
echo 🔑 Учетные данные:
echo    Логин: admin
echo    Пароль: admin123
echo.
echo 📚 Подробная инструкция: DEPLOYMENT_GUIDE.md
echo.

pause
