<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->user();
        if (! $user || ! in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'Bạn không có quyền truy cập chức năng này.'], 403);
        }
        return $next($request);
    }
}