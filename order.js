/**
 * order.js
 * ─────────────────────────────────────────────────────
 * Xử lý toàn bộ logic liên quan đến order
 * ─────────────────────────────────────────────────────
 */

const Order = {

  // ── STATE ─────────────────────────────────────────────
  _tableId  : null,   // bàn đang order
  _items    : [],     // [{key, menuId, name, price, qty, note, disc}]
  _vatOn    : false,

  // ── GETTER ───────────────────────────────────────────
  get tableId()  { return this._tableId; },
  get items()    { return this._items; },
  get vatOn()    { return this._vatOn; },

  // ── TÍNH TỔNG ─────────────────────────────────────────
  getSummary() {
    const cfg = getMergedConfig();
    const sub = this._items.reduce((s, it) => {
      return s + (it.price * it.qty) - (it.disc || 0);
    }, 0);
    const vat   = this._vatOn ? Math.round(sub * cfg.vatRate / 100) : 0;
    const total = sub + vat;
    return { sub, vat, total };
  },

  // ── MỞ BÀN / TẢI ORDER CŨ ────────────────────────────
  openTable(tableId) {
    this._tableId = tableId;
    const cfg     = getMergedConfig();
    const existing = DB.getOrders().find(
      o => o.tableId === tableId && o.status === "open"
    );
    if (existing) {
      this._items = existing.items  || [];
      this._vatOn = existing.vatOn  ?? cfg.vatDefault;
    } else {
      this._items = [];
      this._vatOn = cfg.vatDefault;
    }
  },

  // ── THÊM MÓN ─────────────────────────────────────────
  addItem(menuItem) {
    const idx = this._items.findIndex(i => i.menuId === menuItem.id);
    if (idx >= 0) {
      // Tăng số lượng nếu đã có
      this._items[idx].qty += 1;
    } else {
      this._items.push({
        key    : uid(),
        menuId : menuItem.id,
        name   : menuItem.name,
        price  : menuItem.price,
        qty    : 1,
        note   : "",
        disc   : 0,
      });
    }
    this._autoSave();
  },

  // ── ĐỔI SỐ LƯỢNG ─────────────────────────────────────
  changeQty(key, delta) {
    const idx = this._items.findIndex(i => i.key === key);
    if (idx < 0) return;
    this._items[idx].qty = Math.max(0, this._items[idx].qty + delta);
    if (this._items[idx].qty === 0) {
      this._items.splice(idx, 1);   // xoá nếu qty = 0
    }
    this._autoSave();
  },

  // ── GHI CHÚ ──────────────────────────────────────────
  setNote(key, note) {
    const item = this._items.find(i => i.key === key);
    if (item) { item.note = note; this._autoSave(); }
  },

  // ── GIẢM GIÁ TỪNG MÓN ────────────────────────────────
  setDiscount(key, amount) {
    const item = this._items.find(i => i.key === key);
    if (item) { item.disc = Number(amount) || 0; this._autoSave(); }
  },

  // ── BẬT/TẮT VAT ──────────────────────────────────────
  toggleVat(on) {
    this._vatOn = on;
    this._autoSave();
  },

  // ── LƯU TỰ ĐỘNG ──────────────────────────────────────
  _autoSave() {
    if (!this._tableId) return;

    const { sub, vat, total } = this.getSummary();
    const orders  = DB.getOrders();
    const now     = new Date().toISOString();
    const exIdx   = orders.findIndex(
      o => o.tableId === this._tableId && o.status === "open"
    );

    if (this._items.length === 0) {
      // Xoá order nếu không còn món
      if (exIdx >= 0) {
        orders.splice(exIdx, 1);
        DB.setOrders(orders);
      }
      Tables.setStatus(this._tableId, "empty");
      return;
    }

    const orderObj = {
      id         : exIdx >= 0 ? orders[exIdx].id : uid(),
      tableId    : this._tableId,
      items      : [...this._items],
      vatOn      : this._vatOn,
      sub, vat, total,
      status     : "open",
      createdAt  : exIdx >= 0 ? orders[exIdx].createdAt : now,
      updatedAt  : now,
      billImages : exIdx >= 0 ? (orders[exIdx].billImages || []) : [],
    };

    if (exIdx >= 0) {
      orders[exIdx] = orderObj;
    } else {
      orders.push(orderObj);
      Tables.setStatus(this._tableId, "serving");
    }

    DB.setOrders(orders);
  },

  // ── LẤY ORDER ĐANG MỞ ────────────────────────────────
  getOpen(tableId = this._tableId) {
    return DB.getOrders().find(
      o => o.tableId === tableId && o.status === "open"
    ) || null;
  },

  // ── THANH TOÁN ────────────────────────────────────────
  pay(method) {
    const orders = DB.getOrders();
    const idx    = orders.findIndex(
      o => o.tableId === this._tableId && o.status === "open"
    );
    if (idx < 0) return null;

    orders[idx] = {
      ...orders[idx],
      status : "paid",
      method,
      paidAt : new Date().toISOString(),
    };
    DB.setOrders(orders);
    Tables.setStatus(this._tableId, "empty");

    const paid = orders[idx];
    this._tableId = null;
    this._items   = [];
    this._vatOn   = false;
    return paid;
  },

  // ── HUỶ ORDER ─────────────────────────────────────────
  cancel() {
    const orders = DB.getOrders();
    const idx    = orders.findIndex(
      o => o.tableId === this._tableId && o.status === "open"
    );
    if (idx >= 0) {
      orders[idx].status = "cancelled";
      DB.setOrders(orders);
    }
    Tables.setStatus(this._tableId, "empty");
    this._tableId = null;
    this._items   = [];
    this._vatOn   = false;
  },

  // ── CHỜ THANH TOÁN ────────────────────────────────────
  setWaiting() {
    Tables.setStatus(this._tableId, "waiting");
    this._autoSave();
  },

  // ── LƯU ẢNH BILL ─────────────────────────────────────
  addBillImage(dataUrl) {
    const orders = DB.getOrders();
    const idx    = orders.findIndex(
      o => o.tableId === this._tableId && o.status === "open"
    );
    if (idx < 0) return;
    orders[idx].billImages = [...(orders[idx].billImages || []), dataUrl];
    DB.setOrders(orders);
  },
};

// ── QUẢN LÝ TRẠNG THÁI BÀN ───────────────────────────
const Tables = {
  get all() { return DB.getTables(); },

  setStatus(tableId, status) {
    const tables = DB.getTables();
    const t      = tables.find(t => t.id === tableId);
    if (t) { t.status = status; DB.setTables(tables); }
  },

  getById(tableId) {
    return DB.getTables().find(t => t.id === tableId) || null;
  },
};
