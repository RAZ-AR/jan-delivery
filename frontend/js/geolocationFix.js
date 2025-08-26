// JAN Delivery - Enhanced Geolocation Fix
// This fixes the getCurrentLocation method in CartManager to use reverse geocoding

// Wait for cart to be initialized then override the method
document.addEventListener('DOMContentLoaded', () => {
  if (typeof cart !== 'undefined' && cart.getCurrentLocation) {
    // Store original method
    const originalGetCurrentLocation = cart.getCurrentLocation.bind(cart);
    
    // Override with enhanced version
    cart.getCurrentLocation = async function() {
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
            
            // Получить адрес по координатам через обратное геокодирование
            const addressDetails = await api.reverseGeocode(latitude, longitude);
            
            if (addressDetails && addressDetails.formatted_address) {
              // Установить адрес в поле
              if (this.addressAutocomplete) {
                this.addressAutocomplete.setValue(addressDetails.formatted_address, {
                  coordinates: { latitude, longitude },
                  ...addressDetails
                });
              } else if (this.addressInput) {
                this.addressInput.value = addressDetails.formatted_address;
              }
              
              // Сохранить выбранный адрес
              this.selectedAddress = {
                text: addressDetails.formatted_address,
                coordinates: { latitude, longitude },
                ...addressDetails
              };
              
              // Проверить зону доставки
              this.checkDeliveryZone(this.selectedAddress);
              
              utils.showToast('Адрес определен', 'success');
            } else {
              // Fallback - показать координаты
              const coordsText = `Координаты: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              if (this.addressAutocomplete) {
                this.addressAutocomplete.setValue(coordsText);
              } else if (this.addressInput) {
                this.addressInput.value = coordsText;
              }
              utils.showToast('Местоположение получено', 'success');
            }
            
          } catch (error) {
            utils.logError('Ошибка обработки местоположения:', error);
            utils.showToast('Ошибка получения адреса', 'error');
          } finally {
            // Сбросить кнопку
            this.getLocationBtn.disabled = false;
            this.getLocationBtn.textContent = '📍 Определить местоположение';
          }
        },
        (error) => {
          utils.logError('Ошибка геолокации:', error);
          let errorMessage = 'Не удалось получить местоположение';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Доступ к местоположению запрещен';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Местоположение недоступно';
              break;
            case error.TIMEOUT:
              errorMessage = 'Превышено время ожидания';
              break;
          }
          
          utils.showToast(errorMessage, 'error');
          
          // Сбросить кнопку
          this.getLocationBtn.disabled = false;
          this.getLocationBtn.textContent = '📍 Определить местоположение';
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        }
      );
    };
  }
});