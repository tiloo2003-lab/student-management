<?php

namespace App\Contracts\Support;

interface PdfRendererInterface
{
    public function render(string $view, array $data, string $orientation = 'portrait'): string;
}
