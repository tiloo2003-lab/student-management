<?php

namespace App\Contracts\Support;

use Illuminate\Http\UploadedFile;

interface ImageStorageInterface
{
    public function store(UploadedFile $file, string $directory): string;

    public function delete(?string $path): void;
}