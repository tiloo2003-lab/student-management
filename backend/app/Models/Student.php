<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = ['user_id', 'class_id', 'student_code', 'date_of_birth', 'gender', 'address'];

    protected $casts = ['date_of_birth' => 'date:Y-m-d'];

    protected $appends = ['name', 'email', 'phone', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
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
