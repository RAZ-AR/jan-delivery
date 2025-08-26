// JAN Delivery - Configuration
// Resolve API base URL (local → meta override → default)
const __API_BASE_FROM_META__ = (function () {
  try {
    const tag = document.querySelector('meta[name="jan-api-base"]');
    return tag && tag.content ? tag.content.trim() : '';
  } catch (_) { return ''; }
})();

const CONFIG = {
  // API endpoints
  API_BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : (__API_BASE_FROM_META__ || 'https://jan-delivery.onrender.com'),
  
  // Endpoints
  ENDPOINTS: {
    MENU: '/api/menu',
    ORDERS: '/api/orders',
    USERS: '/api/users',
    HEALTH: '/health',
    CREATE_ORDER: '/api/create-order',
    GEOCODE: '/api/geocode',
    CHECK_ZONE: '/api/check-delivery-zone',
    WAITLIST: '/api/waitlist'
  },

  // App settings
  CURRENCY: 'RSD',
  MIN_ORDER_RSD: 3000, // Минимальный заказ, иначе + DELIVERY_COST_BELOW_MIN
  DELIVERY_COST_BELOW_MIN: 400, // Доставка при сумме ниже MIN_ORDER_RSD
  
  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 минут

  // Default images for categories
  CATEGORY_IMAGES: {
    'пицца': '🍕',
    'бургеры': '🍔',
    'салаты': '🥗',
    'напитки': '🥤',
    'десерты': '🍰',
    'закуски': '🍟',
    'суши': '🍣',
    'паста': '🍝',
    'супы': '🍲'
  },

  // Order statuses
  ORDER_STATUSES: {
    'pending': 'Ожидает подтверждения',
    'confirmed': 'Подтвержден',
    'cooking': 'Готовится',
    'ready': 'Готов к доставке',
    'delivering': 'В пути',
    'delivered': 'Доставлен',
    'cancelled': 'Отменен'
  },

  // Phone number validation (международный формат)
  PHONE_REGEX: /^(\+\d{1,4})?\d{7,14}$/,

  // Development mode
  DEBUG: window.location.hostname === 'localhost'
};

// Helper functions
const utils = {
  // Format price in RSD
  formatPrice: (price) => {
    const num = Number(price) || 0;
    return new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(num) + ' RSD';
  },

  // Format phone number
  formatPhone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('8')) {
      return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('7')) {
      return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
    }
    return phone;
  },

  // Validate phone number
  validatePhone: (phone) => {
    return CONFIG.PHONE_REGEX.test(phone);
  },

  // Generate unique ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Show toast notification
  showToast: (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const styles = {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '12px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      fontSize: '14px',
      zIndex: '10000',
      opacity: '0',
      transition: 'opacity 0.3s ease'
    };

    const bgColors = {
      info: '#3390ec',
      success: '#48bb78',
      warning: '#ed8936',
      error: '#f56565'
    };

    Object.assign(toast.style, styles);
    toast.style.backgroundColor = bgColors[type] || bgColors.info;

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  },

  // Log function
  log: (...args) => {
    if (CONFIG.DEBUG) {
      console.log('[JAN Delivery]', ...args);
    }
  },

  // Error log function
  logError: (...args) => {
    console.error('[JAN Delivery ERROR]', ...args);
  }
};
// Force rebuild delivery zones Tue Aug 26 21:15:00 CEST 2025
