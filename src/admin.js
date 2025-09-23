const crypto = require('crypto');

class AdminManager {
  constructor() {
    this.admins = new Map();
    this.users = new Map();
    this.permissions = new Map();
    this.sessions = new Map();
    this.auditLog = [];
    
    this.initializeDefaultAdmin();
    this.setupDefaultPermissions();
  }
  initializeDefaultAdmin() {
    const defaultAdmin = {
      id: 'admin',
      username: 'admin',
      email: 'admin@smartapp.local',
      password: this.hashPassword('admin123'),
      role: 'super_admin',
      permissions: ['*'],
      created_at: new Date(),
      last_login: null,
      is_active: true
    };
    
    this.admins.set('admin', defaultAdmin);
  }
  setupDefaultPermissions() {
    this.permissions.set('super_admin', [
      'user.create', 'user.read', 'user.update', 'user.delete',
      'admin.create', 'admin.read', 'admin.update', 'admin.delete',
      'system.config', 'system.restart', 'system.logs',
      'bot.commands', 'bot.webhooks', 'bot.monitoring'
    ]);
    
    this.permissions.set('admin', [
      'user.create', 'user.read', 'user.update',
      'bot.commands', 'bot.webhooks', 'bot.monitoring'
    ]);
    
    this.permissions.set('moderator', [
      'user.read', 'user.update',
      'bot.commands', 'bot.monitoring'
    ]);
  }
  hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'smartapp_salt').digest('hex');
  }
  async authenticate(username, password) {
    const admin = this.admins.get(username);
    if (!admin || !admin.is_active) {
      return { success: false, message: 'Пользователь не найден или неактивен' };
    }

    const hashedPassword = this.hashPassword(password);
    if (admin.password !== hashedPassword) {
      return { success: false, message: 'Неверный пароль' };
    }
    admin.last_login = new Date();
    this.admins.set(username, admin);
    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, {
      admin_id: admin.id,
      username: admin.username,
      role: admin.role,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 часа
    });

    this.logAudit('login', admin.id, { username, ip: 'localhost' });

    return {
      success: true,
      session_id: sessionId,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: this.getPermissions(admin.role)
      }
    };
  }
  validateSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { valid: false, message: 'Сессия не найдена' };
    }

    if (new Date() > session.expires_at) {
      this.sessions.delete(sessionId);
      return { valid: false, message: 'Сессия истекла' };
    }

    return { valid: true, session };
  }
  hasPermission(role, permission) {
    const rolePermissions = this.permissions.get(role) || [];
    return rolePermissions.includes('*') || rolePermissions.includes(permission);
  }
  getPermissions(role) {
    return this.permissions.get(role) || [];
  }
  async createUser(userData) {
    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      username: userData.username,
      email: userData.email,
      role: userData.role || 'user',
      created_at: new Date(),
      is_active: true,
      metadata: userData.metadata || {}
    };

    this.users.set(userId, user);
    this.logAudit('user.create', 'system', { user_id: userId, username: userData.username });

    return { success: true, user };
  }

  async getUser(userId) {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, message: 'Пользователь не найден' };
    }
    return { success: true, user };
  }

  async updateUser(userId, updateData) {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, message: 'Пользователь не найден' };
    }

    Object.assign(user, updateData);
    user.updated_at = new Date();
    this.users.set(userId, user);

    this.logAudit('user.update', 'system', { user_id: userId, updates: updateData });

    return { success: true, user };
  }

  async deleteUser(userId) {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, message: 'Пользователь не найден' };
    }

    this.users.delete(userId);
    this.logAudit('user.delete', 'system', { user_id: userId, username: user.username });

    return { success: true };
  }
  async createAdmin(adminData, requesterRole) {
    if (!this.hasPermission(requesterRole, 'admin.create')) {
      return { success: false, message: 'Недостаточно прав' };
    }

    const adminId = crypto.randomUUID();
    const admin = {
      id: adminId,
      username: adminData.username,
      email: adminData.email,
      password: this.hashPassword(adminData.password),
      role: adminData.role || 'admin',
      created_at: new Date(),
      is_active: true
    };

    this.admins.set(adminData.username, admin);
    this.logAudit('admin.create', 'system', { admin_id: adminId, username: adminData.username });

    return { success: true, admin: { id: adminId, username: admin.username, email: admin.email, role: admin.role } };
  }
  async getSystemStats() {
    return {
      admins_count: this.admins.size,
      users_count: this.users.size,
      active_sessions: this.sessions.size,
      audit_logs_count: this.auditLog.length,
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      timestamp: new Date()
    };
  }

  async getAuditLogs(limit = 100) {
    return this.auditLog
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
  logAudit(action, adminId, details = {}) {
    const logEntry = {
      id: crypto.randomUUID(),
      action,
      admin_id: adminId,
      details,
      timestamp: new Date(),
      ip: 'localhost'
    };

    this.auditLog.push(logEntry);
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000);
    }
  }
  getAllUsers() {
    return Array.from(this.users.values());
  }
  getAllAdmins() {
    return Array.from(this.admins.values()).map(admin => ({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      created_at: admin.created_at,
      last_login: admin.last_login,
      is_active: admin.is_active
    }));
  }
  logout(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.logAudit('logout', session.admin_id, { username: session.username });
      this.sessions.delete(sessionId);
    }
    return { success: true };
  }
}

module.exports = AdminManager;
