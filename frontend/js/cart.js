// JAN Delivery - Cart Management
class CartManager {
  constructor() {
    this.items = [];
    this.isLoading = false;
    
    this.loadCartFromStorage();
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.cartIndicator = document.getElementById('cart-indicator');
    this.cartCount = document.getElementById('cart-count');
    this.cartItems = document.getElementById('cart-items');
    this.cartSummary = document.getElementById('cart-summary');
    this.cartEmpty = document.getElementById('cart-empty');
    this.subtotal = document.getElementById('subtotal');
    this.deliveryCost = document.getElementById('delivery-cost');
    this.total = document.getElementById('total');
    this.clearCartBtn = document.getElementById('clear-cart');
    this.checkoutBtn = document.getElementById('checkout-btn');
    this.orderModal = document.getElementById('order-modal');
    this.phoneInput = document.getElementById('phone-input');
    this.addressInput = document.getElementById('address-input');
    this.notesInput = document.getElementById('notes-input');
    this.paymentCash = document.getElementById('payment-cash');
    this.paymentCard = document.getElementById('payment-card');
    this.getLocationBtn = document.getElementById('get-location');
    this.confirmOrderBtn = document.getElementById('confirm-order');
    this.zoneWarning = document.getElementById('zone-warning');
    this.waitlistBtn = document.getElementById('waitlist-btn');
    this.addressSuggestions = document.getElementById('address-suggestions');
    
    // Инициализировать автокомплит адреса
    this.initAddressAutocomplete();
  }

  initAddressAutocomplete() {
    if (this.addressInput && typeof AddressAutocomplete !== 'undefined') {
      this.addressAutocomplete = new AddressAutocomplete(this.addressInput, {
        onSelect: (suggestion) => {
          utils.log('Выбран адрес:', suggestion);
          this.selectedAddress = suggestion;
          this.checkDeliveryZone(suggestion);
        },
        onError: (error) => {
          utils.logError('Ошибка автокомплита:', error);
        }
      });
    }
  }

  bindEvents() {
    // Индикатор корзины
    this.cartIndicator?.addEventListener('click', () => {
      telegram.hapticFeedback('light');
      app.showPage('cart');
    });

    // Очистить корзину
    this.clearCartBtn?.addEventListener('click', () => {
      telegram.hapticFeedback('warning');
      this.showClearConfirmation();
    });

    // Оформить заказ
    this.checkoutBtn?.addEventListener('click', () => {
      telegram.hapticFeedback('light');
      this.showOrderModal();
    });

    // Обработчики корзины
    this.cartItems?.addEventListener('click', (e) => {
      const cartItem = e.target.closest('.cart-item');
      if (!cartItem) return;

      const itemId = cartItem.dataset.itemId;

      if (e.target.classList.contains('quantity-btn')) {
        const action = e.target.dataset.action;
        telegram.hapticFeedback('selection');
        
        if (action === 'increase') {
          this.increaseQuantity(itemId);
        } else if (action === 'decrease') {
          this.decreaseQuantity(itemId);
        }
      } else if (e.target.classList.contains('remove-item')) {
        telegram.hapticFeedback('warning');
        this.removeItem(itemId);
      }
    });

    // Модальное окно заказа
    this.orderModal?.addEventListener('click', (e) => {
      if (e.target === this.orderModal || e.target.classList.contains('modal-close')) {
        this.hideOrderModal();
      }
    });

    // Получить местоположение
    this.getLocationBtn?.addEventListener('click', () => {
      telegram.hapticFeedback('light');
      this.getCurrentLocation();
    });

    // Подтвердить заказ
    this.confirmOrderBtn?.addEventListener('click', () => {
      telegram.hapticFeedback('medium');
      this.confirmOrder();
    });

    // Добавить в список ожидания
    this.waitlistBtn?.addEventListener('click', () => {
      telegram.hapticFeedback('light');
      this.addToWaitlist();
    });

    // Переход к меню из пустой корзины
    document.querySelector('.nav-to-menu')?.addEventListener('click', () => {
      telegram.hapticFeedback('light');
      app.showPage('menu');
    });

    // Форматирование номера телефона
    this.phoneInput?.addEventListener('input', (e) => {
      const formatted = this.formatPhoneInput(e.target.value);
      e.target.value = formatted;
    });

    // Автодополнение адреса (простая версия по первому результату)
    this.addressInput?.addEventListener('input', utils.debounce(async (e) => {
      const q = e.target.value.trim();
      if (q.length < 3) return;
      try {
        const result = await api.geocodeAddress(q);
        if (!result) return;
        if (this.addressSuggestions) {
          this.addressSuggestions.innerHTML = '';
          const option = document.createElement('option');
          option.value = result.formatted_address || q;
          this.addressSuggestions.appendChild(option);
        }
      } catch (_) {}
    }, 400));
  }

  // Добавить товар в корзину
  addItem(item, quantity = 1) {
    const existingItem = this.items.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        ...item,
        quantity: quantity
      });
    }

    this.saveCartToStorage();
    this.updateCartDisplay();
    
    utils.log('Товар добавлен в корзину:', item.name, 'Количество:', quantity);
  }

  // Удалить товар из корзины
  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.saveCartToStorage();
    this.updateCartDisplay();
    
    utils.showToast('Товар удален из корзины', 'info');
  }

  // Увеличить количество
  increaseQuantity(itemId) {
    const item = this.items.find(item => item.id === itemId);
    if (item) {
      item.quantity += 1;
      this.saveCartToStorage();
      this.updateCartDisplay();
    }
  }

  // Уменьшить количество
  decreaseQuantity(itemId) {
    const item = this.items.find(item => item.id === itemId);
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        this.removeItem(itemId);
        return;
      }
      this.saveCartToStorage();
      this.updateCartDisplay();
    }
  }

  // Очистить корзину
  clearCart() {
    this.items = [];
    this.saveCartToStorage();
    this.updateCartDisplay();
    
    utils.showToast('Корзина очищена', 'info');
  }

  // Показать подтверждение очистки корзины
  showClearConfirmation() {
    telegram.showConfirm('Очистить корзину?', (confirmed) => {
      if (confirmed) {
        this.clearCart();
      }
    });
  }

  // Обновить отображение корзины
  updateCartDisplay() {
    this.updateCartIndicator();
    this.renderCartItems();
    this.updateCartSummary();
  }

  // Обновить индикатор корзины
  updateCartIndicator() {
    const totalItems = this.getTotalItems();
    
    if (this.cartCount) {
      this.cartCount.textContent = totalItems;
    }

    // Показать/скрыть индикатор
    if (this.cartIndicator) {
      this.cartIndicator.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  }

  // Отрендерить товары в корзине
  renderCartItems() {
    if (!this.cartItems) return;

    if (this.items.length === 0) {
      this.showEmptyCart();
      return;
    }

    const cartHTML = this.items.map(item => this.getCartItemHTML(item)).join('');
    this.cartItems.innerHTML = cartHTML;

    // Показать/скрыть элементы
    if (this.cartSummary) this.cartSummary.classList.remove('hidden');
    if (this.cartEmpty) this.cartEmpty.style.display = 'none';
  }

  // HTML для товара в корзине
  getCartItemHTML(item) {
    const image = item.image ? 
      `background-image: url('${item.image}')` : 
      '';
    
    const emoji = CONFIG.CATEGORY_IMAGES[item.category?.toLowerCase()] || '🍽️';
    
    return `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item-image" style="${image}">
          ${!item.image ? emoji : ''}
        </div>
        <div class="cart-item-content">
          <div class="cart-item-name">${this.escapeHtml(item.name)}</div>
          <div class="cart-item-price">${utils.formatPrice(item.price)} за шт.</div>
          <div class="cart-item-controls">
            <button class="quantity-btn" data-action="decrease">−</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn" data-action="increase">+</button>
            <button class="remove-item">Удалить</button>
          </div>
        </div>
      </div>
    `;
  }

  // Показать пустую корзину
  showEmptyCart() {
    if (this.cartItems) this.cartItems.innerHTML = '';
    if (this.cartSummary) this.cartSummary.classList.add('hidden');
    if (this.cartEmpty) this.cartEmpty.style.display = 'block';
  }

  // Обновить сводку заказа
  updateCartSummary() {
    const subtotalAmount = this.getSubtotal();
    const deliveryAmount = this.getDeliveryAmount();
    const totalAmount = subtotalAmount + deliveryAmount;

    if (this.subtotal) this.subtotal.textContent = utils.formatPrice(subtotalAmount);
    if (this.deliveryCost) this.deliveryCost.textContent = utils.formatPrice(deliveryAmount);
    if (this.total) this.total.textContent = utils.formatPrice(totalAmount);

    // Активировать/деактивировать кнопку оформления
    if (this.checkoutBtn) {
      this.checkoutBtn.disabled = this.items.length === 0;
    }
  }

  // Показать модальное окно заказа
  showOrderModal() {
    if (this.items.length === 0) {
      utils.showToast('Корзина пуста', 'warning');
      return;
    }

    // Предзаполнить данные пользователя
    this.prefillUserData();
    
    this.orderModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Показать главную кнопку Telegram
    telegram.showMainButton('Подтвердить заказ', () => {
      this.confirmOrder();
    });
  }

  // Скрыть модальное окно заказа
  hideOrderModal() {
    this.orderModal.classList.add('hidden');
    document.body.style.overflow = '';
    
    // Скрыть главную кнопку Telegram
    telegram.hideMainButton();
  }

  // Предзаполнить данные пользователя
  async prefillUserData() {
    const user = telegram.getUser();
    if (!user) return;

    try {
      const userData = await api.getUser(user.id);
      if (userData) {
        if (this.phoneInput && userData.phone) {
          this.phoneInput.value = userData.phone;
        }
        if (this.addressInput && userData.address) {
          this.addressInput.value = userData.address;
        }
      }
    } catch (error) {
      utils.logError('Ошибка загрузки данных пользователя:', error);
    }
  }

  // Получить текущее местоположение
  getCurrentLocation() {
    if (!navigator.geolocation) {
      utils.showToast('Геолокация не поддерживается', 'error');
      return;
    }

    this.getLocationBtn.disabled = true;
    this.getLocationBtn.textContent = 'Получаем...';

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Здесь можно использовать обратное геокодирование
          // Для примера просто показываем координаты
          if (this.addressInput) {
            this.addressInput.value = `Координаты: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          }
          
          utils.showToast('Местоположение получено', 'success');
        } catch (error) {
          utils.logError('Ошибка геокодирования:', error);
          utils.showToast('Ошибка определения адреса', 'error');
        }
      },
      (error) => {
        utils.logError('Ошибка геолокации:', error);
        utils.showToast('Не удалось получить местоположение', 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    // Сбросить кнопку через 2 секунды
    setTimeout(() => {
      this.getLocationBtn.disabled = false;
      this.getLocationBtn.textContent = '📍 Моё местоположение';
    }, 2000);
  }

  // Подтвердить заказ
  async confirmOrder() {
    if (this.isLoading) return;

    // Валидация
    const phone = this.phoneInput?.value.trim();
    const address = this.addressInput?.value.trim();

    if (!phone) {
      utils.showToast('Введите номер телефона', 'warning');
      this.phoneInput?.focus();
      return;
    }

    if (!utils.validatePhone(phone)) {
      utils.showToast('Некорректный номер телефона', 'warning');
      this.phoneInput?.focus();
      return;
    }

    if (!address) {
      utils.showToast('Введите адрес доставки', 'warning');
      this.addressInput?.focus();
      return;
    }

    const user = telegram.getUser();
    if (!user) {
      utils.showToast('Ошибка авторизации', 'error');
      return;
    }

    this.isLoading = true;
    this.setOrderLoading(true);

    try {
      // Проверить зону доставки
      const inZone = await api.checkDeliveryZone({ address });
      if (!inZone) {
        if (this.zoneWarning) this.zoneWarning.style.display = 'block';
        if (this.waitlistBtn) this.waitlistBtn.style.display = 'inline-block';
        utils.showToast('Адрес вне зоны доставки', 'warning');
        return;
      } else {
        if (this.zoneWarning) this.zoneWarning.style.display = 'none';
        if (this.waitlistBtn) this.waitlistBtn.style.display = 'none';
      }

      const payment_method = (this.paymentCard && this.paymentCard.checked) ? 'card' : 'cash';
      // Создать заказ
      const orderData = {
        userId: user.id,
        userInfo: {
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username
        },
        items: this.items,
        total: this.getSubtotal() + this.getDeliveryAmount(),
        address: address,
        phone: phone,
        notes: this.notesInput?.value.trim() || '',
        payment_method
      };

      const order = await api.createOrder(orderData);
      
      if (order) {
        // Очистить корзину
        this.clearCart();
        
        // Скрыть модальное окно
        this.hideOrderModal();
        
        // Показать страницу заказов
        app.showPage('orders');
        
        // Обновить список заказов
        if (window.ordersManager) {
          ordersManager.loadOrders();
        }

        utils.showToast('Заказ успешно оформлен!', 'success');
        telegram.hapticFeedback('success');
      }
    } catch (error) {
      utils.logError('Ошибка создания заказа:', error);
      utils.showToast('Ошибка создания заказа', 'error');
      telegram.hapticFeedback('error');
    } finally {
      this.isLoading = false;
      this.setOrderLoading(false);
    }
  }

  // Добавить адрес в список ожидания
  async addToWaitlist() {
    try {
      const user = telegram.getUser();
      const ok = await api.addToWaitlist({
        userId: user?.id,
        phone: this.phoneInput?.value.trim() || '',
        address: this.addressInput?.value.trim() || '',
        notes: this.notesInput?.value.trim() || ''
      });
      if (ok) {
        utils.showToast('Добавлено в список ожидания', 'success');
      } else {
        utils.showToast('Не удалось добавить', 'error');
      }
    } catch (e) {
      utils.showToast('Ошибка списка ожидания', 'error');
    }
  }

  // Установить состояние загрузки для заказа
  setOrderLoading(loading) {
    if (this.confirmOrderBtn) {
      this.confirmOrderBtn.disabled = loading;
      this.confirmOrderBtn.textContent = loading ? 'Оформляем...' : 'Подтвердить заказ';
    }

    telegram.setMainButtonLoading(loading);
  }

  // Форматирование ввода телефона
  formatPhoneInput(value) {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '';

    if (cleaned.length === 0) return '';

    if (cleaned.startsWith('8')) {
      formatted = '+7';
      const rest = cleaned.slice(1);
      if (rest.length > 0) formatted += ` (${rest.slice(0, 3)}`;
      if (rest.length > 3) formatted += `) ${rest.slice(3, 6)}`;
      if (rest.length > 6) formatted += `-${rest.slice(6, 8)}`;
      if (rest.length > 8) formatted += `-${rest.slice(8, 10)}`;
    } else if (cleaned.startsWith('7')) {
      formatted = '+7';
      const rest = cleaned.slice(1);
      if (rest.length > 0) formatted += ` (${rest.slice(0, 3)}`;
      if (rest.length > 3) formatted += `) ${rest.slice(3, 6)}`;
      if (rest.length > 6) formatted += `-${rest.slice(6, 8)}`;
      if (rest.length > 8) formatted += `-${rest.slice(8, 10)}`;
    } else {
      formatted = value;
    }

    return formatted;
  }

  // Сохранить корзину в localStorage
  saveCartToStorage() {
    try {
      localStorage.setItem('jan-delivery-cart', JSON.stringify(this.items));
    } catch (error) {
      utils.logError('Ошибка сохранения корзины:', error);
    }
  }

  // Загрузить корзину из localStorage
  loadCartFromStorage() {
    try {
      const saved = localStorage.getItem('jan-delivery-cart');
      if (saved) {
        this.items = JSON.parse(saved);
        utils.log('Корзина загружена из хранилища:', this.items.length, 'товаров');
      }
    } catch (error) {
      utils.logError('Ошибка загрузки корзины:', error);
      this.items = [];
    }
  }

  // Вычисления
  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getDeliveryAmount() {
    const subtotal = this.getSubtotal();
    return subtotal >= CONFIG.MIN_ORDER_RSD ? 0 : CONFIG.DELIVERY_COST_BELOW_MIN;
  }

  // Проверить зону доставки для выбранного адреса
  async checkDeliveryZone(addressData) {
    if (!addressData) return;
    
    try {
      let inZone = false;
      
      if (addressData.coordinates) {
        inZone = await api.checkDeliveryZone({
          latitude: addressData.coordinates.latitude,
          longitude: addressData.coordinates.longitude
        });
      } else if (addressData.text) {
        inZone = await api.checkDeliveryZone({ address: addressData.text });
      }
      
      if (inZone) {
        this.zoneWarning.style.display = 'none';
        this.waitlistBtn.style.display = 'none';
      } else {
        this.zoneWarning.style.display = 'block';
        this.waitlistBtn.style.display = 'block';
      }
      
    } catch (error) {
      utils.logError('Ошибка проверки зоны доставки:', error);
    }
  }

  // Утилиты
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Создать глобальный экземпляр
const cart = new CartManager();
