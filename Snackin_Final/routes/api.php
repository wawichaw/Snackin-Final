<?php

use App\Http\Controllers\Api\BiscuitController;
use App\Http\Controllers\Api\CommandeController;
use App\Http\Controllers\Api\CommentaireController;
use App\Http\Controllers\Api\SaveurController;
use App\Http\Controllers\Api\ArticleController;

use App\Http\Controllers\Api\RegisterController as ApiAuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes d'authentification (publiques - pas besoin de token)
Route::post('/register', [ApiAuthController::class, 'register']);
Route::post('/login', [ApiAuthController::class, 'login']);

// Routes publiques (index et show accessibles sans authentification)
Route::get('/biscuits', [BiscuitController::class, 'index']);
// Autocomplétion pour les biscuits (doit être avant /biscuits/{id} pour éviter les conflits)
Route::get('/biscuits/autocomplete', [BiscuitController::class, 'autocomplete']);
Route::get('/biscuits/{id}', [BiscuitController::class, 'show']);

Route::get('/saveurs', [SaveurController::class, 'index']);
Route::get('/saveurs/{id}', [SaveurController::class, 'show']);

Route::get('/commentaires', [CommentaireController::class, 'index']);
Route::get('/commentaires/{id}', [CommentaireController::class, 'show']);

Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{id}', [ArticleController::class, 'show']);

// Routes protégées par authentification (nécessitent un token)
// Les actions store, update et destroy nécessitent l'authentification
Route::middleware('auth:sanctum')->group(function () {
    // Déconnexion (nécessite d'être authentifié)
Route::post('/logout', [ApiAuthController::class, 'logout']);
    
    // Routes API avec ressources - actions protégées
    // apiResource crée automatiquement : store, show, update, destroy
    // (sans create et edit car pas de vues en API)
    Route::post('/biscuits', [BiscuitController::class, 'store']);
    Route::put('/biscuits/{id}', [BiscuitController::class, 'update']);
    Route::delete('/biscuits/{id}', [BiscuitController::class, 'destroy']);

    
    // Commandes : toutes les actions nécessitent l'authentification
    Route::apiResource('commandes', CommandeController::class);
    
    Route::post('/commentaires', [CommentaireController::class, 'store']);
    Route::put('/commentaires/{id}', [CommentaireController::class, 'update']);
    Route::delete('/commentaires/{id}', [CommentaireController::class, 'destroy']);
    Route::post('/commentaires/{id}/moderate', [CommentaireController::class, 'moderate']);
    
    Route::post('/saveurs', [SaveurController::class, 'store']);
    Route::put('/saveurs/{id}', [SaveurController::class, 'update']);
    Route::delete('/saveurs/{id}', [SaveurController::class, 'destroy']);
    
    // Articles : nécessitent l'authentification
    Route::post('/articles', [ArticleController::class, 'store']);
});

