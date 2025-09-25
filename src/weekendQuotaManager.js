const fs = require('fs');
const path = require('path');

class WeekendQuotaManager {
  constructor() {
    this.quotaFile = path.join(__dirname, '..', 'data', 'weekend_quotas.json');
    this.quotas = this.loadQuotas();
  }

  // Загружаем квоты из файла
  loadQuotas() {
    try {
      if (fs.existsSync(this.quotaFile)) {
        const data = fs.readFileSync(this.quotaFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки квот:', error.message);
    }
    
    // Возвращаем квоты по умолчанию
    return this.getDefaultQuotas();
  }

  // Сохраняем квоты в файл
  saveQuotas() {
    try {
      const dataDir = path.dirname(this.quotaFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(this.quotaFile, JSON.stringify(this.quotas, null, 2));
      console.log('Квоты выходных сохранены');
    } catch (error) {
      console.error('Ошибка сохранения квот:', error.message);
    }
  }

  // Квоты по умолчанию
  getDefaultQuotas() {
    return {
      "Москва": {
        "BP": 5,      // 5 мест в день
        "BP BS": 3,   // 3 места в день
        "SBE": 2,     // 2 места в день
        "IPB": 1      // 1 место в день
      },
      "Санкт-Петербург": {
        "BP": 3,
        "BP BS": 2,
        "SBE": 1,
        "IPB": 1
      },
      "Красноярск": {
        "BP": 2,
        "BP BS": 1,
        "SBE": 1,
        "IPB": 1
      },
      "Сочи": {
        "BP": 2,
        "BP BS": 1,
        "SBE": 1,
        "IPB": 1
      }
    };
  }

  // Получить квоту для конкретной даты, локации и должности
  getQuotaForDate(date, location, position) {
    const dateStr = this.formatDate(date);
    
    if (!this.quotas[location] || !this.quotas[location][position]) {
      return 0;
    }

    // Проверяем, есть ли квота для этой даты
    if (!this.quotas[location].dates) {
      this.quotas[location].dates = {};
    }

    if (!this.quotas[location].dates[dateStr]) {
      this.quotas[location].dates[dateStr] = {};
    }

    if (!this.quotas[location].dates[dateStr][position]) {
      this.quotas[location].dates[dateStr][position] = {
        total: this.quotas[location][position],
        used: 0,
        available: this.quotas[location][position]
      };
    }

    return this.quotas[location].dates[dateStr][position];
  }

  // Проверить доступность даты
  isDateAvailable(date, location, position) {
    const quota = this.getQuotaForDate(date, location, position);
    return quota.available > 0;
  }

  // Забронировать дату
  bookDate(date, location, position) {
    const quota = this.getQuotaForDate(date, location, position);
    
    if (quota.available <= 0) {
      return { success: false, message: 'Нет доступных мест на эту дату' };
    }

    quota.used += 1;
    quota.available = quota.total - quota.used;
    
    this.saveQuotas();
    
    return { 
      success: true, 
      message: 'Дата успешно забронирована',
      available: quota.available,
      used: quota.used,
      total: quota.total
    };
  }

  // Отменить бронирование
  cancelBooking(date, location, position) {
    const quota = this.getQuotaForDate(date, location, position);
    
    if (quota.used <= 0) {
      return { success: false, message: 'Нет активных бронирований на эту дату' };
    }

    quota.used -= 1;
    quota.available = quota.total - quota.used;
    
    this.saveQuotas();
    
    return { 
      success: true, 
      message: 'Бронирование отменено',
      available: quota.available,
      used: quota.used,
      total: quota.total
    };
  }

  // Получить доступные даты для локации и должности
  getAvailableDates(location, position, startDate = new Date(), daysAhead = 30) {
    const availableDates = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < daysAhead; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(currentDate.getDate() + i);
      
      if (this.isDateAvailable(checkDate, location, position)) {
        availableDates.push(new Date(checkDate));
      }
    }
    
    return availableDates;
  }

  // Получить статистику квот
  getQuotaStats(location = null) {
    const stats = {};
    
    if (location) {
      stats[location] = this.getLocationStats(location);
    } else {
      Object.keys(this.quotas).forEach(loc => {
        if (loc !== 'dates') {
          stats[loc] = this.getLocationStats(loc);
        }
      });
    }
    
    return stats;
  }

  // Получить статистику для конкретной локации
  getLocationStats(location) {
    const locationData = this.quotas[location];
    if (!locationData) return {};
    
    const stats = {};
    
    Object.keys(locationData).forEach(position => {
      if (position !== 'dates') {
        stats[position] = {
          dailyQuota: locationData[position],
          totalUsed: 0,
          totalAvailable: 0
        };
      }
    });
    
    // Подсчитываем использованные квоты по датам
    if (locationData.dates) {
      Object.values(locationData.dates).forEach(dateData => {
        Object.keys(dateData).forEach(position => {
          if (stats[position]) {
            stats[position].totalUsed += dateData[position].used;
            stats[position].totalAvailable += dateData[position].available;
          }
        });
      });
    }
    
    return stats;
  }

  // Форматирование даты
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // Обновить квоты для локации и должности
  updateQuota(location, position, newQuota) {
    if (!this.quotas[location]) {
      this.quotas[location] = {};
    }
    
    this.quotas[location][position] = newQuota;
    this.saveQuotas();
    
    return { success: true, message: 'Квота обновлена' };
  }

  // Сбросить квоты к значениям по умолчанию
  resetQuotas() {
    this.quotas = this.getDefaultQuotas();
    this.saveQuotas();
    return { success: true, message: 'Квоты сброшены к значениям по умолчанию' };
  }
}

module.exports = WeekendQuotaManager;
