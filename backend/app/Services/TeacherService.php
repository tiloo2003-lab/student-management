<?php

namespace App\Services;

use App\Contracts\Repositories\CourseRepositoryInterface;
use App\Contracts\Repositories\SemesterRepositoryInterface;
use App\Contracts\Repositories\TeacherRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Services\TeacherServiceInterface;
use App\Contracts\Support\TransactionInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Arr;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class TeacherService extends CrudService implements TeacherServiceInterface
{
    private const PROFILE_FIELDS = ['department_id', 'teacher_code', 'degree', 'specialization', 'hired_date'];

    public function __construct(
        private TeacherRepositoryInterface $teachers,
        private UserRepositoryInterface $users,
        private CourseRepositoryInterface $courses,
        private SemesterRepositoryInterface $semesters,
        private TransactionInterface $transaction,
    ) {
        parent::__construct($teachers);
    }

    public function create(array $data): Model
    {
        return $this->transaction->run(function () use ($data) {
            $user = $this->users->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'] ?? 'password',
                'role' => 'teacher',
                'status' => $data['status'] ?? 'active',
            ]);

            return $this->teachers->create(Arr::only($data, self::PROFILE_FIELDS) + ['user_id' => $user->id]);
        });
    }

    public function update(int|string $id, array $data): Model
    {
        $teacher = $this->teachers->findOrFail($id);

        if (($data['status'] ?? null) === 'inactive' && $teacher->user->status === 'active') {
            $this->assertHasNoCurrentCourses($teacher->id);
        }

        $this->transaction->run(function () use ($teacher, $data) {
            $account = ['name' => $data['name'], 'email' => $data['email'], 'phone' => $data['phone'] ?? null];
            if (! empty($data['password'])) {
                $account['password'] = $data['password'];
            }
            if (! empty($data['status'])) {
                $account['status'] = $data['status'];
            }

            $this->users->update($teacher->user, $account);
            $this->teachers->update($teacher, Arr::only($data, self::PROFILE_FIELDS));
        });

        return $this->teachers->findOrFail($id);
    }

    public function delete(int|string $id): void
    {
        $teacher = $this->teachers->findOrFail($id);

        try {
            $this->transaction->run(fn () => $this->users->delete($teacher->user));
        } catch (QueryException) {
            throw new ConflictHttpException('This teacher is assigned to courses or classes and cannot be deleted.');
        }
    }

    private function assertHasNoCurrentCourses(int $teacherId): void
    {
        $semester = $this->semesters->current();

        if ($semester && $this->courses->forTeacherInSemester($teacherId, $semester->id)->isNotEmpty()) {
            throw new UnprocessableEntityHttpException('This teacher is in charge of course sections in the current semester, so the account cannot be locked.');
        }
    }
}
