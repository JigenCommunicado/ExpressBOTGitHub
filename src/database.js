const { Pool } = require('pg');
const redis = require('redis');

class Database {
  constructor() {
    this.pgPool = null;
    this.redisClient = null;
  }

  async connect() {
    try {
      // Подключение к PostgreSQL
      this.pgPool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://expressbot:password@localhost:5432/expressbot',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Тестируем подключение к PostgreSQL
      await this.pgPool.query('SELECT NOW()');
      console.log('✅ PostgreSQL подключен успешно');

      // Подключение к Redis
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      await this.redisClient.connect();
      console.log('✅ Redis подключен успешно');

    } catch (error) {
      console.error('Ошибка подключения к базе данных:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.pgPool) {
        await this.pgPool.end();
        console.log('PostgreSQL отключен');
      }
      if (this.redisClient) {
        await this.redisClient.quit();
        console.log('Redis отключен');
      }
    } catch (error) {
      console.error('Ошибка отключения от базы данных:', error);
    }
  }

  // PostgreSQL методы
  async query(text, params = []) {
    if (!this.pgPool) {
      throw new Error('PostgreSQL не подключен');
    }
    return await this.pgPool.query(text, params);
  }

  async getUserById(id) {
    const result = await this.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getUserByUsername(username) {
    const result = await this.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  }

  async createUser(userData) {
    const { username, email, role = 'user', metadata = {} } = userData;
    const result = await this.query(
      'INSERT INTO users (username, email, role, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, role, JSON.stringify(metadata)]
    );
    return result.rows[0];
  }

  async updateUser(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (key === 'metadata' && typeof value === 'object') {
        fields.push(`${key} = $${paramCount}`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
      paramCount++;
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`;
    
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async deleteUser(id) {
    const result = await this.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  async getAllUsers() {
    const result = await this.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  async getAdminByUsername(username) {
    const result = await this.query('SELECT * FROM admins WHERE username = $1', [username]);
    return result.rows[0];
  }

  async createAdmin(adminData) {
    const { username, email, password_hash, role = 'admin', permissions = [] } = adminData;
    const result = await this.query(
      'INSERT INTO admins (username, email, password_hash, role, permissions) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, created_at, is_active',
      [username, email, password_hash, role, permissions]
    );
    return result.rows[0];
  }

  async getAllAdmins() {
    const result = await this.query('SELECT id, username, email, role, created_at, last_login, is_active FROM admins ORDER BY created_at DESC');
    return result.rows;
  }

  async createSession(sessionData) {
    const { admin_id, username, role, expires_at } = sessionData;
    const result = await this.query(
      'INSERT INTO sessions (admin_id, username, role, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [admin_id, username, role, expires_at]
    );
    return result.rows[0];
  }

  async getSession(sessionId) {
    const result = await this.query('SELECT * FROM sessions WHERE id = $1 AND expires_at > NOW()', [sessionId]);
    return result.rows[0];
  }

  async deleteSession(sessionId) {
    const result = await this.query('DELETE FROM sessions WHERE id = $1 RETURNING *', [sessionId]);
    return result.rows[0];
  }

  async cleanupExpiredSessions() {
    const result = await this.query('DELETE FROM sessions WHERE expires_at <= NOW() RETURNING *');
    return result.rows;
  }

  async logAudit(auditData) {
    const { action, admin_id, details, ip_address, user_agent } = auditData;
    const result = await this.query(
      'INSERT INTO audit_logs (action, admin_id, details, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [action, admin_id, JSON.stringify(details), ip_address, user_agent]
    );
    return result.rows[0];
  }

  async getAuditLogs(limit = 100) {
    const result = await this.query(
      'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  async logWebhookEvent(eventData) {
    const { event_type, repository, payload } = eventData;
    const result = await this.query(
      'INSERT INTO webhook_events (event_type, repository, payload) VALUES ($1, $2, $3) RETURNING *',
      [event_type, repository, JSON.stringify(payload)]
    );
    return result.rows[0];
  }

  // Redis методы
  async setCache(key, value, ttl = 3600) {
    if (!this.redisClient) {
      throw new Error('Redis не подключен');
    }
    await this.redisClient.setEx(key, ttl, JSON.stringify(value));
  }

  async getCache(key) {
    if (!this.redisClient) {
      throw new Error('Redis не подключен');
    }
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async deleteCache(key) {
    if (!this.redisClient) {
      throw new Error('Redis не подключен');
    }
    await this.redisClient.del(key);
  }

  async getSystemStats() {
    const [usersResult, adminsResult, sessionsResult, logsResult] = await Promise.all([
      this.query('SELECT COUNT(*) as count FROM users'),
      this.query('SELECT COUNT(*) as count FROM admins'),
      this.query('SELECT COUNT(*) as count FROM sessions WHERE expires_at > NOW()'),
      this.query('SELECT COUNT(*) as count FROM audit_logs')
    ]);

    return {
      users_count: parseInt(usersResult.rows[0].count),
      admins_count: parseInt(adminsResult.rows[0].count),
      active_sessions: parseInt(sessionsResult.rows[0].count),
      audit_logs_count: parseInt(logsResult.rows[0].count),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    };
  }
}

module.exports = Database;
