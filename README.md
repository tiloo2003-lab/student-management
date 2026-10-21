# Hệ thống quản lý sinh viên

```
tung_aptech/
├── backend/    Laravel 13 (REST API + Sanctum token)
├── frontend/   React 19 + Vite (gọi API bằng axios)
└── database/
    ├── schema.sql   tạo database + 13 bảng
    └── seed.sql     dữ liệu mẫu (mỗi bảng ≥ 20 bản ghi)
```

## Chạy dự án

### 1. Database (MySQL 8+)
```bash
mysql -uroot --default-character-set=utf8mb4 -e "source database/schema.sql"
mysql -uroot --default-character-set=utf8mb4 -e "source database/seed.sql"
```
Cấu hình kết nối ở `backend/.env` (`DB_DATABASE=student_management`, `DB_USERNAME=root`, `DB_PASSWORD=` mật khẩu MySQL của bạn). Sao chép `backend/.env.example` thành `backend/.env` rồi chỉnh các giá trị này.

### 2. Backend
```bash
cd backend
composer install
php artisan serve --port=8001   # http://127.0.0.1:8001
```
> Không dùng `php artisan migrate`: cấu trúc bảng nằm trong `database/schema.sql`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev              # http://127.0.0.1:5173
```
Đổi địa chỉ API bằng biến `VITE_API_URL` (xem `frontend/.env.example`).

## Tài khoản demo (mật khẩu: `password`)
| Vai trò | Email |
|---|---|
| Admin | `admin1@school.test` … `admin5@school.test` |
| Giáo viên | `gv001@school.test` … `gv025@school.test` |
| Sinh viên | `sv0001@school.test` … `sv0060@school.test` |

## Số bản ghi seed
users 90 · departments 20 · teachers 25 · classes 20 · students 60 · subjects 30 · semesters 20 · courses 30 · enrollments 150 · grades 150 · attendances 200 · announcements 20 · posts 24 · categories 20 · comments 40 · contact_messages 20

## Kiến trúc backend

```
Request → Route → Controller → FormRequest → Service → Repository → Model
```

| Thư mục `backend/app` | Vai trò |
|---|---|
| `Http/Controllers/Api` | Mỏng: nhận request, gọi service, trả JSON. `ResourceController` dùng chung cho CRUD |
| `Http/Requests` | FormRequest: validate dữ liệu đầu vào |
| `Contracts/Services`, `Services` | Interface và logic nghiệp vụ (transaction, quy tắc, phân quyền theo dữ liệu) |
| `Contracts/Repositories`, `Repositories` | Interface và truy vấn Eloquent. `BaseRepository` xử lý tìm kiếm, lọc, phân trang |
| `Contracts/Support`, `Support` | Tiện ích: lưu ảnh (`ImageStorageInterface`), transaction (`TransactionInterface`), tính điểm (`GradeCalculator`) |
| `Providers/DomainServiceProvider` | Gắn interface với implementation (một chỗ duy nhất) |
| `Models` | Eloquent model và quan hệ |

Quy tắc phân lớp: Controller không chứa nghiệp vụ; Service không gọi `DB`/query/quan hệ lười của model, mọi truy cập dữ liệu đi qua Repository (interface); chỉ Repository làm việc với Eloquent.

Thêm một thực thể mới: tạo Model, `XRepositoryInterface` + `XRepository`, (service nếu có nghiệp vụ riêng), `XRequest`, `XController`, rồi khai báo trong `DomainServiceProvider`.

## Quy tắc nghiệp vụ (cấu hình ở `backend/config/school.php`)

| Nhóm | Quy tắc | Nơi xử lý |
|---|---|---|
| Đăng ký học phần | Tối đa 24 tín chỉ/kỳ; không trùng lịch; không đăng ký trùng môn trong kỳ; không học lại môn đã đạt (điểm ≥ 4.0); kiểm tra sĩ số; chỉ đăng ký lớp của học kỳ hiện tại; chỉ hủy được khi chưa có điểm | `EnrollmentService`, `RegistrationService` |
| Mở lớp học phần | Giáo viên và phòng không trùng lịch; giáo viên dạy tối đa 6 lớp/kỳ; không đổi môn/học kỳ khi đã có sinh viên; không giảm sĩ số dưới số đã đăng ký; không xóa lớp đã có điểm | `CourseService` |
| Nhập điểm | Phải có giữa kỳ mới nhập được cuối kỳ; vắng quá 20% số buổi (từ 5 buổi) bị cấm thi; giáo viên bị khóa điểm sau 14 ngày kể từ khi hết kỳ (admin vẫn sửa được) | `TeacherPortalService` |
| Điểm danh | Không điểm danh ngày tương lai hoặc ngoài học kỳ | `TeacherPortalService` |
| Học vụ | GPA hệ 10 và hệ 4, xếp loại học lực, tín chỉ đạt/chưa đạt, cảnh báo học vụ (ĐTB kỳ < 4.0), đủ điều kiện học bổng (ĐTB ≥ 8.0, không môn rớt, ≥ 15 tín chỉ) | `AcademicService`, `GradeCalculator` |
| Báo cáo | Thống kê theo học kỳ: tỉ lệ đạt, ĐTB theo lớp học phần và lớp, top sinh viên, danh sách cảnh báo/học bổng | `ReportService` |
| Lớp, giáo viên, sinh viên | Sĩ số lớp tối đa 60; GVCN phải cùng khoa, tối đa 2 lớp; không xóa lớp còn sinh viên; không xóa sinh viên đã có điểm; không khóa giáo viên đang dạy kỳ hiện tại | `SchoolClassService`, `StudentService`, `TeacherService` |
| Học kỳ | Không trùng thời gian; không xóa học kỳ hiện tại hoặc đã có lớp | `SemesterService` |
| Bảo mật | Khóa đăng nhập 15 phút sau 5 lần sai; mật khẩu mới ≥ 8 ký tự gồm chữ và số, khác mật khẩu cũ | `AuthService` |
| Bình luận | Chặn từ cấm, quá nhiều liên kết, gửi trùng trong 60 giây; loại bỏ HTML | `CommentService` |

## Cổng thông tin công khai
| Route | Nội dung |
|---|---|
| `/` | Trang chủ: slider, thống kê, tin mới nhất, đọc nhiều, thông báo, theo danh mục |
| `/tin-tuc` | Tất cả bài viết (sắp xếp Mới nhất / Hot / Đọc nhiều, phân trang) |
| `/danh-muc/:slug` | Bài viết theo danh mục |
| `/tim-kiem?q=` | Kết quả tìm kiếm |
| `/posts/:id` | Chi tiết: lượt xem, thích, chia sẻ, bình luận, bài liên quan |
| `/gioi-thieu`, `/lien-he` | Giới thiệu, form liên hệ |
| `/admin/login`, `/admin` | Đăng nhập, trang quản trị |

Admin quản lý thêm: danh mục, bình luận, tin nhắn liên hệ (`/admin/categories`, `/admin/comments`, `/admin/messages`).

## Trang bài viết công khai
`/posts` (không cần đăng nhập): lưới bài viết tông cam sáng, bấm vào xem chi tiết, thích/bỏ thích (chỉ hiển thị số lượt thích). Admin quản lý tại `/admin/posts` (upload ảnh, mô tả, nội dung). Ảnh lưu ở `backend/public/uploads/posts`.

## Tính năng theo vai trò

**Chung**: đăng nhập/đăng xuất (token), dashboard theo vai trò, xem thông báo theo đối tượng, sửa hồ sơ, đổi mật khẩu.

**Admin**: CRUD sinh viên, giáo viên (tạo kèm tài khoản), khoa, lớp (gán GV chủ nhiệm), môn học, học kỳ (đặt học kỳ hiện tại), lớp học phần (phân công GV, lịch, phòng, sĩ số), thêm/xóa sinh viên khỏi lớp học phần (kiểm tra trùng + sĩ số), đăng/sửa/xóa thông báo, khóa/mở tài khoản, tìm kiếm, lọc, phân trang, thống kê.

**Giáo viên**: xem lớp được phân công, nhập điểm giữa kỳ/cuối kỳ (tự tính tổng kết 40/60 + xếp loại A–F), điểm danh theo ngày, chỉ truy cập được lớp của mình.

**Sinh viên**: xem lớp học phần/lịch học, bảng điểm + GPA theo tín chỉ, lịch sử điểm danh, tỉ lệ chuyên cần.
