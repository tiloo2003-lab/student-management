<?php

namespace App\Support;

use App\Contracts\Support\ImageStorageInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class PublicImageStorage implements ImageStorageInterface
{
    private const PREFIX = 'up-';

    public function store(UploadedFile $file, string $directory): string
    {
        $directory = trim($directory, '/');
        $name = self::PREFIX . Str::random(24) . '.' . $file->getClientOriginalExtension();
        $file->move(public_path($directory), $name);

        return $directory . '/' . $name;
    }

    public function delete(?string $path): void
    {
        if (! $path || ! str_starts_with(basename($path), self::PREFIX)) {
            return;
        }

        $full = public_path($path);
        if (is_file($full)) {
            @unlink($full);
        }
    }
}