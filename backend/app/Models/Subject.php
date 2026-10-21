<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = ['code', 'name', 'credits', 'department_id', 'description'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}