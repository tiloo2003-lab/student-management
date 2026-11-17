<?php

// Run from backend: php tests/portal-smoke.php. Uses only an in-memory database.
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:', 'demo.enabled' => true]);
Illuminate\Support\Facades\DB::purge('sqlite');

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Post;
use App\Models\User;
use App\Repositories\PostRepository;
use Illuminate\Http\Request;

function check($condition, string $message): void {
    if (! $condition) throw new RuntimeException($message);
    echo 'PASS '.$message.PHP_EOL;
}
Schema::create('users', function (Blueprint $t) { $t->id(); });
Schema::create('posts', function (Blueprint $t) { $t->id(); $t->unsignedInteger('likes_count')->default(0); $t->timestamps(); });
require 'database/updates/2026_11_17_post_likes.php';
require 'database/updates/2026_11_17_post_likes.php';
Illuminate\Support\Facades\DB::table('users')->insert([['id' => 1], ['id' => 2]]);
$post = Post::create(['likes_count' => 5]);
$repo = new PostRepository;
check($repo->setLiked($post, 1, true) === 6, 'Like increments once');
check($repo->setLiked($post, 1, true) === 6, 'Repeated like is idempotent');
check($repo->likedIds(1) === [$post->id], 'First account owns its like');
check($repo->likedIds(2) === [], 'Second account has independent state');
check($repo->setLiked($post, 2, false) === 6, 'Cannot remove another account like');
check($repo->setLiked($post, 1, false) === 5, 'Unlike preserves historical likes');
check($repo->setLiked($post, 1, false) === 5, 'Repeated unlike is idempotent');
foreach ([['PUT', '/api/password', null], ['POST', '/api/manage/posts', 'role:admin'], ['DELETE', '/api/students/2', 'role:admin'], ['POST', '/api/posts/1/like', null]] as [$method, $path, $role]) {
    $route = app('router')->getRoutes()->match(Request::create($path, $method));
    $middleware = $route->gatherMiddleware();
    check(in_array('auth:sanctum', $middleware), $path.' requires authentication');
    check(!in_array('App\\Http\\Middleware\\ProtectDemo', $middleware), $path.' has no demo write restriction');
    if ($role) check(in_array($role, $middleware), $path.' retains role restriction');
}
$roleMiddleware = new App\Http\Middleware\RoleMiddleware;
foreach (['admin' => 'admin1@school.test', 'teacher' => 'gv001@school.test', 'student' => 'sv0001@school.test'] as $role => $email) {
    $request = Request::create('/api/example', 'POST');
    $request->setUserResolver(fn () => new User(['email' => $email, 'role' => $role]));
    check($roleMiddleware->handle($request, fn () => response()->json([]), $role)->status() === 200, $role.' demo can access its role');
    if ($role !== 'admin') check($roleMiddleware->handle($request, fn () => response()->json([]), 'admin')->status() === 403, $role.' demo cannot access admin features');
}
echo 'All portal smoke checks passed.'.PHP_EOL;
