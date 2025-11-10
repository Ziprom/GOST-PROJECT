// main.js
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация приложения
    initApp();
});

function initApp() {
    // Загрузка товаров
    loadProducts();
    
    // Инициализация фильтрации
    initFilter();
    
    // Инициализация поиска
    initSearch();
    
    // Инициализация корзины
    initCart();
}

// Модуль работы с товарами
class ProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
    }

    /**
     * Загружает товары из "API" (в данном случае из локального массива)
     * @returns {Promise} - Промис с массивом товаров
     */
    async loadProducts() {
        // В реальном приложении здесь был бы запрос к API
        return new Promise((resolve) => {
            setTimeout(() => {
                this.products = [
                    {
                        id: 1,
                        name: 'iPhone 14 Pro',
                        description: 'Новейший смартфон от Apple с улучшенной камерой',
                        price: 99990,
                        category: 'smartphones',
                        image: 'images/iphnoe14.png'
                    },
                    {
                        id: 2,
                        name: 'Samsung Galaxy S23',
                        description: 'Флагманский смартфон от Samsung с мощным процессором',
                        price: 79990,
                        category: 'smartphones',
                        image: 'images/samsunhgs23.png'
                    },
                    {
                        id: 3,
                        name: 'MacBook Air M2',
                        description: 'Легкий и мощный ноутбук от Apple',
                        price: 129990,
                        category: 'laptops',
                        image: 'images/macbookarim2.png'
                    },
                    {
                        id: 4,
                        name: 'Dell XPS 13',
                        description: 'Компактный ноутбук с безрамочным дисплеем',
                        price: 89990,
                        category: 'laptops',
                        image: 'images/dellXPS13.png'
                    },
                    {
                        id: 5,
                        name: 'iPad Pro',
                        description: 'Мощный планшет для работы и творчества',
                        price: 74990,
                        category: 'tablets',
                        image: 'images/Ipadpro.png'
                    },
                    {
                        id: 6,
                        name: 'Samsung Galaxy Tab S8',
                        description: 'Планшет с S-Pen для заметок и рисования',
                        price: 54990,
                        category: 'tablets',
                        image: 'images/samsunggalaxy.png'
                    },
                    {
                        id: 7,
                        name: 'AirPods Pro',
                        description: 'Беспроводные наушники с шумоподавлением',
                        price: 24990,
                        category: 'accessories',
                        image: 'images/airposd.png'
                    },
                    {
                        id: 8,
                        name: 'Apple Watch Series 8',
                        description: 'Умные часы с функциями для здоровья',
                        price: 39990,
                        category: 'accessories',
                        image: 'images/apllewatch.png'
                    }
                ];
                this.filteredProducts = [...this.products];
                resolve(this.products);
            }, 500); // Имитация задержки сети
        });
    }

    /**
     * Фильтрует товары по категории
     * @param {string} category - Категория для фильтрации
     * @returns {Array} - Отфильтрованный массив товаров
     */
    filterByCategory(category) {
        if (category === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.category === category
            );
        }
        return this.filteredProducts;
    }

    /**
     * Ищет товары по запросу
     * @param {string} query - Поисковый запрос
     * @returns {Array} - Массив найденных товаров
     */
    searchProducts(query) {
        if (!query.trim()) {
            this.filteredProducts = [...this.products];
            return this.filteredProducts;
        }
        
        const lowerCaseQuery = query.toLowerCase();
        this.filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(lowerCaseQuery) ||
            product.description.toLowerCase().includes(lowerCaseQuery)
        );
        
        return this.filteredProducts;
    }

    /**
     * Получает товар по ID
     * @param {number} id - ID товара
     * @returns {Object|null} - Объект товара или null
     */
    getProductById(id) {
        return this.products.find(product => product.id === id) || null;
    }
}

// Инициализация менеджера товаров
const productManager = new ProductManager();

// Загрузка и отображение товаров
async function loadProducts() {
    try {
        await productManager.loadProducts();
        renderProducts(productManager.filteredProducts);
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        showErrorMessage('Не удалось загрузить товары. Пожалуйста, попробуйте позже.');
    }
}

// Рендеринг товаров
function renderProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="no-products">Товары не найдены</p>';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            <img src="${product.image}" alt="${product.name}" class="product-card__image">
            <div class="product-card__content">
                <h3 class="product-card__title">${product.name}</h3>
                <p class="product-card__description">${product.description}</p>
                <div class="product-card__price">${formatPrice(product.price)} руб.</div>
                <div class="product-card__actions">
                    <button class="button button--primary add-to-cart" data-product-id="${product.id}">
                        В корзину
                    </button>
                    <button class="button button--secondary view-details" data-product-id="${product.id}">
                        Подробнее
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Добавляем обработчики событий для кнопок
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            addToCart(productId);
        });
    });
}

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price);
}

// Инициализация фильтрации
function initFilter() {
    const filterButtons = document.querySelectorAll('.filter-button');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Фильтруем товары
            const category = this.getAttribute('data-category');
            const filteredProducts = productManager.filterByCategory(category);
            renderProducts(filteredProducts);
        });
    });
}

// Инициализация поиска
function initSearch() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.getElementById('search-input');
    
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            const foundProducts = productManager.searchProducts(query);
            renderProducts(foundProducts);
        });
        
        // Поиск при вводе (с задержкой)
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = this.value.trim();
                const foundProducts = productManager.searchProducts(query);
                renderProducts(foundProducts);
            }, 300);
        });
    }
}

// Показ сообщений об ошибках
function showErrorMessage(message) {
    // В реальном приложении здесь можно использовать toast-уведомления
    alert(message);
}