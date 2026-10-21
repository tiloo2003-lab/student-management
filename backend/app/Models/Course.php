<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = ['code', 'subject_id', 'teacher_id', 'semester_id', 'room', 'day_of_week', 'start_period', 'end_period', 'max_students'];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class)->with('user:id,name');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }
}