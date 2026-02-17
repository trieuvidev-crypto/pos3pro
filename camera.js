/**
 * camera.js
 * ─────────────────────────────────────────────────────
 * Chụp ảnh bill bằng WebRTC camera
 * ─────────────────────────────────────────────────────
 */

const Camera = {

  _stream   : null,   // MediaStream hiện tại
  _snapshot : null,   // dataUrl ảnh đã chụp

  // ── MỞ MODAL CAMERA ──────────────────────────────────
  async open() {
    this._snapshot = null;
    this._showStage("stage-live");
    document.getElementById("modal-camera").classList.add("show");

    // Xoá ảnh cũ
    const preview = document.getElementById("cam-preview");
    preview.src = "";

    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
      });
      const video = document.getElementById("cam-video");
      video.srcObject = this._stream;
    } catch (err) {
      this._showError("Không thể mở camera: " + err.message);
    }
  },

  // ── CHỤP ẢNH ─────────────────────────────────────────
  shoot() {
    const video  = document.getElementById("cam-video");
    const canvas = document.getElementById("cam-canvas");
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d").drawImage(video, 0, 0);

    this._snapshot = canvas.toDataURL("image/jpeg", 0.88);

    // Hiện preview
    document.getElementById("cam-preview").src = this._snapshot;
    this._showStage("stage-preview");

    // Tắt camera
    this._stopStream();
  },

  // ── CHỤP LẠI ─────────────────────────────────────────
  async retake() {
    this._snapshot = null;
    this._showStage("stage-live");
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      document.getElementById("cam-video").srcObject = this._stream;
    } catch (err) {
      this._showError("Không mở lại camera được: " + err.message);
    }
  },

  // ── TẢI ẢNH VỀ MÁY ────────────────────────────────────
  download() {
    if (!this._snapshot) return;
    downloadImage(this._snapshot, billFilename(Order.tableId || "?"));
    Toast.success("Đã tải ảnh về máy!");
  },

  // ── LƯU VÀO HỆ THỐNG ─────────────────────────────────
  saveToSystem() {
    if (!this._snapshot) return;
    Order.addBillImage(this._snapshot);
    Toast.success("Đã lưu ảnh bill vào hệ thống!");
    this.close();
  },

  // ── ĐÓNG MODAL ────────────────────────────────────────
  close() {
    this._stopStream();
    document.getElementById("modal-camera").classList.remove("show");
    this._snapshot = null;
  },

  // ── CHUYỂN STAGE ─────────────────────────────────────
  _showStage(stageId) {
    ["stage-live", "stage-preview", "stage-error"].forEach(id => {
      document.getElementById(id)?.classList.toggle("show", id === stageId);
    });
  },

  // ── HIỆN LỖI ─────────────────────────────────────────
  _showError(msg) {
    document.getElementById("cam-error-msg").textContent = msg;
    this._showStage("stage-error");
  },

  // ── DỪNG STREAM ──────────────────────────────────────
  _stopStream() {
    if (this._stream) {
      this._stream.getTracks().forEach(t => t.stop());
      this._stream = null;
    }
  },
};
