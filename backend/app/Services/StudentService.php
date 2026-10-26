<?php

namespace App\Services;

use App\Contracts\Repositories\EnrollmentRepositoryInterface;
use App\Contracts\Repositories\StudentRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Services\StudentServiceInterface;
use App\Contracts\Support\TransactionInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class StudentService extends CrudService implements StudentServiceInterface
{
    private const PROFILE_FIELDS = ['class_id', 'student_code', 'date_of_birth', 'gender', 'address'];

    public function __construct(
        private StudentRepositoryInterface $students,
        private UserRepositoryInterface $users,
        private EnrollmentRepositoryInterface $enrollments,
        private TransactionInterface $transaction,
    ) {
        parent::__construct($students);
    }

    public function create(array $data): Model
    {
        $this->assertClassHasRoom((int) $data['class_id']);

        return $this->transaction->run(function () use ($data) {
            $user = $this->users->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'] ?? 'password',
                'role' => 'student',
                'status' => $data['status'] ?? 'active',
            ]);

            return $this->students->create(Arr::only($data, self::PROFILE_FIELDS) + ['user_id' => $user->id]);
        });
    }

    public function update(int|string $id, array $data): Model
    {
        $student = $this->students->findOrFail($id);

        if ((int) $data['class_id'] !== (int) $student->class_id) {
            $this->assertClassHasRoom((int) $data['class_id']);
        }

        $this->transaction->run(function () use ($student, $data) {
            $account = ['name' => $data['name'], 'email' => $data['email'], 'phone' => $data['phone'] ?? null];
            if (! empty($data['password'])) {
                $account['password'] = $data['password'];
            }
            if (! empty($data['status'])) {
                $account['status'] = $data['status'];
            }

            $this->users->update($student->user, $account);
            $this->students->update($student, Arr::only($data, self::PROFILE_FIELDS));
        });

        return $this->students->findOrFail($id);
    }

    public function delete(int|string $id): void
    {
        $student = $this->students->findOrFail($id);

        if ($this->enrollments->countGradedForStudent($student->id) > 0) {
            throw new ConflictHttpException('This student already has grades and cannot be deleted. Lock the account instead.');
        }

        $this->users->delete($student->user);
    }

    private function assertClassHasRoom(int $classId): void
    {
        $limit = (int) config('school.max_class_size');

        if ($this->students->countInClass($classId) >= $limit) {
            throw new UnprocessableEntityHttpException("This class has reached the maximum of {$limit} students.");
        }
    }
}
