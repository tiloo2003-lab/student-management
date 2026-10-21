<?php

namespace App\Support;

use App\Contracts\Support\PdfRendererInterface;
use Dompdf\Dompdf;
use Dompdf\Options;

class DompdfRenderer implements PdfRendererInterface
{
    public function render(string $view, array $data, string $orientation = 'portrait'): string
    {
        $tempDir = storage_path('app/dompdf');
        if (! is_dir($tempDir)) {
            mkdir($tempDir, 0775, true);
        }

        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isRemoteEnabled', false);
        $options->set('tempDir', $tempDir);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml(view($view, $data)->render(), 'UTF-8');
        $dompdf->setPaper('A4', $orientation);
        $dompdf->render();

        return $dompdf->output();
    }
}
