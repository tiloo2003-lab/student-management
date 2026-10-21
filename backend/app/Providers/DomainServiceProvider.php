<?php

namespace App\Providers;

use App\Contracts\Repositories as R;
use App\Contracts\Services as S;
use App\Contracts\Support\ImageStorageInterface;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\SubjectController;
use App\Repositories;
use App\Services;
use App\Contracts\Support\LoginThrottleInterface;
use App\Contracts\Support\TransactionInterface;
use App\Support\CacheLoginThrottle;
use App\Support\DatabaseTransaction;
use App\Support\PublicImageStorage;
use Illuminate\Support\ServiceProvider;

class DomainServiceProvider extends ServiceProvider
{
    private const REPOSITORIES = [
        R\UserRepositoryInterface::class => Repositories\UserRepository::class,
        R\DepartmentRepositoryInterface::class => Repositories\DepartmentRepository::class,
        R\SubjectRepositoryInterface::class => Repositories\SubjectRepository::class,
        R\SemesterRepositoryInterface::class => Repositories\SemesterRepository::class,
        R\SchoolClassRepositoryInterface::class => Repositories\SchoolClassRepository::class,
        R\TeacherRepositoryInterface::class => Repositories\TeacherRepository::class,
        R\StudentRepositoryInterface::class => Repositories\StudentRepository::class,
        R\CourseRepositoryInterface::class => Repositories\CourseRepository::class,
        R\EnrollmentRepositoryInterface::class => Repositories\EnrollmentRepository::class,
        R\GradeRepositoryInterface::class => Repositories\GradeRepository::class,
        R\AttendanceRepositoryInterface::class => Repositories\AttendanceRepository::class,
        R\AnnouncementRepositoryInterface::class => Repositories\AnnouncementRepository::class,
        R\CategoryRepositoryInterface::class => Repositories\CategoryRepository::class,
        R\PostRepositoryInterface::class => Repositories\PostRepository::class,
        R\CommentRepositoryInterface::class => Repositories\CommentRepository::class,
        R\ContactMessageRepositoryInterface::class => Repositories\ContactMessageRepository::class,
    ];

    private const SERVICES = [
        S\AuthServiceInterface::class => Services\AuthService::class,
        S\DashboardServiceInterface::class => Services\DashboardService::class,
        S\HomeServiceInterface::class => Services\HomeService::class,
        S\SemesterServiceInterface::class => Services\SemesterService::class,
        S\TeacherServiceInterface::class => Services\TeacherService::class,
        S\StudentServiceInterface::class => Services\StudentService::class,
        S\CourseServiceInterface::class => Services\CourseService::class,
        S\AnnouncementServiceInterface::class => Services\AnnouncementService::class,
        S\CategoryServiceInterface::class => Services\CategoryService::class,
        S\PostServiceInterface::class => Services\PostService::class,
        S\CommentServiceInterface::class => Services\CommentService::class,
        S\ContactServiceInterface::class => Services\ContactService::class,
        S\TeacherPortalServiceInterface::class => Services\TeacherPortalService::class,
        S\EnrollmentServiceInterface::class => Services\EnrollmentService::class,
        S\RegistrationServiceInterface::class => Services\RegistrationService::class,
        S\AcademicServiceInterface::class => Services\AcademicService::class,
        S\ReportServiceInterface::class => Services\ReportService::class,
        S\SchoolClassServiceInterface::class => Services\SchoolClassService::class,
        S\StudentPortalServiceInterface::class => Services\StudentPortalService::class,
    ];

    private const GENERIC_CRUD = [
        DepartmentController::class => R\DepartmentRepositoryInterface::class,
        SubjectController::class => R\SubjectRepositoryInterface::class,
    ];

    public function register(): void
    {
        foreach (self::REPOSITORIES as $abstract => $concrete) {
            $this->app->bind($abstract, $concrete);
        }

        foreach (self::SERVICES as $abstract => $concrete) {
            $this->app->bind($abstract, $concrete);
        }

        $this->app->bind(ImageStorageInterface::class, PublicImageStorage::class);
        $this->app->bind(TransactionInterface::class, DatabaseTransaction::class);
        $this->app->bind(LoginThrottleInterface::class, CacheLoginThrottle::class);

        foreach (self::GENERIC_CRUD as $controller => $repository) {
            $this->app->when($controller)
                ->needs(S\CrudServiceInterface::class)
                ->give(fn ($app) => new Services\CrudService($app->make($repository)));
        }
    }
}