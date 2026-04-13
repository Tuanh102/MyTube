// main.js - JS xử lý Banner và Sidebar
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Xử lý đổi ảnh Banner sau 3 giây ---
    const bannerContainer = document.getElementById('hero-banner-container');
    const images = bannerContainer.querySelectorAll('.hero-image');
    let currentIndex = 0;

    function changeBanner() {
        // Ẩn ảnh hiện tại
        images[currentIndex].classList.remove('active');

        // Tính toán index ảnh tiếp theo
        currentIndex = (currentIndex + 1) % images.length;

        // Hiện ảnh tiếp theo
        images[currentIndex].classList.add('active');
    }

    // Tự động gọi hàm changeBanner mỗi 3000ms (3 giây)
    setInterval(changeBanner, 5000);



    // --- 2. Xử lý ẩn hiện Sidebar (Toggle) và Header trong suốt ---
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const header = document.querySelector('header');

    menuBtn.addEventListener('click', () => {
        // Tắt Sidebar mờ đi và chuyển sang Header mờ hơn để dễ đọc
        sidebar.classList.toggle('hide');
        mainContent.classList.toggle('expand');
        header.classList.toggle('semi-transparent'); // Thêm hiệu ứng blur khi sidebar đóng/mở
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const userBtn = document.getElementById('user-btn');
    const authPopup = document.getElementById('auth-popup');

    if (userBtn && authPopup) {
        // 1. Khi ấn vào hình người
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
            authPopup.classList.toggle('show');
        });

        // 2. Khi ấn ra ngoài cửa sổ thì đóng lại
        document.addEventListener('click', (e) => {
            if (!authPopup.contains(e.target) && !userBtn.contains(e.target)) {
                authPopup.classList.remove('show');
            }
        });
    }
});
