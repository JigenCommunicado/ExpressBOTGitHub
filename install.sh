#!/bin/bash

echo "========================================"
echo "   ExpressBOT - Автоматическая установка"
echo "========================================"
echo

echo "[1/6] Проверка Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден!"
    echo "📥 Установка Node.js..."
    
    # Установка Node.js через NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка установки Node.js!"
        echo "🔧 Установите Node.js вручную: https://nodejs.org/"
        exit 1
    fi
else
    echo "✅ Node.js найден: $(node --version)"
fi

echo
echo "[2/6] Проверка npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm не найден!"
    exit 1
else
    echo "✅ npm найден: $(npm --version)"
fi

echo
echo "[3/6] Установка зависимостей..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей!"
    exit 1
else
    echo "✅ Зависимости установлены"
fi

echo
echo "[4/6] Создание конфигурации..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Файл .env создан"
else
    echo "✅ Файл .env уже существует"
fi

echo
echo "[5/6] Установка прав на выполнение..."
chmod +x install.sh
chmod +x test-api.js

echo
echo "[6/6] Проверка готовности..."
echo "✅ ExpressBOT готов к запуску!"
echo

echo "========================================"
echo "           🎉 УСТАНОВКА ЗАВЕРШЕНА!"
echo "========================================"
echo
echo "📋 Что дальше:"
echo "   1. Запустите: node index.js"
echo "   2. Откройте: http://localhost:3000"
echo "   3. Админ-панель: http://localhost:3000/admin.html"
echo
echo "🔑 Учетные данные:"
echo "   Логин: admin"
echo "   Пароль: admin123"
echo
echo "🐳 Для Docker развертывания:"
echo "   docker-compose up -d"
echo
echo "📚 Подробная инструкция: DEPLOYMENT_GUIDE.md"
echo

read -p "Нажмите Enter для продолжения..."
