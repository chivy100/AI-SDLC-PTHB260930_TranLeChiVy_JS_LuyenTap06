# NHẬT KÝ PROMPT AI-DRIVEN - BÀI LUYỆN TẬP 06: HABIT TRACKER

- **Họ và tên:** Trần Lê Chí Vỹ
- **Lớp:** AI-SDLC-PTHB260930
- **GitHub:** [chivy100 (Trần Lê Chí Vỹ)](https://github.com/chivy100)
- **Tên Repository:** `AI-SDLC-PTHB260930_TranLeChiVy_JS_LuyenTap06`
- **Thời gian thực hiện:** Tháng 10/2026
- **Công nghệ sử dụng:** HTML5, CSS3 (Vanilla), JavaScript (ES6+ Vanilla), LocalStorage API

---

## 📌 Tổng quan quy trình phát triển

Dự án được xây dựng theo phương pháp phát triển hướng dẫn bởi trí tuệ nhân tạo (AI-Driven Development), chia nhỏ bài toán thành các tính năng độc lập, kiểm tra ràng buộc chặt chẽ và tích hợp theo mô hình kiến trúc module hóa với các hàm dùng chung.

---

### Prompt 1: Khai báo cấu trúc dữ liệu và hằng số hệ thống (Mục 4.1)
```text
Hãy định nghĩa cấu trúc dữ liệu JavaScript cho ứng dụng Habit Tracker theo các yêu cầu sau:
1. Mỗi thói quen là một object gồm 5 thuộc tính:
   - id: number (sinh bằng Date.now(), duy nhất)
   - ten: string (tối đa 40 ký tự, không rỗng, duy nhất không phân biệt hoa thường)
   - mau: string (mã màu hex #RRGGBB từ ô chọn màu)
   - mucTieuTuan: number (số nguyên từ 1 đến 7 ngày/tuần)
   - ngayHoanThanh: array các chuỗi ngày định dạng YYYY-MM-DD, không trùng lặp, không chứa ngày tương lai
2. Khai báo mảng toàn cục habits = [], hằng số SO_NGAY = 7, hằng số STORAGE_KEY = "habits".
3. Khai báo biến trạng thái sortMode = "streak" (chế độ sắp xếp) và chiChuaLam = false (trạng thái lọc thói quen chưa làm hôm nay).
Hãy viết code rõ ràng kèm JSDoc giải thích từng thuộc tính.
```

---

### Prompt 2: Xây dựng cấu trúc HTML ngữ nghĩa và giao diện CSS hiện đại, Responsive (Mục 4.2)
```text
Hãy tạo file index.html và style.css cho ứng dụng Habit Tracker đáp ứng các tiêu chuẩn thẩm mỹ cao cấp:
1. Bố cục gồm 4 vùng chính:
   - Vùng 1: Header và Form thêm thói quen mới (Ô nhập tên thói quen, ô chọn màu sắc, ô nhập mục tiêu tuần, nút Thêm).
   - Vùng 2: Thanh điều khiển (Dropdown Sắp xếp theo Streak giảm dần / Tên A-Z, Checkbox "Chỉ thói quen chưa làm hôm nay").
   - Vùng 3: Khung bảng/lưới 7 ngày gần nhất có khả năng cuộn ngang mượt mà trên thiết bị di động (min-width 375px), có vùng hiển thị trạng thái rỗng "Hãy thêm thói quen đầu tiên" và thông báo hoàn thành "Tuyệt vời! Bạn đã hoàn thành mọi thói quen hôm nay".
   - Vùng 4: Thanh thống kê tổng quan (Hôm nay: X/Y thói quen, Streak dài nhất).
2. Tích hợp Modal chỉnh sửa thói quen và Toast notification hiển thị thông báo.
3. CSS sử dụng phong cách Dark Slate hiện đại, font chữ Plus Jakarta Sans từ Google Fonts, bo góc mềm mại, hiệu ứng viền phát sáng (glow), bóng đổ sâu (shadow), micro-animations khi rê chuột và bấm nút.
4. Tuyệt đối không dùng thư viện hay CSS framework như Bootstrap, Tailwind hay jQuery.
```

---

### Prompt 3: Hiện thực Chức năng 1 - Thêm thói quen mới và kiểm tra tính hợp lệ (Mục 4.3 & 4.9)
```text
Hãy viết hàm kiemTraDuLieu(ten, mucTieuTuan, idHienTai) dùng chung cho cả Thêm và Sửa, và hàm themThoiQuen(e) trong JavaScript:
1. Ràng buộc kiểm tra:
   - Tên rỗng: báo lỗi "Tên thói quen không được để trống" dưới ô nhập.
   - Tên > 40 ký tự: báo lỗi "Tên thói quen tối đa 40 ký tự".
   - Tên đã tồn tại trong mảng habits (so sánh không phân biệt hoa thường, bỏ qua id đang sửa nếu có): báo "Thói quen đã tồn tại".
   - Mục tiêu tuần không phải số nguyên từ 1 đến 7: báo "Mục tiêu phải từ 1 đến 7 ngày".
2. Khi hợp lệ:
   - Tạo object thói quen mới với ngayHoanThanh: [].
   - Thêm vào mảng habits.
   - Xóa trắng form, khôi phục màu mặc định và mục tiêu mặc định.
   - Hiển thị thông báo "Thêm thói quen thành công" (inline và toast).
   - Lưu vào localStorage và gọi hàm render() cập nhật giao diện.
3. Không sử dụng alert() hay prompt().
```

---

### Prompt 4: Hiện thực Chức năng 2 - Hiển thị lưới 7 ngày gần nhất, tính Streak và Tỉ lệ tuần (Mục 4.4 & 4.9)
```text
Hãy viết các hàm xử lý hiển thị lưới 7 ngày gần nhất cho Habit Tracker:
1. Hàm layNgay(soNgayTruoc): trả về chuỗi ngày định dạng YYYY-MM-DD tính từ hôm nay.
2. Hàm layThongTinNgay(soNgayTruoc): trả về thứ (CN, T2..T7), ngày trong tháng, và kiểm tra laHomNay.
3. Hàm tinhStreak(habit):
   - Đếm số ngày liên tiếp hoàn thành tính lùi từ hôm nay nếu hôm nay đã tích.
   - Nếu hôm nay chưa tích thì đếm lùi bắt đầu từ hôm qua.
   - Trả về số nguyên streak.
4. Hàm tinhTiLeTuan(habit):
   - Tỉ lệ tuần = (số ngày đã tích trong 7 ngày gần nhất / mục tiêu tuần) * 100, làm tròn số nguyên, tối đa 100%.
5. Hàm renderTieuDeLoi(): tạo 7 cột ngày gần nhất bằng vòng lặp, tiêu đề dạng "T2 26", cột ngày hôm nay được tô nổi bật ở vị trí cuối cùng.
6. Mỗi hàng thói quen hiển thị màu sắc, tên, nút sửa/xóa, 7 ô tích ngày (tô màu theo thuộc tính mau của thói quen khi đã hoàn thành), và tiến độ streak cùng tỉ lệ tuần.
```

---

### Prompt 5: Hiện thực Chức năng 3 - Tích/bỏ tích ngày và Chỉnh sửa thói quen (Mục 4.5)
```text
Hãy hiện thực tính năng tương tác với ô ngày và sửa thói quen:
1. Hàm toggleNgay(id, ngayStr):
   - Tìm thói quen theo id.
   - Kiểm tra ngàyStr: nếu lớn hơn ngày hôm nay thì từ chối (không cho phép tích ngày tương lai).
   - Nếu ngayStr đã có trong ngayHoanThanh (dùng includes) thì loại bỏ (dùng filter).
   - Nếu chưa có thì thêm vào (dùng push).
   - Lưu vào localStorage ngay lập tức và render() lại để cập nhật streak, tỉ lệ tuần và thống kê ngay lập tức.
2. Hàm moModalSua(id) và xuLyLuuSuaThoiQuen(e):
   - Mở modal và nạp sẵn tên, màu, mục tiêu tuần hiện tại.
   - Khi bấm "Lưu thay đổi": kiểm tra hợp lệ bằng hàm kiemTraDuLieu(ten, mucTieuTuan, id).
   - Cập nhật thông tin mới, giữ nguyên id và toàn bộ mảng lịch sử ngayHoanThanh.
   - Đóng modal, hiển thị thông báo "Cập nhật thành công", lưu localStorage và gọi render().
```

---

### Prompt 6: Hiện thực Chức năng 4 - Xóa thói quen với hộp thoại xác nhận (Mục 4.6)
```text
Hãy viết hàm xoaThoiQuen(id) đáp ứng yêu cầu nghiệp vụ:
1. Khi người dùng bấm nút "Xóa":
   - Sử dụng hàm confirm() với thông điệp chính xác: "Xóa thói quen [tên] và toàn bộ lịch sử?".
   - Nếu người dùng bấm Hủy (Cancel): giữ nguyên dữ liệu, không thực hiện thao tác nào.
   - Nếu người dùng đồng ý (OK): xóa đúng thói quen đó khỏi mảng habits (dùng filter), toàn bộ các thói quen khác giữ nguyên vẹn.
2. Hiển thị thông báo "Xóa thành công".
3. Lưu mảng mới vào localStorage bằng saveData() và gọi render() để cập nhật lại bảng và thống kê.
```

---

### Prompt 7: Hiện thực Chức năng 5 - Sắp xếp và Lọc thói quen (Mục 4.7)
```text
Hãy viết hàm xuLySapXepVaLoc(danhSachGoc) để sắp xếp và lọc thói quen:
1. Nguyên tắc cốt lõi: Không làm thay đổi thứ tự lưu trữ gốc của mảng habits trong localStorage (tạo bản sao shallow copy bằng [...danhSachGoc] trước khi xử lý).
2. Tùy chọn lọc:
   - Nếu checkbox chiChuaLam = true: chỉ giữ lại những thói quen mà mảng ngayHoanThanh chưa chứa ngày hôm nay.
3. Tùy chọn sắp xếp:
   - sortMode === "streak": sắp xếp giảm dần theo số ngày streak (tinhStreak(b) - tinhStreak(a)).
   - sortMode === "ten": sắp xếp theo bảng chữ cái A-Z (localeCompare có hỗ trợ tiếng Việt).
4. Xử lý thông báo đặc biệt:
   - Khi danh sách gốc rỗng (chưa có thói quen nào): hiển thị "Hãy thêm thói quen đầu tiên".
   - Khi danh sách gốc có dữ liệu nhưng sau khi lọc "Chỉ thói quen chưa làm hôm nay" kết quả trả về 0 phần tử: hiển thị thông điệp "Tuyệt vời! Bạn đã hoàn thành mọi thói quen hôm nay".
```

---

### Prompt 8: Hiện thực Chức năng 6 - Thống kê tổng quan và Huy hiệu chuỗi (Mục 4.8)
```text
Hãy viết hàm capNhatThongKe() để tính toán và hiển thị vùng thống kê:
1. Thống kê hôm nay: Đếm số thói quen đã hoàn thành hôm nay trên tổng số thói quen, hiển thị dạng "Hôm nay: X/Y thói quen (Z%)".
2. Streak dài nhất:
   - Tìm thói quen có giá trị tinhStreak() lớn nhất.
   - Nếu có nhiều thói quen cùng đạt streak cao nhất, ưu tiên lấy thói quen xuất hiện trước trong mảng gốc habits.
   - Hiển thị dạng "Streak dài nhất: [Tên thói quen] (N ngày)". Nếu chưa có thói quen nào hoặc streak đều bằng 0 thì hiển thị tương ứng.
3. Huy hiệu chuỗi 7 ngày:
   - Trong hàm render(), nếu thói quen có streak >= 7, tự động gắn thêm huy hiệu nổi bật "⭐ Chuỗi 7 ngày" ngay cạnh tên thói quen.
```

---

### Prompt 9: Tối ưu hóa kiến trúc hàm, quản lý LocalStorage và hoàn thiện ứng dụng (Mục 4.9 & 4.10)
```text
Hãy rà soát và hoàn thiện mã nguồn app.js, index.html, style.css để đạt điểm tuyệt đối 100/100:
1. Đảm bảo toàn bộ các hàm được phân tách rõ ràng theo chuẩn:
   - saveData() / loadData(): lưu và đọc dữ liệu localStorage với key "habits", xử lý ngoại lệ JSON.
   - layNgay(soNgayTruoc): tính toán chuỗi ngày YYYY-MM-DD chính xác.
   - tinhStreak(habit), tinhTiLeTuan(habit): thuật toán tính toán đúng theo quy tắc đề bài.
   - kiemTraDuLieu(ten, mucTieuTuan, idHienTai): hàm kiểm tra dùng chung cho cả Thêm và Sửa.
   - themThoiQuen(), renderTieuDeLoi(), toggleNgay(), moModalSua(), xuLyLuuSuaThoiQuen(), xoaThoiQuen(), xuLySapXepVaLoc(), capNhatThongKe().
   - Hàm render() trung tâm gọi lại sau mọi thao tác để đồng bộ dữ liệu.
2. Kiểm tra tương thích màn hình điện thoại 375px: lưới hiển thị có thể cuộn ngang mượt mà, bố cục tự co giãn linh hoạt.
3. Đảm bảo mở trực tiếp index.html không phát sinh bất kỳ lỗi đỏ nào trong DevTools Console (F12).
```

---

## 🏆 Bảng đối chiếu hoàn thành theo tiêu chí đánh giá

| STT | Nghiệp vụ | Mô tả chi tiết | Điểm tối đa | Trạng thái |
|:---:|:---|:---|:---:|:---:|
| 1 | **4.1. Khai báo dữ liệu** | Object đủ 5 thuộc tính, mảng `ngayHoanThanh`, hằng `SO_NGAY`, `STORAGE_KEY`, biến `sortMode`, `chiChuaLam`. | 10 | ✅ Đạt 10/10 |
| 2 | **4.2. Giao diện chính** | Đủ 4 vùng theo mẫu, đọc `localStorage`, hiện thông báo rỗng, responsive 375px. | 12 | ✅ Đạt 12/12 |
| 3 | **4.3. Thêm thói quen** | Kiểm tra tên rỗng/quá 40 ký tự/trùng, mục tiêu 1-7, tạo mảng ngày rỗng, reset form, lưu `localStorage`. | 17 | ✅ Đạt 17/17 |
| 4 | **4.4. Hiển thị lưới 7 ngày** | 7 cột sinh bằng vòng lặp, hôm nay nổi bật, ô tô màu thói quen, tính đúng streak & tỉ lệ tuần. | 12 | ✅ Đạt 12/12 |
| 5 | **4.5. Tích ngày, sửa thói quen** | Tích/bỏ tích dùng includes/push/filter, sửa giữ nguyên id và lịch sử, cập nhật tức thì. | 12 | ✅ Đạt 12/12 |
| 6 | **4.6. Xóa thói quen** | Xác nhận `confirm()` có tên, xóa đúng mục, các mục khác giữ nguyên, báo thành công, lưu dữ liệu. | 12 | ✅ Đạt 12/12 |
| 7 | **4.7. Sắp xếp và lọc** | Sắp xếp streak/tên không đổi thứ tự lưu, lọc chưa làm hôm nay, báo khi hoàn thành hết. | 8 | ✅ Đạt 8/8 |
| 8 | **4.8. Thống kê** | Đếm số đã làm hôm nay, tìm streak dài nhất (ưu tiên đứng trước), gắn nhãn "Chuỗi 7 ngày". | 4 | ✅ Đạt 4/4 |
| 9 | **4.9. Tổ chức chương trình bằng hàm** | Các chức năng là hàm riêng, hàm `render()` dùng chung, hàm kiểm tra dùng chung, `saveData`/`loadData` chuẩn. | 8 | ✅ Đạt 8/8 |
| 10 | **4.10. Nộp bài** | Đủ 3 file mã nguồn + `prompts.md`, repository đúng cú pháp, chạy mượt mà không lỗi Console. | 5 | ✅ Đạt 5/5 |
| **TỔNG** | | | **100** | **✅ 100/100** |
