import { CustomTemplate } from "../types";

export const BUILTIN_TEMPLATES: CustomTemplate[] = [
  {
    id: "template-quyet-dinh",
    name: "Quyết định (Cá biệt / Quy phạm)",
    description: "Mẫu quyết định chuẩn theo Nghị định 30/2020/NĐ-CP dùng cho việc ban hành quy chế, bổ nhiệm, phê duyệt dự án...",
    type: "quyết định",
    metadata: {
      issuingAuthority: "ỦY BAN NHÂN DÂN TỈNH LÂM ĐỒNG",
      documentNumber: "125/QĐ-UBND",
      location: "Đà Lạt",
      dateString: "Ngày 26 tháng 06 năm 2026",
      titleAbstract: "Về việc ban hành Quy chế quản lý và ứng dụng chuyển đổi số trong hoạt động hành chính công",
      signerPosition: "CHỦ TỊCH",
      signerName: "Nguyễn Văn A",
      recipients: ["Như Điều 3;", "Văn phòng UBND tỉnh;", "Sở Thông tin và Truyền thông;", "Lưu: VT, TH."]
    },
    content: `# QUYẾT ĐỊNH
## Về việc ban hành Quy chế quản lý và ứng dụng chuyển đổi số trong hoạt động hành chính công

**CHỦ TỊCH ỦY BAN NHÂN DÂN TỈNH**

*Căn cứ Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015; Luật sửa đổi, bổ sung một số điều của Luật Tổ chức Chính phủ và Luật Tổ chức chính quyền địa phương ngày 22 tháng 11 năm 2019;*
*Căn cứ Luật Công nghệ thông tin ngày 29 tháng 6 năm 2006;*
*Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;*
*Theo đề nghị của Giám đốc Sở Thông tin và Truyền thông tại Tờ trình số 45/TTr-STTTT ngày 15 tháng 6 năm 2026.*

### QUYẾT ĐỊNH:

**Điều 1.** Ban hành kèm theo Quyết định này "Quy chế quản lý và ứng dụng chuyển đổi số trong hoạt động hành chính công tại địa phương".

**Điều 2.** Quyết định này có hiệu lực thi hành kể từ ngày ký.

**Điều 3.** Chánh Văn phòng Ủy ban nhân dân tỉnh, Giám đốc các sở, Trưởng các ban, ngành, Chủ tịch Ủy ban nhân dân các huyện, thành phố và các tổ chức, cá nhân có liên quan chịu trách nhiệm thi hành Quyết định này./.`
  },
  {
    id: "template-cong-van",
    name: "Công văn hành chính",
    description: "Mẫu công văn gửi các cơ quan, đơn vị trực thuộc để chỉ đạo, đôn đốc, trao đổi công việc hành chính hàng ngày...",
    type: "công văn",
    metadata: {
      issuingAuthority: "SỞ THÔNG TIN VÀ TRUYỀN THÔNG",
      documentNumber: "842/STTTT-CNTT",
      location: "Thành phố Hồ Chí Minh",
      dateString: "Ngày 26 tháng 06 năm 2026",
      titleAbstract: "Về việc đẩy mạnh sử dụng chữ ký số và bảo mật thông tin trong văn bản điện tử",
      signerPosition: "GIÁM ĐỐC",
      signerName: "Trần Thị B",
      recipients: ["Các phòng chuyên môn;", "UBND các quận, huyện;", "Lưu: VT, CNTT."]
    },
    content: `Kính gửi: Các cơ quan, đơn vị trực thuộc Sở Thông tin và Truyền thông

Thực hiện chỉ đạo của Ủy ban nhân dân thành phố tại Kế hoạch số 120/KH-UBND ngày 10/01/2026 về tăng cường ứng dụng chữ ký số chuyên dùng và đảm bảo an toàn thông tin trong các cơ quan nhà nước; Giám đốc Sở Thông tin và Truyền thông yêu cầu các đơn vị triển khai thực hiện các nội dung sau:

1. **Nâng cao tỷ lệ ký số văn bản điện tử**
Toàn bộ văn bản hành chính (trừ văn bản mật) phát hành đi phải được ký số cá nhân của người có thẩm quyền và ký số của cơ quan hành chính theo quy định tại Nghị định 30/2020/NĐ-CP. Mục tiêu đạt 100% văn bản điện tử được xác thực chữ ký số đầy đủ trước khi gửi trên trục liên thông văn bản quốc gia.

2. **Tăng cường kiểm soát an toàn, an ninh mạng**
- Nghiêm cấm việc chia sẻ thông tin tài khoản dùng chung hệ thống quản lý văn bản điều hành cho bên thứ ba.
- Thường xuyên quét virus, mã độc trên máy tính làm việc và báo cáo ngay cho phòng CNTT khi phát hiện sự cố bảo mật bất thường.

3. **Tổ chức thực hiện**
Trưởng các đơn vị chịu trách nhiệm trước Giám đốc Sở về việc đôn đốc cán bộ công chức nghiêm túc chấp hành hướng dẫn này. Phòng Công nghệ thông tin có trách nhiệm theo dõi, tổng hợp và báo cáo kết quả thực hiện vào kỳ họp giao ban cuối tháng./.`
  },
  {
    id: "template-to-trinh",
    name: "Tờ trình phê duyệt",
    description: "Mẫu tờ trình dùng để đề xuất cấp trên phê duyệt dự án, kinh phí, kế hoạch công tác hoặc nhân sự...",
    type: "tờ trình",
    metadata: {
      issuingAuthority: "PHÒNG TỔ CHỨC - HÀNH CHÍNH",
      documentNumber: "15/TTr-TCHC",
      location: "Hà Nội",
      dateString: "Ngày 26 tháng 06 năm 2026",
      titleAbstract: "Về việc xin chủ trương mua sắm trang thiết bị CNTT phục vụ chuyển đổi số cơ quan năm 2026",
      signerPosition: "TRƯỞNG PHÒNG",
      signerName: "Phạm Văn C",
      recipients: ["Ban Giám đốc (để báo cáo);", "Phòng Kế hoạch - Tài chính;", "Lưu: VT, TCHC."]
    },
    content: `Kính gửi: Ban Giám đốc Sở Thông tin và Truyền thông

Để nâng cao năng lực ứng dụng công nghệ thông tin, đảm bảo hạ tầng đồng bộ đáp ứng yêu cầu xử lý hồ sơ hành chính công mức độ 4 trên môi trường mạng, Phòng Tổ chức - Hành chính kính trình Ban Giám đốc phê duyệt chủ trương mua sắm thiết bị chuyên dụng như sau:

### 1. Sự cần thiết đầu tư
Hệ thống máy tính hiện tại của phòng tiếp nhận hồ sơ đã sử dụng trên 6 năm, cấu hình cũ kỹ, thường xuyên xảy ra tình trạng giật lag, treo máy khi quét tài liệu dung lượng lớn. Điều này gây chậm trễ trong quá trình phục vụ người dân, doanh nghiệp, làm giảm chỉ số hài lòng của cơ quan.

### 2. Danh mục thiết bị đề xuất mua sắm
Dưới đây là bảng thông số và kinh phí dự kiến:

| STT | Tên thiết bị | Số lượng | Đơn giá dự kiến (VNĐ) | Thành tiền dự kiến (VNĐ) |
| :--- | :--- | :---: | :---: | :---: |
| 1 | Máy vi tính để bàn Dell Optiplex | 05 bộ | 15.000.000 | 75.000.000 |
| 2 | Máy quét tài liệu tốc độ cao Canon | 02 cái | 12.000.000 | 24.000.000 |
| 3 | Thiết bị lưu điện UPS APC | 05 cái | 2.500.000 | 12.500.000 |
| **Tổng cộng** | | | | **111.500.000** |

### 3. Nguồn kinh phí thực hiện
Sử dụng nguồn kinh phí chi thường xuyên của cơ quan năm 2026 đã được phê duyệt phân bổ cho công tác CNTT.

Kính trình Ban Giám đốc xem xét và quyết định./.`
  },
  {
    id: "template-bao-cao",
    name: "Báo cáo công tác",
    description: "Mẫu báo cáo kết quả thực hiện nhiệm vụ, tổng kết định kỳ tuần, tháng, quý hoặc năm...",
    type: "báo cáo",
    metadata: {
      issuingAuthority: "TRUNG TÂM CÔNG NGHỆ THÔNG TIN",
      documentNumber: "42/BC-TTCNTT",
      location: "Đà Nẵng",
      dateString: "Ngày 26 tháng 06 năm 2026",
      titleAbstract: "Báo cáo tình hình vận hành Cổng dịch vụ công trực tuyến Quý I năm 2026",
      signerPosition: "GIÁM ĐỐC TRUNG TÂM",
      signerName: "Lê Hoàng D",
      recipients: ["Giám đốc Sở (để b/c);", "Các phòng Sở;", "Lưu: VT, CNTT."]
    },
    content: `# BÁO CÁO
## Tình hình vận hành Cổng dịch vụ công trực tuyến Quý I năm 2026

Kính gửi: Giám đốc Sở Thông tin và Truyền thông

Thực hiện nhiệm vụ được giao, Trung tâm Công nghệ thông tin kính báo cáo tình hình vận hành, tiếp nhận và xử lý hồ sơ hành chính trên Cổng dịch vụ công trực tuyến trong Quý I năm 2026 như sau:

### I. KẾT QUẢ ĐẠT ĐƯỢC

1. **Công tác tiếp nhận hồ sơ**
Trong quý vừa qua, toàn tỉnh đã tiếp nhận tổng cộng **14.250** hồ sơ trực tuyến, tăng 24.5% so với cùng kỳ năm ngoái.
- Tỷ lệ hồ sơ trực tuyến mức độ 3, 4 đạt: **85.4%**.
- Tỷ lệ thanh toán phí, lệ phí trực tuyến qua cổng National Payment Gateway đạt: **72.1%**.

2. **Hiệu suất xử lý của các cơ quan**
Hầu hết các phòng ban đã tích cực xử lý hồ sơ trước và đúng hạn. 

| Cơ quan thực hiện | Tổng tiếp nhận | Đã xử lý đúng hạn | Đang xử lý | Quá hạn | Tỷ lệ đúng hạn |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Sở Kế hoạch & Đầu tư | 4.200 | 4.150 | 45 | 5 | 98.8% |
| Sở Tư pháp | 5.800 | 5.720 | 60 | 20 | 98.6% |
| Sở Thông tin & TT | 1.250 | 1.248 | 2 | 0 | 100% |

### II. MỘT SỐ TỒN TẠI, HẠN CHẾ
- Hệ thống cơ sở dữ liệu dùng chung đôi lúc có hiện tượng phản hồi chậm vào khung giờ cao điểm (từ 14h đến 16h hàng ngày).
- Một bộ phận người dân lớn tuổi vẫn gặp khó khăn trong việc tạo lập tài khoản định danh điện tử VNeID để đăng nhập dịch vụ công.

### III. KIẾN NGHỊ VÀ ĐỀ XUẤT
1. Kính đề nghị Giám đốc Sở xem xét, phê duyệt bổ sung nâng cấp băng thông đường truyền kết nối từ trung tâm dữ liệu đến cổng quốc gia.
2. Tổ chức thêm các lớp tập huấn lưu động phối hợp với Đoàn thanh niên hướng dẫn người dân đăng ký tài khoản trực tiếp tại tổ dân phố./.`
  },
  {
    id: "template-giao-an",
    name: "Kế hoạch bài dạy (Giáo án)",
    description: "Mẫu giáo án chuẩn dành cho giáo viên, phân loại mục tiêu, chuẩn bị, và các hoạt động dạy học...",
    type: "giáo án",
    metadata: {
      issuingAuthority: "TRƯỜNG THPT CHUYÊN CHUYỂN ĐỔI SỐ",
      documentNumber: "GA-01/Toán",
      location: "Hà Nội",
      dateString: "Ngày 05 tháng 09 năm 2026",
      titleAbstract: "Kế hoạch bài dạy: Hàm số lượng giác",
      signerPosition: "GIÁO VIÊN SOẠN",
      signerName: "Nguyễn Văn Toán",
      recipients: ["Tổ chuyên môn Toán;", "Lưu: Cá nhân."]
    },
    content: `# KẾ HOẠCH BÀI DẠY
## Tên bài: Hàm số lượng giác
Môn học/Hoạt động giáo dục: Toán học; lớp: 11
Thời gian thực hiện: (02 tiết)

### I. MỤC TIÊU
1. **Kiến thức**: Trình bày được định nghĩa các hàm số lượng giác cơ bản.
2. **Năng lực**: Nhận biết được tính tuần hoàn, tập xác định, tập giá trị của các hàm số lượng giác.
3. **Phẩm chất**: Rèn luyện tính cẩn thận, chính xác trong tính toán và vẽ đồ thị.

### II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
1. **Giáo viên**: SGK, kế hoạch bài dạy, máy chiếu, bảng phụ.
2. **Học sinh**: SGK, vở ghi, dụng cụ học tập (thước kẻ, compa).

### III. TIẾN TRÌNH DẠY HỌC
**1. Hoạt động 1: Mở đầu / Khởi động (10 phút)**
- *Mục tiêu*: Kích thích sự tò mò của học sinh về các chuyển động có tính chu kỳ.
- *Nội dung*: GV chiếu video về chuyển động của đu quay. Yêu cầu HS nhận xét.
- *Sản phẩm*: Câu trả lời của HS.
- *Tổ chức thực hiện*: GV đặt câu hỏi, HS thảo luận nhóm đôi và trả lời.

**2. Hoạt động 2: Hình thành kiến thức mới (60 phút)**
- *Mục tiêu*: Nắm vững định nghĩa hàm số y = sin(x) và y = cos(x).
- *Nội dung*: Học sinh đọc SGK trang 12-15 và hoàn thành phiếu bài tập số 1.
- *Sản phẩm*: Bảng giá trị lượng giác của các góc đặc biệt.
- *Tổ chức thực hiện*: GV giảng giải kết hợp hoạt động nhóm.

**3. Hoạt động 3: Luyện tập (15 phút)**
- *Mục tiêu*: Vận dụng kiến thức tìm tập xác định của hàm số lượng giác.
- *Nội dung*: Làm các bài tập 1, 2 trang 17 SGK.
- *Sản phẩm*: Lời giải bài tập của học sinh.

**4. Hoạt động 4: Vận dụng (5 phút)**
- Giao bài tập về nhà: Tìm các ví dụ trong thực tế có hình dạng đồ thị hình sin.\`
  }
];
