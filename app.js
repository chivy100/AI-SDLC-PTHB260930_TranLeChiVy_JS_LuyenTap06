/**
 * ==============================================================================
 * HABIT TRACKER - ỨNG DỤNG THEO DÕI THÓI QUEN HÀNG NGÀY
 * BTVN JavaScript Cơ bản (AI-Driven) - Đề 06
 * Tác giả: Trần Lê Chí Vỹ (chivy100)
 * Lớp: AI-SDLC-PTHB260930
 * ==============================================================================
 */

// ==============================================================================
// 4.1. KHAI BÁO DỮ LIỆU VÀ HẰNG SỐ HỆ THỐNG
// ==============================================================================

/**
 * Số ngày hiển thị trên lưới theo dõi (7 ngày gần nhất)
 * @type {number}
 */
const SO_NGAY = 7;

/**
 * Khóa lưu trữ dữ liệu trong localStorage
 * @type {string}
 */
const STORAGE_KEY = "habits";

/**
 * Danh sách thói quen
 * Mỗi phần tử là một object: { id, ten, mau, mucTieuTuan, ngayHoanThanh: [] }
 * @type {Array<Object>}
 */
let habits = [];

/**
 * Chế độ sắp xếp hiển thị ("streak": giảm dần theo streak, "ten": tăng dần A-Z)
 * @type {string}
 */
let sortMode = "streak";

/**
 * Trạng thái bộ lọc: chỉ hiển thị thói quen chưa làm hôm nay
 * @type {boolean}
 */
let chiChuaLam = false;

// ==============================================================================
// 4.9. CÁC HÀM TIỆN ÍCH DÙNG CHUNG (LƯU TRỮ, XỬ LÝ NGÀY, TÍNH TOÁN)
// ==============================================================================

/**
 * Lưu mảng habits vào localStorage dưới dạng chuỗi JSON
 */
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu vào localStorage:", error);
    hienThiToast("Không thể lưu dữ liệu vào bộ nhớ trình duyệt", "error");
  }
}

/**
 * Đọc dữ liệu từ localStorage và gán vào mảng habits
 * @returns {Array<Object>}
 */
function loadData() {
  try {
    const dataString = localStorage.getItem(STORAGE_KEY);
    if (!dataString) {
      return [];
    }
    const parsedData = JSON.parse(dataString);
    if (Array.isArray(parsedData)) {
      return parsedData;
    }
    return [];
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu từ localStorage:", error);
    return [];
  }
}

/**
 * Trả về chuỗi ngày dạng YYYY-MM-DD tương ứng với số ngày trước tính từ hôm nay
 * @param {number} soNgayTruoc - 0 là hôm nay, 1 là hôm qua, ...
 * @returns {string} Chuỗi ngày định dạng YYYY-MM-DD
 */
function layNgay(soNgayTruoc = 0) {
  const d = new Date();
  d.setDate(d.getDate() - soNgayTruoc);
  const nam = d.getFullYear();
  const thang = String(d.getMonth() + 1).padStart(2, "0");
  const ngay = String(d.getDate()).padStart(2, "0");
  return `${nam}-${thang}-${ngay}`;
}

/**
 * Trả về thông tin thứ và ngày trong tháng phục vụ tạo tiêu đề cột
 * @param {number} soNgayTruoc 
 * @returns {Object} { thu, ngay, label, ngayStr, laHomNay }
 */
function layThongTinNgay(soNgayTruoc = 0) {
  const d = new Date();
  d.setDate(d.getDate() - soNgayTruoc);
  const thuArr = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const thu = thuArr[d.getDay()];
  const ngay = d.getDate();
  return {
    thu: thu,
    ngay: ngay,
    label: `${thu} ${ngay}`,
    ngayStr: layNgay(soNgayTruoc),
    laHomNay: soNgayTruoc === 0
  };
}

/**
 * Tính số ngày liên tiếp hoàn thành (Streak) của một thói quen
 * Quy tắc:
 * - Đếm lùi từ hôm nay nếu hôm nay đã tích
 * - Nếu hôm nay chưa tích thì đếm lùi từ hôm qua
 * @param {Object} habit - Đối tượng thói quen
 * @returns {number} Số ngày streak liên tiếp
 */
function tinhStreak(habit) {
  if (!habit || !Array.isArray(habit.ngayHoanThanh) || habit.ngayHoanThanh.length === 0) {
    return 0;
  }

  const homNayStr = layNgay(0);
  const daLamHomNay = habit.ngayHoanThanh.includes(homNayStr);

  // Nếu hôm nay đã làm: bắt đầu đếm từ hôm nay (offset = 0)
  // Nếu hôm nay chưa làm: bắt đầu đếm từ hôm qua (offset = 1)
  let offset = daLamHomNay ? 0 : 1;
  let streak = 0;

  while (true) {
    const ngayKiemTra = layNgay(offset);
    if (habit.ngayHoanThanh.includes(ngayKiemTra)) {
      streak++;
      offset++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Tính tỉ lệ hoàn thành mục tiêu tuần của một thói quen trong 7 ngày gần nhất
 * Quy tắc: số ngày đã tích trong 7 ngày gần nhất / mục tiêu tuần × 100, làm tròn số nguyên, tối đa 100%
 * @param {Object} habit 
 * @returns {number} Tỉ lệ phần trăm hoàn thành (0 - 100)
 */
function tinhTiLeTuan(habit) {
  if (!habit || !habit.mucTieuTuan || habit.mucTieuTuan <= 0) {
    return 0;
  }

  let soNgayDaTich = 0;
  for (let i = 0; i < SO_NGAY; i++) {
    const ngay = layNgay(i);
    if (habit.ngayHoanThanh && habit.ngayHoanThanh.includes(ngay)) {
      soNgayDaTich++;
    }
  }

  const tiLe = Math.round((soNgayDaTich / habit.mucTieuTuan) * 100);
  return Math.min(100, tiLe);
}

/**
 * Hàm kiểm tra dữ liệu dùng chung cho cả Thêm và Sửa thói quen
 * @param {string} ten - Tên thói quen
 * @param {number|string} mucTieuTuan - Mục tiêu số ngày/tuần
 * @param {number|null} idHienTai - ID thói quen đang sửa (null nếu là thêm mới)
 * @returns {Object} { hopLe: boolean, loiTen: string, loiMucTieu: string }
 */
function kiemTraDuLieu(ten, mucTieuTuan, idHienTai = null) {
  const ketQua = {
    hopLe: true,
    loiTen: "",
    loiMucTieu: ""
  };

  const tenTrim = (ten || "").trim();

  // Kiểm tra tên rỗng
  if (tenTrim.length === 0) {
    ketQua.hopLe = false;
    ketQua.loiTen = "Tên thói quen không được để trống";
  } else if (tenTrim.length > 40) {
    // Kiểm tra tên quá 40 ký tự
    ketQua.hopLe = false;
    ketQua.loiTen = "Tên thói quen tối đa 40 ký tự";
  } else {
    // Kiểm tra tên trùng (không phân biệt hoa thường, không tính chính thói quen đang sửa)
    const tenDaTonTai = habits.some(h => {
      if (idHienTai !== null && h.id === Number(idHienTai)) {
        return false;
      }
      return h.ten.trim().toLowerCase() === tenTrim.toLowerCase();
    });

    if (tenDaTonTai) {
      ketQua.hopLe = false;
      ketQua.loiTen = "Thói quen đã tồn tại";
    }
  }

  // Kiểm tra mục tiêu tuần: phải là số nguyên từ 1 đến 7
  const mucTieuNum = Number(mucTieuTuan);
  if (
    mucTieuTuan === "" || 
    mucTieuTuan === null || 
    isNaN(mucTieuNum) || 
    !Number.isInteger(mucTieuNum) || 
    mucTieuNum < 1 || 
    mucTieuNum > 7
  ) {
    ketQua.hopLe = false;
    ketQua.loiMucTieu = "Mục tiêu phải từ 1 đến 7 ngày";
  }

  return ketQua;
}

/**
 * Hiển thị thông báo Toast góc màn hình
 * @param {string} message 
 * @param {string} type - "success" | "error" | "info"
 */
function hienThiToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "✅";
  if (type === "error") icon = "❌";
  else if (type === "info") icon = "ℹ️";

  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  // Tự động gỡ sau khi hết animation (3 giây)
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 3000);
}

/**
 * Hiển thị thông báo inline tại form
 * @param {HTMLElement} element 
 * @param {string} message 
 * @param {string} type - "success" | "error"
 */
function hienThiThongBaoForm(element, message, type = "success") {
  if (!element) return;
  element.className = `form-alert ${type}`;
  element.textContent = message;
  element.style.display = "flex";

  setTimeout(() => {
    element.style.display = "none";
  }, 3500);
}

// ==============================================================================
// 4.3. CHỨC NĂNG 1: THÊM THÓI QUEN MỚI
// ==============================================================================

/**
 * Xử lý thêm thói quen mới từ form
 * @param {Event} e 
 */
function themThoiQuen(e) {
  if (e) e.preventDefault();

  const inputTen = document.getElementById("tenThoiQuen");
  const inputMau = document.getElementById("mauThoiQuen");
  const inputMucTieu = document.getElementById("mucTieuTuan");
  const loiTen = document.getElementById("loiTenThoiQuen");
  const loiMucTieu = document.getElementById("loiMucTieu");
  const thongBaoForm = document.getElementById("thongBaoForm");

  // Xóa các thông báo lỗi cũ
  if (loiTen) loiTen.textContent = "";
  if (loiMucTieu) loiMucTieu.textContent = "";

  const ten = inputTen.value;
  const mau = inputMau.value || "#6366f1";
  const mucTieu = inputMucTieu.value;

  // Gọi hàm kiểm tra dữ liệu dùng chung
  const kiemTra = kiemTraDuLieu(ten, mucTieu, null);

  if (!kiemTra.hopLe) {
    if (loiTen && kiemTra.loiTen) {
      loiTen.textContent = kiemTra.loiTen;
    }
    if (loiMucTieu && kiemTra.loiMucTieu) {
      loiMucTieu.textContent = kiemTra.loiMucTieu;
    }
    return;
  }

  // Tạo đối tượng thói quen mới
  const thoiQuenMoi = {
    id: Date.now(),
    ten: ten.trim(),
    mau: mau,
    mucTieuTuan: parseInt(mucTieu, 10),
    ngayHoanThanh: [] // Mảng rỗng ban đầu
  };

  // Thêm vào mảng
  habits.push(thoiQuenMoi);

  // Xóa trắng form và đặt lại giá trị mặc định
  inputTen.value = "";
  inputMau.value = "#6366f1";
  document.getElementById("mauPreview").style.backgroundColor = "#6366f1";
  inputMucTieu.value = "5";

  // Hiển thị thông báo thành công
  hienThiThongBaoForm(thongBaoForm, "Thêm thói quen thành công", "success");
  hienThiToast("Thêm thói quen thành công!", "success");

  // Lưu vào localStorage và vẽ lại giao diện
  saveData();
  render();
}

// ==============================================================================
// 4.4. CHỨC NĂNG 2: HIỂN THỊ LƯỚI 7 NGÀY GẦN NHẤT
// ==============================================================================

/**
 * Sinh danh sách 7 ngày gần nhất (hôm nay ở cuối cùng)
 * @returns {Array<Object>}
 */
function layDanhSach7Ngay() {
  const cotNgay = [];
  // Duyệt từ SO_NGAY - 1 (6 ngày trước) về 0 (hôm nay)
  for (let i = SO_NGAY - 1; i >= 0; i--) {
    cotNgay.push(layThongTinNgay(i));
  }
  return cotNgay;
}

/**
 * Vẽ tiêu đề các cột của bảng thói quen
 * 7 cột ngày gần nhất được tạo bằng vòng lặp, tiêu đề dạng "T2 26", hôm nay được tô nổi bật
 */
function renderTieuDeLoi() {
  const hangTieuDe = document.getElementById("hangTieuDeLoi");
  if (!hangTieuDe) return;

  const danhSach7Ngay = layDanhSach7Ngay();

  let html = `
    <th class="col-thoi-quen">Thói quen</th>
  `;

  // Vòng lặp tạo 7 cột ngày gần nhất
  danhSach7Ngay.forEach(ngayInfo => {
    const classHomNay = ngayInfo.laHomNay ? "col-hom-nay" : "";
    const tooltipText = ngayInfo.laHomNay ? "Hôm nay" : ngayInfo.ngayStr;

    html += `
      <th class="col-ngay ${classHomNay}" title="${tooltipText}">
        <div class="date-header-cell">
          <span class="date-header-thu">${ngayInfo.thu}</span>
          <span class="date-header-ngay">${ngayInfo.ngay}</span>
        </div>
      </th>
    `;
  });

  html += `
    <th class="col-thong-so">Tiến độ & Streak</th>
  `;

  hangTieuDe.innerHTML = html;
}

// ==============================================================================
// 4.5. CHỨC NĂNG 3: TÍCH NGÀY VÀ SỬA THÓI QUEN
// ==============================================================================

/**
 * Tích hoặc bỏ tích ngày hoàn thành của thói quen
 * Sử dụng includes, push, filter và lưu ngay
 * @param {number} id - Mã thói quen
 * @param {string} ngayStr - Chuỗi ngày YYYY-MM-DD
 */
function toggleNgay(id, ngayStr) {
  // Không cho phép tích ngày tương lai
  const homNayStr = layNgay(0);
  if (ngayStr > homNayStr) {
    hienThiToast("Không thể đánh dấu ngày trong tương lai", "error");
    return;
  }

  const thoiQuen = habits.find(h => h.id === Number(id));
  if (!thoiQuen) return;

  if (!Array.isArray(thoiQuen.ngayHoanThanh)) {
    thoiQuen.ngayHoanThanh = [];
  }

  // Nếu ngày đó đã có trong ngayHoanThanh thì bỏ ra (dùng filter)
  // Chưa có thì thêm vào (dùng push)
  if (thoiQuen.ngayHoanThanh.includes(ngayStr)) {
    thoiQuen.ngayHoanThanh = thoiQuen.ngayHoanThanh.filter(d => d !== ngayStr);
  } else {
    thoiQuen.ngayHoanThanh.push(ngayStr);
  }

  // Lưu ngay vào localStorage
  saveData();

  // Streak, tỉ lệ tuần và thống kê cập nhật ngay
  render();
}

/**
 * Mở modal chỉnh sửa thói quen và điền sẵn dữ liệu hiện tại
 * @param {number} id 
 */
function moModalSua(id) {
  const thoiQuen = habits.find(h => h.id === Number(id));
  if (!thoiQuen) return;

  const modal = document.getElementById("modalSua");
  const inputId = document.getElementById("suaId");
  const inputTen = document.getElementById("suaTenThoiQuen");
  const inputMau = document.getElementById("suaMauThoiQuen");
  const previewMau = document.getElementById("suaMauPreview");
  const inputMucTieu = document.getElementById("suaMucTieuTuan");
  const loiTen = document.getElementById("loiSuaTen");
  const loiMucTieu = document.getElementById("loiSuaMucTieu");
  const thongBao = document.getElementById("thongBaoModal");

  // Xóa các lỗi cũ
  if (loiTen) loiTen.textContent = "";
  if (loiMucTieu) loiMucTieu.textContent = "";
  if (thongBao) thongBao.style.display = "none";

  // Điền thông tin thói quen
  inputId.value = thoiQuen.id;
  inputTen.value = thoiQuen.ten;
  inputMau.value = thoiQuen.mau;
  previewMau.style.backgroundColor = thoiQuen.mau;
  inputMucTieu.value = thoiQuen.mucTieuTuan;

  modal.style.display = "flex";
  inputTen.focus();
}

/**
 * Đóng modal chỉnh sửa
 */
function dongModalSua() {
  const modal = document.getElementById("modalSua");
  if (modal) modal.style.display = "none";
}

/**
 * Xử lý lưu thông tin thói quen sau khi sửa
 * @param {Event} e 
 */
function xuLyLuuSuaThoiQuen(e) {
  if (e) e.preventDefault();

  const id = Number(document.getElementById("suaId").value);
  const ten = document.getElementById("suaTenThoiQuen").value;
  const mau = document.getElementById("suaMauThoiQuen").value;
  const mucTieu = document.getElementById("suaMucTieuTuan").value;
  const loiTen = document.getElementById("loiSuaTen");
  const loiMucTieu = document.getElementById("loiSuaMucTieu");

  if (loiTen) loiTen.textContent = "";
  if (loiMucTieu) loiMucTieu.textContent = "";

  // Dùng hàm kiểm tra dữ liệu dùng chung (truyền ID để bỏ qua trùng tên với chính nó)
  const kiemTra = kiemTraDuLieu(ten, mucTieu, id);

  if (!kiemTra.hopLe) {
    if (loiTen && kiemTra.loiTen) loiTen.textContent = kiemTra.loiTen;
    if (loiMucTieu && kiemTra.loiMucTieu) loiMucTieu.textContent = kiemTra.loiMucTieu;
    return;
  }

  // Tìm thói quen và cập nhật (giữ nguyên id và ngayHoanThanh)
  const thoiQuen = habits.find(h => h.id === id);
  if (thoiQuen) {
    thoiQuen.ten = ten.trim();
    thoiQuen.mau = mau;
    thoiQuen.mucTieuTuan = parseInt(mucTieu, 10);

    dongModalSua();
    hienThiToast("Cập nhật thành công", "success");
    saveData();
    render();
  }
}

// ==============================================================================
// 4.6. CHỨC NĂNG 4: XÓA THÓI QUEN
// ==============================================================================

/**
 * Xóa thói quen sau khi người dùng xác nhận bằng confirm()
 * Quy tắc: Bấm "Xóa": hỏi "Xóa thói quen [tên] và toàn bộ lịch sử?"; đồng ý thì xóa
 * @param {number} id 
 */
function xoaThoiQuen(id) {
  const thoiQuen = habits.find(h => h.id === Number(id));
  if (!thoiQuen) return;

  // Yêu cầu: Riêng thao tác xóa được dùng confirm() để hỏi xác nhận
  const xacNhan = confirm(`Xóa thói quen ${thoiQuen.ten} và toàn bộ lịch sử?`);
  if (!xacNhan) return;

  // Xóa đúng thói quen và lịch sử của nó; các thói quen còn lại giữ nguyên
  habits = habits.filter(h => h.id !== Number(id));

  // Hiện "Xóa thành công" và lưu localStorage
  hienThiToast("Xóa thành công", "success");
  saveData();
  render();
}

// ==============================================================================
// 4.7. CHỨC NĂNG 5: SẮP XẾP VÀ LỌC THÓI QUEN
// ==============================================================================

/**
 * Xử lý lọc và sắp xếp thói quen mà không làm thay đổi thứ tự lưu trong localStorage
 * @param {Array<Object>} danhSachGoc 
 * @returns {Array<Object>} Danh sách đã lọc và sắp xếp
 */
function xuLySapXepVaLoc(danhSachGoc) {
  // Tạo bản sao để không thay đổi thứ tự gốc
  let danhSach = [...danhSachGoc];

  // 1. Lọc: "Chỉ thói quen chưa làm hôm nay"
  if (chiChuaLam) {
    const homNayStr = layNgay(0);
    danhSach = danhSach.filter(h => !h.ngayHoanThanh || !h.ngayHoanThanh.includes(homNayStr));
  }

  // 2. Sắp xếp
  if (sortMode === "streak") {
    // Sắp xếp theo streak giảm dần
    danhSach.sort((a, b) => tinhStreak(b) - tinhStreak(a));
  } else if (sortMode === "ten") {
    // Sắp xếp theo tên A-Z (tiếng Việt chuẩn)
    danhSach.sort((a, b) => a.ten.localeCompare(b.ten, "vi", { sensitivity: "base" }));
  }

  return danhSach;
}

// ==============================================================================
// 4.8. CHỨC NĂNG 6: THỐNG KÊ TỔNG QUAN
// ==============================================================================

/**
 * Cập nhật số liệu thống kê:
 * - Số thói quen đã làm hôm nay / tổng số thói quen
 * - Thói quen có streak dài nhất (nếu bằng nhau lấy thói quen đứng trước trong danh sách)
 */
function capNhatThongKe() {
  const statHomNay = document.getElementById("statHomNay");
  const statTiLeHomNay = document.getElementById("statTiLeHomNay");
  const statStreakDaiNhat = document.getElementById("statStreakDaiNhat");

  const tongSo = habits.length;
  const homNayStr = layNgay(0);

  // Đếm số thói quen đã hoàn thành hôm nay
  const daLamHomNay = habits.filter(h => h.ngayHoanThanh && h.ngayHoanThanh.includes(homNayStr)).length;

  if (statHomNay) {
    statHomNay.textContent = `${daLamHomNay}/${tongSo} thói quen`;
  }

  if (statTiLeHomNay) {
    const phanTramHomNay = tongSo > 0 ? Math.round((daLamHomNay / tongSo) * 100) : 0;
    statTiLeHomNay.textContent = `(${phanTramHomNay}%)`;
  }

  // Tìm thói quen có streak dài nhất (duyệt theo thứ tự mảng gốc để nếu bằng nhau, lấy thói quen đứng trước)
  if (statStreakDaiNhat) {
    if (tongSo === 0) {
      statStreakDaiNhat.textContent = "Chưa có";
    } else {
      let maxStreak = -1;
      let thoiQuenStreakMax = null;

      for (let i = 0; i < habits.length; i++) {
        const h = habits[i];
        const s = tinhStreak(h);
        if (s > maxStreak) {
          maxStreak = s;
          thoiQuenStreakMax = h;
        }
      }

      if (thoiQuenStreakMax && maxStreak > 0) {
        statStreakDaiNhat.textContent = `${thoiQuenStreakMax.ten} (${maxStreak} ngày)`;
      } else if (thoiQuenStreakMax) {
        statStreakDaiNhat.textContent = `${thoiQuenStreakMax.ten} (0 ngày)`;
      } else {
        statStreakDaiNhat.textContent = "Chưa có";
      }
    }
  }
}

// ==============================================================================
// 4.9. HÀM RENDER DÙNG CHUNG
// ==============================================================================

/**
 * Hàm vẽ lại toàn bộ giao diện từ dữ liệu hiện tại
 * Gọi lại sau mọi thao tác thêm, sửa, xóa, lọc, sắp xếp, tích ngày
 */
function render() {
  // 1. Vẽ tiêu đề cột 7 ngày
  renderTieuDeLoi();

  const thanBang = document.getElementById("thanBangThoiQuen");
  const thongBaoRong = document.getElementById("thongBaoRong");
  const emptyIcon = document.getElementById("emptyStateIcon");
  const emptyText = document.getElementById("emptyStateText");
  const bangThoiQuen = document.getElementById("bangThoiQuen");

  if (!thanBang) return;

  const danhSach7Ngay = layDanhSach7Ngay();

  // Áp dụng lọc và sắp xếp
  const danhSachHienThi = xuLySapXepVaLoc(habits);

  // Xử lý trạng thái rỗng hoặc hoàn thành hết
  if (habits.length === 0) {
    // Chưa có thói quen nào: hiện "Hãy thêm thói quen đầu tiên"
    bangThoiQuen.style.display = "none";
    thongBaoRong.style.display = "flex";
    emptyIcon.textContent = "🌱";
    emptyText.textContent = "Hãy thêm thói quen đầu tiên";
  } else if (danhSachHienThi.length === 0 && chiChuaLam) {
    // Đã làm hết thói quen hôm nay: hiện "Tuyệt vời! Bạn đã hoàn thành mọi thói quen hôm nay"
    bangThoiQuen.style.display = "none";
    thongBaoRong.style.display = "flex";
    emptyIcon.textContent = "🎉";
    emptyText.textContent = "Tuyệt vời! Bạn đã hoàn thành mọi thói quen hôm nay";
  } else {
    bangThoiQuen.style.display = "table";
    thongBaoRong.style.display = "none";

    let rowsHtml = "";

    danhSachHienThi.forEach(habit => {
      const streak = tinhStreak(habit);
      const tiLeTuan = tinhTiLeTuan(habit);

      // Thói quen có streak từ 7 trở lên được gắn nhãn "Chuỗi 7 ngày"
      const huyHieuStreak7 = streak >= 7 
        ? `<span class="badge-streak-7" title="Đạt chuỗi từ 7 ngày liên tiếp!">⭐ Chuỗi 7 ngày</span>` 
        : "";

      rowsHtml += `
        <tr class="habit-row" data-id="${habit.id}">
          <!-- Cột thông tin thói quen -->
          <td class="col-thoi-quen">
            <div class="habit-info-cell">
              <span class="habit-color-indicator" style="background-color: ${habit.mau};"></span>
              <div class="habit-text-wrap">
                <div class="habit-title">
                  <span>${habit.ten}</span>
                  ${huyHieuStreak7}
                </div>
                <div class="habit-meta-sub">
                  <span>Mục tiêu: ${habit.mucTieuTuan} ngày/tuần</span>
                </div>
                <div class="habit-actions">
                  <button type="button" class="btn btn-action-edit" onclick="moModalSua(${habit.id})" title="Chỉnh sửa thói quen">
                    ✏️ Sửa
                  </button>
                  <button type="button" class="btn btn-action-delete" onclick="xoaThoiQuen(${habit.id})" title="Xóa thói quen">
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            </div>
          </td>
      `;

      // 7 cột ô tích ngày
      danhSach7Ngay.forEach(ngayInfo => {
        const daHoanThanh = habit.ngayHoanThanh && habit.ngayHoanThanh.includes(ngayInfo.ngayStr);
        const classHomNay = ngayInfo.laHomNay ? "col-hom-nay" : "";
        const styleCompleted = daHoanThanh 
          ? `background-color: ${habit.mau}; border-color: ${habit.mau}; color: #ffffff;` 
          : "";

        rowsHtml += `
          <td class="col-ngay day-cell ${classHomNay}">
            <button 
              type="button" 
              class="day-btn ${daHoanThanh ? 'completed' : ''}" 
              style="${styleCompleted}"
              onclick="toggleNgay(${habit.id}, '${ngayInfo.ngayStr}')"
              title="${ngayInfo.label} - ${daHoanThanh ? 'Đã hoàn thành (Bấm để hủy)' : 'Chưa hoàn thành (Bấm để đánh dấu)'}"
              aria-label="${habit.ten} ngày ${ngayInfo.label}"
            >
              ${daHoanThanh ? '✓' : ''}
            </button>
          </td>
        `;
      });

      // Cột tiến độ tuần và Streak
      rowsHtml += `
          <td class="col-thong-so">
            <div class="stats-cell-content">
              <div class="stat-streak-badge">
                <span class="fire-icon">🔥</span>
                <span>Streak ${streak}</span>
              </div>
              <div class="rate-progress-wrapper" title="Hoàn thành ${tiLeTuan}% mục tiêu tuần">
                <div class="rate-progress-bar">
                  <div class="rate-progress-fill" style="width: ${tiLeTuan}%;"></div>
                </div>
                <span class="rate-percentage">${tiLeTuan}%</span>
              </div>
            </div>
          </td>
        </tr>
      `;
    });

    thanBang.innerHTML = rowsHtml;
  }

  // Cập nhật vùng thống kê
  capNhatThongKe();
}

// ==============================================================================
// KHỞI TẠO SỰ KIỆN VÀ CHẠY ỨNG DỤNG KHI TẢI TRANG
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Đọc dữ liệu từ localStorage
  habits = loadData();

  // 2. Gán sự kiện cho Form Thêm thói quen
  const formThoiQuen = document.getElementById("formThoiQuen");
  if (formThoiQuen) {
    formThoiQuen.addEventListener("submit", themThoiQuen);
  }

  // Xem trước màu khi đổi mã màu
  const inputMau = document.getElementById("mauThoiQuen");
  const mauPreview = document.getElementById("mauPreview");
  if (inputMau && mauPreview) {
    inputMau.addEventListener("input", (e) => {
      mauPreview.style.backgroundColor = e.target.value;
    });
  }

  const suaMauInput = document.getElementById("suaMauThoiQuen");
  const suaMauPreview = document.getElementById("suaMauPreview");
  if (suaMauInput && suaMauPreview) {
    suaMauInput.addEventListener("input", (e) => {
      suaMauPreview.style.backgroundColor = e.target.value;
    });
  }

  // Tự động xóa lỗi khi người dùng gõ
  const inputTen = document.getElementById("tenThoiQuen");
  const loiTen = document.getElementById("loiTenThoiQuen");
  if (inputTen && loiTen) {
    inputTen.addEventListener("input", () => {
      loiTen.textContent = "";
    });
  }

  const inputMucTieu = document.getElementById("mucTieuTuan");
  const loiMucTieu = document.getElementById("loiMucTieu");
  if (inputMucTieu && loiMucTieu) {
    inputMucTieu.addEventListener("input", () => {
      loiMucTieu.textContent = "";
    });
  }

  const suaTenInput = document.getElementById("suaTenThoiQuen");
  const loiSuaTen = document.getElementById("loiSuaTen");
  if (suaTenInput && loiSuaTen) {
    suaTenInput.addEventListener("input", () => {
      loiSuaTen.textContent = "";
    });
  }

  const suaMucTieuInput = document.getElementById("suaMucTieuTuan");
  const loiSuaMucTieu = document.getElementById("loiSuaMucTieu");
  if (suaMucTieuInput && loiSuaMucTieu) {
    suaMucTieuInput.addEventListener("input", () => {
      loiSuaMucTieu.textContent = "";
    });
  }

  // 3. Gán sự kiện Sắp xếp
  const selectSapXep = document.getElementById("selectSapXep");
  if (selectSapXep) {
    selectSapXep.value = sortMode;
    selectSapXep.addEventListener("change", (e) => {
      sortMode = e.target.value;
      render();
    });
  }

  // 4. Gán sự kiện Lọc "Chỉ thói quen chưa làm hôm nay"
  const checkChuaLam = document.getElementById("checkChuaLam");
  if (checkChuaLam) {
    checkChuaLam.checked = chiChuaLam;
    checkChuaLam.addEventListener("change", (e) => {
      chiChuaLam = e.target.checked;
      render();
    });
  }

  // 5. Gán sự kiện cho Modal Sửa
  const formSua = document.getElementById("formSuaThoiQuen");
  if (formSua) {
    formSua.addEventListener("submit", xuLyLuuSuaThoiQuen);
  }

  const btnDongModal = document.getElementById("btnDongModal");
  if (btnDongModal) {
    btnDongModal.addEventListener("click", dongModalSua);
  }

  const btnHuySua = document.getElementById("btnHuySua");
  if (btnHuySua) {
    btnHuySua.addEventListener("click", dongModalSua);
  }

  // Đóng modal khi bấm ra ngoài vùng nội dung
  const modalSua = document.getElementById("modalSua");
  if (modalSua) {
    modalSua.addEventListener("click", (e) => {
      if (e.target === modalSua) {
        dongModalSua();
      }
    });
  }

  // Đóng modal bằng phím ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dongModalSua();
    }
  });

  // 6. Vẽ giao diện lần đầu tiên
  render();
});
