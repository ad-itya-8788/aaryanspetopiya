<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PetCategoryController;
use App\Http\Controllers\Admin\RegistrationController as AdminRegistrationController;
use App\Http\Controllers\Admin\WebsiteImageController;
use App\Http\Controllers\Api\HomepageController;
use App\Http\Controllers\Api\PetCategoryController as ApiPetCategoryController;
use App\Http\Controllers\Api\PuneAreaController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\PetGamesController;
use App\Http\Controllers\Admin\PetGamesAdminController;
use App\Http\Controllers\Admin\PetVarietyController;
use Illuminate\Support\Facades\Route;

Route::get('/homepage', HomepageController::class)->name('api.homepage');
Route::get('/pune-areas', PuneAreaController::class)->name('api.pune-areas');
Route::get('/categories/{slug}', [ApiPetCategoryController::class, 'show'])->name('api.categories.show');
Route::post('/registrations', [RegistrationController::class, 'store'])->middleware('throttle:120,1');

Route::prefix('pet-games')->middleware('throttle:30,1')->group(function () {
    Route::get('/', [PetGamesController::class, 'index']);
    Route::post('/players', [PetGamesController::class, 'registerPlayer']);
    Route::post('/{slug}/attempts', [PetGamesController::class, 'start']);
    Route::post('/attempts/{attemptId}/questions/{questionId}/hint', [PetGamesController::class, 'hint']);
    Route::post('/attempts/{attemptId}/answers', [PetGamesController::class, 'answer']);
    Route::post('/attempts/{attemptId}/complete', [PetGamesController::class, 'complete']);
    Route::post('/attempts/{attemptId}/abandon', [PetGamesController::class, 'abandon']);
});

Route::middleware('web')->prefix('admin')->group(function () {
    Route::get('/csrf', [AuthController::class, 'csrfToken']);
    Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:5,1');

    Route::middleware(['auth', 'admin'])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'destroy']);
        Route::get('/dashboard', DashboardController::class);
        Route::get('/pet-games/analytics', [PetGamesAdminController::class, 'analytics']);
        Route::get('/pet-games/games', [PetGamesAdminController::class, 'games']);
        Route::patch('/pet-games/games/{game}', [PetGamesAdminController::class, 'updateGame']);
        Route::get('/pet-games/questions', [PetGamesAdminController::class, 'questions']);
        Route::post('/pet-games/questions', [PetGamesAdminController::class, 'storeQuestion']);
        Route::put('/pet-games/questions/{question}', [PetGamesAdminController::class, 'updateQuestion']);
        Route::patch('/pet-games/questions/{question}/disable', [PetGamesAdminController::class, 'disableQuestion']);
        Route::get('/pet-games/players', [PetGamesAdminController::class, 'players']);
        Route::get('/pet-games/attempts', [PetGamesAdminController::class, 'attempts']);
        Route::get('/registrations', [AdminRegistrationController::class, 'index']);
        Route::get('/registrations/export', [AdminRegistrationController::class, 'export'])->name('admin.registrations.export');
        Route::get('/registrations/{registration}', [AdminRegistrationController::class, 'show']);
        Route::get('/categories/{category}/varieties', [PetVarietyController::class, 'index']);
        Route::post('/categories/{category}/varieties', [PetVarietyController::class, 'store']);
        Route::put('/varieties/{variety}', [PetVarietyController::class, 'update']);
        Route::delete('/varieties/{variety}', [PetVarietyController::class, 'destroy']);
        Route::delete('/variety-images/{image}', [PetVarietyController::class, 'destroyImage']);
        Route::post('/categories', [PetCategoryController::class, 'store']);
        Route::put('/categories/{category}', [PetCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [PetCategoryController::class, 'destroy']);
        Route::post('/images', [WebsiteImageController::class, 'store']);
        Route::put('/images/{image}', [WebsiteImageController::class, 'update']);
        Route::delete('/images/{image}', [WebsiteImageController::class, 'destroy']);
    });
});
