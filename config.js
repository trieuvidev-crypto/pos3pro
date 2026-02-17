/**
 * config.js
 * ─────────────────────────────────────────────────────
 * ĐỔI THÔNG TIN THANH TOÁN VÀ QUÁN TẠI ĐÂY
 * ─────────────────────────────────────────────────────
 */
const CONFIG = {
  // ── THÔNG TIN QUÁN ──────────────────────────────────
  storeName : "CÀ PHÊ SANG",
  address   : "Địa chỉ quán cafe...",

  // ── VIETQR — ĐỔI STK Ở ĐÂY ─────────────────────────
  // Mã ngân hàng phổ biến:
  //   agribank | vietcombank | tcb | mb | vpbank | bidv
  //   tpbank   | sacombank  | acb | ocb
  bankCode    : "agribank",
  bankAccount : "7400215025420",
  bankOwner   : "NGUYEN THANH SANG",

  // ── THUẾ VAT ─────────────────────────────────────────
  vatRate     : 8,       // phần trăm (%)
  vatDefault  : false,   // bật VAT mặc định cho đơn mới?

  // ── KHU / SỐ BÀN ─────────────────────────────────────
  zones: [
    { id: "A", name: "Khu A", tables: 8 },
    { id: "B", name: "Khu B", tables: 8 },
  ],
};
