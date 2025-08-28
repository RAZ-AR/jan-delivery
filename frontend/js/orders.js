// JAN Delivery - Orders Management
class OrdersManager {
  constructor() {
    this.orders = [];
    this.isLoading = false;
    
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.ordersList = document.getElementById('orders-list');
    this.ordersEmpty = document.getElementById('orders-empty');
  }

  bindEvents() {
    // Обработчик кликов по заказам
    this.ordersList?.addEventListener('click', (e) => {
      const orderItem = e.target.closest('.order-item');
      if (orderItem) {
        telegram.hapticFeedback('light');
        this.showOrderDetails(orderItem.dataset.orderId);
      }
    });
  }

  // Загрузить заказы пользователя
  async loadOrders() {
    const user = telegram.getUser();
    if (!user) {
      utils.logError('Пользователь не найден');
      this.showEmptyOrders();
      return;
    }

    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoading();

    try {
      this.orders = await api.getUserOrders(user.id);
      this.renderOrders();
      
      utils.log('Заказы загружены:', this.orders.length);
    } catch (error) {
      utils.logError('Ошибка загрузки заказов:', error);
      utils.showToast('Ошибка загрузки заказов', 'error');
      this.showError();
    } finally {
      this.isLoading = false;
    }
  }

  // Отрендерить список заказов
  renderOrders() {
    if (!this.ordersList) return;

    if (this.orders.length === 0) {
      this.showEmptyOrders();
      return;
    }

    const ordersHTML = this.orders.map(order => this.getOrderItemHTML(order)).join('');
    this.ordersList.innerHTML = ordersHTML;

    // Показать/скрыть элементы
    this.ordersList.style.display = 'block';
    if (this.ordersEmpty) this.ordersEmpty.style.display = 'none';
  }

  // HTML для карточки заказа
  getOrderItemHTML(order) {
    const statusText = CONFIG.ORDER_STATUSES[order.status] || order.status;
    const itemsCount = Array.isArray(order.items) ? order.items.length : 0;
    const itemsText = this.getItemsText(itemsCount);
    
    const createdDate = new Date(order.createdAt).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="order-item" data-order-id="${order.id}">
        <div class="order-header">
          <div class="order-id">${order.id}</div>
          <div class="order-status order-status-${order.status}">${statusText}</div>
        </div>
        <div class="order-details">
          <div>${itemsText} • ${createdDate}</div>
          ${order.address ? `<div>📍 ${this.escapeHtml(order.address)}</div>` : ''}
          ${order.estimatedDelivery ? `<div>⏱️ ${order.estimatedDelivery}</div>` : ''}
        </div>
        <div class="order-total">${utils.formatPrice(order.total)}</div>
      </div>
    `;
  }

  // Показать детали заказа
  showOrderDetails(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const itemsList = Array.isArray(order.items) ? 
      order.items.map(item => `${item.name} × ${item.quantity}`).join('\n') :
      'Информация о товарах недоступна';

    const details = `
🧾 Заказ: ${order.id}
📊 Статус: ${CONFIG.ORDER_STATUSES[order.status] || order.status}

📦 Товары:
${itemsList}

💰 Сумма: ${utils.formatPrice(order.total)}
📍 Адрес: ${order.address || 'Не указан'}
📞 Телефон: ${order.phone || 'Не указан'}
📅 Дата: ${new Date(order.createdAt).toLocaleString('ru-RU')}

${order.notes ? `📝 Комментарий: ${order.notes}` : ''}
${order.estimatedDelivery ? `⏱️ Ожидаемое время: ${order.estimatedDelivery}` : ''}
    `.trim();

    telegram.showAlert(details);
  }

  // Показать пустой список заказов
  showEmptyOrders() {
    if (this.ordersList) this.ordersList.style.display = 'none';
    if (this.ordersEmpty) this.ordersEmpty.style.display = 'block';
  }

  // Показать загрузку
  showLoading() {
    if (!this.ordersList) return;
    
    this.ordersList.innerHTML = `
      <div style="text-align: center; padding: 48px;">
        <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
        <p>Загружаем заказы...</p>
      </div>
    `;
    this.ordersList.style.display = 'block';
    if (this.ordersEmpty) this.ordersEmpty.style.display = 'none';
  }

  // Показать ошибку
  showError() {
    if (!this.ordersList) return;
    
    this.ordersList.innerHTML = `
      <div style="text-align: center; padding: 48px;">
        <div style="font-size: 64px; margin-bottom: 16px;">😕</div>
        <h3>Ошибка загрузки</h3>
        <p style="color: var(--tg-theme-hint-color); margin-bottom: 24px;">
          Не удалось загрузить заказы
        </p>
        <button onclick="ordersManager.loadOrders()" 
                style="background: var(--primary-color); color: white; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer;">
          Попробовать снова
        </button>
      </div>
    `;
    this.ordersList.style.display = 'block';
    if (this.ordersEmpty) this.ordersEmpty.style.display = 'none';
  }

  // Обновить заказы
  async refreshOrders() {
    await this.loadOrders();
  }

  // Отслеживание статуса заказа (для будущего использования)
  async trackOrder(orderId) {
    try {
      const order = await api.getOrder(orderId);
      if (order) {
        // Обновить заказ в списке
        const index = this.orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
          this.orders[index] = order;
          this.renderOrders();
        }
        return order;
      }
    } catch (error) {
      utils.logError('Ошибка отслеживания заказа:', error);
    }
    return null;
  }

  // Автообновление статусов заказов
  startStatusPolling() {
    // Проверять статусы активных заказов каждые 30 секунд
    this.pollingInterval = setInterval(async () => {
      const activeOrders = this.orders.filter(order => 
        ['pending', 'confirmed', 'cooking', 'ready', 'delivering'].includes(order.status)
      );

      if (activeOrders.length > 0) {
        let hasUpdates = false;
        
        for (const order of activeOrders) {
          const updatedOrder = await this.trackOrder(order.id);
          if (updatedOrder && updatedOrder.status !== order.status) {
            hasUpdates = true;
            
            // Показать уведомление об изменении статуса
            const statusText = CONFIG.ORDER_STATUSES[updatedOrder.status] || updatedOrder.status;
            utils.showToast(`Заказ ${order.id}: ${statusText}`, 'info');
          }
        }

        if (hasUpdates) {
          telegram.hapticFeedback('success');
        }
      }
    }, 30000);
  }

  // Остановить автообновление
  stopStatusPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Получить текст для количества товаров
  getItemsText(count) {
    if (count === 1) return '1 товар';
    if (count >= 2 && count <= 4) return `${count} товара`;
    return `${count} товаров`;
  }

  // Фильтр заказов по статусу
  filterOrdersByStatus(status) {
    const filtered = status === 'all' ? 
      this.orders : 
      this.orders.filter(order => order.status === status);
    
    if (filtered.length === 0) {
      this.showEmptyOrders();
    } else {
      const ordersHTML = filtered.map(order => this.getOrderItemHTML(order)).join('');
      this.ordersList.innerHTML = ordersHTML;
      this.ordersList.style.display = 'block';
      if (this.ordersEmpty) this.ordersEmpty.style.display = 'none';
    }
  }

  // Поиск заказов
  searchOrders(query) {
    if (!query.trim()) {
      this.renderOrders();
      return;
    }

    const searchResults = this.orders.filter(order => {
      const searchText = `${order.id} ${order.address || ''} ${order.phone || ''}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    if (searchResults.length === 0) {
      this.ordersList.innerHTML = `
        <div style="text-align: center; padding: 48px;">
          <div style="font-size: 64px; margin-bottom: 16px;">🔍</div>
          <h3>Заказы не найдены</h3>
          <p style="color: var(--tg-theme-hint-color);">
            Попробуйте изменить запрос
          </p>
        </div>
      `;
    } else {
      const ordersHTML = searchResults.map(order => this.getOrderItemHTML(order)).join('');
      this.ordersList.innerHTML = ordersHTML;
    }
  }

  // Утилиты
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Обновить отображение заказов при смене языка
  async updateOrdersDisplay(language) {
    if (this.orders.length === 0) return;

    console.log(`Обновляем отображение заказов для языка: ${language}`);

    // Пока просто перерендериваем с новыми переводами статусов
    // В будущем можно будет обновлять названия блюд в заказах
    this.renderOrders();
  }
}

// Создать глобальный экземпляр
const ordersManager = new OrdersManager();