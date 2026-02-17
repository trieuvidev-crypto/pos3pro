/**
 * payment.js
 * ─────────────────────────────────────────────────────
 * Thanh toán QR (VietQR) và in hoá đơn
 * ─────────────────────────────────────────────────────
 */

const Payment = {

  // ── MỞ MODAL QR ──────────────────────────────────────
  showQR() {
    const { total } = Order.getSummary();
    const cfg       = getMergedConfig();
    const info      = encodeURIComponent(`Ban ${Order.tableId}`);

    // Build VietQR URL
    const qrUrl = [
      `https://api.vietqr.io/image`,
      `/${cfg.bankCode}-${cfg.bankAccount}-compact2.jpg`,
      `?amount=${total}`,
      `&addInfo=${info}`,
      `&accountName=${encodeURIComponent(cfg.bankOwner)}`,
    ].join("");

    // Điền thông tin vào modal
    document.getElementById("qr-amount").textContent   = fmtVND(total);
    document.getElementById("qr-bank").textContent     = cfg.bankCode.toUpperCase();
    document.getElementById("qr-account").textContent  = cfg.bankAccount;
    document.getElementById("qr-owner").textContent    = cfg.bankOwner;

    const img = document.getElementById("qr-image");
    img.src = qrUrl;
    img.alt = "VietQR";

    this._openModal("modal-qr");
  },

  // ── XÁC NHẬN ĐÃ NHẬN TIỀN QR ─────────────────────────
  confirmQR() {
    const paid = Order.pay("qr");
    if (!paid) return;
    this._closeModal("modal-qr");
    Toast.success(`Thanh toán QR thành công! ${fmtVND(paid.total)}`);
    App.showView("tables");
    Render.tables();
  },

  // ── THANH TOÁN TIỀN MẶT ───────────────────────────────
  payByCash() {
    const { total } = Order.getSummary();
    const paid      = Order.pay("cash");
    if (!paid) return;
    Toast.success(`Thanh toán tiền mặt thành công! ${fmtVND(total)}`);
    App.showView("tables");
    Render.tables();
  },

  // ── IN HOÁ ĐƠN ───────────────────────────────────────
  printReceipt() {
    const cfg   = getMergedConfig();
    const order = Order.getOpen();
    if (!order) { Toast.error("Không có order để in!"); return; }

    const rows = order.items.map(it => `
      <tr>
        <td>${it.name}</td>
        <td style="text-align:center">x${it.qty}</td>
        <td style="text-align:right">${fmtVND(it.price * it.qty)}</td>
      </tr>
    `).join("");

    const vatRow = order.vat > 0
      ? `<tr class="vat-row"><td colspan="2">VAT ${cfg.vatRate}%</td><td style="text-align:right">+${fmtVND(order.vat)}</td></tr>`
      : "";

    const html = `
      <!DOCTYPE html><html lang="vi"><head>
      <meta charset="UTF-8">
      <title>Hoá Đơn</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Courier New', monospace; max-width: 300px; margin: auto; padding: 16px; font-size: 13px; }
        h1 { text-align: center; font-size: 1.1em; margin-bottom: 4px; }
        .sub { text-align: center; font-size: 0.8em; color: #555; margin-bottom: 12px; }
        .info { margin-bottom: 10px; }
        hr { border: none; border-top: 1px dashed #999; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 4px 2px; vertical-align: top; }
        td:last-child { white-space: nowrap; }
        .total { font-size: 1.3em; font-weight: bold; text-align: right; padding-top: 8px; margin-top: 4px; border-top: 2px solid #000; }
        .footer { text-align: center; margin-top: 20px; font-size: 0.85em; color: #666; }
      </style>
      </head><body>
      <h1>${cfg.storeName}</h1>
      <p class="sub">${cfg.address}</p>
      <hr>
      <div class="info">
        <div>Bàn: <strong>${order.tableId}</strong></div>
        <div>Giờ: ${fmtDateTime(new Date().toISOString())}</div>
      </div>
      <hr>
      <table><tbody>
        ${rows}
        ${vatRow}
      </tbody></table>
      <p class="total">TỔNG: ${fmtVND(order.total)}</p>
      <hr>
      <p class="footer">Cảm ơn quý khách!<br>Hẹn gặp lại!</p>
      </body></html>
    `;

    const win = window.open("", "_blank", "width=420,height=650");
    if (!win) { Toast.error("Trình duyệt chặn popup. Vui lòng cho phép!"); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  },

  // ── HELPER: MỞ/ĐÓNG MODAL ────────────────────────────
  _openModal(id) {
    document.getElementById(id)?.classList.add("show");
  },
  _closeModal(id) {
    document.getElementById(id)?.classList.remove("show");
  },
};
