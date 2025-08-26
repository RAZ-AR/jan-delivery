// JAN Delivery - Address Autocomplete
class AddressAutocomplete {
  constructor(inputElement, options = {}) {
    this.input = inputElement;
    this.container = null;
    this.suggestions = null;
    this.loadingIndicator = null;
    this.searchTimeout = null;
    this.selectedSuggestion = null;
    
    // Опции
    this.options = {
      minLength: 2,
      delay: 300,
      maxSuggestions: 5,
      placeholder: 'Начните вводить адрес...',
      onSelect: null,
      onError: null,
      showCoordinates: false,
      ...options
    };

    this.init();
  }

  init() {
    this.setupContainer();
    this.setupEventListeners();
    this.input.placeholder = this.options.placeholder;
  }

  setupContainer() {
    // Обернуть input в контейнер если еще не обернут
    if (!this.input.parentElement.classList.contains('address-input-container')) {
      const container = document.createElement('div');
      container.className = 'address-input-container';
      
      this.input.parentNode.insertBefore(container, this.input);
      container.appendChild(this.input);
    }
    
    this.container = this.input.parentElement;
    
    // Создать контейнер для предложений
    this.suggestions = document.createElement('div');
    this.suggestions.className = 'address-suggestions';
    this.suggestions.style.display = 'none';
    this.container.appendChild(this.suggestions);
    
    // Создать индикатор загрузки
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'address-input-loading';
    this.loadingIndicator.style.display = 'none';
    this.container.appendChild(this.loadingIndicator);
  }

  setupEventListeners() {
    // Ввод текста
    this.input.addEventListener('input', (e) => {
      this.handleInput(e.target.value);
    });

    // Фокус - показать предложения если есть
    this.input.addEventListener('focus', () => {
      if (this.suggestions.children.length > 0) {
        this.showSuggestions();
      }
    });

    // Потеря фокуса - скрыть предложения с задержкой
    this.input.addEventListener('blur', () => {
      setTimeout(() => this.hideSuggestions(), 150);
    });

    // Клавиши навигации
    this.input.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });

    // Клик вне элемента
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.hideSuggestions();
      }
    });
  }

  handleInput(value) {
    clearTimeout(this.searchTimeout);

    if (!value || value.length < this.options.minLength) {
      this.hideSuggestions();
      return;
    }

    this.showLoading();
    
    this.searchTimeout = setTimeout(async () => {
      try {
        const results = await api.searchAddresses(value, this.options.maxSuggestions);
        this.showSuggestions(results);
      } catch (error) {
        utils.logError('Ошибка автокомплита:', error);
        if (this.options.onError) {
          this.options.onError(error);
        }
      } finally {
        this.hideLoading();
      }
    }, this.options.delay);
  }

  handleKeydown(e) {
    const items = this.suggestions.querySelectorAll('.suggestion-item');
    const selectedIndex = Array.from(items).findIndex(item => 
      item.classList.contains('selected')
    );

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectSuggestion(Math.min(selectedIndex + 1, items.length - 1));
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.selectSuggestion(Math.max(selectedIndex - 1, 0));
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          this.applySuggestion(items[selectedIndex].dataset.index);
        }
        break;
        
      case 'Escape':
        this.hideSuggestions();
        this.input.blur();
        break;
    }
  }

  selectSuggestion(index) {
    const items = this.suggestions.querySelectorAll('.suggestion-item');
    
    // Удалить предыдущий выбор
    items.forEach(item => item.classList.remove('selected'));
    
    // Выбрать новый элемент
    if (items[index]) {
      items[index].classList.add('selected');
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }

  showSuggestions(results = null) {
    if (results) {
      this.renderSuggestions(results);
    }
    
    if (this.suggestions.children.length > 0) {
      this.suggestions.style.display = 'block';
    }
  }

  hideSuggestions() {
    this.suggestions.style.display = 'none';
  }

  showLoading() {
    this.loadingIndicator.style.display = 'block';
  }

  hideLoading() {
    this.loadingIndicator.style.display = 'none';
  }

  renderSuggestions(results) {
    this.suggestions.innerHTML = '';

    if (!results || results.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'suggestion-item';
      noResults.innerHTML = `
        <div class="suggestion-main">Адрес не найден</div>
        <div class="suggestion-secondary">Попробуйте изменить запрос</div>
      `;
      this.suggestions.appendChild(noResults);
      return;
    }

    results.forEach((result, index) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.dataset.index = index;
      
      const mainText = result.text || result.address || 'Неизвестный адрес';
      const secondaryText = this.buildSecondaryText(result);
      
      item.innerHTML = `
        <div class="suggestion-main">${this.escapeHtml(mainText)}</div>
        <div class="suggestion-secondary">${this.escapeHtml(secondaryText)}</div>
      `;

      // Клик по предложению
      item.addEventListener('click', () => {
        this.applySuggestion(index);
      });

      // Hover эффект
      item.addEventListener('mouseenter', () => {
        this.selectSuggestion(index);
      });

      this.suggestions.appendChild(item);
    });

    // Сохранить результаты для последующего использования
    this.lastResults = results;
  }

  buildSecondaryText(result) {
    const parts = [];
    
    if (result.street && result.street !== result.address) {
      parts.push(result.street);
    }
    
    if (result.locality) {
      parts.push(result.locality);
    }
    
    if (result.region && result.region !== result.locality) {
      parts.push(result.region);
    }

    if (this.options.showCoordinates && result.coordinates) {
      parts.push(`${result.coordinates.latitude.toFixed(4)}, ${result.coordinates.longitude.toFixed(4)}`);
    }

    return parts.join(', ') || 'Адрес';
  }

  applySuggestion(index) {
    if (!this.lastResults || !this.lastResults[index]) {
      return;
    }

    const suggestion = this.lastResults[index];
    this.selectedSuggestion = suggestion;
    
    // Заполнить поле ввода
    this.input.value = suggestion.text || suggestion.address || '';
    
    // Скрыть предложения
    this.hideSuggestions();
    
    // Вызвать callback
    if (this.options.onSelect) {
      this.options.onSelect(suggestion);
    }

    // Haptic feedback
    if (typeof Telegram !== 'undefined' && Telegram.WebApp.HapticFeedback) {
      Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Получить выбранное предложение
  getSelectedSuggestion() {
    return this.selectedSuggestion;
  }

  // Очистить поле и выбор
  clear() {
    this.input.value = '';
    this.selectedSuggestion = null;
    this.hideSuggestions();
  }

  // Установить значение программно
  setValue(address, suggestion = null) {
    this.input.value = address;
    this.selectedSuggestion = suggestion;
    this.hideSuggestions();
  }

  // Уничтожить автокомплит
  destroy() {
    clearTimeout(this.searchTimeout);
    
    if (this.suggestions) {
      this.suggestions.remove();
    }
    
    if (this.loadingIndicator) {
      this.loadingIndicator.remove();
    }
    
    // Убрать контейнер если он был создан
    if (this.container && this.container.classList.contains('address-input-container')) {
      const parent = this.container.parentNode;
      parent.insertBefore(this.input, this.container);
      this.container.remove();
    }
  }
}

// Глобальная функция для инициализации автокомплита
window.initAddressAutocomplete = function(selector, options) {
  const elements = document.querySelectorAll(selector);
  const instances = [];
  
  elements.forEach(element => {
    instances.push(new AddressAutocomplete(element, options));
  });
  
  return instances.length === 1 ? instances[0] : instances;
};