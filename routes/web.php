<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;
use App\Http\Controllers\Auth\SocialiteController;

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

        // Users — full CRUD
        Route::get('users', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
        Route::post('users', [App\Http\Controllers\Admin\UserController::class, 'store'])->name('users.store');
        Route::put('users/{user}', [App\Http\Controllers\Admin\UserController::class, 'update'])->name('users.update');
        Route::patch('users/{user}/status', [App\Http\Controllers\Admin\UserController::class, 'updateStatus'])->name('users.status');
        Route::delete('users/{user}', [App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('users.destroy');

        // Roles — full CRUD
        Route::get('roles', [App\Http\Controllers\Admin\RoleController::class, 'index'])->name('roles.index');
        Route::post('roles', [App\Http\Controllers\Admin\RoleController::class, 'store'])->name('roles.store');
        Route::put('roles/{role}', [App\Http\Controllers\Admin\RoleController::class, 'update'])->name('roles.update');
        Route::delete('roles/{role}', [App\Http\Controllers\Admin\RoleController::class, 'destroy'])->name('roles.destroy');
    });
});

require __DIR__.'/settings.php';

Route::get('/auth/google', [SocialiteController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [SocialiteController::class, 'handleGoogleCallback'])->name('auth.google.callback');
