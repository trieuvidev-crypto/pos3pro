/**
 * data.js
 * ─────────────────────────────────────────────────────
 * Dữ liệu demo: menu mẫu + khởi tạo bàn
 * Chỉ dùng khi chạy lần đầu (chưa có dữ liệu)
 * ─────────────────────────────────────────────────────
 */

// ── MENU MẪU (từ thực đơn thực tế) ───────────────────
const DEMO_MENU = [
  // Cà Phê Pha Máy
  { id:"m01", name:"Cà phê đen đá",         price:12000, category:"Cà Phê Pha Máy",   active:true, desc:"" },
  { id:"m02", name:"Cà phê đen",             price:10000, category:"Cà Phê Pha Máy",   active:true, desc:"" },
  { id:"m03", name:"Cà phê sữa đá",         price:15000, category:"Cà Phê Pha Máy",   active:true, desc:"" },
  { id:"m04", name:"Cà phê muối",            price:17000, category:"Cà Phê Pha Máy",   active:true, desc:"" },
  { id:"m05", name:"Bạc xỉu",                price:18000, category:"Cà Phê Pha Máy",   active:true, desc:"" },
  { id:"m06", name:"Ca cao sữa",             price:15000, category:"Cà Phê Pha Máy",   active:true, desc:"" },
  // Sinh Tố
  { id:"m07", name:"Sinh tố Bơ",             price:20000, category:"Sinh Tố",           active:true, desc:"" },
  { id:"m08", name:"Sinh tố Sầu riêng",     price:25000, category:"Sinh Tố",           active:true, desc:"" },
  { id:"m09", name:"Sinh tố Mít",            price:20000, category:"Sinh Tố",           active:true, desc:"" },
  { id:"m10", name:"Sinh tố Dâu",            price:20000, category:"Sinh Tố",           active:true, desc:"" },
  { id:"m11", name:"Sinh tố Mãng cầu",      price:20000, category:"Sinh Tố",           active:true, desc:"" },
  { id:"m12", name:"Sinh tố Kiwi",           price:20000, category:"Sinh Tố",           active:true, desc:"" },
  // Ăn Vặt
  { id:"m13", name:"Bánh tráng trộn",        price:15000, category:"Ăn Vặt",            active:true, desc:"" },
  { id:"m14", name:"Bò viên chiên",          price:15000, category:"Ăn Vặt",            active:true, desc:"" },
  { id:"m15", name:"Cá viên chiên",          price:10000, category:"Ăn Vặt",            active:true, desc:"" },
  { id:"m16", name:"Trái cây ly",            price:10000, category:"Ăn Vặt",            active:true, desc:"" },
  { id:"m17", name:"Mì Ly",                  price:10000, category:"Ăn Vặt",            active:true, desc:"" },
  { id:"m18", name:"Bánh Flan",              price:10000, category:"Ăn Vặt",            active:true, desc:"" },
  { id:"m19", name:"Kem cây",                price:5000,  category:"Ăn Vặt",            active:true, desc:"" },
  // Điểm Tâm Sáng
  { id:"m20", name:"Hủ tiếu",                price:25000, category:"Điểm Tâm Sáng",    active:true, desc:"" },
  { id:"m21", name:"Cơm sườn",               price:25000, category:"Điểm Tâm Sáng",    active:true, desc:"" },
  // Trà Trái Cây
  { id:"m22", name:"Trà đào",                price:17000, category:"Trà Trái Cây",      active:true, desc:"Thêm 5k ly 1L" },
  { id:"m23", name:"Trà vải",                price:17000, category:"Trà Trái Cây",      active:true, desc:"" },
  { id:"m24", name:"Trà Kiwi",               price:17000, category:"Trà Trái Cây",      active:true, desc:"" },
  { id:"m25", name:"Trà chanh dây hạt đác",  price:20000, category:"Trà Trái Cây",      active:true, desc:"" },
  { id:"m26", name:"Trà đậu tâm hạt đác",   price:20000, category:"Trà Trái Cây",      active:true, desc:"" },
  { id:"m27", name:"Trà mãng cầu",           price:20000, category:"Trà Trái Cây",      active:true, desc:"" },
  { id:"m28", name:"Trà chanh Thái xanh",    price:20000, category:"Trà Trái Cây",      active:true, desc:"" },
  { id:"m29", name:"Trà dưa lưới",           price:20000, category:"Trà Trái Cây",      active:true, desc:"" },
  { id:"m30", name:"Trà dâu",                price:17000, category:"Trà Trái Cây",      active:true, desc:"" },
  { id:"m31", name:"Trà ổi hồng",            price:17000, category:"Trà Trái Cây",      active:true, desc:"" },
  // Trà Sữa
  { id:"m32", name:"Trà sữa thái xanh",      price:20000, category:"Trà Sữa",           active:true, desc:"" },
  { id:"m33", name:"Trà sữa thái đỏ",        price:20000, category:"Trà Sữa",           active:true, desc:"" },
  { id:"m34", name:"Sữa tươi TCDD",          price:20000, category:"Trà Sữa",           active:true, desc:"" },
  { id:"m35", name:"Trà sữa Matcha",         price:20000, category:"Trà Sữa",           active:true, desc:"" },
  { id:"m36", name:"Matcha latte",            price:20000, category:"Trà Sữa",           active:true, desc:"" },
  { id:"m37", name:"Cacao latte",             price:20000, category:"Trà Sữa",           active:true, desc:"" },
  { id:"m38", name:"Trà sữa việt quất",      price:20000, category:"Trà Sữa",           active:true, desc:"" },
  { id:"m39", name:"Trà sữa socola",         price:20000, category:"Trà Sữa",           active:true, desc:"" },
  // Giải Khát
  { id:"m40", name:"Lipton tắc xí muội",     price:10000, category:"Giải Khát",         active:true, desc:"" },
  { id:"m41", name:"Tắc xí muội",            price:10000, category:"Giải Khát",         active:true, desc:"" },
  { id:"m42", name:"Đá me",                  price:10000, category:"Giải Khát",         active:true, desc:"" },
  { id:"m43", name:"Trà đường",              price:8000,  category:"Giải Khát",         active:true, desc:"" },
];

// ── KHỞI TẠO BÀN TỪ CONFIG ───────────────────────────
function initTables() {
  const tables = [];
  CONFIG.zones.forEach(zone => {
    for (let i = 1; i <= zone.tables; i++) {
      tables.push({
        id     : `${zone.id}${i}`,   // "A1", "B3"...
        zone   : zone.id,
        number : i,
        status : "empty",            // empty | serving | waiting
      });
    }
  });
  return tables;
}

// ── DANH SÁCH DANH MỤC ───────────────────────────────
const ALL_CATEGORIES = [
  "Cà Phê Pha Máy",
  "Sinh Tố",
  "Ăn Vặt",
  "Điểm Tâm Sáng",
  "Trà Trái Cây",
  "Trà Sữa",
  "Giải Khát",
  "Khác",
];

// ── TRẠNG THÁI BÀN ────────────────────────────────────
const TABLE_STATUS = {
  empty   : { label: "Trống",           color: "#64748b", bg: "#1e293b", border: "#475569" },
  serving : { label: "Đang phục vụ",   color: "#fbbf24", bg: "#451a03", border: "#f59e0b" },
  waiting : { label: "Chờ thanh toán", color: "#f87171", bg: "#1a0000", border: "#ef4444" },
};
