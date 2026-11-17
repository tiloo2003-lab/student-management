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
- **Dialogs** use SweetAlert2 (delete confirmations, notifications, semester picker for PDF export). Destructive operations and bulk grading ask for confirmation; ordinary saves and comments use direct submission with feedback.

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

## Authenticated news portal
| Route | Content |
|---|---|
| `/` | Home: slider, statistics, latest news, most read, announcements, categories |
| `/news` | All posts (sort by Latest / Hot / Most read, pagination) |
| `/category/:slug` | Posts in a category |
| `/search?q=` | Search results |
| `/posts/:id` | Post detail: views, likes, sharing, comments, related posts |
| `/about`, `/contact` | About page and contact form |
| `/login`, `/workspace` | Sign in and the role-based workspace (`/admin` redirects here) |

Admins also manage categories, comments and contact messages (`/admin/categories`, `/admin/comments`, `/admin/messages`) and posts at `/admin/posts` (image upload, description, content). Post images are stored in `backend/public/uploads/posts`. Likes require an account and are stored per user; repeated like/unlike requests are idempotent. Existing aggregate like counts are preserved as historical counts.

## Features by role

**Everyone**: sign in/out (token), role-based dashboard, announcements by audience, profile editing, password change.

**Admin**: CRUD for students, teachers (created together with an account), departments, classes (homeroom teacher), subjects, semesters (set the current semester), course sections (teacher, schedule, room, capacity); add or remove students from a section (duplicate and capacity checks); announcements; lock/unlock accounts; search, filters, pagination, statistics and academic reports.

**Teacher**: view assigned sections, enter midterm and final scores for the whole class (total is computed at 40/60 with an A–F grade), take attendance by date, access only their own sections.

**Student**: course registration, schedule and sections, grades with GPA by credits, attendance history and attendance rate, PDF transcript.

## Portal workflow update

- All news pages require sign-in. A shared article returns to that article after login; ordinary login opens News.
- `/workspace` is the overview for every role. The same account menu is available in News and the workspace. `/admin` remains a compatibility redirect.
- School news is a post category; Your notifications is the role-filtered announcement feed.
- Failed reads display an error and retry control. A failed session check caused by network/server errors preserves the token; only a 401 expires the session.
- Grade drafts are not cleared when saving attendance. Leaving an edited form or changing an attendance date asks before discarding. Reload/close uses the browser's unsaved-changes warning.

### One-time additive database update

From `backend`, run this against the configured MySQL database after deploying these changes:

```powershell
php artisan portal:upgrade
```

This command creates only `post_likes` if missing. It does not reseed, truncate or modify historical post counts. Run it before using likes with normal accounts. Fresh installs from `database/schema.sql` already include the table. Do not run a general migration or reload the schema to update an existing database.

### Demo access and recovery

To add interactive recruiter scenarios to an existing database, run from `backend`:

```powershell
php artisan demo:populate --preview
php artisan demo:populate
```

This adds six sample students, three current-semester practice courses for `gv001`, sample grades and attendance, role notifications, an article with comments, and a contact message. `sv0001` is not automatically enrolled in the sample courses; all three are available for registration subject to the normal credit limit. Existing registrations are preserved when this command is rerun. Existing rows and passwords are preserved. Repeating the command skips existing records; it does not reset edits. The preview validates within a transaction and rolls back inserted rows (auto-increment numbers may still advance). An active current semester and the three demo accounts must already exist. If validation fails, all additions are rolled back.

Recruiter walkthrough: Teacher → My course sections → codes starting `DEMO-` for grading/attendance; Student → Registration → Software testing workshop or Portfolio project lab; Admin → Posts, Notifications, Contact messages and academic management. Data added here lives in MySQL; export that database to preserve it when deploying.

`DEMO_MODE=true` (default) labels `admin1@school.test`, `gv001@school.test`, and `sv0001@school.test` as demo accounts. They have the same permissions as normal accounts of their respective roles, including saving, deleting where allowed, liking, commenting and changing their own credentials. Changes are saved to the database. The demo label does not bypass role permissions or validation.

A reset tool is provided but is never run automatically. `php artisan demo:reset` requires `DEMO_ALLOW_RESET=true`, a separately configured database whose name ends in `_demo`, and an interactive confirmation. It restores sample rows from `database/seed.sql` and clears likes and sessions in that demo database. It must never be used for a database holding real data. The reset does not remove uploaded files.

### Verification

```powershell
# From backend; uses an isolated in-memory SQLite database, not MySQL:
php tests/portal-smoke.php
# From frontend:
npm run build
npm run lint
```

Manual acceptance: shared article login; Workspace for all three roles; save attendance while grade edits exist; cancel navigation with unsaved data; session-check network failure and retry; invalid URLs; demo writes within each role and rejection outside that role; two users liking the same article independently.
