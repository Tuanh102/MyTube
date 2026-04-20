// ========== MODAL LOGIN ==========
function requireLogin() {
    const modal = document.getElementById('modal-login');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Đóng modal khi click ra ngoài box
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal-login');

    if (modal) {
        modal.addEventListener('click', function (e) {
            // chỉ đóng khi click vào nền (overlay), không phải box
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});

// Thêm hàm này vào watch.js
function openHeaderLogin() {
    // 1. Đóng modal hiện tại
    const modalLogin = document.getElementById('modal-login');
    if (modalLogin) modalLogin.style.display = 'none';

    // 2. Mở popup auth trên header
    const authPopup = document.getElementById('auth-popup');
    if (authPopup) {
        authPopup.classList.add('show');
        // Đảm bảo tab đăng nhập được hiển thị (dùng hàm window.toggleAuth bạn đã viết trong header.js)
        if (typeof window.toggleAuth === 'function') {
            window.toggleAuth('login');
        }
    }
}