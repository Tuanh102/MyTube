# 🚀 MyTube - Node.js + Express + MySQL Project

## 📌 Giới thiệu

MyTube là một ứng dụng web mô phỏng nền tảng xem video, được xây dựng bằng Node.js theo mô hình MVC.
Dự án sử dụng Express để xử lý server, EJS để render giao diện và MySQL để lưu trữ dữ liệu.

---

## 🛠️ Công nghệ sử dụng

* Node.js
* Express
* EJS (Template Engine)
* MySQL (mysql2)
* dotenv (quản lý biến môi trường)
* bcrypt (mã hóa mật khẩu)

---

## 📦 Cài đặt

### 1. Clone project

```bash
git clone <link-repo>
cd <ten-project>
```

### 2. Cài đặt dependencies

```bash
npm install express ejs dotenv mysql2 bcrypt
```

---

## ⚙️ Cấu hình môi trường

Tạo file `.env` trong thư mục gốc:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
```

---

## ▶️ Chạy ứng dụng

```bash
npm start
```

Hoặc:

```bash
node app.js
```

---

## 📂 Cấu trúc thư mục

```
/project
│
├── src/
│   ├── controllers/     # Xử lý logic
│   ├── models/          # Làm việc với database
│   ├── views/           # Giao diện EJS
│   ├── routes/          # Định tuyến
│
├── public/              # CSS, JS, images
├── .env                 # Biến môi trường
├── app.js               # File chính
└── package.json
```

---

## 🔑 Chức năng chính

* Đăng ký / đăng nhập người dùng
* Mã hóa mật khẩu bằng bcrypt
* Kết nối và truy vấn MySQL
* Hiển thị dữ liệu bằng EJS
* Tổ chức code theo mô hình MVC

---

## 🧠 Giải thích các lệnh npm (để hiểu thêm)

### 1.

```bash
npm install mysql2 dotenv
```

* `mysql2`: Thư viện giúp Node.js kết nối và làm việc với MySQL
* `dotenv`: Đọc file `.env` để quản lý thông tin cấu hình (DB, PORT...)

---

### 2.

```bash
npm install ejs
```

* `ejs`: Template engine giúp render HTML động (hiển thị dữ liệu từ server ra giao diện)

---

### 3.

```bash
npm install express ejs dotenv mysql2 bcrypt
```

👉 Lệnh cài đầy đủ cho project:

* `express`: Tạo server, xử lý request/response
* `ejs`: Render giao diện
* `dotenv`: Quản lý biến môi trường
* `mysql2`: Kết nối database
* `bcrypt`: Mã hóa mật khẩu để tăng bảo mật

---

### ⚠️ Lưu ý

* Không cần chạy nhiều lệnh riêng lẻ, chỉ cần dùng **1 lệnh đầy đủ** là đủ
* Nếu chạy lặp lại (`npm install ...`) thì npm sẽ tự bỏ qua phần đã cài

---

## 📬 Ghi chú

Project này phù hợp để học:

* Backend Node.js
* Mô hình MVC
* Kết nối database MySQL
* Xây dựng web cơ bản

---
