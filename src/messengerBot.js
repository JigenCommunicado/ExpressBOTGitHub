const DatabaseManager = require('./database');

class MessengerBot {
  constructor(logger) {
    this.logger = logger;
    this.users = new Map();
    this.flightRequests = new Map();
    this.database = new DatabaseManager();
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
    
    const positions = {
      'bp': { name: 'БП' },
      'bp_bs': { name: 'БП BS' },
      'sbe': { name: 'СБЭ' },
      'ipb': { name: 'ИПБ' }
    };

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
        message: `✅ Выбрана должность: ${position.name}\n📅 Дата: ${formattedDate}\n📍 Локация: ${location.icon} ${location.name}\n🏢 Подразделение: ${department.name}\n\n✏️ Отлично!\n\nТеперь введите ваши ФИО и Табельный номер одним сообщением, используя следующий формат:`,
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

    const positions = {
      'bp': { name: 'БП' },
      'bp_bs': { name: 'БП BS' },
      'sbe': { name: 'СБЭ' },
      'ipb': { name: 'ИПБ' }
    };

    const location = locations[user.selectedLocation];
    const department = departments[user.selectedDepartment];
    const position = positions[user.selectedPosition];

    return {
      type: 'direction_input',
      data: {
        message: `✅ Регистрация завершена!\n\n👤 ФИО: ${user.fullName}\n🔢 Табельный номер: ${user.employeeId}\n👨‍✈️ Должность: ${position.name}\n📅 Дата: ${formattedDate}\n📍 Локация: ${location.icon} ${location.name}\n🏢 Подразделение: ${department.name}\n\n✈️ Введите желаемое направление:`,
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

    const positions = {
      'bp': { name: 'БП' },
      'bp_bs': { name: 'БП BS' },
      'sbe': { name: 'СБЭ' },
      'ipb': { name: 'ИПБ' }
    };

    const location = locations[user.selectedLocation];
    const department = departments[user.selectedDepartment];
    const position = positions[user.selectedPosition];

    return {
      type: 'wishes_input',
      data: {
        message: `✅ Регистрация завершена!\n\n👤 ФИО: ${user.fullName}\n🔢 Табельный номер: ${user.employeeId}\n👨‍✈️ Должность: ${position.name}\n📅 Дата: ${formattedDate}\n📍 Локация: ${location.icon} ${location.name}\n🏢 Подразделение: ${department.name}\n✈️ Направление: ${user.direction}\n\n📝 Отлично! Теперь укажите ваши пожелания. Если пожелания отсутствуют, то поставьте прочерк:`,
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

    const positions = {
      'bp': { name: 'БП' },
      'bp_bs': { name: 'БП BS' },
      'sbe': { name: 'СБЭ' },
      'ipb': { name: 'ИПБ' }
    };

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
          position: position.name,
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
        direction: user.direction,
        wishes: user.wishes,
        status: 'pending',
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
    
    return {
      type: 'weekend_menu',
      data: {
        message: '🏖️ Управление выходными днями',
        description: 'Выберите действие:',
        buttons: [
          { text: '📅 Заказать выходной', command: '/weekend_book' },
          { text: '❌ Отменить выходной', command: '/weekend_cancel' },
          { text: '📋 Свободные даты', command: '/weekend_free_dates' },
          { text: '📝 Заказанные даты', command: '/weekend_booked_dates' },
          { text: '⬅️ Назад в главное меню', command: '/start' }
        ]
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
    user.state = 'booking_weekend';
    
    return {
      type: 'weekend_booking_form',
      data: {
        message: '📅 Заказ выходного дня',
        description: 'Выберите дату для выходного дня:',
        calendar: this.generateWeekendCalendar(new Date()),
        buttons: [
          { text: '⬅️ Назад к меню выходных', command: '/order_weekend' },
          { text: '🏠 Главное меню', command: '/start' }
        ]
      }
    };
  }

  handleWeekendCancel(userId, args) {
    const user = this.getOrCreateUser(userId);
    
    // Получаем заказанные выходные пользователя
    const userWeekends = this.getUserWeekends(userId);
    
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
    const freeDates = this.getFreeWeekendDates();
    
    return {
      type: 'weekend_free_dates',
      data: {
        message: '📋 Свободные даты для выходных',
        description: 'Доступные даты для заказа выходных:',
        freeDates: freeDates,
        buttons: [
          { text: '📅 Заказать выходной', command: '/weekend_book' },
          { text: '⬅️ Назад к меню выходных', command: '/order_weekend' }
        ]
      }
    };
  }

  handleWeekendBookedDates(userId, args) {
    const user = this.getOrCreateUser(userId);
    const userWeekends = this.getUserWeekends(userId);
    
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

  // Вспомогательные функции для работы с выходными
  generateWeekendCalendar(date) {
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
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6; // Суббота или воскресенье
      const isPast = dayDate < new Date();
      
      calendar.days.push({
        day: day,
        date: dayDate.toISOString().split('T')[0],
        isWeekend: isWeekend,
        isPast: isPast,
        available: !isPast && isWeekend
      });
    }

    return calendar;
  }

  getUserWeekends(userId) {
    // Пока возвращаем пустой массив, позже будем получать из базы данных
    return [];
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
}

module.exports = MessengerBot;




