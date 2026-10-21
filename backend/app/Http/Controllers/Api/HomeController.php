<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\HomeServiceInterface;
use App\Http\Controllers\Controller;

class HomeController extends Controller
{
    public function __invoke(HomeServiceInterface $home)
    {
        return $home->home();
    }
}
