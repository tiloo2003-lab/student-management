<?php

namespace App\Services;

use App\Models\{User, Teacher, Student, Semester, Course};
use App\Support\{GradeCalculator, Schedule};
use Illuminate\Support\Facades\{DB, Hash};
use RuntimeException;

class DemoExperienceService
{
    private function ensure(string $table, array $key, array $values): int
    {
        $row = DB::table($table)->where($key)->first();
        return $row ? $row->id : DB::table($table)->insertGetId($key + $values + ['created_at' => now(), 'updated_at' => now()]);
    }

    // Caller owns the transaction. Existing rows and credentials are never overwritten.
    public function populate(): array
    {
        $admin = User::where('email', 'admin1@school.test')->where('role', 'admin')->firstOrFail();
        $teacherUser = User::where('email', 'gv001@school.test')->where('role', 'teacher')->firstOrFail();
        $studentUser = User::where('email', 'sv0001@school.test')->where('role', 'student')->firstOrFail();
        $teacher = Teacher::where('user_id', $teacherUser->id)->firstOrFail();
        $student = Student::where('user_id', $studentUser->id)->firstOrFail();
        $semester = Semester::where('is_current', true)->firstOrFail();
        if (today()->lt($semester->start_date) || today()->gt($semester->end_date)) {
            throw new RuntimeException('Current semester must include today. No existing semester dates were changed.');
        }
        $class = DB::table('classes')->where('homeroom_teacher_id', $teacher->id)->first();
        $classId = $class?->id ?? $this->ensure('classes', ['code' => 'DEMO-LAB'], [
            'name' => 'Demo software practice class', 'department_id' => $teacher->department_id,
            'homeroom_teacher_id' => $teacher->id, 'academic_year' => $semester->academic_year,
        ]);
        $students = [$student->id];
        foreach (['An Nguyen', 'Binh Tran', 'Chi Le', 'Dung Pham', 'Ha Vu', 'Minh Do'] as $i => $name) {
            $number = $i + 1;
            $uid = $this->ensure('users', ['email' => "demo.learner{$number}@school.test"], [
                'name' => $name.' (Demo)', 'password' => Hash::make('password'), 'role' => 'student', 'status' => 'active',
            ]);
            $students[] = $this->ensure('students', ['user_id' => $uid], [
                'student_code' => "DEMO-S{$number}", 'class_id' => $classId,
                'date_of_birth' => '2005-06-15', 'gender' => 'other', 'address' => 'Sample data for portfolio demonstration',
            ]);
        }
        $result = [];
        foreach (['Web application practice', 'Software testing workshop', 'Portfolio project lab'] as $i => $name) {
            $number = $i + 1;
            $code = 'DEMO-'.$semester->id.'-'.$number;
            $subjectId = $this->ensure('subjects', ['code' => "DEMO-M{$number}"], [
                'name' => $name, 'credits' => 1, 'department_id' => $teacher->department_id,
                'description' => 'Sample course for recruiter walkthroughs.',
            ]);
            $course = Course::where('code', $code)->first();
            if (! $course) {
                $occupied = Course::where('semester_id', $semester->id)->where(function ($q) use ($teacher, $student) {
                    $q->where('teacher_id', $teacher->id)->orWhereHas('enrollments', fn ($q) => $q->where('student_id', $student->id));
                })->get();
                $slot = null;
                foreach (range(2, 7) as $day) {
                    foreach ([1, 4, 7, 10] as $period) {
                        $candidate = ['day_of_week' => $day, 'start_period' => $period, 'end_period' => $period + 1];
                        if (! $occupied->contains(fn ($c) => Schedule::conflicts($c, $candidate))) { $slot = $candidate; break 2; }
                    }
                }
                if (! $slot) throw new RuntimeException('No free timetable slot for demo courses.');
                $course = app(CourseService::class)->create($slot + [
                    'code' => $code, 'subject_id' => $subjectId, 'teacher_id' => $teacher->id,
                    'semester_id' => $semester->id, 'room' => "DEMO-LAB-{$number}", 'max_students' => 20,
                ]);
            }
            // Leave the main demo student unregistered to start the recruiter walkthrough at zero credits.
            foreach ($students as $index => $sid) {
                if ($index === 0) continue;
                $existing = DB::table('enrollments')->where(['student_id' => $sid, 'course_id' => $course->id])->exists();
                if ($existing) continue;
                $enrollment = app(EnrollmentService::class)->enroll($sid, $course);
                if ($i === 0) {
                    $mid = [7.5, 9, 7, 5, 3, null, 8][$index];
                    $final = [null, 9, 8, 6, 3, null, 8][$index];
                    $total = GradeCalculator::total($mid, $final);
                    DB::table('grades')->where('enrollment_id', $enrollment->id)->update([
                        'midterm' => $mid, 'final' => $final, 'total' => $total, 'letter' => GradeCalculator::letter($total),
                    ]);
                }
                if ($i !== 0) continue;
                $day = today()->subDay();
                $sessions = 0;
                while ($sessions < 5 && $day->gte($semester->start_date)) {
                    if ($day->dayOfWeekIso + 1 === (int) $course->day_of_week) {
                        $this->ensure('attendances', ['course_id' => $course->id, 'student_id' => $sid, 'date' => $day->toDateString()], [
                            'status' => $sessions === 0 ? ['present', 'late', 'excused', 'absent', 'present', 'present', 'present'][$index] : 'present',
                            'note' => 'Demo attendance record',
                        ]);
                        $sessions++;
                    }
                    $day->subDay();
                }
            }
            $result[] = $code.' - '.$name;
        }
        $available = app(RegistrationService::class)->available($studentUser);
        $registration = collect($available['courses'])->firstWhere('code', 'DEMO-'.$semester->id.'-3');
        if (! ($registration['registration']['eligible'] ?? false) && ! ($registration['registration']['registered'] ?? false)) {
            throw new RuntimeException('Demo registration is blocked: '.implode(' ', $registration['registration']['reasons'] ?? []));
        }
        foreach (['all' => 'Welcome to the interactive demo', 'teacher' => 'Demo: grade and take attendance', 'student' => 'Demo: try course registration'] as $role => $title) {
            $this->ensure('announcements', ['title' => $title, 'author_id' => $admin->id], [
                'content' => 'Open Workspace. Course codes starting with DEMO are sample practice data. Try the features available to your role; changes are saved.',
                'target_role' => $role,
            ]);
        }
        $category = $this->ensure('categories', ['slug' => 'demo-campus'], ['name' => 'Demo campus', 'description' => 'Recruiter walkthrough content']);
        $post = $this->ensure('posts', ['title' => 'Demo: explore the student management portal', 'author_id' => $admin->id], [
            'description' => 'A practice article for editing, comments, likes and shared links.', 'category_id' => $category,
            'content' => 'Welcome to the demo campus. Admins can manage sample content. Teachers can use DEMO course sections to enter grades and attendance. Students can review results and register for Portfolio project lab. Use this article to try comments and likes.',
        ]);
        foreach ([$teacherUser, $studentUser] as $u) {
            $this->ensure('comments', ['post_id' => $post, 'user_id' => $u->id, 'content' => 'Demo comment: ready to explore the portal.'], ['name' => $u->name]);
        }
        $this->ensure('contact_messages', ['email' => 'demo.visitor@school.test', 'subject' => 'Demo: request course information'], [
            'name' => 'Demo visitor', 'message' => 'Please share details about the software testing workshop.', 'is_read' => false,
        ]);
        return array_merge($result, ['Sample article: /posts/'.$post, 'Demo students: 6; notifications: 3; contact message: 1']);
    }
}
