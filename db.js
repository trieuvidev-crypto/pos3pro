/**
 * db.js
 * ─────────────────────────────────────────────────────
 * Lớp lưu trữ dữ liệu bằng localStorage
 * (Nâng cấp lên IndexedDB/Dexie.js khi cần dữ liệu lớn)
 * ─────────────────────────────────────────────────────
 */
const DB = {

  // ── KEYS ─────────────────────────────────────────────
  KEYS: {
    tables  : "pos_tables",
    menu    : "pos_menu",
    orders  : "pos_orders",
    config  : "pos_config",
  },

  // ── ĐỌC ──────────────────────────────────────────────
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      console.warn("DB.get error:", e);
      return defaultValue;
    }
  },

  // ── GHI ──────────────────────────────────────────────
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn("DB.set error (bộ nhớ đầy?):", e);
      return false;
    }
  },

  // ── XOÁ 1 KEY ─────────────────────────────────────────
  remove(key) {
    localStorage.removeItem(key);
  },

  // ── XOÁ TẤT CẢ ────────────────────────────────────────
  clear() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  },

  // ── SHORTHAND GETTERS / SETTERS ───────────────────────
  getTables()   { return this.get(this.KEYS.tables,  []); },
  setTables(v)  { return this.set(this.KEYS.tables,  v); },

  getMenu()     { return this.get(this.KEYS.menu,    []); },
  setMenu(v)    { return this.set(this.KEYS.menu,    v); },

  getOrders()   { return this.get(this.KEYS.orders,  []); },
  setOrders(v)  { return this.set(this.KEYS.orders,  v); },

  getCfg()      { return this.get(this.KEYS.config,  {}); },
  setCfg(v)     { return this.set(this.KEYS.config,  v); },

  // ── EXPORT TOÀN BỘ ────────────────────────────────────
  exportAll() {
    return {
      tables    : this.getTables(),
      menu      : this.getMenu(),
      orders    : this.getOrders(),
      config    : this.getCfg(),
      exportedAt: new Date().toISOString(),
      version   : "1.0",
    };
  },

  // ── IMPORT TOÀN BỘ ────────────────────────────────────
  importAll(data) {
    if (data.tables)  this.setTables(data.tables);
    if (data.menu)    this.setMenu(data.menu);
    if (data.orders)  this.setOrders(data.orders);
    if (data.config)  this.setCfg(data.config);
  },
};
