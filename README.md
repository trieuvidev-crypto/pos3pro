# CÀ PHÊ SANG — POS System
> Hệ thống quản lý quán cafe, chạy hoàn toàn trên trình duyệt, không cần backend.

---

## CẤU TRÚC FILE

```
cafe-pos/
├── index.html              ← Mở file này để chạy app
│
├── css/
│   ├── base.css            ← Biến màu, reset, typography
│   ├── layout.css          ← Header, nav, views, layout
│   └── components.css      ← Buttons, cards, modals, toast
│
├── js/
│   ├── config.js           ← ⚙️  ĐỔI VIETQR & THÔNG TIN QUÁN TẠI ĐÂY
│   ├── db.js               ← Lưu trữ localStorage
│   ├── data.js             ← Menu mẫu + khởi tạo bàn
│   ├── utils.js            ← Hàm tiện ích (format, toast, confirm...)
│   ├── order.js            ← Logic order + trạng thái bàn
│   ├── menu.js             ← CRUD thực đơn
│   ├── payment.js          ← Thanh toán QR + in hoá đơn
│   ├── camera.js           ← Chụp ảnh bill (WebRTC)
│   ├── reports.js          ← Báo cáo doanh thu
│   ├── render.js           ← Vẽ toàn bộ giao diện
│   └── app.js              ← Controller chính, khởi động
│
└── README.md
```

---

## CHẠY NGAY

**Cách 1 — Mở trực tiếp (đơn giản nhất):**
```
Mở file index.html bằng trình duyệt Chrome / Edge / Firefox
```
> ⚠️ Một số trình duyệt chặn camera khi mở file:// — dùng cách 2 để chụp bill.

**Cách 2 — Chạy local server (khuyến nghị):**
```bash
# Nếu có Python:
python -m http.server 8080

# Nếu có Node.js:
npx serve .

# Sau đó mở: http://localhost:8080
```

---

## ĐỔI THÔNG TIN VIETQR

Mở file `js/config.js`:

```javascript
const CONFIG = {
  bankCode    : "agribank",          // ← Mã ngân hàng
  bankAccount : "7400215025420",     // ← Số tài khoản của bạn
  bankOwner   : "NGUYEN THANH SANG", // ← Tên chủ tài khoản
  // ...
};
```

### Mã ngân hàng phổ biến
| Ngân hàng    | bankCode      |
|--------------|---------------|
| Agribank     | `agribank`    |
| Vietcombank  | `vietcombank` |
| Techcombank  | `tcb`         |
| MB Bank      | `mb`          |
| VPBank       | `vpbank`      |
| BIDV         | `bidv`        |
| TPBank       | `tpbank`      |
| Sacombank    | `sacombank`   |
| ACB          | `acb`         |

---

## SỬ DỤNG

### Sơ đồ bàn
- Nhấn vào bàn để mở màn hình order
- Màu vàng = đang phục vụ
- Màu đỏ + nhấp nháy = chờ thanh toán

### Thêm món vào order
- Chọn danh mục hoặc tìm kiếm
- Nhấn vào món để thêm
- Dùng `+` / `-` để đổi số lượng
- Nhập ghi chú hoặc giảm giá từng món

### Thanh toán
- **TIỀN MẶT** → thanh toán ngay, đóng bàn
- **QR BANK** → hiện mã QR VietQR đúng số tiền → nhấn "Đã nhận tiền"
- **CHỜ TT** → chuyển bàn sang trạng thái chờ, quay về sơ đồ

### Chụp Bill
1. Nhấn **CHỤP BILL** trong màn hình order
2. Cho phép trình duyệt dùng camera
3. Nhấn **CHỤP ẢNH**
4. **Tải về máy** → file `bill_banA3_2026-02-17_15-30.jpg`
5. **Lưu hệ thống** → gắn vào order, xem lại trong Lịch sử

### Import menu từ CSV
File CSV format (UTF-8):
```
Tên,Giá,Danh mục,Mô tả
Cà phê đen đá,12000,Cà Phê Pha Máy,Đậm đà thơm ngon
Sinh tố bơ,20000,Sinh Tố,Béo ngậy bổ dưỡng
```
→ Vào **Thực Đơn** → **Import CSV**

### Backup & Restore
- **Cài Đặt → Xuất backup JSON** → tải file `backup_cafe_2026-02-17.json`
- **Cài Đặt → Khôi phục JSON** → chọn file backup

---

## DEPLOY GITHUB PAGES

```bash
# 1. Tạo repo trên GitHub
git init
git add .
git commit -m "init"
git remote add origin https://github.com/ten-ban/cafe-pos.git
git push -u origin main

# 2. Vào Settings → Pages → Source: main branch → /root
# 3. App chạy tại: https://ten-ban.github.io/cafe-pos/
```

---

## PHÍM TẮT

| Phím  | Tác dụng        |
|-------|-----------------|
| `1`   | Sơ đồ bàn       |
| `2`   | Thực đơn        |
| `3`   | Lịch sử         |
| `4`   | Báo cáo         |
| `5`   | Cài đặt         |
| `Esc` | Đóng modal / về sơ đồ bàn |

---

## LƯU Ý

- Dữ liệu lưu trong **localStorage** của trình duyệt — **không xoá cache** hoặc backup thường xuyên!
- App hoạt động **offline** sau lần đầu load
- Để nâng cấp lên **IndexedDB** (dung lượng lớn hơn), sửa file `js/db.js` dùng thư viện Dexie.js

---

*Cảm ơn quý khách — Chúc ngon miệng!*
