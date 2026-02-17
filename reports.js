/**
 * reports.js
 * ─────────────────────────────────────────────────────
 * Báo cáo doanh thu, lịch sử order
 * ─────────────────────────────────────────────────────
 */

const Reports = {

  // ── TÍNH DOANH THU THEO KHOẢNG THỜI GIAN ──────────────
  getRevenue(period = "day") {
    const paidOrders = DB.getOrders().filter(o => o.status === "paid");
    const now        = new Date();
    const start      = new Date(now);

    if (period === "day") {
      start.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
    } else if (period === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }

    const filtered = paidOrders.filter(
      o => new Date(o.paidAt || o.updatedAt) >= start
    );

    // Tổng doanh thu
    const revenue = filtered.reduce((s, o) => s + o.total, 0);

    // Phân chia theo phương thức
    const byMethod = filtered.reduce((acc, o) => {
      const m = o.method || "cash";
      acc[m]  = (acc[m] || 0) + o.total;
      return acc;
    }, {});

    // Top món bán chạy
    const itemCount = {};
    filtered.forEach(o => {
      o.items?.forEach(it => {
        itemCount[it.name] = (itemCount[it.name] || 0) + it.qty;
      });
    });
    const topItems = Object.entries(itemCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      revenue,
      count   : filtered.length,
      avgOrder: filtered.length ? Math.round(revenue / filtered.length) : 0,
      byMethod,
      topItems,
      period,
    };
  },

  // ── LỊCH SỬ THEO NGÀY ────────────────────────────────
  getHistory(dateISO) {
    return DB.getOrders()
      .filter(o => {
        if (o.status !== "paid") return false;
        const d = new Date(o.paidAt || o.updatedAt).toISOString().slice(0, 10);
        return d === dateISO;
      })
      .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
  },

  // ── TỔNG QUAN NHANH (cho header) ─────────────────────
  getDaySummary() {
    const today = todayISO();
    const orders = DB.getOrders().filter(o => {
      if (o.status !== "paid") return false;
      return new Date(o.paidAt || o.updatedAt).toISOString().slice(0, 10) === today;
    });
    return {
      count  : orders.length,
      revenue: orders.reduce((s, o) => s + o.total, 0),
    };
  },
};
