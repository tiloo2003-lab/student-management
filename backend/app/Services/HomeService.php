<?php

namespace App\Services;

use App\Contracts\Repositories\AnnouncementRepositoryInterface;
use App\Contracts\Repositories\CategoryRepositoryInterface;
use App\Contracts\Repositories\CourseRepositoryInterface;
use App\Contracts\Repositories\DepartmentRepositoryInterface;
use App\Contracts\Repositories\PostRepositoryInterface;
use App\Contracts\Repositories\StudentRepositoryInterface;
use App\Contracts\Repositories\TeacherRepositoryInterface;
use App\Contracts\Services\HomeServiceInterface;

class HomeService implements HomeServiceInterface
{
    public function __construct(
        private PostRepositoryInterface $posts,
        private CategoryRepositoryInterface $categories,
        private AnnouncementRepositoryInterface $announcements,
        private StudentRepositoryInterface $students,
        private TeacherRepositoryInterface $teachers,
        private DepartmentRepositoryInterface $departments,
        private CourseRepositoryInterface $courses,
    ) {
    }

    public function home(): array
    {
        $sections = $this->categories->withPostCounts(3)->map(fn ($category) => [
            'category' => $category->only(['id', 'name', 'slug']),
            'posts' => $this->posts->latestInCategory($category->id, 4),
        ]);

        return [
            'stats' => [
                'students' => $this->students->count(),
                'teachers' => $this->teachers->count(),
                'departments' => $this->departments->count(),
                'courses' => $this->courses->count(),
                'posts' => $this->posts->count(),
            ],
            'latest' => $this->posts->latest(9),
            'popular' => $this->posts->popular(6),
            'sections' => $sections,
            'announcements' => $this->announcements->recentPublic(6),
        ];
    }
}
