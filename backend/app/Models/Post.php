<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = ['title', 'description', 'content', 'image', 'author_id', 'category_id', 'likes_count', 'views_count'];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) return null;
        return str_starts_with($this->image, 'http') ? $this->image : asset($this->image);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id')->select('id', 'name');
    }

    public function category()
    {
        return $this->belongsTo(Category::class)->select('id', 'name', 'slug');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
