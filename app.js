/**
 * app.js
 * ─────────────────────────────────────────────────────
 * Khởi động ứng dụng, điều hướng view, xử lý sự kiện
 * ─────────────────────────────────────────────────────
 */

const App = {

  _currentView : "tables",

  // ── KHỞI ĐỘNG ─────────────────────────────────────────
  init() {
    // Lần đầu chạy: tạo dữ liệu mặc định
    if (DB.getTables().length === 0) {
      DB.setTables(initTables());
    }
    if (DB.getMenu().length === 0) {
      DB.setMenu(DEMO_MENU);
    }

    // Toast
    Toast.init();

    // Render giao diện ban đầu
    this._populateCatSelect("mform-cat", ALL_CATEGORIES);
    this._populateDate("hist-date");
    Render.tables();
    this.showView("tables");

    // Header: ngày hiện tại
    document.getElementById("header-date").textContent =
      new Date().toLocaleDateString("vi-VN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });

    // Header: store name
    const cfg = getMergedConfig();
    document.getElementById("header-store").textContent = cfg.storeName;

    // Keyboard shortcuts
    this._bindKeyboard();

    console.log("✅ CÀ PHÊ SANG POS đã khởi động!");
  },

  // ── CHUYỂN VIEW ────────────────────────────────────────
  showView(viewId) {
    // Ẩn tất cả view
    document.querySelectorAll(".view").forEach(v => v.classList.remove("show"));
    // Hiện view được chọn
    document.getElementById(`view-${viewId}`)?.classList.add("show");

    // Cập nhật nav active
    document.querySelectorAll(".nav-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.view === viewId ||
        (viewId === "order" && b.dataset.view === "tables"));
    });

    this._currentView = viewId;

    // Render nội dung tương ứng
    switch (viewId) {
      case "tables":
        Render.tables();
        break;
      case "menu":
        Render.menuMgmt();
        break;
      case "history":
        Render.history(document.getElementById("hist-date")?.value || todayISO());
        break;
      case "reports":
        Render.reports(document.querySelector(".rep-period-btn.active")?.dataset.period || "day");
        break;
      case "settings":
        Render.settings();
        break;
    }
  },

  // ── MỞ BÀN ────────────────────────────────────────────
  openTable(tableId) {
    Order.openTable(tableId);
    this.showView("order");
    Render.order();
  },

  // ── LƯU CÀI ĐẶT ──────────────────────────────────────
  saveSettings() {
    const cfg = {
      storeName  : document.getElementById("cfg-store-name").value.trim(),
      address    : document.getElementById("cfg-address").value.trim(),
      bankCode   : document.getElementById("cfg-bank-code").value.trim(),
      bankAccount: document.getElementById("cfg-bank-acc").value.trim(),
      bankOwner  : document.getElementById("cfg-bank-owner").value.trim(),
      vatRate    : Number(document.getElementById("cfg-vat-rate").value) || 8,
      vatDefault : document.getElementById("cfg-vat-default").checked,
    };
    DB.setCfg(cfg);
    document.getElementById("header-store").textContent = cfg.storeName || CONFIG.storeName;
    Toast.success("Đã lưu cài đặt!");
  },

  // ── BACKUP ────────────────────────────────────────────
  exportBackup() {
    const data = JSON.stringify(DB.exportAll(), null, 2);
    downloadFile(data, `backup_cafe_${todayISO()}.json`);
    Toast.success("Đã xuất file backup!");
  },

  async importBackup(file) {
    try {
      const text = await readFileAsText(file);
      const data = JSON.parse(text);
      DB.importAll(data);
      Toast.success("Khôi phục dữ liệu thành công!");
      Render.settings();
      Render.tables();
    } catch (e) {
      Toast.error("File không hợp lệ: " + e.message);
    }
  },

  resetAll() {
    showConfirm(
      "XOÁ TOÀN BỘ DỮ LIỆU? Hành động này không thể hoàn tác!",
      () => {
        DB.clear();
        window.location.reload();
      }
    );
  },

  // ── PHÍM TẮT ──────────────────────────────────────────
  _bindKeyboard() {
    document.addEventListener("keydown", e => {
      // Không kích hoạt khi đang gõ vào input
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Không kích hoạt khi modal đang mở
      if (document.querySelector(".modal.show")) return;

      switch (e.key) {
        case "1": this.showView("tables");   break;
        case "2": this.showView("menu");     break;
        case "3": this.showView("history");  break;
        case "4": this.showView("reports");  break;
        case "5": this.showView("settings"); break;
        case "Escape":
          document.querySelectorAll(".modal.show")
            .forEach(m => m.classList.remove("show"));
          this.showView("tables");
          break;
      }
    });
  },

  // ── ĐIỀN DANH MỤC VÀO SELECT ─────────────────────────
  _populateCatSelect(selectId, cats) {
    const el = document.getElementById(selectId);
    if (!el) return;
    el.innerHTML = cats.map(c =>
      `<option value="${c}">${c}</option>`
    ).join("");
  },

  // ── ĐẶT NGÀY MẶC ĐỊNH CHO INPUT DATE ─────────────────
  _populateDate(inputId) {
    const el = document.getElementById(inputId);
    if (el) el.value = todayISO();
  },
};

// ── KHỞI ĐỘNG KHI DOM SẴN SÀNG ───────────────────────────
document.addEventListener("DOMContentLoaded", () => App.init());
