<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\DashboardServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request, DashboardServiceInterface $dashboard)
    {
        return $dashboard->forUser($request->user());
    }
}
