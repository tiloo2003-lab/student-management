CREATE DATABASE IF NOT EXISTS student_management
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_management;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS personal_access_tokens;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS attendances;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS semesters;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(120)    NOT NULL,
  email          VARCHAR(150)    NOT NULL,
  password       VARCHAR(255)    NOT NULL,
  role           ENUM('admin','teacher','student') NOT NULL DEFAULT 'student',
  phone          VARCHAR(20)     NULL,
  status         ENUM('active','inactive') NOT NULL DEFAULT 'active',
  remember_token VARCHAR(100)    NULL,
  created_at     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email),
  KEY users_role_index (role)
) ENGINE=InnoDB;

CREATE TABLE departments (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(20)     NOT NULL,
  name        VARCHAR(150)    NOT NULL,
  description TEXT            NULL,
  created_at  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY departments_code_unique (code)
) ENGINE=InnoDB;

CREATE TABLE teachers (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        BIGINT UNSIGNED NOT NULL,
  department_id  BIGINT UNSIGNED NOT NULL,
  teacher_code   VARCHAR(20)     NOT NULL,
  degree         VARCHAR(50)     NULL,
  specialization VARCHAR(150)    NULL,
  hired_date     DATE            NULL,
  created_at     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY teachers_user_unique (user_id),
  UNIQUE KEY teachers_code_unique (teacher_code),
  CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_teachers_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB;

CREATE TABLE classes (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code                VARCHAR(20)     NOT NULL,
  name                VARCHAR(120)    NOT NULL,
  department_id       BIGINT UNSIGNED NOT NULL,
  homeroom_teacher_id BIGINT UNSIGNED NULL,
  academic_year       VARCHAR(20)     NULL,
  created_at          TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY classes_code_unique (code),
  CONSTRAINT fk_classes_department FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT fk_classes_homeroom FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE students (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  class_id      BIGINT UNSIGNED NOT NULL,
  student_code  VARCHAR(20)     NOT NULL,
  date_of_birth DATE            NULL,
  gender        ENUM('male','female','other') NOT NULL DEFAULT 'male',
  address       VARCHAR(255)    NULL,
  created_at    TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY students_user_unique (user_id),
  UNIQUE KEY students_code_unique (student_code),
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES classes(id)
) ENGINE=InnoDB;

CREATE TABLE subjects (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code          VARCHAR(20)     NOT NULL,
  name          VARCHAR(150)    NOT NULL,
  credits       TINYINT UNSIGNED NOT NULL DEFAULT 3,
  department_id BIGINT UNSIGNED NOT NULL,
  description   TEXT            NULL,
  created_at    TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY subjects_code_unique (code),
  CONSTRAINT fk_subjects_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB;

CREATE TABLE semesters (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(60)     NOT NULL,
  academic_year VARCHAR(20)     NOT NULL,
  term          TINYINT UNSIGNED NOT NULL DEFAULT 1,
  start_date    DATE            NOT NULL,
  end_date      DATE            NOT NULL,
  is_current    TINYINT(1)      NOT NULL DEFAULT 0,
  created_at    TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY semesters_year_term_unique (academic_year, term)
) ENGINE=InnoDB;

CREATE TABLE courses (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code         VARCHAR(20)     NOT NULL,
  subject_id   BIGINT UNSIGNED NOT NULL,
  teacher_id   BIGINT UNSIGNED NOT NULL,
  semester_id  BIGINT UNSIGNED NOT NULL,
  room         VARCHAR(30)     NULL,
  day_of_week  TINYINT UNSIGNED NULL COMMENT '2=Monday ... 7=Saturday, 8=Sunday',
  start_period TINYINT UNSIGNED NULL,
  end_period   TINYINT UNSIGNED NULL,
  max_students SMALLINT UNSIGNED NOT NULL DEFAULT 50,
  created_at   TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY courses_code_unique (code),
  CONSTRAINT fk_courses_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
  CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  CONSTRAINT fk_courses_semester FOREIGN KEY (semester_id) REFERENCES semesters(id)
) ENGINE=InnoDB;

CREATE TABLE enrollments (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id  BIGINT UNSIGNED NOT NULL,
  course_id   BIGINT UNSIGNED NOT NULL,
  enrolled_at DATE            NULL,
  created_at  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY enrollments_student_course_unique (student_id, course_id),
  CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE grades (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  enrollment_id BIGINT UNSIGNED NOT NULL,
  midterm       DECIMAL(4,2)    NULL,
  final         DECIMAL(4,2)    NULL,
  total         DECIMAL(4,2)    NULL,
  letter        VARCHAR(2)      NULL,
  created_at    TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY grades_enrollment_unique (enrollment_id),
  CONSTRAINT fk_grades_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE attendances (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  course_id  BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  date       DATE            NOT NULL,
  status     ENUM('present','absent','late','excused') NOT NULL DEFAULT 'present',
  note       VARCHAR(255)    NULL,
  created_at TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY attendances_unique (course_id, student_id, date),
  CONSTRAINT fk_attendances_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendances_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE announcements (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title       VARCHAR(200)    NOT NULL,
  content     TEXT            NOT NULL,
  author_id   BIGINT UNSIGNED NOT NULL,
  target_role ENUM('all','teacher','student') NOT NULL DEFAULT 'all',
  created_at  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_announcements_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE categories (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)    NOT NULL,
  slug        VARCHAR(120)    NOT NULL,
  description VARCHAR(255)    NULL,
  created_at  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY categories_slug_unique (slug)
) ENGINE=InnoDB;

CREATE TABLE posts (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title       VARCHAR(200)    NOT NULL,
  description VARCHAR(500)    NOT NULL,
  content     LONGTEXT        NULL,
  image       VARCHAR(255)    NULL,
  author_id   BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NULL,
  likes_count INT UNSIGNED    NOT NULL DEFAULT 0,
  views_count INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY posts_likes_index (likes_count),
  KEY posts_views_index (views_count),
  KEY posts_created_index (created_at),
  KEY posts_category_index (category_id),
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_posts_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE comments (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id    BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NULL,
  name       VARCHAR(100)    NOT NULL,
  content    VARCHAR(1000)   NOT NULL,
  created_at TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY comments_post_index (post_id),
  KEY comments_user_index (user_id),
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE contact_messages (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100)    NOT NULL,
  email      VARCHAR(150)    NOT NULL,
  phone      VARCHAR(20)     NULL,
  subject    VARCHAR(200)    NOT NULL,
  message    TEXT            NOT NULL,
  is_read    TINYINT(1)      NOT NULL DEFAULT 0,
  created_at TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE personal_access_tokens (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tokenable_type VARCHAR(255)    NOT NULL,
  tokenable_id   BIGINT UNSIGNED NOT NULL,
  name           TEXT            NOT NULL,
  token          VARCHAR(64)     NOT NULL,
  abilities      TEXT            NULL,
  last_used_at   TIMESTAMP       NULL,
  expires_at     TIMESTAMP       NULL,
  created_at     TIMESTAMP       NULL,
  updated_at     TIMESTAMP       NULL,
  PRIMARY KEY (id),
  UNIQUE KEY personal_access_tokens_token_unique (token),
  KEY personal_access_tokens_tokenable_index (tokenable_type, tokenable_id),
  KEY personal_access_tokens_expires_at_index (expires_at)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
