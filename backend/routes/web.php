<?php

use Illuminate\Support\Facades\Route;

Route::get('/admin/login', function () {
    return redirect()->away(config('admin.frontend_url').'/admin');
})->name('admin.login.page');
