const AdminManager = require('./admin');

class AdminCommands {
  constructor(adminManager) {
    this.admin = adminManager;
    this.commands = new Map();
    this.setupCommands();
  }

  setupCommands() {
    // Команда: /admin stats
    this.commands.set('stats', {
      description: 'Получить статистику системы',
      usage: '/admin stats',
      permission: 'system.monitoring',
      handler: this.getSystemStats.bind(this)
    });

    // Команда: /admin users
    this.commands.set('users', {
      description: 'Получить список пользователей',
      usage: '/admin users [--role=role] [--active]',
      permission: 'user.read',
      handler: this.getUsers.bind(this)
    });

    // Команда: /admin user create
    this.commands.set('user_create', {
      description: 'Создать нового пользователя',
      usage: '/admin user create <username> <email> [role]',
      permission: 'user.create',
      handler: this.createUser.bind(this)
    });

    // Команда: /admin user update
    this.commands.set('user_update', {
      description: 'Обновить пользователя',
      usage: '/admin user update <user_id> <field> <value>',
      permission: 'user.update',
      handler: this.updateUser.bind(this)
    });

    // Команда: /admin user delete
    this.commands.set('user_delete', {
      description: 'Удалить пользователя',
      usage: '/admin user delete <user_id>',
      permission: 'user.delete',
      handler: this.deleteUser.bind(this)
    });

    // Команда: /admin admins
    this.commands.set('admins', {
      description: 'Получить список администраторов',
      usage: '/admin admins',
      permission: 'admin.read',
      handler: this.getAdmins.bind(this)
    });

    // Команда: /admin admin create
    this.commands.set('admin_create', {
      description: 'Создать нового администратора',
      usage: '/admin admin create <username> <email> <password> [role]',
      permission: 'admin.create',
      handler: this.createAdmin.bind(this)
    });

    // Команда: /admin logs
    this.commands.set('logs', {
      description: 'Получить логи аудита',
      usage: '/admin logs [limit]',
      permission: 'system.logs',
      handler: this.getAuditLogs.bind(this)
    });

    // Команда: /admin sessions
    this.commands.set('sessions', {
      description: 'Получить активные сессии',
      usage: '/admin sessions',
      permission: 'system.monitoring',
      handler: this.getActiveSessions.bind(this)
    });

    // Команда: /admin help
    this.commands.set('help', {
      description: 'Показать справку по админ командам',
      usage: '/admin help',
      permission: null,
      handler: this.showHelp.bind(this)
    });
  }

  async processCommand(command, args, context = {}) {
    const cmd = this.commands.get(command);
    
    if (!cmd) {
      return {
        success: false,
        message: `❌ Неизвестная админ команда: ${command}. Используйте /admin help для списка команд.`
      };
    }

    // Проверка прав доступа
    if (cmd.permission && context.session) {
      const session = this.admin.validateSession(context.session);
      if (!session.valid) {
        return {
          success: false,
          message: '❌ Сессия недействительна. Необходима повторная авторизация.'
        };
      }

      if (!this.admin.hasPermission(session.session.role, cmd.permission)) {
        return {
          success: false,
          message: '❌ Недостаточно прав для выполнения этой команды.'
        };
      }
    }

    try {
      const result = await cmd.handler(args, context);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error(`Error executing admin command ${command}:`, error);
      return {
        success: false,
        message: `❌ Ошибка выполнения команды: ${error.message}`
      };
    }
  }

  async getSystemStats(args, context) {
    const stats = await this.admin.getSystemStats();
    
    return {
      type: 'system_stats',
      data: {
        admins: stats.admins_count,
        users: stats.users_count,
        active_sessions: stats.active_sessions,
        audit_logs: stats.audit_logs_count,
        uptime: Math.floor(stats.uptime / 60) + ' минут',
        memory: {
          rss: Math.round(stats.memory_usage.rss / 1024 / 1024) + ' MB',
          heap: Math.round(stats.memory_usage.heapUsed / 1024 / 1024) + ' MB'
        },
        timestamp: stats.timestamp
      }
    };
  }

  async getUsers(args, context) {
    const users = this.admin.getAllUsers();
    let filteredUsers = users;

    // Фильтрация по роли
    const roleFilter = args.find(arg => arg.startsWith('--role='));
    if (roleFilter) {
      const role = roleFilter.split('=')[1];
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    // Фильтрация по активности
    const activeFilter = args.includes('--active');
    if (activeFilter) {
      filteredUsers = filteredUsers.filter(user => user.is_active);
    }

    return {
      type: 'users_list',
      data: {
        users: filteredUsers.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          is_active: user.is_active
        })),
        total: filteredUsers.length
      }
    };
  }

  async createUser(args, context) {
    if (args.length < 2) {
      throw new Error('Необходимо указать username и email');
    }

    const [username, email, role = 'user'] = args;
    
    const userData = {
      username,
      email,
      role
    };

    const result = await this.admin.createUser(userData);
    return {
      type: 'user_created',
      data: result.user
    };
  }

  async updateUser(args, context) {
    if (args.length < 3) {
      throw new Error('Необходимо указать user_id, поле и значение');
    }

    const [userId, field, value] = args;
    
    const updateData = { [field]: value };
    const result = await this.admin.updateUser(userId, updateData);
    
    return {
      type: 'user_updated',
      data: result.user
    };
  }

  async deleteUser(args, context) {
    if (args.length < 1) {
      throw new Error('Необходимо указать user_id');
    }

    const [userId] = args;
    const result = await this.admin.deleteUser(userId);
    
    return {
      type: 'user_deleted',
      data: { user_id: userId }
    };
  }

  async getAdmins(args, context) {
    const admins = this.admin.getAllAdmins();
    
    return {
      type: 'admins_list',
      data: {
        admins,
        total: admins.length
      }
    };
  }

  async createAdmin(args, context) {
    if (args.length < 3) {
      throw new Error('Необходимо указать username, email и password');
    }

    const [username, email, password, role = 'admin'] = args;
    
    const adminData = {
      username,
      email,
      password,
      role
    };

    const session = this.admin.validateSession(context.session);
    const result = await this.admin.createAdmin(adminData, session.session.role);
    
    return {
      type: 'admin_created',
      data: result.admin
    };
  }

  async getAuditLogs(args, context) {
    const limit = args.length > 0 ? parseInt(args[0]) : 100;
    const logs = await this.admin.getAuditLogs(limit);
    
    return {
      type: 'audit_logs',
      data: {
        logs: logs.map(log => ({
          id: log.id,
          action: log.action,
          admin_id: log.admin_id,
          details: log.details,
          timestamp: log.timestamp
        })),
        total: logs.length
      }
    };
  }

  async getActiveSessions(args, context) {
    const sessions = Array.from(this.admin.sessions.values());
    
    return {
      type: 'active_sessions',
      data: {
        sessions: sessions.map(session => ({
          admin_id: session.admin_id,
          username: session.username,
          role: session.role,
          created_at: session.created_at,
          expires_at: session.expires_at
        })),
        total: sessions.length
      }
    };
  }

  async showHelp(args, context) {
    const helpText = Array.from(this.commands.entries())
      .map(([command, info]) => `**${command}** - ${info.description}\n   Использование: \`${info.usage}\`\n   Права: ${info.permission || 'не требуются'}`)
      .join('\n\n');

    return {
      type: 'admin_help',
      data: {
        commands: this.commands.size,
        help_text: helpText
      }
    };
  }

  getAvailableCommands() {
    return Array.from(this.commands.keys());
  }
}

module.exports = AdminCommands;
