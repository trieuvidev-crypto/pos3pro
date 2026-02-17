/**
 * render.js
 * ─────────────────────────────────────────────────────
 * Vẽ toàn bộ giao diện HTML ra màn hình
 * ─────────────────────────────────────────────────────
 */

const Render = {

  // ══════════════════════════════════════════════════
  // SƠ ĐỒ BÀN
  // ══════════════════════════════════════════════════
  tables() {
    const tables = DB.getTables();
    const orders = DB.getOrders();
    const cfg    = getMergedConfig();

    CONFIG.zones.forEach(zone => {
      const grid = document.getElementById(`zone-grid-${zone.id}`);
      if (!grid) return;

      const zoneTables = tables.filter(t => t.zone === zone.id);
      grid.innerHTML = zoneTables.map(t => {
        const st      = TABLE_STATUS[t.status] || TABLE_STATUS.empty;
        const openOrd = orders.find(o => o.tableId === t.id && o.status === "open");
        const ping    = t.status === "waiting"
          ? `<span class="ping-dot"></span>` : "";

        return `
          <button class="table-card status-${t.status}" onclick="App.openTable('${t.id}')">
            ${ping}
            <div class="table-num">${t.number}</div>
            <div class="table-id">Bàn ${t.id}</div>
            <div class="table-status-label" style="color:${st.color}">${st.label}</div>
            ${openOrd ? `<div class="table-total">${fmtVND(openOrd.total)}</div>` : ""}
          </button>
        `;
      }).join("");
    });

    // Thống kê nhanh
    document.getElementById("stat-empty").textContent   = tables.filter(t => t.status === "empty").length;
    document.getElementById("stat-serving").textContent = tables.filter(t => t.status === "serving").length;
    document.getElementById("stat-waiting").textContent = tables.filter(t => t.status === "waiting").length;
  },

  // ══════════════════════════════════════════════════
  // ORDER PAGE
  // ══════════════════════════════════════════════════
  order() {
    const t   = Tables.getById(Order.tableId);
    const st  = t ? TABLE_STATUS[t.status] : TABLE_STATUS.empty;

    // Header bàn
    document.getElementById("order-table-id").textContent    = `BÀN ${Order.tableId}`;
    const badge = document.getElementById("order-status-badge");
    badge.textContent  = st.label;
    badge.style.color  = st.color;
    badge.style.background = st.bg;

    // Panel món ăn bên phải
    this._renderOrderItems();
    this._renderOrderSummary();
    this._renderMenuGrid();
  },

  // ── DANH SÁCH MÓN TRONG ORDER ─────────────────────
  _renderOrderItems() {
    const container = document.getElementById("order-items");
    if (!container) return;

    if (Order.items.length === 0) {
      container.innerHTML = `<div class="empty-hint">Chọn món từ bảng bên trái</div>`;
      return;
    }

    container.innerHTML = Order.items.map(it => `
      <div class="order-item">
        <div class="oi-top">
          <span class="oi-name">${it.name}</span>
          <span class="oi-price">${fmtVND(it.price * it.qty - (it.disc || 0))}</span>
        </div>
        <div class="oi-controls">
          <button class="qty-btn minus" onclick="Order.changeQty('${it.key}', -1); Render.order()">−</button>
          <span class="qty-num">${it.qty}</span>
          <button class="qty-btn plus"  onclick="Order.changeQty('${it.key}', +1); Render.order()">+</button>
          <input class="inp inp-sm oi-note" value="${it.note || ""}"
            onchange="Order.setNote('${it.key}', this.value)"
            placeholder="Ghi chú..." />
        </div>
        <div class="oi-disc">
          <span class="disc-label">Giảm:</span>
          <input class="inp inp-sm disc-inp" type="number" value="${it.disc || ""}"
            onchange="Order.setDiscount('${it.key}', this.value); Render._renderOrderSummary()"
            placeholder="0" />
          <span class="disc-unit">đ</span>
        </div>
      </div>
    `).join("");
  },

  // ── TỔNG TIỀN VÀ NÚT ACTION ───────────────────────
  _renderOrderSummary() {
    const { sub, vat, total } = Order.getSummary();
    const cfg                 = getMergedConfig();
    const hasItems            = Order.items.length > 0;

    // VAT
    document.getElementById("vat-checkbox").checked = Order.vatOn;
    document.getElementById("vat-label").textContent =
      `VAT ${cfg.vatRate}%${Order.vatOn ? ` (+${fmtVND(vat)})` : ""}`;

    // Tổng
    document.getElementById("order-total").textContent = fmtVND(total);

    // Nút: bật/tắt theo có món không
    ["btn-pay-cash", "btn-pay-qr", "btn-wait", "btn-print"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = !hasItems;
    });
  },

  // ── LƯỚI MÓN ĂN BÊN TRÁI ─────────────────────────
  _renderMenuGrid(filter = {}) {
    const cat    = filter.cat    || document.getElementById("order-cat-active")?.dataset.cat || "Tất cả";
    const search = filter.search ?? document.getElementById("order-search")?.value ?? "";

    const items = DB.getMenu().filter(m => {
      if (!m.active) return false;
      if (cat !== "Tất cả" && m.category !== cat) return false;
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    // Render category tabs
    const catBar = document.getElementById("order-cat-bar");
    const cats   = MenuMgr.getCategories();
    catBar.innerHTML = cats.map(c => `
      <button class="cat-btn ${c === cat ? "active" : ""}"
        onclick="Render._renderMenuGrid({cat:'${c.replace(/'/g,"\\'")}'}); this.parentNode.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');">
        ${c}
      </button>
    `).join("");

    // Render grid
    const grid = document.getElementById("order-menu-grid");
    if (items.length === 0) {
      grid.innerHTML = `<div class="empty-hint" style="grid-column:span 2">Không tìm thấy món</div>`;
      return;
    }
    grid.innerHTML = items.map(m => `
      <button class="menu-card" onclick="Order.addItem(${JSON.stringify(m).replace(/"/g,'&quot;')}); Render.order()">
        <div class="mc-name">${m.name}</div>
        ${m.desc ? `<div class="mc-desc">${m.desc}</div>` : ""}
        <div class="mc-price">${fmtVND(m.price)}</div>
      </button>
    `).join("");
  },

  // ══════════════════════════════════════════════════
  // QUẢN LÝ THỰC ĐƠN
  // ══════════════════════════════════════════════════
  menuMgmt(filter = {}) {
    const cat    = filter.cat    || document.getElementById("mmgmt-cat")?.value    || "Tất cả";
    const search = filter.search ?? document.getElementById("mmgmt-search")?.value ?? "";

    const items = DB.getMenu().filter(m => {
      if (cat !== "Tất cả" && m.category !== cat) return false;
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    // Render category select
    const catSelect = document.getElementById("mmgmt-cat");
    if (catSelect) {
      const current = catSelect.value;
      catSelect.innerHTML = MenuMgr.getCategories().map(c =>
        `<option value="${c}" ${c === current ? "selected" : ""}>${c}</option>`
      ).join("");
    }

    const tbody = document.getElementById("menu-tbody");
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--dim);padding:40px">Không có món nào</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map((m, i) => `
      <tr class="${i % 2 === 0 ? "row-even" : ""}">
        <td>
          <div class="item-name-main">${m.name}</div>
          ${m.desc ? `<div class="item-name-desc">${m.desc}</div>` : ""}
        </td>
        <td class="td-cat">${m.category}</td>
        <td class="td-price">${fmtVND(m.price)}</td>
        <td>
          <span class="badge ${m.active ? "on" : "off"}"
            onclick="MenuMgr.toggleActive('${m.id}'); Render.menuMgmt()">
            ${m.active ? "Đang bán" : "Tắt"}
          </span>
        </td>
        <td>
          <div class="row-actions">
            <button class="btn btn-sm btn-teal" onclick="MenuMgr.openEdit('${m.id}')">Sửa</button>
            <button class="btn btn-sm btn-red"  onclick="MenuMgr.delete('${m.id}')">Xoá</button>
          </div>
        </td>
      </tr>
    `).join("");
  },

  // ══════════════════════════════════════════════════
  // LỊCH SỬ
  // ══════════════════════════════════════════════════
  history(dateISO) {
    const orders  = Reports.getHistory(dateISO);
    const dayRev  = orders.reduce((s, o) => s + o.total, 0);
    const container = document.getElementById("history-list");

    document.getElementById("hist-summary").textContent =
      `${orders.length} đơn — ${fmtVND(dayRev)}`;

    if (orders.length === 0) {
      container.innerHTML = `<div class="empty-hint" style="text-align:center;padding:60px">Không có đơn hàng ngày này</div>`;
      return;
    }

    container.innerHTML = orders.map(o => {
      const rows = (o.items || []).map(it =>
        `<div class="hist-item-row"><span>${it.name} × ${it.qty}</span><span>${fmtVND(it.price * it.qty)}</span></div>`
      ).join("");

      const billImgs = (o.billImages || []).length > 0
        ? `<div class="hist-bills">
            <div class="hist-bills-label">Ảnh bill (${o.billImages.length})</div>
            <div class="hist-bills-imgs">
              ${o.billImages.map((img, i) =>
                `<img src="${img}" class="bill-thumb" onclick="window.open(this.src,'_blank')" title="Ảnh bill ${i+1}" />`
              ).join("")}
            </div>
           </div>` : "";

      return `
        <div class="hist-card">
          <div class="hist-card-header">
            <div>
              <span class="hist-table-id">Bàn ${o.tableId}</span>
              <span class="hist-time">${fmtTime(o.paidAt || o.updatedAt)}</span>
            </div>
            <div style="text-align:right">
              <div class="hist-total">${fmtVND(o.total)}</div>
              <div class="hist-method ${o.method === "qr" ? "method-qr" : "method-cash"}">
                ${o.method === "qr" ? "QR Transfer" : "Tiền mặt"}
              </div>
            </div>
          </div>
          <div class="hist-items">${rows}</div>
          ${billImgs}
        </div>
      `;
    }).join("");
  },

  // ══════════════════════════════════════════════════
  // BÁO CÁO
  // ══════════════════════════════════════════════════
  reports(period = "day") {
    const data = Reports.getRevenue(period);

    document.getElementById("rep-revenue").textContent = fmtVND(data.revenue);
    document.getElementById("rep-count").textContent   = data.count;
    document.getElementById("rep-avg").textContent     = data.count ? fmtVND(data.avgOrder) : "—";

    // QR / Cash
    document.getElementById("rep-qr").textContent   = fmtVND(data.byMethod.qr   || 0);
    document.getElementById("rep-cash").textContent = fmtVND(data.byMethod.cash || 0);

    // Top items bar chart
    const topContainer = document.getElementById("rep-top-items");
    if (data.topItems.length === 0) {
      topContainer.innerHTML = `<div class="empty-hint" style="text-align:center;padding:30px">Chưa có dữ liệu</div>`;
      return;
    }
    const maxQty = data.topItems[0]?.[1] || 1;
    topContainer.innerHTML = data.topItems.map(([name, qty], i) => `
      <div class="top-item-row">
        <span class="top-rank">${i + 1}</span>
        <span class="top-name">${name}</span>
        <div class="top-bar-wrap">
          <div class="top-bar" style="width:${(qty / maxQty) * 100}%"></div>
        </div>
        <span class="top-qty">${qty}</span>
      </div>
    `).join("");
  },

  // ══════════════════════════════════════════════════
  // CÀI ĐẶT
  // ══════════════════════════════════════════════════
  settings() {
    const cfg = getMergedConfig();
    document.getElementById("cfg-store-name").value  = cfg.storeName  || "";
    document.getElementById("cfg-address").value     = cfg.address    || "";
    document.getElementById("cfg-bank-code").value   = cfg.bankCode   || "";
    document.getElementById("cfg-bank-acc").value    = cfg.bankAccount|| "";
    document.getElementById("cfg-bank-owner").value  = cfg.bankOwner  || "";
    document.getElementById("cfg-vat-rate").value    = cfg.vatRate    ?? 8;
    document.getElementById("cfg-vat-default").checked = !!cfg.vatDefault;

    // Stats
    const menu   = DB.getMenu();
    const orders = DB.getOrders();
    document.getElementById("stats-menu-count").textContent   = menu.length;
    document.getElementById("stats-order-count").textContent  = orders.length;
    document.getElementById("stats-paid-count").textContent   = orders.filter(o => o.status === "paid").length;
  },
};
