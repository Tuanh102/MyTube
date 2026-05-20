# HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY FRONTEND (MYTUBE CLIENT)

Tài liệu này hướng dẫn chi tiết cách cài đặt, khởi chạy cấu hình độc lập và kiểm tra giao diện Frontend của dự án **MyTube** (YouTube Clone). 

---

## 1. Giới thiệu dự án Frontend
*   **Công nghệ sử dụng:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
*   **Các tính năng giao diện đã hoàn thiện:**
    *   **Trang chủ (Homepage):** Lưới danh sách video, thanh Sidebar điều hướng, bộ lọc phân loại video.
    *   **Trang xem video (Watch Page):** Trình phát video, đề xuất video liên quan, khu vực bình luận.
    *   **Hệ thống xác thực:** Trang Đăng nhập (`/login`) và Đăng ký (`/register`).
    *   **Trang chức năng cá nhân (Yêu cầu đăng nhập):** Kênh đăng ký (Subscriptions), Lịch sử (History), Video đã thích (Likes), Video đã mua (Purchased), Quản lý kênh (Studio).
    *   **Giao diện tối ưu:** Responsive mượt mà trên cả thiết bị di động, tablet và máy tính.

---

## 2. Yêu cầu môi trường chạy thử
Để khởi chạy mã nguồn Frontend một cách trơn tru, máy tính của bạn (hoặc giảng viên) cần cài đặt sẵn:
*   **Node.js:** Phiên bản **v18.x** hoặc **v20.x** trở lên (Khuyến nghị bản LTS).
*   **Trình quản lý gói:** `npm` (mặc định đi kèm khi cài Node.js).

---

## 3. Các bước cài đặt và khởi chạy chi tiết

Khi nộp bài, thư mục lưu trữ đã loại bỏ `node_modules` để giảm dung lượng file nén. Giảng viên chỉ cần thực hiện 3 bước đơn giản dưới đây để chạy dự án:

### Bước 1: Mở thư mục dự án
Mở cửa sổ Command Prompt (Windows), PowerShell hoặc Terminal (macOS/Linux) và di chuyển vào thư mục `client`:
```bash
cd client
```

### Bước 2: Cài đặt các thư viện cần thiết (Dependencies)
Gõ lệnh sau để hệ thống tự động tải và cài đặt tất cả các thư viện đã được cấu hình sẵn trong file `package.json`:
```bash
npm install
```
*(Quá trình này có thể mất từ 1-2 phút tùy thuộc vào tốc độ mạng)*

### Bước 3: Khởi chạy môi trường phát triển (Development Server)
Khởi động máy chủ giao diện cục bộ bằng lệnh:
```bash
npm run dev
```

Sau khi chạy lệnh thành công, terminal sẽ hiển thị thông tin như sau:
```text
▲ Next.js 14.1.0
- Local:        http://localhost:3000
```

Mở trình duyệt web bất kỳ (Chrome, Edge, Firefox,...) và truy cập đường dẫn: **[http://localhost:3000](http://localhost:3000)** để trải nghiệm giao diện MyTube.

---

## 4. Giải thích cấu trúc thư mục cốt lõi (Cho Giảng viên chấm bài)

*   `src/app/`: Hệ thống định tuyến của ứng dụng (Next.js App Router). Mỗi thư mục bên trong tương ứng với một URL trên trình duyệt.
*   `src/views/components/`: Nơi lưu trữ các Component giao diện độc lập và tái sử dụng nhiều lần:
    *   `Header.tsx`: Thanh điều hướng, tìm kiếm và nút tải video.
    *   `Sidebar.tsx`: Thanh thực đơn điều hướng chuẩn YouTube.
    *   `VideoCard.tsx`: Khung hiển thị chi tiết của một video.
*   `src/views/pages/`: Các trang giao diện chi tiết hoàn chỉnh.
*   `tailwind.config.js`: File cấu hình giao diện CSS, màu sắc, font chữ của dự án.
