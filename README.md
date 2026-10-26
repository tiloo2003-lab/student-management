# Student Management System

```
tung_aptech/
├── backend/    Laravel 13 (REST API + Sanctum tokens)
├── frontend/   React 19 + Vite (talks to the API with axios)
└── database/
    ├── schema.sql   creates the database and 17 tables
    └── seed.sql     sample data (at least 20 records per table)
```

## Running the project

### 1. Database (MySQL 8+)
```bash
mysql -uroot -p --default-character-set=utf8mb4 -e "source database/schema.sql"
mysql -uroot -p --default-character-set=utf8mb4 -e "source database/seed.sql"
```
Connection settings live in `backend/.env` (`DB_DATABASE=student_management`, `DB_USERNAME=root`, `DB_PASSWORD=` your MySQL password). Copy `backend/.env.example` to `backend/.env` and adjust these values.

Re-run only `seed.sql` to reset the sample data without recreating the tables.

### 2. Backend
```bash
cd backend
composer install
php artisan key:generate
php artisan serve --port=8001   # http://127.0.0.1:8001
```
> Do not run `php artisan migrate`: the table structure lives in `database/schema.sql`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev              # http://127.0.0.1:5173
```
Change the API address with the `VITE_API_URL` variable (see `frontend/.env.example`).

## Demo accounts (password: `password`)
| Role | Email |
|---|---|
| Admin | `admin1@school.test` … `admin5@school.test` |
| Teacher | `gv001@school.test` … `gv025@school.test` |
| Student | `sv0001@school.test` … `sv0060@school.test` |

Tip: the teacher `gv016@school.test` has a section in the current semester, so grading and attendance can be tried right away. Sections from past semesters are locked for teachers.

## Seed data
users 90 · departments 20 · teachers 25 · classes 20 · students 60 · subjects 30 · semesters 20 · courses 30 · enrollments 150 · grades 150 · attendances 200 · announcements 20 · posts 24 · categories 20 · comments 40 · contact_messages 20

## Backend architecture

```
Request → Route → Controller → FormRequest → Service → Repository → Model
```

| Folder in `backend/app` | Role |
|---|---|
| `Http/Controllers/Api` | Thin: receive the request, call a service, return JSON. `ResourceController` is shared by the CRUD controllers |
| `Http/Requests` | FormRequests: validate incoming data |
| `Contracts/Services`, `Services` | Interfaces and business logic (transactions, rules, data-level authorization) |
| `Contracts/Repositories`, `Repositories` | Interfaces and Eloquent queries. `BaseRepository` handles search, filters and pagination |
| `Contracts/Support`, `Support` | Utilities: image storage (`ImageStorageInterface`), transactions (`TransactionInterface`), grading (`GradeCalculator`) |
| `Providers/DomainServiceProvider` | Binds interfaces to implementations in one place |
| `Models` | Eloquent models and relations |

Layering rules: controllers contain no business logic; services never call `DB`, run queries or touch lazy relations, all data access goes through repository interfaces; only repositories work with Eloquent.

To add a new entity: create the Model, `XRepositoryInterface` + `XRepository`, a service if it has its own rules, `XRequest` and `XController`, then register them in `DomainServiceProvider`.

## PDF export, filters and class-wide grading

- **PDF export** (dompdf with the DejaVu font):
  - Students: on the Grades page, filter by academic year, semester and subject, then press **Export PDF**.
  - Teachers and admins: **Export grade sheet (PDF)** on the course section page.
  - Admins: the **PDF** button in the student list (choose a semester) and **Export PDF** on the Academic reports page.
- **Filters**: students (cohort, department, class, gender, status), classes (department, cohort), course sections (academic year, semester, department, teacher), semesters (academic year), teachers (department, degree), reports (academic year, semester, class).
- **Class-wide grading**: edit scores for several students and press **Save class grades** once. Rows with errors (exam ban, missing midterm, ...) are reported individually while valid rows are still saved.
- **Comments** require a login; users can delete their own comments and admins can delete any.
- **Dialogs** use SweetAlert2 (delete confirmations, notifications, semester picker for PDF export). Every action that changes data asks for confirmation first.

## Business rules (configurable in `backend/config/school.php`)

| Area | Rules | Handled in |
|---|---|---|
| Course registration | Max 24 credits per semester; no schedule conflicts; no duplicate subject in a semester; no retaking a passed subject (score ≥ 4.0); capacity check; only sections of the current semester; cancel only while there are no grades | `EnrollmentService`, `RegistrationService` |
| Opening sections | No teacher or room conflicts; max 6 sections per teacher per semester; subject and semester cannot change once students enrolled; capacity cannot drop below enrolled students; sections with grades cannot be deleted | `CourseService` |
| Grading | A midterm is required before a final; more than 20% absences (from 5 sessions) means an exam ban; teachers are locked out 14 days after the semester ends (admins can still edit) | `TeacherPortalService` |
| Attendance | No attendance for future dates or dates outside the semester | `TeacherPortalService` |
| Academic standing | 10-point and 4.0 GPA, classification, credits passed/failed, academic warning (semester average < 4.0), scholarship eligibility (average ≥ 8.0, no failed subject, ≥ 15 credits) | `AcademicService`, `GradeCalculator` |
| Reports | Per-semester statistics: pass rate, averages by course section and class, top students, warning and scholarship lists | `ReportService` |
| Classes, teachers, students | Max 60 students per class; homeroom teacher must be in the same department, max 2 classes; classes with students cannot be deleted; students with grades cannot be deleted; teachers teaching in the current semester cannot be locked | `SchoolClassService`, `StudentService`, `TeacherService` |
| Semesters | Dates cannot overlap; the current semester or one with sections cannot be deleted | `SemesterService` |
| Security | Login lock for 15 minutes after 5 failed attempts; new password ≥ 8 characters with letters and numbers, different from the old one | `AuthService` |
| Comments | Blocks banned words, too many links and duplicates within 60 seconds; strips HTML | `CommentService` |

## Public portal
| Route | Content |
|---|---|
| `/` | Home: slider, statistics, latest news, most read, announcements, categories |
| `/news` | All posts (sort by Latest / Hot / Most read, pagination) |
| `/category/:slug` | Posts in a category |
| `/search?q=` | Search results |
| `/posts/:id` | Post detail: views, likes, sharing, comments, related posts |
| `/about`, `/contact` | About page and contact form |
| `/admin/login`, `/admin` | Sign in and the management area |

Admins also manage categories, comments and contact messages (`/admin/categories`, `/admin/comments`, `/admin/messages`) and posts at `/admin/posts` (image upload, description, content). Post images are stored in `backend/public/uploads/posts`. Likes work without an account and the page only shows the like count.

## Features by role

**Everyone**: sign in/out (token), role-based dashboard, announcements by audience, profile editing, password change.

**Admin**: CRUD for students, teachers (created together with an account), departments, classes (homeroom teacher), subjects, semesters (set the current semester), course sections (teacher, schedule, room, capacity); add or remove students from a section (duplicate and capacity checks); announcements; lock/unlock accounts; search, filters, pagination, statistics and academic reports.

**Teacher**: view assigned sections, enter midterm and final scores for the whole class (total is computed at 40/60 with an A–F grade), take attendance by date, access only their own sections.

**Student**: course registration, schedule and sections, grades with GPA by credits, attendance history and attendance rate, PDF transcript.
