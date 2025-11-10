// validation.js
// Модуль валидации форм
class FormValidator {
    constructor() {
        this.patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/,
            name: /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/,
            password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
        };
        
        this.messages = {
            required: 'Это поле обязательно для заполнения',
            email: 'Введите корректный email адрес',
            phone: 'Введите телефон в формате +7 (XXX) XXX-XX-XX',
            name: 'Имя может содержать только буквы и дефисы',
            password: 'Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы и цифры',
            minLength: (min) => `Минимальная длина: ${min} символов`,
            maxLength: (max) => `Максимальная длина: ${max} символов`
        };
    }
    
    /**
     * Валидирует поле формы
     * @param {HTMLInputElement} field - Поле для валидации
     * @param {Object} rules - Правила валидации
     * @returns {string|null} - Сообщение об ошибке или null
     */
    validateField(field, rules) {
        const value = field.value.trim();
        
        // Проверка на обязательность заполнения
        if (rules.required && !value) {
            return this.messages.required;
        }
        
        // Если поле не обязательно и пустое, пропускаем дальнейшую валидацию
        if (!value) {
            return null;
        }
        
        // Проверка минимальной длины
        if (rules.minLength && value.length < rules.minLength) {
            return this.messages.minLength(rules.minLength);
        }
        
        // Проверка максимальной длины
        if (rules.maxLength && value.length > rules.maxLength) {
            return this.messages.maxLength(rules.maxLength);
        }
        
        // Проверка по паттерну
        if (rules.pattern && !this.patterns[rules.pattern].test(value)) {
            return this.messages[rules.pattern];
        }
        
        // Кастомная валидация
        if (rules.custom && !rules.custom(value)) {
            return rules.customMessage || 'Неверное значение';
        }
        
        return null;
    }
    
    /**
     * Валидирует всю форму
     * @param {HTMLFormElement} form - Форма для валидации
     * @param {Object} fieldsRules - Правила для полей формы
     * @returns {boolean} - Результат валидации
     */
    validateForm(form, fieldsRules) {
        let isValid = true;
        const errors = {};
        
        for (const [fieldName, rules] of Object.entries(fieldsRules)) {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const error = this.validateField(field, rules);
                if (error) {
                    isValid = false;
                    errors[fieldName] = error;
                    this.showFieldError(field, error);
                } else {
                    this.clearFieldError(field);
                }
            }
        }
        
        return isValid;
    }
    
    /**
     * Показывает ошибку для поля
     * @param {HTMLInputElement} field - Поле с ошибкой
     * @param {string} message - Сообщение об ошибке
     */
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        
        field.parentNode.appendChild(errorElement);
    }
    
    /**
     * Убирает ошибку с поля
     * @param {HTMLInputElement} field - Поле для очистки
     */
    clearFieldError(field) {
        field.classList.remove('error');
        
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }
    
    /**
     * Инициализирует валидацию формы
     * @param {string} formSelector - Селектор формы
     * @param {Object} fieldsRules - Правила для полей
     * @param {Function} onSubmit - Колбэк при успешной отправке
     */
    initFormValidation(formSelector, fieldsRules, onSubmit) {
        const form = document.querySelector(formSelector);
        if (!form) return;
        
        const validator = this;
        
        // Валидация при изменении полей
        Object.keys(fieldsRules).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.addEventListener('blur', function() {
                    const error = validator.validateField(this, fieldsRules[fieldName]);
                    if (error) {
                        validator.showFieldError(this, error);
                    } else {
                        validator.clearFieldError(this);
                    }
                });
                
                field.addEventListener('input', function() {
                    validator.clearFieldError(this);
                });
            }
        });
        
        // Валидация при отправке формы
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const isValid = validator.validateForm(this, fieldsRules);
            
            if (isValid) {
                if (onSubmit) {
                    onSubmit(this);
                } else {
                    this.submit();
                }
            } else {
                // Фокусировка на первом поле с ошибкой
                const firstErrorField = this.querySelector('.error');
                if (firstErrorField) {
                    firstErrorField.focus();
                }
            }
        });
    }
}

// Пример использования валидации для формы регистрации
document.addEventListener('DOMContentLoaded', function() {
    const validator = new FormValidator();
    
    // Правила для формы регистрации
    const registrationRules = {
        name: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: 'name'
        },
        email: {
            required: true,
            pattern: 'email'
        },
        phone: {
            required: true,
            pattern: 'phone'
        },
        password: {
            required: true,
            pattern: 'password'
        }
    };
    
    // Инициализация валидации формы (если форма существует на странице)
    validator.initFormValidation('#registration-form', registrationRules, function(form) {
        // Обработка успешной отправки формы
        const formData = new FormData(form);
        console.log('Форма отправлена:', Object.fromEntries(formData));
        
        // В реальном приложении здесь был бы AJAX-запрос
        alert('Регистрация успешно завершена!');
        form.reset();
    });
});

// Добавляем стили для ошибок валидации
const style = document.createElement('style');
style.textContent = `
    .error {
        border-color: #dc3545 !important;
    }
    
    .error-message {
        color: #dc3545;
        font-size: 14px;
        margin-top: 5px;
    }
    
    .error:focus {
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }
`;
document.head.appendChild(style);