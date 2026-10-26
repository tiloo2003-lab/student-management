<?php

namespace App\Services;

use App\Contracts\Repositories\SchoolClassRepositoryInterface;
use App\Contracts\Repositories\TeacherRepositoryInterface;
use App\Contracts\Services\SchoolClassServiceInterface;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SchoolClassService extends CrudService implements SchoolClassServiceInterface
{
    public function __construct(
        private SchoolClassRepositoryInterface $classes,
        private TeacherRepositoryInterface $teachers,
    ) {
        parent::__construct($classes);
    }

    public function create(array $data): Model
    {
        $this->assertHomeroomTeacher($data);

        return parent::create($data);
    }

    public function update(int|string $id, array $data): Model
    {
        $this->assertHomeroomTeacher($data, (int) $id);

        return parent::update($id, $data);
    }

    public function delete(int|string $id): void
    {
        $class = $this->classes->findOrFail($id);

        if ($class->students_count > 0) {
            throw new ConflictHttpException('This class still has students. Move them to another class before deleting.');
        }

        parent::delete($id);
    }

    private function assertHomeroomTeacher(array $data, ?int $classId = null): void
    {
        $teacherId = $data['homeroom_teacher_id'] ?? null;
        if (! $teacherId) {
            return;
        }

        $teacher = $this->teachers->findOrFail($teacherId);

        if ((int) $teacher->department_id !== (int) $data['department_id']) {
            throw new UnprocessableEntityHttpException('The homeroom teacher must belong to the same department as the class.');
        }

        $limit = (int) config('school.max_homeroom_classes');
        if ($this->classes->countByHomeroomTeacher((int) $teacherId, $classId) >= $limit) {
            throw new UnprocessableEntityHttpException("A teacher can be homeroom teacher of at most {$limit} classes.");
        }
    }
}
