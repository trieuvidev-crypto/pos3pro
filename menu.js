/**
 * menu.js
 * ─────────────────────────────────────────────────────
 * Quản lý thực đơn: thêm / sửa / xoá / import
 * ─────────────────────────────────────────────────────
 */

const MenuMgr = {

  _editId : null,   // null = thêm mới, có giá trị = đang sửa

  // ── MỞ FORM THÊM ─────────────────────────────────────
  openAdd() {
    this._editId = null;
    document.getElementById("mform-title").textContent = "Thêm Món Mới";
    document.getElementById("mform-name").value     = "";
    document.getElementById("mform-price").value    = "";
    document.getElementById("mform-cat").value      = ALL_CATEGORIES[0];
    document.getElementById("mform-desc").value     = "";
    document.getElementById("mform-active").checked = true;
    document.getElementById("modal-menu-form").classList.add("show");
    document.getElementById("mform-name").focus();
  },

  // ── MỞ FORM SỬA ──────────────────────────────────────
  openEdit(itemId) {
    const item = DB.getMenu().find(m => m.id === itemId);
    if (!item) return;

    this._editId = itemId;
    document.getElementById("mform-title").textContent  = "Sửa Món";
    document.getElementById("mform-name").value     = item.name;
    document.getElementById("mform-price").value    = item.price;
    document.getElementById("mform-cat").value      = item.category;
    document.getElementById("mform-desc").value     = item.desc || "";
    document.getElementById("mform-active").checked = item.active;
    document.getElementById("modal-menu-form").classList.add("show");
    document.getElementById("mform-name").focus();
  },

  // ── LƯU (THÊM HOẶC CẬP NHẬT) ─────────────────────────
  save() {
    const name  = document.getElementById("mform-name").value.trim();
    const price = Number(document.getElementById("mform-price").value) || 0;
    const cat   = document.getElementById("mform-cat").value;
    const desc  = document.getElementById("mform-desc").value.trim();
    const active= document.getElementById("mform-active").checked;

    if (!name) { Toast.error("Vui lòng nhập tên món!"); return; }

    const menu = DB.getMenu();

    if (this._editId) {
      // Sửa
      const idx = menu.findIndex(m => m.id === this._editId);
      if (idx >= 0) {
        menu[idx] = { ...menu[idx], name, price, category: cat, desc, active };
        DB.setMenu(menu);
        Toast.success("Đã cập nhật món!");
      }
    } else {
      // Thêm mới
      menu.push({ id: uid(), name, price, category: cat, desc, active });
      DB.setMenu(menu);
      Toast.success("Đã thêm món mới!");
    }

    document.getElementById("modal-menu-form").classList.remove("show");
    Render.menuMgmt();
  },

  // ── XOÁ MÓN ──────────────────────────────────────────
  delete(itemId) {
    const item = DB.getMenu().find(m => m.id === itemId);
    if (!item) return;

    showConfirm(`Xoá món "${item.name}"?`, () => {
      const menu = DB.getMenu().filter(m => m.id !== itemId);
      DB.setMenu(menu);
      Toast.info("Đã xoá món!");
      Render.menuMgmt();
    });
  },

  // ── BẬT / TẮT BÁN ────────────────────────────────────
  toggleActive(itemId) {
    const menu = DB.getMenu();
    const item = menu.find(m => m.id === itemId);
    if (!item) return;
    item.active = !item.active;
    DB.setMenu(menu);
    Render.menuMgmt();
  },

  // ── IMPORT TỪ CSV ─────────────────────────────────────
  async importCSV(file) {
    try {
      const text  = await readFileAsText(file);
      const items = parseMenuCSV(text);
      if (items.length === 0) { Toast.error("Không tìm thấy món nào trong file!"); return; }

      const menu = DB.getMenu();
      items.forEach(item => menu.push(item));
      DB.setMenu(menu);

      Toast.success(`Đã import ${items.length} món!`);
      Render.menuMgmt();
    } catch (e) {
      Toast.error("Lỗi đọc file: " + e.message);
    }
  },

  // ── IMPORT TỪ JSON (mảng menu trong file backup) ──────
  importJSON(items) {
    if (!Array.isArray(items) || items.length === 0) {
      Toast.error("Dữ liệu menu không hợp lệ!"); return;
    }
    const menu = DB.getMenu();
    items.forEach(item => {
      // Không ghi đè nếu đã có id trùng
      if (!menu.find(m => m.id === item.id)) menu.push(item);
    });
    DB.setMenu(menu);
    Toast.success(`Đã import ${items.length} món!`);
    Render.menuMgmt();
  },

  // ── LẤY DANH SÁCH DANH MỤC HIỆN CÓ ──────────────────
  getCategories() {
    const cats = Array.from(new Set(DB.getMenu().map(m => m.category)));
    return ["Tất cả", ...cats];
  },
};
