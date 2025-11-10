// cart.js
// Модуль корзины покупок
class ProductCart {
    constructor() {
        this.items = [];
        this.loadFromStorage();
    }
    
    /**
     * Добавляет товар в корзину
     * @param {Object} product - Объект товара
     * @returns {boolean} - Результат операции
     */
    addProduct(product) {
        if (!this.validateProduct(product)) {
            return false;
        }
        
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveToStorage();
        this.updateCartUI();
        return true;
    }
    
    /**
     * Удаляет товар из корзины
     * @param {number} productId - ID товара
     * @returns {boolean} - Результат операции
     */
    removeProduct(productId) {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== productId);
        
        if (this.items.length !== initialLength) {
            this.saveToStorage();
            this.updateCartUI();
            return true;
        }
        
        return false;
    }
    
    /**
     * Изменяет количество товара в корзине
     * @param {number} productId - ID товара
     * @param {number} quantity - Новое количество
     * @returns {boolean} - Результат операции
     */
    updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            return this.removeProduct(productId);
        }
        
        const item = this.items.find(item => item.id === productId);
        
        if (item) {
            item.quantity = quantity;
            this.saveToStorage();
            this.updateCartUI();
            return true;
        }
        
        return false;
    }
    
    /**
     * Очищает корзину
     */
    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateCartUI();
    }
    
    /**
     * Рассчитывает общую сумму
     * @returns {number} - Общая сумма
     */
    calculateTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    
    /**
     * Получает количество товаров в корзине
     * @returns {number} - Количество товаров
     */
    getItemCount() {
        return this.items.reduce((count, item) => {
            return count + item.quantity;
        }, 0);
    }
    
    /**
     * Валидирует товар перед добавлением в корзину
     * @param {Object} product - Объект товара
     * @returns {boolean} - Результат валидации
     */
    validateProduct(product) {
        return product && 
               product.id && 
               product.name && 
               product.price > 0;
    }
    
    /**
     * Сохраняет корзину в localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('techstore_cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Ошибка сохранения корзины:', error);
        }
    }
    
    /**
     * Загружает корзину из localStorage
     */
    loadFromStorage() {
        try {
            const storedCart = localStorage.getItem('techstore_cart');
            if (storedCart) {
                this.items = JSON.parse(storedCart);
            }
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            this.items = [];
        }
    }
    
    /**
     * Обновляет UI корзины
     */
    updateCartUI() {
        // Обновляем счетчик товаров
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this.getItemCount();
        }
        
        // Обновляем содержимое корзины в модальном окне
        this.renderCartItems();
        
        // Обновляем общую сумму
        const totalPrice = document.getElementById('total-price');
        if (totalPrice) {
            totalPrice.textContent = formatPrice(this.calculateTotal());
        }
    }
    
    /**
     * Рендерит товары в корзине
     */
    renderCartItems() {
        const cartItems = document.getElementById('cart-items');
        const cartEmpty = document.getElementById('cart-empty');
        
        if (!cartItems || !cartEmpty) return;
        
        if (this.items.length === 0) {
            cartEmpty.style.display = 'block';
            cartItems.style.display = 'none';
            return;
        }
        
        cartEmpty.style.display = 'none';
        cartItems.style.display = 'block';
        
        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item__image">
                <div class="cart-item__details">
                    <h4 class="cart-item__title">${item.name}</h4>
                    <div class="cart-item__price">${formatPrice(item.price)} руб.</div>
                </div>
                <div class="cart-item__actions">
                    <div class="cart-item__quantity">
                        <button class="quantity-button decrease-quantity" data-product-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-button increase-quantity" data-product-id="${item.id}">+</button>
                    </div>
                    <button class="cart-item__remove" data-product-id="${item.id}">🗑️</button>
                </div>
            </div>
        `).join('');
        
        // Добавляем обработчики событий для кнопок в корзине
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-product-id'));
                const item = cart.items.find(item => item.id === productId);
                if (item) {
                    cart.updateQuantity(productId, item.quantity - 1);
                }
            });
        });
        
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-product-id'));
                const item = cart.items.find(item => item.id === productId);
                if (item) {
                    cart.updateQuantity(productId, item.quantity + 1);
                }
            });
        });
        
        document.querySelectorAll('.cart-item__remove').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-product-id'));
                cart.removeProduct(productId);
            });
        });
    }
}

// Инициализация корзины
const cart = new ProductCart();

// Инициализация функционала корзины
function initCart() {
    // Открытие/закрытие модального окна корзины
    const cartToggle = document.getElementById('cart-toggle');
    const cartModal = document.getElementById('cart-modal');
    const cartClose = document.getElementById('cart-close');
    
    if (cartToggle && cartModal && cartClose) {
        cartToggle.addEventListener('click', () => {
            cartModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        cartClose.addEventListener('click', () => {
            cartModal.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal || e.target.classList.contains('modal__overlay')) {
                cartModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Обработка оформления заказа
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (cart.items.length === 0) {
                alert('Корзина пуста. Добавьте товары перед оформлением заказа.');
                return;
            }
            
            // В реальном приложении здесь был бы переход к оформлению заказа
            alert('Заказ успешно оформлен! Спасибо за покупку.');
            cart.clear();
            cartModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Обновляем UI корзины при загрузке
    cart.updateCartUI();
}

// Добавление товара в корзину
function addToCart(productId) {
    const product = productManager.getProductById(productId);
    
    if (product) {
        const success = cart.addProduct(product);
        
        if (success) {
            // В реальном приложении здесь можно показать toast-уведомление
            console.log(`Товар "${product.name}" добавлен в корзину`);
        } else {
            showErrorMessage('Не удалось добавить товар в корзину');
        }
    } else {
        showErrorMessage('Товар не найден');
    }
}