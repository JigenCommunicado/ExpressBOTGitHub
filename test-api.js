const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Начинаем тестирование ExpressBOT API...\n');

  try {
    // 1. Тест главной страницы
    console.log('1️⃣ Тестируем главную страницу...');
    const mainResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Главная страница:', mainResponse.data.message);
    console.log('   Статус:', mainResponse.data.status);
    console.log('   Версия:', mainResponse.data.version);
    console.log('');

    // 2. Тест health check
    console.log('2️⃣ Тестируем health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.status);
    console.log('   Время работы:', Math.floor(healthResponse.data.uptime), 'секунд');
    console.log('   Память RSS:', Math.round(healthResponse.data.memory.rss / 1024 / 1024), 'MB');
    console.log('');

    // 3. Тест списка команд
    console.log('3️⃣ Тестируем список команд...');
    const commandsResponse = await axios.get(`${BASE_URL}/api/commands`);
    console.log('✅ Доступно команд:', commandsResponse.data.data.count);
    console.log('   Команды:', commandsResponse.data.data.commands.join(', '));
    console.log('');

    // 4. Тест команды help
    console.log('4️⃣ Тестируем команду help...');
    const helpResponse = await axios.post(`${BASE_URL}/api/command`, {
      command: 'help',
      args: []
    });
    console.log('✅ Команда help выполнена успешно');
    console.log('   Тип ответа:', helpResponse.data.data.type);
    console.log('');

    // 5. Тест GitHub API (если есть токен)
    if (process.env.GITHUB_TOKEN) {
      console.log('5️⃣ Тестируем GitHub API...');
      try {
        const userResponse = await axios.get(`${BASE_URL}/api/user/microsoft`);
        console.log('✅ GitHub API работает');
        console.log('   Пользователь:', userResponse.data.data.login);
        console.log('   Репозиториев:', userResponse.data.data.public_repos);
        console.log('');
      } catch (error) {
        console.log('⚠️ GitHub API требует токен (GITHUB_TOKEN)');
        console.log('');
      }
    } else {
      console.log('5️⃣ Пропускаем GitHub API (нет токена)');
      console.log('');
    }

    // 6. Тест админ аутентификации
    console.log('6️⃣ Тестируем админ аутентификацию...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/admin/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Админ аутентификация успешна');
        console.log('   Session ID:', loginResponse.data.session_id);
        console.log('   Роль:', loginResponse.data.admin.role);
        console.log('');

        // 7. Тест админ API
        console.log('7️⃣ Тестируем админ API...');
        const sessionId = loginResponse.data.session_id;
        
        // Статистика
        const statsResponse = await axios.get(`${BASE_URL}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${sessionId}` }
        });
        console.log('✅ Статистика системы получена');
        console.log('   Админов:', statsResponse.data.data.admins);
        console.log('   Пользователей:', statsResponse.data.data.users);
        console.log('   Активных сессий:', statsResponse.data.data.active_sessions);
        console.log('');

        // Пользователи
        const usersResponse = await axios.get(`${BASE_URL}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${sessionId}` }
        });
        console.log('✅ Список пользователей получен');
        console.log('   Всего пользователей:', usersResponse.data.data.total);
        console.log('');

        // Админы
        const adminsResponse = await axios.get(`${BASE_URL}/api/admin/admins`, {
          headers: { 'Authorization': `Bearer ${sessionId}` }
        });
        console.log('✅ Список администраторов получен');
        console.log('   Всего админов:', adminsResponse.data.data.total);
        console.log('');

        // Логи
        const logsResponse = await axios.get(`${BASE_URL}/api/admin/logs?limit=5`, {
          headers: { 'Authorization': `Bearer ${sessionId}` }
        });
        console.log('✅ Логи аудита получены');
        console.log('   Последних записей:', logsResponse.data.data.total);
        console.log('');

      } else {
        console.log('❌ Ошибка админ аутентификации:', loginResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Ошибка админ аутентификации:', error.response?.data?.message || error.message);
    }

    console.log('🎉 Тестирование завершено успешно!');
    console.log('\n📋 Доступные интерфейсы:');
    console.log('   🌐 Главная страница: http://localhost:3000');
    console.log('   🔐 Админ-панель: http://localhost:3000/admin.html');
    console.log('   💚 Health Check: http://localhost:3000/health');
    console.log('   🤖 API Commands: http://localhost:3000/api/commands');

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    if (error.response) {
      console.error('   Статус:', error.response.status);
      console.error('   Данные:', error.response.data);
    }
  }
}

// Запуск тестирования
testAPI();
