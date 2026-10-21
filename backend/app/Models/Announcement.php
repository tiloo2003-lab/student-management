<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = ['title', 'content', 'author_id', 'target_role'];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id')->select('id', 'name');
    }
}