<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    protected $fillable = ['enrollment_id', 'midterm', 'final', 'total', 'letter'];

    protected $casts = ['midterm' => 'float', 'final' => 'float', 'total' => 'float'];

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }
}