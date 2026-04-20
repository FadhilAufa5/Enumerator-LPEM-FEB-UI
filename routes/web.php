<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Admin routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::inertia('enumerator', 'admin/enumerator/index')->name('enumerator.index');
        Route::inertia('wilayah', 'admin/wilayah/index')->name('wilayah.index');
        Route::inertia('survey', 'admin/survey/index')->name('survey.index');
        Route::inertia('assignment', 'admin/assignment/index')->name('assignment.index');
        Route::inertia('tracking', 'admin/tracking/index')->name('tracking.index');
        Route::inertia('laporan', 'admin/laporan/index')->name('laporan.index');
        Route::inertia('users', 'admin/users/index')->name('users.index');
        Route::inertia('roles', 'admin/roles/index')->name('roles.index');
    });
});

require __DIR__.'/settings.php';
