<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    protected $table = 'classes';

    protected $fillable = ['code', 'name', 'department_id', 'homeroom_teacher_id', 'academic_year'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function homeroomTeacher()
    {
        return $this->belongsTo(Teacher::class, 'homeroom_teacher_id')->with('user:id,name');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'class_id');
    }
}