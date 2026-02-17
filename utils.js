/**
 * utils.js
 * ─────────────────────────────────────────────────────
 * Các hàm tiện ích dùng chung
 * ─────────────────────────────────────────────────────
 */

// ── TẠO ID NGẪU NHIÊN ────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── FORMAT TIỀN VND ──────────────────────────────────
function fmtVND(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount || 0) + "đ";
}

// ── FORMAT SỐ (không có "đ") ─────────────────────────
function fmtNum(n) {
  return new Intl.NumberFormat("vi-VN").format(n || 0);
}

// ── FORMAT NGÀY GIỜ ───────────────────────────────────
function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN");
}

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
}

// ── NGÀY HÔM NAY DẠNG YYYY-MM-DD ─────────────────────
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ── DOWNLOAD FILE ────────────────────────────────────
function downloadFile(content, filename, type = "application/json") {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── DOWNLOAD ẢNH ─────────────────────────────────────
function downloadImage(dataUrl, filename) {
  const a    = document.createElement("a");
  a.href     = dataUrl;
  a.download = filename;
  a.click();
}

// ── TẠO TÊN FILE BILL ────────────────────────────────
function billFilename(tableId) {
  const d   = new Date();
  const pad = n => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}-${pad(d.getMinutes())}`;
  return `bill_ban${tableId}_${date}_${time}.jpg`;
}

// ── ĐỌC FILE TEXT ────────────────────────────────────
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Không đọc được file"));
    reader.readAsText(file);
  });
}

// ── TOAST NOTIFICATION ───────────────────────────────
const Toast = {
  _container: null,

  init() {
    this._container = document.getElementById("toast-container");
  },

  show(message, type = "success", duration = 3000) {
    if (!this._container) this.init();
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.textContent = message;
    this._container.appendChild(el);

    // Hiệu ứng xuất hiện
    requestAnimationFrame(() => el.classList.add("show"));

    // Tự xoá sau duration ms
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  success(msg) { this.show(msg, "success"); },
  error(msg)   { this.show(msg, "error"); },
  info(msg)    { this.show(msg, "info"); },
};

// ── CONFIRM DIALOG ────────────────────────────────────
function showConfirm(message, onYes, onNo) {
  const overlay = document.getElementById("confirm-overlay");
  const msgEl   = document.getElementById("confirm-msg");
  const btnYes  = document.getElementById("confirm-yes");
  const btnNo   = document.getElementById("confirm-no");

  msgEl.textContent = message;
  overlay.classList.add("show");

  // Xoá listener cũ trước khi gắn mới
  const newYes = btnYes.cloneNode(true);
  const newNo  = btnNo.cloneNode(true);
  btnYes.replaceWith(newYes);
  btnNo.replaceWith(newNo);

  const close = () => overlay.classList.remove("show");

  newYes.addEventListener("click", () => { close(); if (onYes) onYes(); });
  newNo.addEventListener ("click", () => { close(); if (onNo)  onNo();  });
}

// ── PARSE CSV ─────────────────────────────────────────
// Format: Tên,Giá,Danh mục,Mô tả
function parseMenuCSV(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const items = [];

  lines.forEach((line, i) => {
    // Bỏ qua dòng header nếu có
    if (i === 0 && line.toLowerCase().includes("tên")) return;

    const parts = line.split(",").map(p => p.trim());
    if (parts.length >= 2 && parts[0]) {
      items.push({
        id       : uid(),
        name     : parts[0],
        price    : Number(parts[1]) || 0,
        category : parts[2] || "Khác",
        desc     : parts[3] || "",
        active   : true,
      });
    }
  });

  return items;
}

// ── GET/SET MERGED CONFIG ─────────────────────────────
// Merge CONFIG (file) với giá trị đã lưu trong DB
function getMergedConfig() {
  const saved = DB.getCfg();
  return { ...CONFIG, ...saved };
}
