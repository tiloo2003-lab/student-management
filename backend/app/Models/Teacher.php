<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    protected $fillable = ['user_id', 'department_id', 'teacher_code', 'degree', 'specialization', 'hired_date'];

    protected $appends = ['name', 'email', 'phone', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function getNameAttribute(): ?string
    {
        return $this->relationLoaded('user') ? $this->user?->name : null;
    }

    public function getEmailAttribute(): ?string
    {
        return $this->relationLoaded('user') ? $this->user?->email : null;
    }

    public function getPhoneAttribute(): ?string
    {
        return $this->relationLoaded('user') ? $this->user?->phone : null;
    }

    public function getStatusAttribute(): ?string
    {
        return $this->relationLoaded('user') ? $this->user?->status : null;
    }
}
