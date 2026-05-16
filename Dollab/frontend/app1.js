// app.js
const API_URL = "https://localhost:7145"; // Замените на ваш реальный API URL

// Функция для переключения видимости пароля
function togglePasswordVisibility() {
    const passwordWrapper = document.getElementById('passwordWrapper');
    const passwordInput = document.getElementById('login-password');
    const toggleButton = document.getElementById('togglePassword');
    
    if (!passwordWrapper || !passwordInput || !toggleButton) {
        console.error('Элементы для переключения пароля не найдены');
        return;
    }
    
    if (passwordWrapper.classList.contains('show-password')) {
        // Скрываем пароль
        passwordInput.type = 'password';
        passwordWrapper.classList.remove('show-password');
        toggleButton.setAttribute('aria-label', 'Показать пароль');
    } else {
        // Показываем пароль
        passwordInput.type = 'text';
        passwordWrapper.classList.add('show-password');
        toggleButton.setAttribute('aria-label', 'Скрыть пароль');
    }
}

// Функция для инициализации обработчиков событий
function initEventListeners() {
    const toggleButton = document.getElementById('togglePassword');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    
    if (toggleButton) {
        // Обработчик клика на иконку
        toggleButton.addEventListener('click', togglePasswordVisibility);
        
        // Обработчик нажатия Enter/Space на иконке
        toggleButton.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                togglePasswordVisibility();
            }
        });
    }
    
    // Обработчики клавиши Enter для полей ввода
    if (usernameInput) {
        usernameInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (window.login) {
                    window.login();
                }
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (window.login) {
                    window.login();
                }
            }
        });
    }
}

async function login() {
  const login = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ login, password })
  });

  if (!response.ok) {
    alert("Ошибка входа");
    return;
  }

  const data = await response.json();

localStorage.setItem("token", data.token);
localStorage.setItem("userId", data.userId);
localStorage.setItem("username", data.username);
localStorage.setItem("role", data.role);

  window.location.href = "newmainpage1.html";
}

async function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        email,
        password
      })
    });

    const text = await response.text();

    if (!response.ok) {
      alert("Error: " + text);
      return;
    }

    alert("Registration successful!");
  } catch (error) {
    console.error(error);
    alert("Server error");
  }
}

// Функция для восстановления пароля
function forgotPassword() {
    const email = prompt('Введите ваш email для восстановления пароля:');
    if (email) {
        alert(`Инструкция по восстановлению пароля отправлена на email: ${email}\n(Это демонстрация, в реальном приложении была бы отправка email)`);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();
});

// Экспортируем функции для использования в HTML
window.login = login;
window.signup = signup;
window.forgotPassword = forgotPassword;
window.togglePasswordVisibility = togglePasswordVisibility;