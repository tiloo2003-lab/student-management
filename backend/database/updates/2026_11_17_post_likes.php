<?php

// Additive update: does not change existing posts or their historical like counts.
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

if (! Schema::hasTable('post_likes')) {
    Schema::create('post_likes', function (Blueprint $table) {
        $table->unsignedBigInteger('user_id');
        $table->unsignedBigInteger('post_id');
        $table->timestamp('created_at')->useCurrent();
        $table->primary(['user_id', 'post_id']);
        $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        $table->foreign('post_id')->references('id')->on('posts')->cascadeOnDelete();
    });
}
