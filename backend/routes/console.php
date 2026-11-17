<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('demo:populate {--preview : Validate all additions then roll back}', function () {
    \Illuminate\Support\Facades\DB::beginTransaction();
    try {
        $items = app(\App\Services\DemoExperienceService::class)->populate();
        if ($this->option('preview')) \Illuminate\Support\Facades\DB::rollBack();
        else \Illuminate\Support\Facades\DB::commit();
        foreach ($items as $item) $this->line($item);
        $this->info($this->option('preview') ? 'Preview passed. No rows saved.' : 'Demo data added. Existing data and passwords preserved.');
    } catch (\Throwable $e) {
        \Illuminate\Support\Facades\DB::rollBack();
        $this->error($e->getMessage());
        return 1;
    }
})->purpose('Add recruiter demo scenarios without resetting existing data');

Artisan::command('portal:upgrade', function () {
    require database_path('updates/2026_11_17_post_likes.php');
    $this->info('Account-based likes are ready. Existing data was preserved.');
})->purpose('Apply the additive portal update without running unrelated migrations');

Artisan::command('demo:reset', function () {
    $db = \Illuminate\Support\Facades\DB::connection();
    if (! config('demo.allow_reset') || ! str_ends_with($db->getDatabaseName(), '_demo')) {
        $this->error('Reset requires DEMO_ALLOW_RESET=true and a dedicated database ending in _demo.');
        return 1;
    }
    if (! $this->confirm('Replace all sample data in '.$db->getDatabaseName().'?', false)) return 1;
    $sql = file_get_contents(base_path('../database/seed.sql'));
    $sql = preg_replace('/^USE\s+student_management\s*;/mi', '', $sql);
    try {
        $db->statement('SET FOREIGN_KEY_CHECKS = 0');
        if (\Illuminate\Support\Facades\Schema::hasTable('post_likes')) $db->table('post_likes')->truncate();
        $db->unprepared($sql);
    } finally {
        $db->statement('SET FOREIGN_KEY_CHECKS = 1');
    }
    $this->info('Demo sample data restored.');
})->purpose('Restore sample data only in an explicitly configured demo database');
