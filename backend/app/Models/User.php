<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = ['name', 'email', 'password', 'role', 'phone', 'status'];

    protected $hidden = ['password', 'remember_token'];
    protected $appends = ['is_demo'];

    public function isDemo(): bool
    {
        return (bool) config('demo.enabled') && in_array(strtolower($this->email), config('demo.accounts', []), true);
    }

    public function getIsDemoAttribute(): bool
    {
        return $this->isDemo();
    }

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class);
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }
}
