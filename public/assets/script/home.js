document.addEventListener('DOMContentLoaded', () => {
    // --- 1. XỬ LÝ BANNER TỰ ĐỘNG CHUYỂN CẢNH ---
    const bannerContainer = document.getElementById('hero-banner-container');
    if (bannerContainer) {
        const images = bannerContainer.querySelectorAll('.hero-image');
        let currentIndex = 0;

        function changeBanner() {
            if (images.length > 0) {
                images[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % images.length;
                images[currentIndex].classList.add('active');
            }
        }

        // Chuyển banner mỗi 5 giây
        setInterval(changeBanner, 5000);
    }

    // --- 2. XỬ LÝ CLICK CHỌN DANH MỤC (NAV) ---
    // Thay đoạn xử lý Nav cũ bằng đoạn này
    const categoryItems = document.querySelectorAll('.category-item');
        
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            categoryItems.forEach(li => li.classList.remove('active'));
            this.classList.add('active');
            console.log('Category:', this.innerText);
        });
    });
});