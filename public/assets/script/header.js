document.addEventListener('DOMContentLoaded', () => {

    // ===== SIDEBAR =====
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const header = document.querySelector('header');

    if (menuBtn && sidebar && header) {
        // 1. Khi bấm vào nút Menu
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài document
            sidebar.classList.toggle('show');
            header.classList.toggle('semi-transparent');
        });

        // 2. Khi bấm vào bên trong Sidebar thì không bị đóng
        sidebar.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // 3. Khi bấm bất kỳ đâu ngoài Sidebar và MenuBtn
        document.addEventListener('click', () => {
            if (sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                header.classList.remove('semi-transparent');
            }
        });
    }

    // ===== POPUP USER =====
    const userBtn = document.getElementById('user-btn');
    const authPopup = document.getElementById('auth-popup');

    if (userBtn && authPopup) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            authPopup.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!authPopup.contains(e.target) && !userBtn.contains(e.target)) {
                authPopup.classList.remove('show');
            }
        });
    }

    // ===== AUTH (LOGIN / REGISTER) =====

    // Hàm chuyển tab
    window.toggleAuth = function(type) {
        const loginSec = document.getElementById('login-section');
        const registerSec = document.getElementById('register-section');

        if (!loginSec || !registerSec) return;

        if (type === 'register') {
            loginSec.style.display = 'none';
            registerSec.style.display = 'block';
        } else {
            loginSec.style.display = 'block';
            registerSec.style.display = 'none';
        }
    };

    // LOGIN
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = new URLSearchParams(new FormData(loginForm));
            const res = await fetch('/auth/login-local', {
                method: 'POST',
                body: data
            });

            const result = await res.json();

            if (result.success) {
                window.location.reload();
            } else {
                alert(result.message);
            }
        });
    }

    // REGISTER
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = new URLSearchParams(new FormData(registerForm));
            const res = await fetch('/auth/register-local', {
                method: 'POST',
                body: data
            });

            const result = await res.json();

            if (result.success) {
                alert('Đăng ký thành công! Hãy đăng nhập.');
                window.toggleAuth('login');
            } else {
                alert(result.message);
            }
        });
    }
});