// JAN Delivery - Menu Management
class MenuManager {
  constructor() {
    this.menu = [];
    this.categoriesStructure = {}; // Структура категорий с подкатегориями
    this.categories = [];
    this.subCategories = [];
    this.currentCategory = 'all';
    this.currentSubCategory = null;
    this.isLoading = false;
    
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.categoriesFilter = document.querySelector('.categories-filter');
    this.subCategoriesFilter = null; // Будет создан динамически
    this.menuGrid = document.getElementById('menu-items');
    this.itemModal = document.getElementById('item-modal');
    this.itemDetails = document.getElementById('item-details');
  }

  bindEvents() {
    // Обработчик для фильтра категорий
    this.categoriesFilter?.addEventListener('click', (e) => {
      if (e.target.classList.contains('category-btn')) {
        telegram.hapticFeedback('selection');
        this.selectCategory(e.target.dataset.category);
      }
    });

    // Обработчик для фильтра подкатегорий (делегирование события)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('subcategory-btn')) {
        telegram.hapticFeedback('selection');
        this.selectSubCategory(e.target.dataset.subcategory);
      }
    });

    // Обработчик для карточек блюд
    this.menuGrid?.addEventListener('click', (e) => {
      const menuItem = e.target.closest('.menu-item');
      const addButton = e.target.closest('.add-to-cart');

      if (addButton && menuItem) {
        e.stopPropagation();
        telegram.hapticFeedback('light');
        this.addToCart(menuItem.dataset.itemId);
      } else if (menuItem) {
        telegram.hapticFeedback('light');
        this.showItemDetails(menuItem.dataset.itemId);
      }
    });

    // Закрытие модального окна
    this.itemModal?.addEventListener('click', (e) => {
      if (e.target === this.itemModal || e.target.classList.contains('modal-close')) {
        this.hideItemDetails();
      }
    });
  }

  // Загрузить меню
  async loadMenu(language = null) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoading();

    try {
      // Загружаем меню и структуру категорий
      const [menuData, categoriesStructure] = await Promise.all([
        api.getMenu(language),
        api.getCategoriesStructure(language)
      ]);

      this.menu = menuData;
      this.categoriesStructure = categoriesStructure;
      
      this.extractCategories();
      this.renderCategories();
      
      // Сбросить текущую подкатегорию при смене языка
      this.currentSubCategory = null;
      this.renderMenu();
      
      utils.log('Меню загружено:', this.menu.length, 'блюд', language ? `(${language})` : '');
    } catch (error) {
      utils.logError('Ошибка загрузки меню:', error);
      utils.showToast('Ошибка загрузки меню', 'error');
      this.showError();
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  // Извлечь категории из меню
  extractCategories() {
    const categorySet = new Set();
    
    this.menu.forEach(item => {
      if (item.category && item.available) {
        categorySet.add(item.category.toLowerCase());
      }
    });

    this.categories = Array.from(categorySet).sort();
    utils.log('Найдены категории:', this.categories);
  }

  // Отрендерить категории
  renderCategories() {
    if (!this.categoriesFilter) return;

    const buttons = ['all', ...this.categories].map(category => {
      const name = this.getCategoryName(category);
      const active = category === this.currentCategory ? 'active' : '';
      
      return `
        <button class="category-btn ${active}" data-category="${category}" data-i18n="${this.getCategoryI18nKey(category)}">
          ${name}
        </button>
      `;
    }).join('');

    this.categoriesFilter.innerHTML = buttons;
  }

  // Получить переведенное название категории
  getCategoryName(category) {
    if (category === 'all') {
      return window.i18n ? window.i18n.t('menu.categories.all') : 'Все';
    }

    // Маппинг категорий на ключи переводов
    const categoryKeys = {
      'шашлык': 'menu.categories.shashlik',
      'люля-кебаб': 'menu.categories.kebab', 
      'рыба': 'menu.categories.fish',
      'овощи': 'menu.categories.vegetables',
      'соусы': 'menu.categories.sauces',
      'салаты': 'menu.categories.salads'
    };

    const key = categoryKeys[category.toLowerCase()];
    if (key && window.i18n) {
      return window.i18n.t(key);
    }

    return this.capitalizeFirst(category);
  }

  // Получить i18n ключ для категории
  getCategoryI18nKey(category) {
    if (category === 'all') return 'menu.categories.all';
    
    const categoryKeys = {
      'шашлык': 'menu.categories.shashlik',
      'люля-кебаб': 'menu.categories.kebab',
      'рыба': 'menu.categories.fish', 
      'овощи': 'menu.categories.vegetables',
      'соусы': 'menu.categories.sauces',
      'салаты': 'menu.categories.salads'
    };

    return categoryKeys[category.toLowerCase()] || '';
  }

  // Обновить кнопки категорий (для смены языка)
  updateCategoryButtons() {
    const buttons = this.categoriesFilter?.querySelectorAll('.category-btn');
    if (!buttons) return;

    buttons.forEach(btn => {
      const category = btn.dataset.category;
      const newName = this.getCategoryName(category);
      btn.textContent = newName;
    });

    // Также обновляем подкатегории если они отображаются
    this.updateSubCategoryButtons();
  }

  // Выбрать категорию
  async selectCategory(category) {
    this.currentCategory = category;
    this.currentSubCategory = null; // Сбросить подкатегорию

    // Обновить активное состояние кнопок категорий
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    // Показать подкатегории для выбранной категории
    await this.showSubCategories(category);
    
    // Обновить меню
    this.renderMenu();
  }

  // Показать подкатегории для категории
  async showSubCategories(category) {
    if (category === 'all') {
      this.hideSubCategories();
      return;
    }

    try {
      const subCategories = this.categoriesStructure[category]?.subCategories || [];
      
      if (subCategories.length === 0) {
        this.hideSubCategories();
        return;
      }

      this.renderSubCategories(subCategories);
    } catch (error) {
      utils.logError('Ошибка загрузки подкатегорий:', error);
      this.hideSubCategories();
    }
  }

  // Отрендерить подкатегории
  renderSubCategories(subCategories) {
    // Создаем контейнер для подкатегорий если его нет
    if (!this.subCategoriesFilter) {
      this.subCategoriesFilter = document.createElement('div');
      this.subCategoriesFilter.className = 'subcategories-filter';
      this.categoriesFilter.insertAdjacentElement('afterend', this.subCategoriesFilter);
    }

    const buttons = ['all', ...subCategories].map(subCategory => {
      const name = subCategory === 'all' ? 
        (window.i18n ? window.i18n.t('menu.categories.all') : 'Все') :
        subCategory;
      const active = subCategory === this.currentSubCategory || 
                    (subCategory === 'all' && !this.currentSubCategory) ? 'active' : '';
      
      return `
        <button class="subcategory-btn ${active}" data-subcategory="${subCategory}">
          ${name}
        </button>
      `;
    }).join('');

    this.subCategoriesFilter.innerHTML = buttons;
    this.subCategoriesFilter.style.display = 'flex';
  }

  // Скрыть подкатегории
  hideSubCategories() {
    if (this.subCategoriesFilter) {
      this.subCategoriesFilter.style.display = 'none';
      this.subCategoriesFilter.innerHTML = '';
    }
  }

  // Выбрать подкатегорию
  selectSubCategory(subCategory) {
    this.currentSubCategory = subCategory === 'all' ? null : subCategory;

    // Обновить активное состояние кнопок подкатегорий
    document.querySelectorAll('.subcategory-btn').forEach(btn => {
      const isActive = btn.dataset.subcategory === subCategory ||
                      (btn.dataset.subcategory === 'all' && subCategory === 'all');
      btn.classList.toggle('active', isActive);
    });

    this.renderMenu();
  }

  // Обновить кнопки подкатегорий (для смены языка)
  updateSubCategoryButtons() {
    const buttons = this.subCategoriesFilter?.querySelectorAll('.subcategory-btn');
    if (!buttons) return;

    buttons.forEach(btn => {
      const subCategory = btn.dataset.subcategory;
      if (subCategory === 'all') {
        btn.textContent = window.i18n ? window.i18n.t('menu.categories.all') : 'Все';
      }
      // Подкатегории уже переведены с сервера
    });
  }

  // Отрендерить меню
  renderMenu() {
    if (!this.menuGrid) return;

    const filteredMenu = this.getFilteredMenu();

    if (filteredMenu.length === 0) {
      this.menuGrid.innerHTML = this.getEmptyMenuHTML();
      return;
    }

    const menuHTML = filteredMenu.map(item => this.getMenuItemHTML(item)).join('');
    this.menuGrid.innerHTML = menuHTML;
  }

  // Получить отфильтрованное меню
  getFilteredMenu() {
    return this.menu.filter(item => {
      if (!item.available) return false;
      
      // Если выбраны "Все" категории
      if (this.currentCategory === 'all') return true;
      
      // Фильтр по категории
      if (item.category.toLowerCase() !== this.currentCategory.toLowerCase()) {
        return false;
      }
      
      // Если подкатегория не выбрана, показываем все блюда категории
      if (!this.currentSubCategory) return true;
      
      // Фильтр по подкатегории
      return item.subCategory.toLowerCase() === this.currentSubCategory.toLowerCase();
    });
  }

  // HTML для карточки блюда
  getMenuItemHTML(item) {
    const image = item.image ? 
      `background-image: url('${item.image}')` : 
      '';
    
    const emoji = CONFIG.CATEGORY_IMAGES[item.category.toLowerCase()] || '🍽️';
    
    return `
      <div class="menu-item" data-item-id="${item.id}">
        <div class="menu-item-image" style="${image}">
          ${!item.image ? emoji : ''}
        </div>
        <div class="menu-item-content">
          <div class="menu-item-name">${this.escapeHtml(item.name)}</div>
          <div class="menu-item-description">${this.escapeHtml(item.description)}</div>
          <div class="menu-item-footer">
            <div class="menu-item-price">${utils.formatPrice(item.price)}</div>
            <button class="add-to-cart" data-item-id="${item.id}">
              В корзину
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // HTML для пустого меню
  getEmptyMenuHTML() {
    return `
      <div class="empty-menu">
        <div class="empty-icon">🍽️</div>
        <h3>Блюда не найдены</h3>
        <p>В этой категории пока нет доступных блюд</p>
      </div>
    `;
  }

  // Старый метод удален - используется новый async selectCategory выше

  // Добавить в корзину
  async addToCart(itemId) {
    const item = this.menu.find(item => item.id === itemId);
    if (!item) {
      utils.showToast('Блюдо не найдено', 'error');
      return;
    }

    if (!item.available) {
      utils.showToast('Блюдо временно недоступно', 'warning');
      return;
    }

    cart.addItem(item);
    utils.showToast(`${item.name} добавлено в корзину`, 'success');
  }

  // Показать детали блюда
  async showItemDetails(itemId) {
    const item = this.menu.find(item => item.id === itemId);
    if (!item) return;

    this.renderItemDetails(item);
    this.itemModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  // Скрыть детали блюда
  hideItemDetails() {
    this.itemModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Отрендерить детали блюда
  renderItemDetails(item) {
    const image = item.image ? 
      `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">` :
      `<div style="width: 100%; height: 200px; background: var(--tg-theme-secondary-bg-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 64px;">${CONFIG.CATEGORY_IMAGES[item.category.toLowerCase()] || '🍽️'}</div>`;

    const ingredients = item.ingredients && item.ingredients.length > 0 ?
      `<div class="ingredients">
        <h4>Состав:</h4>
        <p>${item.ingredients.join(', ')}</p>
      </div>` : '';

    const nutritionInfo = (item.weight || item.calories) ?
      `<div class="nutrition-info">
        ${item.weight ? `<span>Вес: ${item.weight}</span>` : ''}
        ${item.calories ? `<span>Калории: ${item.calories} ккал</span>` : ''}
      </div>` : '';

    this.itemDetails.innerHTML = `
      ${image}
      <div style="padding: 16px 0;">
        <h3 style="margin-bottom: 8px; font-size: 20px;">${this.escapeHtml(item.name)}</h3>
        <p style="color: var(--tg-theme-hint-color); margin-bottom: 16px; line-height: 1.5;">
          ${this.escapeHtml(item.description)}
        </p>
        ${ingredients}
        ${nutritionInfo}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
          <div style="font-size: 24px; font-weight: 700; color: var(--primary-color);">
            ${utils.formatPrice(item.price)}
          </div>
          <button class="add-to-cart" data-item-id="${item.id}" 
                  style="padding: 12px 24px; font-size: 16px;" 
                  ${!item.available ? 'disabled' : ''}>
            ${item.available ? 'В корзину' : 'Недоступно'}
          </button>
        </div>
      </div>
    `;

    // Привязать обработчик для кнопки добавления в корзину
    const addButton = this.itemDetails.querySelector('.add-to-cart');
    if (addButton) {
      addButton.addEventListener('click', () => {
        this.addToCart(item.id);
        this.hideItemDetails();
      });
    }
  }

  // Показать загрузку
  showLoading() {
    if (!this.menuGrid) return;
    
    this.menuGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px;">
        <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
        <p>Загружаем меню...</p>
      </div>
    `;
  }

  // Скрыть загрузку
  hideLoading() {
    // Загрузка скрывается автоматически при рендере меню
  }

  // Показать ошибку
  showError() {
    if (!this.menuGrid) return;
    
    this.menuGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px;">
        <div style="font-size: 64px; margin-bottom: 16px;">😕</div>
        <h3>Ошибка загрузки</h3>
        <p style="color: var(--tg-theme-hint-color); margin-bottom: 24px;">
          Не удалось загрузить меню
        </p>
        <button onclick="menuManager.loadMenu()" 
                style="background: var(--primary-color); color: white; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer;">
          Попробовать снова
        </button>
      </div>
    `;
  }

  // Обновить меню
  async refreshMenu() {
    api.clearCache();
    await this.loadMenu();
  }

  // Поиск блюд
  searchItems(query) {
    if (!query.trim()) {
      this.renderMenu();
      return;
    }

    const searchResults = this.menu.filter(item => {
      if (!item.available) return false;
      
      const searchText = `${item.name} ${item.description} ${item.ingredients?.join(' ') || ''}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    if (searchResults.length === 0) {
      this.menuGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px;">
          <div style="font-size: 64px; margin-bottom: 16px;">🔍</div>
          <h3>Ничего не найдено</h3>
          <p style="color: var(--tg-theme-hint-color);">
            Попробуйте изменить запрос
          </p>
        </div>
      `;
    } else {
      const menuHTML = searchResults.map(item => this.getMenuItemHTML(item)).join('');
      this.menuGrid.innerHTML = menuHTML;
    }
  }

  // Утилиты
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Создать глобальный экземпляр
const menuManager = new MenuManager();