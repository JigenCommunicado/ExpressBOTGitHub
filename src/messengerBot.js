const DatabaseManager = require('./database');
const WeekendQuotaManager = require('./weekendQuotaManager');

class MessengerBot {
  constructor(logger) {
    this.logger = logger;
    this.users = new Map();
    this.flightRequests = new Map();
    this.database = new DatabaseManager();
    this.quotaManager = new WeekendQuotaManager();
    
    // Общие объекты для маппинга
    this.departments = {
      'moscow': { name: 'Москва', icon: '🏛️' },
      'spb': { name: 'Санкт-Петербург', icon: '🏛️' },
      'krasnoyarsk': { name: 'Красноярск', icon: '🏔️' },
      'sochi': { name: 'Сочи', icon: '🌴' }
    };

    this.positions = {
      'bp': { name: 'БП' },
      'bp_bs': { name: 'БП BS' },
      'sbe': { name: 'СБЭ' },
      'ipb': { name: 'ИПБ' }
    };

    this.departmentsMapping = {
      'moscow': 'Москва',
      'spb': 'Санкт-Петербург', 
      'krasnoyarsk': 'Красноярск',
      'sochi': 'Сочи'
    };

    this.positionsMapping = {
      'bp': 'BP',
      'bp_bs': 'BP BS',
      'sbe': 'SBE',
      'ipb': 'IPB'
    };
    
    this.setupCommands();
    this.initDatabase();
  }

  async initDatabase() {
    try {
      await this.database.init();
      console.log('База данных инициализирована');
    } catch (error) {
      console.error('Ошибка инициализации базы данных:', error);
    }
  }

  setupCommands() {
    this.commands = new Map();
    
    this.commands.set('start', {
      description: 'Начать работу с ботом',
      handler: this.handleStart.bind(this)
    });

    this.commands.set('help', {
      description: 'Показать справку',
      handler: this.handleHelp.bind(this)
    });

    this.commands.set('order_flight', {
      description: 'Заказать рейс',
      handler: this.handleOrderFlight.bind(this)
    });

    this.commands.set('my_orders', {
      description: 'Мои заказы',
      handler: this.handleMyOrders.bind(this)
    });

    this.commands.set('cancel_order', {
      description: 'Отменить заказ',
      handler: this.handleCancelOrder.bind(this)
    });

    this.commands.set('status', {
      description: 'Статус заказа',
      handler: this.handleStatus.bind(this)
    });

    this.commands.set('select_location', {
      description: 'Выбор локации',
      handler: this.handleLocationSelection.bind(this)
    });

    this.commands.set('select_department', {
      description: 'Выбор подразделения',
      handler: this.handleDepartmentSelection.bind(this)
    });

    this.commands.set('select_date', {
      description: 'Выбор даты',
      handler: this.handleDateSelection.bind(this)
    });

    this.commands.set('select_position', {
      description: 'Выбор должности',
      handler: this.handlePositionSelection.bind(this)
    });

    this.commands.set('confirm_order', {
      description: 'Подтверждение заказа',
      handler: this.handleConfirmOrder.bind(this)
    });

    this.commands.set('edit_order', {
      description: 'Изменение заказа',
      handler: this.handleEditOrder.bind(this)
    });

    // Новые команды для услуг
    this.commands.set('order_weekend', {
      description: 'Заказ выходных',
      handler: this.handleOrderWeekend.bind(this)
    });

    this.commands.set('order_hotel', {
      description: 'Заказ гостиницы',
      handler: this.handleOrderHotel.bind(this)
    });

    this.commands.set('order_aeroexpress', {
      description: 'Заказ аэроэкспресса',
      handler: this.handleOrderAeroexpress.bind(this)
    });

    // Команды для управления выходными
    this.commands.set('weekend_book', {
      description: 'Заказать выходной день',
      handler: this.handleWeekendBook.bind(this)
    });

    this.commands.set('weekend_cancel', {
      description: 'Отменить выходной день',
      handler: this.handleWeekendCancel.bind(this)
    });

    this.commands.set('weekend_free_dates', {
      description: 'Показать свободные даты',
      handler: this.handleWeekendFreeDates.bind(this)
    });

    this.commands.set('weekend_booked_dates', {
      description: 'Показать заказанные даты',
      handler: this.handleWeekendBookedDates.bind(this)
    });

    this.commands.set('weekend_select_date', {
      description: 'Выбрать дату для выходного',
      handler: this.handleWeekendSelectDate.bind(this)
    });

    this.commands.set('weekend_department_selection', {
      description: 'Выбор подразделения для выходных',
      handler: this.handleWeekendDepartmentSelection.bind(this)
    });

    this.commands.set('weekend_position_selection', {
      description: 'Выбор должности для выходных',
      handler: this.handleWeekendPositionSelection.bind(this)
    });

    this.commands.set('weekend_confirm_dates', {
      description: 'Подтверждение выбранных дат',
      handler: this.handleWeekendConfirmDates.bind(this)
    });

    this.commands.set('weekend_submit', {
      description: 'Отправка заказа выходных',
      handler: this.handleWeekendSubmit.bind(this)
    });

    this.commands.set('weekend_prev_month', {
      description: 'Предыдущий месяц в календаре',
      handler: this.handleWeekendPrevMonth.bind(this)
    });

    this.commands.set('weekend_next_month', {
      description: 'Следующий месяц в календаре',
      handler: this.handleWeekendNextMonth.bind(this)
    });

    this.commands.set('weekend_continue_selection', {
      description: 'Продолжить выбор дат',
      handler: this.handleWeekendContinueSelection.bind(this)
    });

    this.commands.set('weekend_cancel_weekend', {
      description: 'Отменить конкретный выходной',
      handler: this.handleWeekendCancelWeekend.bind(this)
    });

    this.commands.set('weekend_quota_stats', {
      description: 'Показать статистику квот',
      handler: this.handleWeekendQuotaStats.bind(this)
    });

    this.commands.set('weekend_fullname_input', {
      description: 'Ввод ФИО для заказа выходных',
      handler: this.handleWeekendFullnameInput.bind(this)
    });

    this.commands.set('weekend_employee_id_input', {
      description: 'Ввод табельного номера для заказа выходных',
      handler: this.handleWeekendEmployeeIdInput.bind(this)
    });
  }

  async processMessage(userId, message) {
    try {
      const user = this.getOrCreateUser(userId);
      
      if (message.startsWith('/')) {
        const command = message.substring(1).split(' ')[0];
        const args = message.split(' ').slice(1);
        
        const commandInfo = this.commands.get(command);
        if (commandInfo && commandInfo.handler) {
          return await commandInfo.handler(userId, args);
        } else {
          return this.getUnknownCommandResponse();
        }
      } else {
        return this.handleTextMessage(userId, message);
      }
    } catch (error) {
      this.logger.error('Error processing message', { error: error.message, userId, message });
      return this.getErrorResponse();
    }
  }

  getOrCreateUser(userId) {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        id: userId,
        name: `User_${userId}`,
        createdAt: new Date(),
        lastActivity: new Date(),
        state: 'idle',
        currentOrder: null
      });
    }
    
    const user = this.users.get(userId);
    user.lastActivity = new Date();
    return user;
  }

  handleStart(userId, args) {
    const user = this.getOrCreateUser(userId);
    user.state = 'idle';
    
    const welcomeData = this.getWelcomeMessage();
    
    return {
      type: 'welcome',
      data: {
        message: welcomeData,
        serviceButtons: welcomeData.serviceButtons
      }
    };
  }

  getWelcomeMessage() {
    return {
      logo: 'CREW SERVICES',
      title: 'Привет! Я ваш персональный помощник для заказа услуг.',
      content: [
        'Выберите нужную услугу из меню ниже:',
        '',
        '**Доступные услуги:**',
        '• ✈️ Заказ рейса - подача заявки на рейс/эстафету',
        '• 🏖️ Заказ выходных - заявка на выходные дни',
        '• 🏨 Заказ гостиницы - бронирование номера',
        '• 🚄 Заказ аэроэкспресса - билеты на аэроэкспресс',
        '',
        'Для заказа рейса действуют специальные правила:',
        '**Лимит:** Одна заявка в месяц на рейс/эстафету.',
        '**Сроки:** С 20-го по 5-е число (вкл.) на следующий месяц.',
        '**Условия ЧКЭ:** 100% доступность и отсутствие нарушений за последние 3 месяца.'
      ],
      serviceButtons: [
        { id: 'order_flight', name: '✈️ Заказ рейса', description: 'Подача заявки на рейс/эстафету' },
        { id: 'order_weekend', name: '🏖️ Заказ выходных', description: 'Заявка на выходные дни' },
        { id: 'order_hotel', name: '🏨 Заказ гостиницы', description: 'Бронирование номера' },
        { id: 'order_aeroexpress', name: '🚄 Заказ аэроэкспресса', description: 'Билеты на аэроэкспресс' }
      ]
    };
  }

  handleHelp(userId, args) {
    const helpText = [
      '📋 Доступные команды:',
      '',
      '/start - Начать работу с ботом',
      '/order_flight - Заказать рейс',
      '/order_weekend - Заказать выходные',
      '/order_hotel - Заказать гостиницу',
      '/order_aeroexpress - Заказать аэроэкспресс',
      '/my_orders - Просмотреть мои заказы',
      '/cancel_order - Отменить заказ',
      '/status - Проверить статус заказа',
      '/help - Показать эту справку',
      '',
      '💡 Выберите нужную услугу из главного меню'
    ];

    return {
      type: 'help',
      data: {
        message: helpText.join('\n'),
        buttons: [
          { text: '✈️ Заказ рейса', command: '/order_flight' },
          { text: '🏖️ Заказ выходных', command: '/order_weekend' },
          { text: '🏨 Заказ гостиницы', command: '/order_hotel' },
          { text: '🚄 Заказ аэроэкспресса', command: '/order_aeroexpress' },
          { text: '📋 Мои заказы', command: '/my_orders' }
        ]
      }
    };
  }

  handleOrderFlight(userId, args) {
    // Перенаправляем на существующую функцию заказа рейса
    return this.handleLocationSelection(userId, ['moscow']); // Начинаем с выбора локации
  }

  handleMyOrders(userId, args) {
    const user = this.getOrCreateUser(userId);
    const orders = Array.from(this.flightRequests.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (orders.length === 0) {
      return {
        type: 'no_orders',
        data: {
          message: '📭 У вас пока нет заказов рейсов.',
          buttons: [
            { text: 'Заказать рейс', command: '/order_flight' },
            { text: 'На главную', command: '/start' }
          ]
        }
      };
    }

    const ordersList = orders.map((order, index) => 
      `${index + 1}. Рейс ${order.departure} → ${order.destination}\n` +
      `   Дата: ${order.date} ${order.time}\n` +
      `   Статус: ${this.getStatusText(order.status)}\n` +
      `   ID: ${order.id}`
    ).join('\n\n');

    return {
      type: 'orders_list',
      data: {
        message: `📋 Ваши заказы рейсов:\n\n${ordersList}`,
        buttons: [
          { text: 'Заказать новый рейс', command: '/order_flight' },
          { text: 'Проверить статус', command: '/status' },
          { text: 'На главную', command: '/start' }
        ]
      }
    };
  }

  handleCancelOrder(userId, args) {
    const orderId = args[0];
    
    if (!orderId) {
      return {
        type: 'cancel_order_prompt',
        data: {
          message: '❌ Для отмены заказа укажите ID заказа.\n\nПример: /cancel_order 12345',
          buttons: [
            { text: 'Мои заказы', command: '/my_orders' },
            { text: 'На главную', command: '/start' }
          ]
        }
      };
    }

    const order = this.flightRequests.get(orderId);
    if (!order || order.userId !== userId) {
      return {
        type: 'order_not_found',
        data: {
          message: '❌ Заказ не найден или не принадлежит вам.',
          buttons: [
            { text: 'Мои заказы', command: '/my_orders' },
            { text: 'На главную', command: '/start' }
          ]
        }
      };
    }

    if (order.status === 'cancelled') {
      return {
        type: 'already_cancelled',
        data: {
          message: '⚠️ Этот заказ уже отменен.',
          buttons: [
            { text: 'Мои заказы', command: '/my_orders' },
            { text: 'На главную', command: '/start' }
          ]
        }
      };
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    this.flightRequests.set(orderId, order);

    return {
      type: 'order_cancelled',
      data: {
        message: `✅ Заказ #${orderId} успешно отменен.`,
        buttons: [
          { text: 'Мои заказы', command: '/my_orders' },
          { text: 'Заказать новый рейс', command: '/order_flight' },
          { text: 'На главную', command: '/start' }
        ]
      }
    };
  }

  handleStatus(userId, args) {
    const orderId = args[0];
    
    if (!orderId) {
      const user = this.getOrCreateUser(userId);
      const orders = Array.from(this.flightRequests.values())
        .filter(order => order.userId === userId && order.status !== 'cancelled')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (orders.length === 0) {
        return {
          type: 'no_orders',
          data: {
            message: '📭 У вас нет активных заказов.',
            buttons: [
              { text: 'Заказать рейс', command: '/order_flight' },
              { text: 'На главную', command: '/start' }
            ]
          }
        };
      }

      const statusList = orders.map(order => 
        `Заказ #${order.id}: ${this.getStatusText(order.status)}`
      ).join('\n');

      return {
        type: 'status_list',
        data: {
          message: `📊 Статус ваших заказов:\n\n${statusList}`,
          buttons: [
            { text: 'Мои заказы', command: '/my_orders' },
            { text: 'На главную', command: '/start' }
          ]
        }
      };
    }

    const order = this.flightRequests.get(orderId);
    if (!order || order.userId !== userId) {
      return {
        type: 'order_not_found',
        data: {
          message: '❌ Заказ не найден или не принадлежит вам.',
          buttons: [
            { text: 'Мои заказы', command: '/my_orders' },
            { text: 'На главную', command: '/start' }
          ]
        }
      };
    }

    return {
      type: 'order_status',
      data: {
        message: this.getOrderStatusMessage(order),
        buttons: [
          { text: 'Мои заказы', command: '/my_orders' },
          { text: 'На главную', command: '/start' }
        ]
      }
    };
  }

  handleTextMessage(userId, message) {
    const user = this.getOrCreateUser(userId);
    
    if (user.state === 'ordering_flight') {
      return this.handleFlightOrderData(userId, message);
    }

    if (user.state === 'entering_name') {
      return this.handleNameInput(userId, message);
    }

    if (user.state === 'entering_employee_id') {
      return this.handleEmployeeIdInput(userId, message);
    }

    if (user.state === 'entering_direction') {
      return this.handleDirectionInput(userId, message);
    }

    if (user.state === 'entering_wishes') {
      return this.handleWishesInput(userId, message);
    }

    // Проверяем, не является ли сообщение выбором локации
    const locationMap = {
      'москва': 'moscow',
      'санкт-петербург': 'spb',
      'красноярск': 'krasnoyarsk',
      'сочи': 'sochi'
    };

    const locationId = locationMap[message.toLowerCase()];
    if (locationId) {
      return this.handleLocationSelection(userId, [locationId]);
    }

    return {
      type: 'unknown_message',
      data: {
        message: '🤔 Не понимаю ваше сообщение. Используйте команды или кнопки.',
        buttons: [
          { text: 'Справка', command: '/help' },
          { text: 'На главную', command: '/start' }
        ]
      }
    };
  }

  handleLocationSelection(userId, args) {
    const locationId = args[0];
    const user = this.getOrCreateUser(userId);
    
    const locations = {
      'moscow': { name: 'Москва', icon: '🏛️', code: 'МСК' },
      'spb': { name: 'Санкт-Петербург', icon: '🏛️', code: 'СПБ' },
      'krasnoyarsk': { name: 'Красноярск', icon: '🏔️', code: 'КРС' },
      'sochi': { name: 'Сочи', icon: '🌴', code: 'СОЧ' }
    };

    const location = locations[locationId];
    if (!location) {
      return {
        type: 'invalid_location',
        data: {
          message: '❌ Неверная локация. Пожалуйста, выберите одну из предложенных.',
          buttons: [
            { text: 'На главную', command: '/start' }
          ]
        }
      };
    }

    // Сохраняем выбранную локацию
    user.selectedLocation = locationId;
    user.state = 'selecting_department';

    const currentTime = new Date().toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return {
      type: 'department_selection',
      data: {
        message: `👌 Отлично!\n\nТеперь выберите ваше Подразделение для ${location.code}: ${currentTime}`,
        departmentButtons: [
          { id: 'oke1', name: 'ОКЭ 1' },
          { id: 'oke2', name: 'ОКЭ 2' },
          { id: 'oke3', name: 'ОКЭ 3' },
          { id: 'olsit', name: 'ОЛСИТ' }
        ],
        buttons: [
          { text: '⬅️ Назад в главное меню', command: '/start' }
        ]
      }
    };
  }

  handleDepartmentSelection(userId, args) {
    const departmentId = args[0];
    const user = this.getOrCreateUser(userId);
    
    const departments = {
      'oke1': { name: 'ОКЭ 1' },
      'oke2': { name: 'ОКЭ 2' },
      'oke3': { name: 'ОКЭ 3' },
      'olsit': { name: 'ОЛСИТ' }
    };

    const department = departments[departmentId];
    if (!department) {
      return {
        type: 'invalid_department',
        data: {
          message: '❌ Неверное подразделение. Пожалуйста, выберите одно из предложенных.',
          buttons: [
            { text: 'Назад к выбору локации', command: '/start' }
          ]
        }
      };
    }

    // Сохраняем выбранное подразделение
    user.selectedDepartment = departmentId;
    user.state = 'selecting_date';

    const locations = {
      'moscow': { name: 'Москва', icon: '🏛️' },
      'spb': { name: 'Санкт-Петербург', icon: '🏛️' },
      'krasnoyarsk': { name: 'Красноярск', icon: '🏔️' },
      'sochi': { name: 'Сочи', icon: '🌴' }
    };

    const location = locations[user.selectedLocation];

    return {
      type: 'date_selection',
      data: {
        message: `✅ Выбрано подразделение: ${department.name}\n📍 Локация: ${location.icon} ${location.name}\n\n📅 Выберите дату для рейса:`,
        calendar: this.generateCalendar(new Date()),
        buttons: [
          { text: '⬅️ Назад в главное меню', command: '/start' }
        ]
      }
    };
  }

  handleDateSelection(userId, args) {
    const selectedDate = args[0];
    const user = this.getOrCreateUser(userId);
    
    if (!selectedDate) {
      return {
        type: 'invalid_date',
        data: {
          message: '❌ Неверная дата. Пожалуйста, выберите дату из календаря.',
          buttons: [
            { text: 'Назад к выбору подразделения', command: '/start' }
          ]
        }
      };
    }

    // Сохраняем выбранную дату
    user.selectedDate = selectedDate;
    user.state = 'selecting_position';

    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const currentTime = new Date().toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return {
      type: 'position_selection',
      data: {
        message: `✅ Выбрана дата: ${formattedDate}\n\n👨‍✈️ Выберите вашу должность:`,
        positionButtons: [
          { id: 'bp', name: 'БП' },
          { id: 'bp_bs', name: 'БП BS' },
          { id: 'sbe', name: 'СБЭ' },
          { id: 'ipb', name: 'ИПБ' }
        ],
        buttons: [
          { text: '⬅️ Назад к выбору даты', command: '/select_department ' + user.selectedDepartment }
        ]
      }
    };
  }

  handlePositionSelection(userId, args) {
    const positionId = args[0];
    const user = this.getOrCreateUser(userId);
    
    const positions = this.positions;

    const position = positions[positionId];
    if (!position) {
      return {
        type: 'invalid_position',
        data: {
          message: '❌ Неверная должность. Пожалуйста, выберите одну из предложенных.',
          buttons: [
            { text: 'Назад к выбору даты', command: '/select_department ' + user.selectedDepartment }
          ]
        }
      };
    }

    // Сохраняем выбранную должность
    user.selectedPosition = positionId;
    user.state = 'entering_name';

    const dateObj = new Date(user.selectedDate);
    const formattedDate = dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const locations = {
      'moscow': { name: 'Москва', icon: '🏛️' },
      'spb': { name: 'Санкт-Петербург', icon: '🏛️' },
      'krasnoyarsk': { name: 'Красноярск', icon: '🏔️' },
      'sochi': { name: 'Сочи', icon: '🌴' }
    };

    const departments = {
      'oke1': { name: 'ОКЭ 1' },
      'oke2': { name: 'ОКЭ 2' },
      'oke3': { name: 'ОКЭ 3' },
      'olsit': { name: 'ОЛСИТ' }
    };

    const location = locations[user.selectedLocation];
    const department = departments[user.selectedDepartment];

    return {
      type: 'name_input',
      data: {
        message: `✅ Выбрана должность: ${positionInfo.name}\n📅 Дата: ${formattedDate}\n📍 Локация: ${location.icon} ${location.name}\n🏢 Подразделение: ${department.name}\n\n✏️ Отлично!\n\nТеперь введите ваши ФИО и Табельный номер одним сообщением, используя следующий формат:`,
        formatBlock: {
          fields: [
            'ФИО',
            'Табельный номер'
          ],
          example: [
            'Соколянский А.В.',
            '119356'
          ]
        },
        buttons: [
          { text: '⬅️ Назад к выбору должности', command: '/select_date ' + user.selectedDate }
        ]
      }
    };
  }

  handleNameInput(userId, message) {
    const user = this.getOrCreateUser(userId);
    
    // Проверяем, что введено ФИО (должно содержать буквы)
    if (message.trim().length < 3) {
      return {
        type: 'invalid_name',
        data: {
          message: '❌ Неверный формат ФИО. Пожалуйста, введите ФИО на русском языке (например: Иванов И.И.)',
          buttons: [
            { text: '⬅️ Назад к выбору должности', command: '/select_date ' + user.selectedDate }
          ]
        }
      };
    }

    // Сохраняем ФИО
    user.fullName = message.trim();
    user.state = 'entering_employee_id';

    return {
      type: 'employee_id_input',
      data: {
        message: `✅ ФИО: ${user.fullName}\n\n🔢 Теперь введите ваш Табельный номер:`,
        buttons: [
          { text: '⬅️ Назад к вводу ФИО', command: '/select_position ' + user.selectedPosition }
        ]
      }
    };
  }

  handleEmployeeIdInput(userId, message) {
    const user = this.getOrCreateUser(userId);
    
    // Проверяем, что введен табельный номер (только цифры)
    if (!/^\d+$/.test(message.trim())) {
      return {
        type: 'invalid_employee_id',
        data: {
          message: '❌ Неверный формат табельного номера. Пожалуйста, введите только цифры (например: 119356)',
          buttons: [
            { text: '⬅️ Назад к вводу ФИО', command: '/select_position ' + user.selectedPosition }
          ]
        }
      };
    }

    // Сохраняем табельный номер
    user.employeeId = message.trim();
    user.state = 'entering_direction';

    const dateObj = new Date(user.selectedDate);
    const formattedDate = dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const locations = {
      'moscow': { name: 'Москва', icon: '🏛️' },
      'spb': { name: 'Санкт-Петербург', icon: '🏛️' },
      'krasnoyarsk': { name: 'Красноярск', icon: '🏔️' },
      'sochi': { name: 'Сочи', icon: '🌴' }
    };

    const departments = {
      'oke1': { name: 'ОКЭ 1' },
      'oke2': { name: 'ОКЭ 2' },
      'oke3': { name: 'ОКЭ 3' },
      'olsit': { name: 'ОЛСИТ' }
    };

    const positions = this.positions;

    const location = locations[user.selectedLocation];
    const department = departments[user.selectedDepartment];
    const position = positions[user.selectedPosition];

    return {
      type: 'direction_input',
      data: {
        message: `✅ Регистрация завершена!\n\n👤 ФИО: ${user.fullName}\n🔢 Табельный номер: ${user.employeeId}\n👨‍✈️ Должность: ${positionInfo.name}\n📅 Дата: ${formattedDate}\n📍 Локация: ${location.icon} ${location.name}\n🏢 Подразделение: ${department.name}\n\n✈️ Введите желаемое направление:`,
        buttons: [
          { text: '⬅️ Назад к вводу табельного номера', command: '/select_position ' + user.selectedPosition }
        ]
      }
    };
  }

  handleDirectionInput(userId, message) {
    const user = this.getOrCreateUser(userId);
    
    // Проверяем, что введено направление (минимум 2 символа)
    if (message.trim().length < 2) {
      return {
        type: 'invalid_direction',
        data: {
          message: '❌ Неверный формат направления. Пожалуйста, введите корректное направление (например: Москва-Сочи)',
          buttons: [
            { text: '⬅️ Назад к вводу табельного номера', command: '/select_position ' + user.selectedPosition }
          ]
        }
      };
    }

    // Сохраняем направление
    user.direction = message.trim();
    user.state = 'entering_wishes';

    const dateObj = new Date(user.selectedDate);
    const formattedDate = dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const locations = {
      'moscow': { name: 'Москва', icon: '🏛️' },
      'spb': { name: 'Санкт-Петербург', icon: '🏛️' },
      'krasnoyarsk': { name: 'Красноярск', icon: '🏔️' },
      'sochi': { name: 'Сочи', icon: '🌴' }
    };

    const departments = {
      'oke1': { name: 'ОКЭ 1' },
      'oke2': { name: 'ОКЭ 2' },
      'oke3': { name: 'ОКЭ 3' },
      'olsit': { name: 'ОЛСИТ' }
    };

    const positions = this.positions;

    const location = locations[user.selectedLocation];
    const department = departments[user.selectedDepartment];
    const position = positions[user.selectedPosition];

    return {
      type: 'wishes_input',
      data: {
        message: `✅ Регистрация завершена!\n\n👤 ФИО: ${user.fullName}\n🔢 Табельный номер: ${user.employeeId}\n👨‍✈️ Должность: ${positionInfo.name}\n📅 Дата: ${formattedDate}\n📍 Локация: ${location.icon} ${location.name}\n🏢 Подразделение: ${department.name}\n✈️ Направление: ${user.direction}\n\n📝 Отлично! Теперь укажите ваши пожелания. Если пожелания отсутствуют, то поставьте прочерк:`,
        buttons: [
          { text: '⬅️ Назад к вводу направления', command: '/select_position ' + user.selectedPosition }
        ]
      }
    };
  }

  handleWishesInput(userId, message) {
    const user = this.getOrCreateUser(userId);
    
    // Сохраняем пожелания (принимаем любой текст, включая прочерк)
    user.wishes = message.trim();
    user.state = 'location_selected';

    const dateObj = new Date(user.selectedDate);
    const formattedDate = dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const locations = {
      'moscow': { name: 'Москва', icon: '🏛️' },
      'spb': { name: 'Санкт-Петербург', icon: '🏛️' },
      'krasnoyarsk': { name: 'Красноярск', icon: '🏔️' },
      'sochi': { name: 'Сочи', icon: '🌴' }
    };

    const departments = {
      'oke1': { name: 'ОКЭ 1' },
      'oke2': { name: 'ОКЭ 2' },
      'oke3': { name: 'ОКЭ 3' },
      'olsit': { name: 'ОЛСИТ' }
    };

    const positions = this.positions;

    const location = locations[user.selectedLocation];
    const department = departments[user.selectedDepartment];
    const position = positions[user.selectedPosition];

    return {
      type: 'final_summary',
      data: {
        message: `✨ Пожалуйста, проверьте вашу заявку перед отправкой:`,
        summary: {
          location: location.name,
          department: department.name,
          date: formattedDate,
          position: positionInfo.name,
          fullName: user.fullName,
          employeeId: user.employeeId,
          direction: user.direction,
          wishes: user.wishes
        },
        buttons: [
          { text: '✅ Подтвердить', command: '/confirm_order', style: 'confirm' },
          { text: '✏️ Изменить', command: '/edit_order', style: 'edit' }
        ]
      }
    };
  }

  async handleConfirmOrder(userId, args) {
    const user = this.getOrCreateUser(userId);
    
    try {
      // Создаем заказ
      const orderId = this.generateOrderId();
      const order = {
        id: orderId,
        userId: userId,
        fullName: user.fullName,
        employeeId: user.employeeId,
        position: user.selectedPosition,
        location: user.selectedLocation,
        department: user.selectedDepartment,
        date: user.selectedDate,
        flight_date: user.selectedDate, // Дублируем для совместимости
        direction: user.direction,
        wishes: user.wishes,
        type: 'flight', // Добавляем тип заказа
        createdAt: new Date()
      };

      // Сохраняем заказ в базу данных
      await this.database.saveOrder(order);

      // Также сохраняем в память для совместимости
      if (!this.orders) {
        this.orders = new Map();
      }
      this.orders.set(orderId, order);

      // Сбрасываем состояние пользователя
      user.state = 'idle';
      user.currentOrder = orderId;

      this.logger.info('Заказ успешно сохранен в базу данных', { orderId, userId });

      return {
        type: 'order_confirmed',
        data: {
          message: `🎉 Поздравляем!\n\nВаши данные успешно отправлены и сохранены.\n\nНапоминаем, что заказ рейса — это возможность, а не гарантия его выполнения.\nИтоговое решение остается за ЦП при обеспечении плана полетов.\n\nЧтобы вернуться в главное меню и начать заново, нажмите /start.`,
          orderId: orderId,
          buttons: [
            { text: '/start', command: '/start' }
          ]
        }
      };
    } catch (error) {
      this.logger.error('Ошибка сохранения заказа в базу данных', { error: error.message, userId });
      
      return {
        type: 'error',
        data: {
          message: '❌ Произошла ошибка при сохранении заказа. Попробуйте еще раз.',
          buttons: [
            { text: 'Попробовать снова', command: '/confirm_order' },
            { text: 'Начать заново', command: '/start' }
          ]
        }
      };
    }
  }

  handleEditOrder(userId, args) {
    const user = this.getOrCreateUser(userId);
    
    return {
      type: 'edit_options',
      data: {
        message: `✏️ Что вы хотите изменить?`,
        buttons: [
          { text: '📍 Локацию', command: '/edit_location' },
          { text: '🏢 Подразделение', command: '/edit_department' },
          { text: '📅 Дату', command: '/edit_date' },
          { text: '👨‍✈️ Должность', command: '/edit_position' },
          { text: '👤 ФИО', command: '/edit_name' },
          { text: '🔢 Табельный номер', command: '/edit_employee_id' },
          { text: '✈️ Направление', command: '/edit_direction' },
          { text: '📝 Пожелания', command: '/edit_wishes' },
          { text: '⬅️ Назад к сводке', command: '/show_summary' }
        ]
      }
    };
  }

  generateOrderId() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Понедельник = 0

    const calendar = {
      month: monthNames[month],
      year: year,
      daysOfWeek: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      days: []
    };

    // Добавляем пустые ячейки для начала месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.days.push({ day: '', empty: true });
    }

    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const isSpecial = day === 21; // Специальная дата с самолетом
      
      calendar.days.push({
        day: day,
        date: dayDate.toISOString().split('T')[0],
        special: isSpecial,
        available: true
      });
    }

    return calendar;
  }

  handleFlightOrderData(userId, message) {
    return {
      type: 'flight_order_instructions',
      data: {
        message: '📝 Для заказа рейса заполните форму, используя команду /order_flight',
        buttons: [
          { text: 'Заказать рейс', command: '/order_flight' },
          { text: 'На главную', command: '/start' }
        ]
      }
    };
  }

  submitFlightOrder(userId, orderData) {
    const orderId = this.generateOrderId();
    const order = {
      id: orderId,
      userId: userId,
      ...orderData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.flightRequests.set(orderId, order);
    
    const user = this.getOrCreateUser(userId);
    user.state = 'idle';
    user.currentOrder = orderId;

    return {
      type: 'order_submitted',
      data: {
        message: this.getOrderSubmittedMessage(order),
        buttons: [
          { text: 'Мои заказы', command: '/my_orders' },
          { text: 'Проверить статус', command: `/status ${orderId}` },
          { text: 'Заказать еще', command: '/order_flight' },
          { text: 'На главную', command: '/start' }
        ]
      }
    };
  }

  getOrderSubmittedMessage(order) {
    return `✅ Заявка на рейс успешно отправлена!

📋 Детали заказа:
• ID заказа: #${order.id}
• Маршрут: ${order.departure} → ${order.destination}
• Дата: ${order.date} ${order.time}
• Пассажиров: ${order.passengers}
• Контакт: ${order.contact}
• Статус: ${this.getStatusText(order.status)}

⏰ Время обработки: до 24 часов
📞 Мы свяжемся с вами для подтверждения рейса.`;
  }

  getOrderStatusMessage(order) {
    return `📊 Статус заказа #${order.id}

Маршрут: ${order.departure} → ${order.destination}
Дата: ${order.date} ${order.time}
Пассажиров: ${order.passengers}
Статус: ${this.getStatusText(order.status)}

Создан: ${order.createdAt.toLocaleString('ru-RU')}
Обновлен: ${order.updatedAt.toLocaleString('ru-RU')}`;
  }

  getStatusText(status) {
    const statusMap = {
      'pending': '⏳ Ожидает обработки',
      'confirmed': '✅ Подтвержден',
      'in_progress': '🚀 В процессе',
      'completed': '🎉 Завершен',
      'cancelled': '❌ Отменен',
      'rejected': '🚫 Отклонен'
    };
    return statusMap[status] || '❓ Неизвестно';
  }

  generateOrderId() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  getUnknownCommandResponse() {
    return {
      type: 'unknown_command',
      data: {
        message: '❓ Неизвестная команда. Используйте /help для просмотра доступных команд.',
        buttons: [
          { text: 'Справка', command: '/help' },
          { text: 'На главную', command: '/start' }
        ]
      }
    };
  }

  getErrorResponse() {
    return {
      type: 'error',
      data: {
        message: '❌ Произошла ошибка. Попробуйте еще раз или обратитесь в поддержку.',
        buttons: [
          { text: 'На главную', command: '/start' }
        ]
      }
    };
  }

  getBotStats() {
    const totalUsers = this.users.size;
    const totalOrders = this.flightRequests.size;
    const activeOrders = Array.from(this.flightRequests.values())
      .filter(order => order.status === 'pending' || order.status === 'confirmed').length;

    return {
      totalUsers,
      totalOrders,
      activeOrders,
      users: Array.from(this.users.values()),
      orders: Array.from(this.flightRequests.values())
    };
  }

  updateOrderStatus(orderId, status) {
    const order = this.flightRequests.get(orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      this.flightRequests.set(orderId, order);
      return true;
    }
    return false;
  }

  // Обработчики новых услуг
  handleOrderWeekend(userId, args) {
    const user = this.getOrCreateUser(userId);
    user.state = 'weekend_menu';
    
    // Проверяем, заполнены ли данные пользователя
    const hasCompleteData = user.weekendOrder && user.weekendOrder.isComplete;
    
    let message = '🏖️ Управление выходными днями';
    let description = '';
    let buttons = [];
    
    if (hasCompleteData) {
      // Если данные заполнены, показываем все функции
      description = 'Данные заполнены. Выберите действие:';
      buttons = [
        { text: '📅 Заказать выходной', command: '/weekend_book' },
        { text: '❌ Отменить выходной', command: '/weekend_cancel' },
        { text: '📋 Свободные даты', command: '/weekend_free_dates' },
        { text: '📝 Заказанные даты', command: '/weekend_booked_dates' },
        { text: '📊 Статистика квот', command: '/weekend_quota_stats' },
        { text: '⬅️ Назад в главное меню', command: '/start' }
      ];
    } else {
      // Если данные не заполнены, показываем только заказ выходных
      description = 'Для работы с выходными днями необходимо заполнить данные. Начните с заказа выходного дня.';
      buttons = [
        { text: '📅 Заказать выходной', command: '/weekend_book' },
        { text: '⬅️ Назад в главное меню', command: '/start' }
      ];
    }
    
    return {
      type: 'weekend_menu',
      data: {
        message: message,
        description: description,
        buttons: buttons
      }
    };
  }

  handleOrderHotel(userId, args) {
    const user = this.getOrCreateUser(userId);
    user.state = 'ordering_hotel';
    
    return {
      type: 'hotel_order_form',
      data: {
        message: '🏨 Заказ гостиницы',
        form: {
          fields: [
            { name: 'check_in', label: 'Дата заезда', type: 'date', required: true },
            { name: 'check_out', label: 'Дата выезда', type: 'date', required: true },
            { name: 'guests', label: 'Количество гостей', type: 'number', required: true },
            { name: 'room_type', label: 'Тип номера', type: 'select', options: ['Стандарт', 'Улучшенный', 'Люкс'], required: true },
            { name: 'city', label: 'Город', type: 'text', required: true },
            { name: 'contact', label: 'Контактный телефон', type: 'text', required: true },
            { name: 'notes', label: 'Дополнительные пожелания', type: 'textarea', required: false }
          ]
        },
        buttons: [
          { text: 'Отправить заявку', action: 'submit_hotel_order' },
          { text: 'Отмена', command: '/start' }
        ]
      }
    };
  }

  handleOrderAeroexpress(userId, args) {
    const user = this.getOrCreateUser(userId);
    user.state = 'ordering_aeroexpress';
    
    return {
      type: 'aeroexpress_order_form',
      data: {
        message: '🚄 Заказ аэроэкспресса',
        form: {
          fields: [
            { name: 'departure_station', label: 'Станция отправления', type: 'select', options: ['Аэропорт Шереметьево', 'Аэропорт Домодедово', 'Аэропорт Внуково'], required: true },
            { name: 'arrival_station', label: 'Станция прибытия', type: 'select', options: ['Белорусский вокзал', 'Павелецкий вокзал', 'Киевский вокзал'], required: true },
            { name: 'departure_date', label: 'Дата поездки', type: 'date', required: true },
            { name: 'departure_time', label: 'Время отправления', type: 'time', required: true },
            { name: 'passengers', label: 'Количество пассажиров', type: 'number', required: true },
            { name: 'contact', label: 'Контактный телефон', type: 'text', required: true },
            { name: 'notes', label: 'Дополнительные пожелания', type: 'textarea', required: false }
          ]
        },
        buttons: [
          { text: 'Отправить заявку', action: 'submit_aeroexpress_order' },
          { text: 'Отмена', command: '/start' }
        ]
      }
    };
  }

  // Обработчики для управления выходными днями
  handleWeekendBook(userId, args) {
    const user = this.getOrCreateUser(userId);
    user.state = 'weekend_location_selection';
    user.weekendOrder = {
      location: null,
      department: null,
      position: null,
      fullName: null,
      employeeId: null,
      selectedDates: [],
      isComplete: false
    }; // Инициализируем объект заказа
    
    return {
      type: 'weekend_location_selection',
      data: {
        message: '🏖️ Заказ выходного дня',
        description: 'Для заказа выходного дня необходимо заполнить данные. Выберите ваше подразделение:',
        departmentButtons: [
          { id: 'moscow', name: 'Москва', icon: '🏛️' },
          { id: 'spb', name: 'Санкт-Петербург', icon: '🏛️' },
          { id: 'krasnoyarsk', name: 'Красноярск', icon: '🏔️' },
          { id: 'sochi', name: 'Сочи', icon: '🌴' }
        ],
        buttons: [
          { text: '⬅️ Назад к меню выходных', command: '/order_weekend' },
          { text: '🏠 Главное меню', command: '/start' }
        ]
      }
    };
  }

  async handleWeekendCancel(userId, args) {
    const user = this.getOrCreateUser(userId);
    
    // Получаем заказанные выходные пользователя
    const userWeekends = await this.getUserWeekends(userId);
    
    if (userWeekends.length === 0) {
      return {
        type: 'no_weekends',
        data: {
          message: '📭 У вас нет заказанных выходных дней.',
          buttons: [
            { text: '📅 Заказать выходной', command: '/weekend_book' },
            { text: '⬅️ Назад к меню выходных', command: '/order_weekend' }
          ]
        }
      };
    }

    return {
      type: 'weekend_cancel_list',
      data: {
        message: '❌ Отмена выходного дня',
        description: 'Выберите выходной день для отмены:',
        weekends: userWeekends,
        buttons: [
          { text: '⬅️ Назад к меню выходных', command: '/order_weekend' }
        ]
      }
    };
  }

  handleWeekendFreeDates(userId, args) {
    const user = this.getOrCreateUser(userId);
    
    // Проверяем, заполнены ли данные пользователя
    if (!user.weekendOrder || !user.weekendOrder.isComplete) {
      return {
        type: 'weekend_department_selection',
        data: {
          message: '📊 Просмотр свободных дат',
          description: 'Для просмотра свободных дат необходимо заполнить данные. Начните с заказа выходного дня.',
          buttons: [
            { text: '📅 Заказать выходной', command: '/weekend_book' },
            { text: '⬅️ Назад к меню выходных', command: '/order_weekend' }
          ]
        }
      };
    }

    // Получаем доступные даты с учетом квот
    const location = this.departmentsMapping[user.weekendOrder.department];
    const position = this.positionsMapping[user.weekendOrder.position];
    
    const availableDates = this.weekendQuotaManager.getAvailableDates(location, position);
    
    // Форматируем даты для отображения
    const formattedDates = availableDates.map(date => ({
      date: date.toISOString().split('T')[0],
      display: date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        weekday: 'short'
      }),
      available: true
    }));

    return {
      type: 'weekend_free_dates',
      data: {
        message: `📋 Свободные даты для выходных\n📍 ${location} | 👤 ${position}`,
        description: `Доступно мест: ${formattedDates.length}`,
        freeDates: formattedDates.slice(0, 10), // Показываем только первые 10 дат
        buttons: [
          { text: '📅 Заказать выходной', command: '/weekend_book' },
          { text: '🔄 Изменить фильтры', command: '/weekend_free_dates' },
          { text: '⬅️ Назад к меню выходных', command: '/order_weekend' }
        ]
      }
    };
  }

  async handleWeekendBookedDates(userId, args) {
    const user = this.getOrCreateUser(userId);
    const userWeekends = await this.getUserWeekends(userId);
    
    if (userWeekends.length === 0) {
      return {
        type: 'no_weekends',
        data: {
          message: '📭 У вас нет заказанных выходных дней.',
          buttons: [
            { text: '📅 Заказать выходной', command: '/weekend_book' },
            { text: '⬅️ Назад к меню выходных', command: '/order_weekend' }
          ]
        }
      };
    }

    return {
      type: 'weekend_booked_dates',
      data: {
        message: '📝 Ваши заказанные выходные дни',
        description: 'Список ваших выходных дней:',
        weekends: userWeekends,
        buttons: [
          { text: '❌ Отменить выходной', command: '/weekend_cancel' },
          { text: '📅 Заказать еще', command: '/weekend_book' },
          { text: '⬅️ Назад к меню выходных', command: '/order_weekend' }
        ]
      }
    };
  }

  async handleWeekendCancelWeekend(userId, args) {
    const weekendId = args[0];
    
    if (!weekendId) {
      return {
        type: 'error',
        data: {
          message: '❌ Ошибка: не указан ID выходного дня для отмены.',
          buttons: [
            { text: '⬅️ Назад к меню выходных', command: '/order_weekend' }
          ]
        }
      };
    }

    try {
      // Получаем информацию о заказе для освобождения квот
      const order = await this.database.getOrderById(weekendId);
      if (!order) {
        return {
          type: 'error',
          data: {
            message: '❌ Заказ не найден.',
            buttons: [
              { text: '⬅️ Назад к меню выходных', command: '/order_weekend' }
            ]
          }
        };
      }

      // Освобождаем квоты для каждой даты
      if (order.selectedDates && order.selectedDates.length > 0) {
        const location = this.departmentsMapping[order.department];
        const position = this.positionsMapping[order.position];

        if (location && position) {
          for (const dateStr of order.selectedDates) {
            const date = new Date(dateStr);
            this.weekendQuotaManager.cancelBooking(date, location, position);
          }
        }
      }

      // Удаляем заказ из базы данных
      await this.database.deleteOrder(weekendId);
      
      this.logger.info('Выходной день успешно отменен и квоты освобождены', { weekendId, userId });
      
      return {
        type: 'weekend_cancelled',
        data: {
          message: '✅ Выходной день успешно отменен!',
          description: 'Ваш заказ на выходной день был отменен и места освобождены.',
          buttons: [
            { text: '📅 Заказать новый выходной', command: '/weekend_book' },
            { text: '📝 Мои заказанные даты', command: '/weekend_booked_dates' },
            { text: '⬅️ Назад к меню выходных', command: '/order_weekend' }
          ]
        }
      };
    } catch (error) {
      this.logger.error('Ошибка отмены выходного дня', { error: error.message, weekendId, userId });
      
      return {
        type: 'error',
        data: {
          message: '❌ Ошибка при отмене выходного дня. Попробуйте еще раз.',
          buttons: [
            { text: '📝 Мои заказанные даты', command: '/weekend_booked_dates' },
            { text: '⬅️ Назад к меню выходных', command: '/order_weekend' }
          ]
        }
      };
    }
  }

  // Вспомогательные функции для работы с выходными
  generateWeekendCalendar(date, location = null, position = null) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Понедельник = 0

    // Вычисляем предыдущий и следующий месяц
    const prevMonth = new Date(year, month - 1, 1);
    const nextMonth = new Date(year, month + 1, 1);

    const calendar = {
      month: monthNames[month],
      year: year,
      currentMonth: month,
      currentYear: year,
      prevMonth: {
        month: prevMonth.getMonth(),
        year: prevMonth.getFullYear()
      },
      nextMonth: {
        month: nextMonth.getMonth(),
        year: nextMonth.getFullYear()
      },
      daysOfWeek: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      days: []
    };

    // Добавляем пустые ячейки для начала месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.days.push({ day: '', empty: true });
    }

    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6; // Суббота или воскресенье
      const isPast = dayDate < new Date();
      
      // Определяем доступность даты с учетом квот
      let available = !isPast;
      
      if (location && position && !isPast) {
        const quota = this.weekendQuotaManager.getQuotaForDate(dayDate, location, position);
        available = quota.available > 0;
      }
      
      calendar.days.push({
        day: day,
        date: dayDate.toISOString().split('T')[0],
        isWeekend: isWeekend,
        isPast: isPast,
        available: available
      });
    }

    return calendar;
  }

  async getUserWeekends(userId) {
    try {
      const allOrders = await this.database.getAllOrders();
      const userWeekends = allOrders.filter(order => 
        (order.user_id === userId || order.userId === userId) && 
        order.type === 'weekend' && 
        order.status !== 'cancelled'
      );
      
      return userWeekends.map(order => ({
        id: order.id,
        date: order.selectedDates ? order.selectedDates[0] : order.date, // Берем первую дату для отображения
        dates: order.selectedDates || [order.date],
        department: order.department,
        position: order.position,
        status: order.status,
        createdAt: order.created_at || order.createdAt,
        formatted: (order.selectedDates || [order.date]).map(date => {
          const d = new Date(date);
          return d.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
          });
        }).join(', ')
      }));
    } catch (error) {
      this.logger.error('Ошибка получения заказанных выходных пользователя', { error: error.message, userId });
      return [];
    }
  }

  getFreeWeekendDates() {
    // Пока возвращаем тестовые данные, позже будем получать из базы данных
    const today = new Date();
    const freeDates = [];
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (date.getDay() === 0 || date.getDay() === 6) { // Суббота или воскресенье
        freeDates.push({
          date: date.toISOString().split('T')[0],
          formatted: date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
          })
        });
      }
    }
    
    return freeDates.slice(0, 10); // Возвращаем только первые 10 дат
  }

  // Обработчики для полного процесса заказа выходных
  handleWeekendSelectDate(userId, args) {
    const user = this.getOrCreateUser(userId);
    const selectedDate = args[0];
    
    if (!selectedDate) {
      return {
        type: 'invalid_date',
        data: {
          message: '❌ Неверная дата. Пожалуйста, выберите дату из календаря.',
          buttons: [
            { text: '⬅️ Назад к выбору должности', command: '/weekend_book' }
          ]
        }
      };
    }

    // Добавляем дату к заказу
    if (!user.weekendOrder.selectedDates) {
      user.weekendOrder.selectedDates = [];
    }
    
    // Проверяем, не выбрано ли уже 2 даты
    if (user.weekendOrder.selectedDates.length >= 2) {
      return {
        type: 'max_dates_selected',
        data: {
          message: '❌ Вы уже выбрали максимальное количество дат (2). Сначала подтвердите текущий выбор.',
          buttons: [
            { text: '✅ Подтвердить выбор', command: '/weekend_confirm_dates' },
            { text: '🔄 Начать заново', command: '/weekend_book' }
          ]
        }
      };
    }

    // Проверяем, не выбрана ли уже эта дата
    if (user.weekendOrder.selectedDates.includes(selectedDate)) {
      return {
        type: 'date_already_selected',
        data: {
          message: '❌ Эта дата уже выбрана. Выберите другую дату.',
          buttons: [
            { text: '✅ Подтвердить выбор', command: '/weekend_confirm_dates' },
            { text: '🔄 Начать заново', command: '/weekend_book' }
          ]
        }
      };
    }

    user.weekendOrder.selectedDates.push(selectedDate);
    user.state = 'weekend_date_selection';

    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });

    const selectedDatesText = user.weekendOrder.selectedDates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
      });
    }).join(', ');

    return {
      type: 'weekend_date_selected',
      data: {
        message: `✅ Выбрана дата: ${formattedDate}`,
        description: `Выбранные даты: ${selectedDatesText}`,
        selectedDates: user.weekendOrder.selectedDates,
        canSelectMore: user.weekendOrder.selectedDates.length < 2,
        buttons: [
          { text: '✅ Подтвердить выбор', command: '/weekend_confirm_dates' },
          { text: '➕ Выбрать еще дату', command: '/weekend_continue_selection' },
          { text: '🔄 Начать заново', command: '/weekend_book' }
        ]
      }
    };
  }

  // Добавляем обработчики для всех этапов
  handleWeekendDepartmentSelection(userId, args) {
    const user = this.getOrCreateUser(userId);
    const departmentId = args[0];
    
    const departments = this.departments;

    const department = departments[departmentId];
    if (!department) {
      return {
        type: 'invalid_department',
        data: {
          message: '❌ Неверное подразделение. Пожалуйста, выберите одно из предложенных.',
          buttons: [
            { text: '⬅️ Назад к выбору подразделения', command: '/weekend_book' }
          ]
        }
      };
    }

    user.weekendOrder.location = departmentId; // Сохраняем как location (подразделение)
    user.weekendOrder.department = departmentId; // Также сохраняем как department для совместимости
    user.state = 'weekend_position_selection';

    return {
      type: 'weekend_position_selection',
      data: {
        message: `✅ Выбрано подразделение: ${department.icon} ${department.name}`,
        description: 'Выберите вашу должность:',
        positionButtons: [
          { id: 'bp', name: 'БП' },
          { id: 'bp_bs', name: 'БП BS' },
          { id: 'sbe', name: 'СБЭ' },
          { id: 'ipb', name: 'ИПБ' }
        ],
        buttons: [
          { text: '⬅️ Назад к выбору подразделения', command: '/weekend_book' }
        ]
      }
    };
  }

  handleWeekendPositionSelection(userId, args) {
    const user = this.getOrCreateUser(userId);
    const positionId = args[0];
    
    const positions = this.positions;

    const position = positions[positionId];
    if (!position) {
      return {
        type: 'invalid_position',
        data: {
          message: '❌ Неверная должность. Пожалуйста, выберите одну из предложенных.',
          buttons: [
            { text: '⬅️ Назад к выбору должности', command: '/weekend_book' }
          ]
        }
      };
    }

    user.weekendOrder.position = positionId;
    user.state = 'weekend_fullname_input';

    const departments = this.departments;
    const department = departments[user.weekendOrder.department];

    return {
      type: 'weekend_fullname_input',
      data: {
        message: `✅ Выбрана должность: ${position.name}`,
        description: `Подразделение: ${department.icon} ${department.name}\nДолжность: ${position.name}\n\nВведите ваше ФИО (полностью):`,
        formatBlock: {
          fields: ['ФИО'],
          example: ['Соколянский Александр Владимирович']
        },
        buttons: [
          { text: '⬅️ Назад к выбору должности', command: '/weekend_book' }
        ]
      }
    };
  }

  handleWeekendConfirmDates(userId, args) {
    const user = this.getOrCreateUser(userId);
    
    if (!user.weekendOrder.selectedDates || user.weekendOrder.selectedDates.length === 0) {
      return {
        type: 'no_dates_selected',
        data: {
          message: '❌ Вы не выбрали ни одной даты. Пожалуйста, выберите даты для выходных.',
          buttons: [
            { text: '📅 Выбрать даты', command: '/weekend_book' }
          ]
        }
      };
    }

    user.state = 'weekend_confirmation';

    const departments = this.departments;

    const positions = this.positions;

    const department = departments[user.weekendOrder.department];
    const positionInfo = positions[user.weekendOrder.position];

    const selectedDatesText = user.weekendOrder.selectedDates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
      });
    }).join('\n• ');

    return {
      type: 'weekend_confirmation',
      data: {
        message: '✨ Пожалуйста, проверьте вашу заявку на выходные:',
        summary: {
          department: `${department.icon} ${department.name}`,
          position: positionInfo.name,
          dates: selectedDatesText,
          count: user.weekendOrder.selectedDates.length
        },
        buttons: [
          { text: '✅ Отправить заявку', command: '/weekend_submit', style: 'confirm' },
          { text: '✏️ Изменить', command: '/weekend_book', style: 'edit' }
        ]
      }
    };
  }

  async handleWeekendSubmit(userId, args) {
    const user = this.getOrCreateUser(userId);
    
    // Отладочная информация
    console.log('DEBUG: user.weekendOrder:', JSON.stringify(user.weekendOrder, null, 2));
    console.log('DEBUG: user.fullName:', user.fullName);
    console.log('DEBUG: user.employeeId:', user.employeeId);
    
    try {
      // Проверяем квоты для каждой выбранной даты
      const location = this.departmentsMapping[user.weekendOrder.department];
      const position = this.positionsMapping[user.weekendOrder.position];
      
      // Проверяем доступность каждой даты
      const unavailableDates = [];
      for (const dateStr of user.weekendOrder.selectedDates) {
        const date = new Date(dateStr);
        if (!this.weekendQuotaManager.isDateAvailable(date, location, position)) {
          unavailableDates.push(dateStr);
        }
      }

      if (unavailableDates.length > 0) {
        return {
          type: 'error',
          data: {
            message: `❌ К сожалению, на следующие даты нет доступных мест:\n${unavailableDates.join(', ')}\n\nПожалуйста, выберите другие даты.`,
            buttons: [{
              text: '📅 Выбрать другие даты',
              command: 'weekend_book_weekend'
            }, {
              text: '⬅️ Назад в меню',
              command: '/start'
            }]
          }
        };
      }

      // Создаем заказ выходных
      const orderId = this.generateOrderId();
      const order = {
        id: orderId,
        user_id: userId,
        full_name: user.fullName || `Пользователь ${userId}`,
        employee_id: user.employeeId || '000000',
        type: 'weekend',
        department: user.weekendOrder.department,
        position: user.weekendOrder.position,
        selectedDates: user.weekendOrder.selectedDates,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      console.log('DEBUG: order to save:', JSON.stringify(order, null, 2));

      // Бронируем даты в системе квот
      for (const dateStr of user.weekendOrder.selectedDates) {
        const date = new Date(dateStr);
        const bookingResult = this.quotaManager.bookDate(date, location, position);
        if (!bookingResult.success) {
          // Если не удалось забронировать, отменяем предыдущие бронирования
          for (const prevDateStr of user.weekendOrder.selectedDates) {
            if (prevDateStr !== dateStr) {
              const prevDate = new Date(prevDateStr);
              this.quotaManager.cancelBooking(prevDate, location, position);
            }
          }
          throw new Error(bookingResult.message);
        }
      }

      // Сохраняем заказ в базу данных
      await this.database.saveOrder(order);

      // Сбрасываем состояние пользователя
      user.state = 'idle';
      user.weekendOrder = {};

      this.logger.info('Заказ выходных успешно сохранен в базу данных', { orderId, userId });

      const departments = {
        'moscow': { name: 'Москва', icon: '🏛️' },
        'spb': { name: 'Санкт-Петербург', icon: '🏛️' },
        'krasnoyarsk': { name: 'Красноярск', icon: '🏔️' },
        'sochi': { name: 'Сочи', icon: '🌴' }
      };

      const positions = {
        'bp': { name: 'БП' },
        'bp_bs': { name: 'БП BS' },
        'sbe': { name: 'СБЭ' },
        'ipb': { name: 'ИПБ' }
      };

      const department = departments[order.department];
      const positionInfo = positions[order.position];

      const selectedDatesText = order.selectedDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long'
        });
      }).join('\n• ');

      return {
        type: 'weekend_submitted',
        data: {
          message: `🎉 Заявка на выходные успешно отправлена!\n\n📋 Детали заказа:\n• ID: ${orderId}\n• Подразделение: ${department.icon} ${department.name}\n• Должность: ${positionInfo.name}\n• Даты: ${selectedDatesText}\n• Статус: Ожидает подтверждения\n\n⏰ Время обработки: до 24 часов\n📞 Мы свяжемся с вами для подтверждения.`,
          orderId: orderId,
          buttons: [
            { text: '📝 Мои заказы', command: '/weekend_booked_dates' },
            { text: '📅 Заказать еще', command: '/weekend_book' },
            { text: '🏠 Главное меню', command: '/start' }
          ]
        }
      };
    } catch (error) {
      this.logger.error('Ошибка сохранения заказа выходных в базу данных', { error: error.message, userId });
      
      return {
        type: 'error',
        data: {
          message: '❌ Произошла ошибка при сохранении заказа. Попробуйте еще раз.',
          buttons: [
            { text: 'Попробовать снова', command: '/weekend_submit' },
            { text: 'Начать заново', command: '/weekend_book' }
          ]
        }
      };
    }
  }

  // Обработчики навигации по календарю
  handleWeekendContinueSelection(userId, args) {
    const user = this.getOrCreateUser(userId);
    user.state = 'weekend_date_selection';

    const departments = this.departments;

    const positions = this.positions;

    const department = departments[user.weekendOrder.department];
    const positionInfo = positions[user.weekendOrder.position];

    const selectedDatesText = user.weekendOrder.selectedDates ? 
      user.weekendOrder.selectedDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long'
        });
      }).join(', ') : '';

    return {
      type: 'weekend_date_selection',
      data: {
        message: `✅ Продолжаем выбор дат`,
        description: `Подразделение: ${department.icon} ${department.name}\nДолжность: ${positionInfo.name}\n${selectedDatesText ? `Выбранные даты: ${selectedDatesText}\n` : ''}\nВыберите даты для выходных (можно выбрать 1 или 2 даты):`,
        calendar: this.generateWeekendCalendar(new Date(), this.departmentsMapping[user.weekendOrder.department], this.positionsMapping[user.weekendOrder.position]),
        selectedDates: user.weekendOrder.selectedDates || [],
        buttons: [
          { text: '⬅️ Назад к выбору должности', command: '/weekend_book' }
        ]
      }
    };
  }

  handleWeekendPrevMonth(userId, args) {
    const user = this.getOrCreateUser(userId);
    const month = parseInt(args[0]) || 0;
    const year = parseInt(args[1]) || new Date().getFullYear();
    
    const targetDate = new Date(year, month, 1);
    user.state = 'weekend_date_selection';

    const departments = this.departments;

    const positions = this.positions;

    const department = departments[user.weekendOrder.department];
    const positionInfo = positions[user.weekendOrder.position];

    const selectedDatesText = user.weekendOrder.selectedDates ? 
      user.weekendOrder.selectedDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long'
        });
      }).join(', ') : '';

    return {
      type: 'weekend_date_selection',
      data: {
        message: `✅ Выбор дат`,
        description: `Подразделение: ${department.icon} ${department.name}\nДолжность: ${positionInfo.name}\n${selectedDatesText ? `Выбранные даты: ${selectedDatesText}\n` : ''}\nВыберите даты для выходных (можно выбрать 1 или 2 даты):`,
        calendar: this.generateWeekendCalendar(targetDate, this.departmentsMapping[user.weekendOrder.department], this.positionsMapping[user.weekendOrder.position]),
        selectedDates: user.weekendOrder.selectedDates || [],
        buttons: [
          { text: '⬅️ Назад к выбору должности', command: '/weekend_book' }
        ]
      }
    };
  }

  handleWeekendNextMonth(userId, args) {
    const user = this.getOrCreateUser(userId);
    const month = parseInt(args[0]) || 0;
    const year = parseInt(args[1]) || new Date().getFullYear();
    
    const targetDate = new Date(year, month, 1);
    user.state = 'weekend_date_selection';

    const departments = this.departments;

    const positions = this.positions;

    const department = departments[user.weekendOrder.department];
    const positionInfo = positions[user.weekendOrder.position];

    const selectedDatesText = user.weekendOrder.selectedDates ? 
      user.weekendOrder.selectedDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long'
        });
      }).join(', ') : '';

    return {
      type: 'weekend_date_selection',
      data: {
        message: `✅ Выбор дат`,
        description: `Подразделение: ${department.icon} ${department.name}\nДолжность: ${positionInfo.name}\n${selectedDatesText ? `Выбранные даты: ${selectedDatesText}\n` : ''}\nВыберите даты для выходных (можно выбрать 1 или 2 даты):`,
        calendar: this.generateWeekendCalendar(targetDate, this.departmentsMapping[user.weekendOrder.department], this.positionsMapping[user.weekendOrder.position]),
        selectedDates: user.weekendOrder.selectedDates || [],
        buttons: [
          { text: '⬅️ Назад к выбору должности', command: '/weekend_book' }
        ]
      }
    };
  }

  // Функция для показа статистики квот
  handleWeekendQuotaStats(userId, args) {
    const user = this.getOrCreateUser(userId);
    
    // Проверяем, заполнены ли данные пользователя
    if (!user.weekendOrder || !user.weekendOrder.isComplete) {
      return {
        type: 'weekend_department_selection',
        data: {
          message: '📊 Статистика квот',
          description: 'Для просмотра статистики квот необходимо заполнить данные. Начните с заказа выходного дня.',
          buttons: [
            { text: '📅 Заказать выходной', command: '/weekend_book' },
            { text: '⬅️ Назад к меню выходных', command: '/order_weekend' }
          ]
        }
      };
    }

    // Получаем статистику квот
    const location = this.departmentsMapping[user.weekendOrder.department];
    const position = this.positionsMapping[user.weekendOrder.position];
    
    const stats = this.weekendQuotaManager.getQuotaStats(location);
    const positionStats = stats[location] && stats[location][position];
    
    let message = `📊 Статистика квот\n📍 ${location} | 👤 ${position}`;
    let description = '';
    
    if (positionStats) {
      description = `📋 Дневная квота: ${positionStats.dailyQuota} мест\n📅 Использовано: ${positionStats.totalUsed} мест\n✅ Доступно: ${positionStats.totalAvailable} мест`;
    } else {
      description = '❌ Статистика недоступна для выбранного подразделения и должности';
    }

    return {
      type: 'weekend_quota_stats',
      data: {
        message: message,
        description: description,
        buttons: [
          { text: '🔄 Изменить фильтры', command: '/weekend_quota_stats' },
          { text: '📅 Заказать выходной', command: '/weekend_book' },
          { text: '⬅️ Назад к меню выходных', command: '/order_weekend' }
        ]
      }
    };
  }

  // Обработчик ввода ФИО для заказа выходных
  handleWeekendFullnameInput(userId, args) {
    const user = this.getOrCreateUser(userId);
    const fullName = args.join(' ').trim();
    
    if (!fullName || fullName.length < 3) {
      return {
        type: 'invalid_name',
        data: {
          message: '❌ Пожалуйста, введите ваше ФИО полностью (минимум 3 символа).',
          buttons: [
            { text: '⬅️ Назад к выбору должности', command: '/weekend_book' }
          ]
        }
      };
    }

    user.weekendOrder.fullName = fullName;
    user.state = 'weekend_employee_id_input';

    return {
      type: 'weekend_employee_id_input',
      data: {
        message: `✅ ФИО: ${fullName}`,
        description: 'Введите ваш табельный номер:',
        formatBlock: {
          fields: ['Табельный номер'],
          example: ['119356']
        },
        buttons: [
          { text: '⬅️ Назад к вводу ФИО', command: '/weekend_book' }
        ]
      }
    };
  }

  // Обработчик ввода табельного номера для заказа выходных
  handleWeekendEmployeeIdInput(userId, args) {
    const user = this.getOrCreateUser(userId);
    const employeeId = args[0].trim();
    
    if (!employeeId || employeeId.length < 3) {
      return {
        type: 'invalid_employee_id',
        data: {
          message: '❌ Пожалуйста, введите корректный табельный номер (минимум 3 символа).',
          buttons: [
            { text: '⬅️ Назад к вводу ФИО', command: '/weekend_book' }
          ]
        }
      };
    }

    user.weekendOrder.employeeId = employeeId;
    user.weekendOrder.isComplete = true; // Отмечаем, что данные заполнены
    user.state = 'weekend_date_selection';

    // Получаем информацию о выбранных параметрах для отображения
    const departments = this.departments;
    const positions = this.positions;
    const department = departments[user.weekendOrder.department];
    const position = positions[user.weekendOrder.position];

    return {
      type: 'weekend_date_selection',
      data: {
        message: `✅ Данные заполнены!`,
        description: `Подразделение: ${department.icon} ${department.name}\nДолжность: ${position.name}\nФИО: ${user.weekendOrder.fullName}\nТабельный номер: ${employeeId}\n\nВыберите даты для выходных (можно выбрать 1 или 2 даты):`,
        calendar: this.generateWeekendCalendar(new Date(), this.departmentsMapping[user.weekendOrder.department], this.positionsMapping[user.weekendOrder.position]),
        selectedDates: user.weekendOrder.selectedDates || [],
        buttons: [
          { text: '⬅️ Изменить данные', command: '/weekend_book' }
        ]
      }
    };
  }
}

module.exports = MessengerBot;




