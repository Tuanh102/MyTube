# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN MYTUBE TỪ ĐẦU (GETTING STARTED GUIDE)

Tài liệu này hướng dẫn chi tiết từng bước để bạn thiết lập môi trường, cài đặt thư viện, cấu hình biến môi trường (`.env`), khởi tạo cơ sở dữ liệu và kích hoạt chạy ứng dụng **MyTube** (Next.js Client + NestJS Server) trên máy tính cá nhân.

---

## 📋 YÊU CẦU HỆ THỐNG TRƯỚC KHI CÀI ĐẶT:
* **Node.js**: Phiên bản LTS mới nhất (Khuyên dùng v18 hoặc v20+).
* **MongoDB**: Đã cài đặt dịch vụ MongoDB cục bộ đang chạy tại cổng mặc định `mongodb://localhost:27017` hoặc có chuỗi kết nối MongoDB Atlas trực tuyến.

---

## 🛠️ BƯỚC 1: CẤU HÌNH BIẾN MÔI TRƯỜNG (`.env`)

Dự án sử dụng chung một file cấu hình môi trường `.env` duy nhất nằm tại **thư mục gốc** (`d:\MyTube`).

1. Tại thư mục gốc `MyTube/`, bạn sao chép tệp cấu hình mẫu:
   * **Windows PowerShell:** `Copy-Item .env.example .env`
   * **Linux/macOS/Git Bash:** `cp .env.example .env`
2. Mở file `.env` mới tạo lên và điền đầy đủ các thông tin quan trọng sau:
   * **MONGODB_URI**: Đường dẫn kết nối MongoDB (Mặc định: `mongodb://127.0.0.1:27017/mytube`).
   * **NEXTAUTH_SECRET**: Chuỗi khóa bảo mật phiên đăng nhập (Có thể tạo nhanh bằng cách gõ lệnh `openssl rand -base64 32` hoặc điền chuỗi ngẫu nhiên).
   * **PAYOS CONFIG**: Điền thông tin Client ID, API Key và Checksum Key từ tài khoản PayOS thử nghiệm của bạn để tích hợp cổng thanh toán VIP.
   * **CLOUDINARY CONFIG**: Cung cấp tài khoản Cloudinary để xử lý tải lên video và ảnh đại diện.

---

## 📦 BƯỚC 2: CÀI ĐẶT THƯ VIỆN & PHỤ THUỘC (INSTALL DEPENDENCIES)

Dự án gồm 2 phần độc lập Client và Server, bạn cần cài đặt thư viện cho cả hai bên:

### 1. Cài đặt thư viện cho Backend NestJS Server:
Mở terminal và di chuyển vào thư mục `server/`:
```bash
cd server
npm install
```

### 2. Cài đặt thư viện cho Frontend Next.js Client:
Mở terminal mới (hoặc quay ra ngoài) và di chuyển vào thư mục `client/`:
```bash
cd client
npm install
```

---

## 🔌 BƯỚC 3: RESET & KHỞI TẠO CƠ SỞ DỮ LIỆU (DATABASE INITIALIZATION)

Trước khi khởi chạy dự án, hãy chuẩn bị cơ sở dữ liệu của bạn bằng cách mở terminal tại thư mục **`server/`**:

* **Cách A: Khởi tạo dữ liệu mẫu đẹp mắt (Khuyên dùng để trải nghiệm ngay):**
  Lệnh này sẽ làm sạch database cũ và tự động nạp tài khoản admin VIP (`Tuanh102` - email `ttattatto96@gmail.com`), kênh `Tuanh IT` có tích xanh, và 3 video demo hấp dẫn kèm lịch sử thanh toán hóa đơn:
  ```bash
  npm run db:reset
  ```

* **Cách B: Làm rỗng 100% cơ sở dữ liệu (Dành cho việc kiểm thử từ đầu):**
  Lệnh này dọn sạch hoàn toàn cơ sở dữ liệu về trạng thái trắng tinh khôi phục (cold-start) để bạn thử nghiệm luồng đăng ký mới từ con số 0:
  ```bash
  npm run db:clear
  ```

---

## 🚀 BƯỚC 4: KHỞI CHẠY CÁC MÁY CHỦ PHÁT TRIỂN (RUN LOCAL DEV SERVERS)

Để chạy dự án đầy đủ, bạn cần bật đồng thời cả Backend Server và Frontend Client. Hãy mở hai cửa sổ terminal song song:

### Cửa sổ 1: Khởi chạy NestJS Server (Cổng mặc định: 5000)
Di chuyển vào thư mục `server/` và gõ:
```bash
cd server
npm start
```

### Cửa sổ 2: Khởi chạy Next.js Client (Cổng mặc định: 3000)
Di chuyển vào thư mục `client/` và gõ:
```bash
cd client
npm run dev
```

---

## 🎉 BƯỚC 5: TRẢI NGHIỆM ỨNG DỤNG!

Mở trình duyệt web của bạn và truy cập trực tiếp vào đường dẫn:
```text
http://localhost:3000
```
