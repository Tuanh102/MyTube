# ⚠️ CẢNH BÁO AN TOÀN DỮ LIỆU (DATABASE SAFETY WARNING)

Thư mục này chứa các kịch bản quản trị và dọn dẹp cơ sở dữ liệu môi trường phát triển cục bộ (Local Development Database Scripts). Các kịch bản này có tính chất **Xóa dữ liệu (Destructive Operations)**.

## ⛔ LƯU Ý QUAN TRỌNG:
* **TUYỆT ĐỐI KHÔNG** chạy các script này trên môi trường Production (máy chủ thật) trừ khi bạn thực sự muốn khôi phục dữ liệu trắng từ đầu.
* Việc chạy các script này sẽ **xóa sạch vĩnh viễn** toàn bộ bảng dữ liệu người dùng, video, bình luận, hóa đơn trong MongoDB cục bộ của bạn.

## 📂 Danh sách các Script:

1. `seed.ts` (Gọi qua `npm run db:reset`):
   * **Chức năng:** Xóa sạch dữ liệu cũ và tự động nạp lại bộ dữ liệu mẫu chuẩn (Admin VIP, video demo, hóa đơn mẫu) để dễ dàng thử nghiệm giao diện.

2. `clear.ts` (Gọi qua `npm run db:clear`):
   * **Chức năng:** Làm rỗng hoàn toàn 100% cơ sở dữ liệu, đưa hệ thống về trạng thái trắng tinh khôi phục từ đầu (cold-start) phục vụ việc kiểm thử bảo mật và lỗi hệ thống.
