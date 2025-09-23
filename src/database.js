const fs = require('fs');
const path = require('path');

class DatabaseManager {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.ordersFile = path.join(this.dataDir, 'orders.json');
    this.orders = [];
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async init() {
    try {
      await this.loadOrders();
      console.log('База данных JSON инициализирована');
    } catch (error) {
      console.error('Ошибка инициализации базы данных:', error.message);
      throw error;
    }
  }

  async loadOrders() {
    try {
      if (fs.existsSync(this.ordersFile)) {
        const data = fs.readFileSync(this.ordersFile, 'utf8');
        this.orders = JSON.parse(data);
      } else {
        this.orders = [];
        await this.saveOrders();
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error.message);
      this.orders = [];
    }
  }

  async saveOrders() {
    try {
      fs.writeFileSync(this.ordersFile, JSON.stringify(this.orders, null, 2));
    } catch (error) {
      console.error('Ошибка сохранения заказов:', error.message);
      throw error;
    }
  }

  async saveOrder(orderData) {
    try {
      const {
        id,
        userId,
        fullName,
        employeeId,
        position,
        location,
        department,
        date,
        direction,
        wishes,
        status = 'pending'
      } = orderData;

      const order = {
        id,
        user_id: userId,
        full_name: fullName,
        employee_id: employeeId,
        position,
        location,
        department,
        flight_date: date,
        direction,
        wishes,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Удаляем существующий заказ с таким же ID, если есть
      this.orders = this.orders.filter(o => o.id !== id);
      
      // Добавляем новый заказ
      this.orders.push(order);
      
      await this.saveOrders();
      console.log(`Заказ ${id} успешно сохранен в базу данных`);
      return { id, changes: 1 };
    } catch (error) {
      console.error('Ошибка сохранения заказа:', error.message);
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      return this.orders.find(order => order.id === orderId) || null;
    } catch (error) {
      console.error('Ошибка получения заказа:', error.message);
      throw error;
    }
  }

  async getUserOrders(userId) {
    try {
      return this.orders
        .filter(order => order.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      console.error('Ошибка получения заказов пользователя:', error.message);
      throw error;
    }
  }

  async getAllOrders(limit = 100, offset = 0) {
    try {
      return this.orders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(offset, offset + limit);
    } catch (error) {
      console.error('Ошибка получения всех заказов:', error.message);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const orderIndex = this.orders.findIndex(order => order.id === orderId);
      
      if (orderIndex === -1) {
        return { changes: 0 };
      }

      this.orders[orderIndex].status = status;
      this.orders[orderIndex].updated_at = new Date().toISOString();
      
      await this.saveOrders();
      console.log(`Статус заказа ${orderId} обновлен на ${status}`);
      return { changes: 1 };
    } catch (error) {
      console.error('Ошибка обновления статуса заказа:', error.message);
      throw error;
    }
  }

  async getOrderStats() {
    try {
      console.log('Получение статистики заказов, всего заказов:', this.orders.length);
      const stats = {
        total: this.orders.length,
        byStatus: {}
      };
      
      this.orders.forEach(order => {
        if (!stats.byStatus[order.status]) {
          stats.byStatus[order.status] = 0;
        }
        stats.byStatus[order.status]++;
      });
      
      console.log('Статистика заказов:', stats);
      return stats;
    } catch (error) {
      console.error('Ошибка получения статистики заказов:', error.message);
      throw error;
    }
  }

  async close() {
    try {
      await this.saveOrders();
      console.log('База данных закрыта');
    } catch (error) {
      console.error('Ошибка закрытия базы данных:', error.message);
    }
  }
}

module.exports = DatabaseManager;

