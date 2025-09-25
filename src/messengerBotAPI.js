class MessengerBotAPI {
  constructor(messengerBot, logger) {
    this.bot = messengerBot;
    this.logger = logger;
  }

  async processMessage(req, res) {
    try {
      const { userId, message, messageType = 'text' } = req.body;

      if (!userId || !message) {
        return res.status(400).json({
          success: false,
          message: 'Требуются userId и message'
        });
      }

      this.logger.info('Processing messenger message', { userId, message, messageType });

      const response = await this.bot.processMessage(userId, message);
      
      this.logger.info('Messenger response generated', { 
        userId, 
        responseType: response.type,
        success: true 
      });

      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      this.logger.error('Error processing messenger message', { 
        error: error.message, 
        userId: req.body.userId 
      });
      
      res.status(500).json({
        success: false,
        message: 'Ошибка обработки сообщения'
      });
    }
  }

  submitFlightOrder(req, res) {
    try {
      const { userId, orderData } = req.body;

      if (!userId || !orderData) {
        return res.status(400).json({
          success: false,
          message: 'Требуются userId и orderData'
        });
      }

      this.logger.info('Submitting flight order', { userId, orderData });

      const response = this.bot.submitFlightOrder(userId, orderData);
      
      this.logger.info('Flight order submitted', { 
        userId, 
        orderId: response.data.message.match(/#(\w+)/)?.[1],
        success: true 
      });

      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      this.logger.error('Error submitting flight order', { 
        error: error.message, 
        userId: req.body.userId 
      });
      
      res.status(500).json({
        success: false,
        message: 'Ошибка отправки заказа рейса'
      });
    }
  }

  getBotStats(req, res) {
    try {
      const stats = this.bot.getBotStats();
      
      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      this.logger.error('Error getting bot stats', { error: error.message });
      
      res.status(500).json({
        success: false,
        message: 'Ошибка получения статистики бота'
      });
    }
  }

  updateOrderStatus(req, res) {
    try {
      const { orderId, status } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({
          success: false,
          message: 'Требуются orderId и status'
        });
      }

      const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Неверный статус. Допустимые: ${validStatuses.join(', ')}`
        });
      }

      this.logger.info('Updating order status', { orderId, status });

      const success = this.bot.updateOrderStatus(orderId, status);
      
      if (success) {
        this.logger.info('Order status updated', { orderId, status, success: true });
        
        res.json({
          success: true,
          message: 'Статус заказа обновлен'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
      }

    } catch (error) {
      this.logger.error('Error updating order status', { 
        error: error.message, 
        orderId: req.body.orderId 
      });
      
      res.status(500).json({
        success: false,
        message: 'Ошибка обновления статуса заказа'
      });
    }
  }

  getOrderDetails(req, res) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Требуется orderId'
        });
      }

      const stats = this.bot.getBotStats();
      const order = stats.orders.find(o => o.id === orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
      }

      res.json({
        success: true,
        data: order
      });

    } catch (error) {
      this.logger.error('Error getting order details', { 
        error: error.message, 
        orderId: req.params.orderId 
      });
      
      res.status(500).json({
        success: false,
        message: 'Ошибка получения деталей заказа'
      });
    }
  }


  getAvailableCommands(req, res) {
    try {
      const commands = Array.from(this.bot.commands.entries()).map(([command, info]) => ({
        command: `/${command}`,
        description: info.description
      }));

      res.json({
        success: true,
        data: {
          commands,
          total: commands.length
        }
      });

    } catch (error) {
      this.logger.error('Error getting available commands', { error: error.message });
      
      res.status(500).json({
        success: false,
        message: 'Ошибка получения списка команд'
      });
    }
  }

  async getOrderById(req, res) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Требуется orderId'
        });
      }

      const order = await this.bot.database.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
      }

      res.json({
        success: true,
        data: order
      });

    } catch (error) {
      this.logger.error('Error getting order by ID', { error: error.message, orderId: req.params.orderId });
      
      res.status(500).json({
        success: false,
        message: 'Ошибка получения заказа'
      });
    }
  }

  async getUserOrders(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Требуется userId'
        });
      }

      const orders = await this.bot.database.getUserOrders(userId);

      res.json({
        success: true,
        data: {
          orders,
          count: orders.length
        }
      });

    } catch (error) {
      this.logger.error('Error getting user orders', { error: error.message, userId: req.params.userId });
      
      res.status(500).json({
        success: false,
        message: 'Ошибка получения заказов пользователя'
      });
    }
  }

  async getAllOrders(req, res) {
    try {
      const { limit = 100, offset = 0 } = req.query;

      const orders = await this.bot.database.getAllOrders(parseInt(limit), parseInt(offset));

      res.json({
        success: true,
        data: {
          orders,
          count: orders.length,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });

    } catch (error) {
      this.logger.error('Error getting all orders', { error: error.message });
      
      res.status(500).json({
        success: false,
        message: 'Ошибка получения заказов'
      });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({
          success: false,
          message: 'Требуются orderId и status'
        });
      }

      const validStatuses = ['pending', 'confirmed', 'rejected', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Недопустимый статус. Доступные: ' + validStatuses.join(', ')
        });
      }

      const result = await this.bot.database.updateOrderStatus(orderId, status);

      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
      }

      res.json({
        success: true,
        message: 'Статус заказа обновлен',
        data: { orderId, status }
      });

    } catch (error) {
      this.logger.error('Error updating order status', { error: error.message, orderId: req.params.orderId });
      
      res.status(500).json({
        success: false,
        message: 'Ошибка обновления статуса заказа'
      });
    }
  }

  async getOrderStats(req, res) {
    try {
      const stats = await this.bot.database.getOrderStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      this.logger.error('Error getting order stats', { error: error.message });
      
      res.status(500).json({
        success: false,
        message: 'Ошибка получения статистики заказов'
      });
    }
  }

  async deleteOrder(req, res) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Требуется orderId'
        });
      }

      const result = await this.bot.database.deleteOrder(orderId);

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
      }

      this.logger.info('Order deleted', { orderId, success: true });

      res.json({
        success: true,
        message: 'Заказ успешно удален',
        data: { orderId }
      });

    } catch (error) {
      this.logger.error('Error deleting order', { error: error.message, orderId: req.params.orderId });
      
      res.status(500).json({
        success: false,
        message: 'Ошибка удаления заказа'
      });
    }
  }

  // Получить статистику квот
  async getQuotaStats(req, res) {
    try {
      const { location } = req.query;
      const stats = this.bot.quotaManager.getQuotaStats(location);
      
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      this.logger.error('Ошибка получения статистики квот', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения статистики квот'
      });
    }
  }

  // Обновить квоту
  async updateQuota(req, res) {
    try {
      const { location, position, quota } = req.body;

      if (!location || !position || quota === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Требуются location, position и quota'
        });
      }

      const result = this.bot.quotaManager.updateQuota(location, position, parseInt(quota));
      
      res.json({
        success: true,
        message: result.message,
        data: { location, position, quota }
      });
    } catch (error) {
      this.logger.error('Ошибка обновления квоты', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Ошибка обновления квоты'
      });
    }
  }

  // Сбросить квоты
  async resetQuotas(req, res) {
    try {
      const result = this.bot.quotaManager.resetQuotas();
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      this.logger.error('Ошибка сброса квот', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Ошибка сброса квот'
      });
    }
  }
}

module.exports = MessengerBotAPI;


