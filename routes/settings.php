<?php

use App\Http\Controllers\Admin\SystemSettingController;
use App\Http\Controllers\Settings\LanguageController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    Route::get('settings/language', [LanguageController::class, 'edit'])->name('language.edit');
    Route::patch('settings/language', [LanguageController::class, 'update'])->name('language.update');
});

Route::post('locale', [LanguageController::class, 'setLocale'])->name('locale.set');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('settings', [SystemSettingController::class, 'index'])->name('settings.index');
        Route::post('settings', [SystemSettingController::class, 'update'])->name('settings.update');
        Route::post('settings/reset', [SystemSettingController::class, 'reset'])->name('settings.reset');
        Route::post('settings/clear-cache', [SystemSettingController::class, 'clearCache'])->name('settings.clear-cache');
        Route::post('settings/warm-cache', [SystemSettingController::class, 'warmCache'])->name('settings.warm-cache');
    });
});
