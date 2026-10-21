<?php

use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SemesterController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentPortalController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\TeacherPortalController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::get('/home', HomeController::class);
Route::get('/categories', [CategoryController::class, 'publicIndex']);
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']);
Route::get('/posts/{post}/comments', [CommentController::class, 'index']);
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1');
Route::middleware('throttle:60,1')->group(function () {
    Route::post('/posts/{post}/like', [PostController::class, 'like']);
    Route::delete('/posts/{post}/like', [PostController::class, 'unlike']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'changePassword']);
    Route::get('/dashboard', DashboardController::class);
    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->middleware('throttle:10,1');
    Route::delete('/posts/{post}/comments/{comment}', [CommentController::class, 'destroyOwn']);
    Route::get('/announcements', [AnnouncementController::class, 'index']);

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('departments', DepartmentController::class);
        Route::apiResource('teachers', TeacherController::class);
        Route::apiResource('classes', ClassController::class);
        Route::apiResource('students', StudentController::class);
        Route::apiResource('subjects', SubjectController::class);
        Route::apiResource('semesters', SemesterController::class);
        Route::apiResource('courses', CourseController::class);
        Route::apiResource('announcements', AnnouncementController::class)->except(['index']);

        Route::apiResource('manage/categories', CategoryController::class)->parameters(['categories' => 'category']);
        Route::get('/manage/comments', [CommentController::class, 'adminIndex']);
        Route::delete('/manage/comments/{comment}', [CommentController::class, 'destroy']);
        Route::get('/manage/messages', [ContactController::class, 'index']);
        Route::put('/manage/messages/{message}/read', [ContactController::class, 'markRead']);
        Route::delete('/manage/messages/{message}', [ContactController::class, 'destroy']);

        Route::get('/reports/overview', [ReportController::class, 'overview']);
        Route::get('/reports/export', [ExportController::class, 'report']);
        Route::get('/export/students/{student}', [ExportController::class, 'studentTranscript']);

        Route::get('/manage/posts', [PostController::class, 'adminIndex']);
        Route::post('/manage/posts', [PostController::class, 'store']);
        Route::get('/manage/posts/{post}', [PostController::class, 'adminShow']);
        Route::post('/manage/posts/{post}', [PostController::class, 'update']);
        Route::delete('/manage/posts/{post}', [PostController::class, 'destroy']);

        Route::get('/courses/{course}/students', [CourseController::class, 'students']);
        Route::post('/courses/{course}/students', [CourseController::class, 'addStudent']);
        Route::delete('/courses/{course}/students/{enrollment}', [CourseController::class, 'removeStudent']);
    });

    Route::middleware('role:teacher,admin')->prefix('teacher')->group(function () {
        Route::get('/courses', [TeacherPortalController::class, 'courses']);
        Route::get('/courses/{course}', [TeacherPortalController::class, 'show']);
        Route::put('/courses/{course}/grades', [TeacherPortalController::class, 'saveGrades']);
        Route::get('/courses/{course}/export', [ExportController::class, 'courseGradeSheet']);
        Route::get('/courses/{course}/attendance', [TeacherPortalController::class, 'attendance']);
        Route::post('/courses/{course}/attendance', [TeacherPortalController::class, 'saveAttendance']);
    });

    Route::middleware('role:student')->prefix('student')->group(function () {
        Route::get('/registration', [RegistrationController::class, 'index']);
        Route::post('/registration/{course}', [RegistrationController::class, 'store']);
        Route::delete('/registration/{course}', [RegistrationController::class, 'destroy']);
        Route::get('/courses', [StudentPortalController::class, 'courses']);
        Route::get('/grades', [StudentPortalController::class, 'grades']);
        Route::get('/grades/export', [ExportController::class, 'myTranscript']);
        Route::get('/attendance', [StudentPortalController::class, 'attendance']);
    });
});
