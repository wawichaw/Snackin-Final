<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\BiscuitController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\CommentaireController;
use App\Http\Controllers\SaveurController;
use App\Http\Controllers\LocalizationController;

// Entrée principale de la SPA Vue
Route::view('/', 'monopage')->name('home');

// (exemple Blade statique si besoin)
Route::view('/about', 'about')->name('about');

// Autocomplétion (backend classique)
Route::get('/biscuits/search', [BiscuitController::class, 'search'])->name('biscuits.search');

// Routes multipage classiques (si encore utilisées côté prof)
Route::resource('biscuits', BiscuitController::class);
Route::get('/biscuit', [BiscuitController::class, 'index'])->name('biscuit.index');

// Commentaires publics Blade
Route::get('/commentaires', [CommentaireController::class, 'public'])->name('commentaires.public');
Route::post('/commentaires', [CommentaireController::class, 'store'])->name('commentaires.store');

// CRUD complet pour commentaires en mode admin (Blade)
Route::get('/commentaires-crud', [CommentaireController::class, 'index'])->name('commentaires.index');
Route::get('/commentaires-crud/create', [CommentaireController::class, 'create'])->name('commentaires.create');
Route::get('/commentaires-crud/{commentaire}', [CommentaireController::class, 'show'])->name('commentaires.show');
Route::get('/commentaires-crud/{commentaire}/edit', [CommentaireController::class, 'edit'])->name('commentaires.edit');
Route::put('/commentaires-crud/{commentaire}', [CommentaireController::class, 'update'])->name('commentaires.update');
Route::delete('/commentaires-crud/{commentaire}', [CommentaireController::class, 'destroy'])->name('commentaires.destroy');

// Commentaires imbriqués sous un biscuit (admin)
Route::get('/biscuits/{biscuit}/commentaires',        [CommentaireController::class, 'index'])->name('biscuits.commentaires.index');
Route::get('/biscuits/{biscuit}/commentaires/create', [CommentaireController::class, 'create'])->name('biscuits.commentaires.create');
Route::post('/biscuits/{biscuit}/commentaires',       [CommentaireController::class, 'store'])->name('biscuits.commentaires.store');

// Sections protégées (admin / commandes) -> besoin d'être connecté
Route::middleware(['auth'])->group(function () {

    // Commentaires admin
    Route::get('/admin/commentaires', [CommentaireController::class, 'admin'])->name('commentaires.admin');
    Route::get('/admin/commentaires/{commentaire}', [CommentaireController::class, 'showAdmin'])->name('commentaires.show-admin');
    Route::get('/admin/commentaires/{commentaire}/edit', [CommentaireController::class, 'editAdmin'])->name('commentaires.edit-admin');
    Route::put('/admin/commentaires/{commentaire}', [CommentaireController::class, 'updateAdmin'])->name('commentaires.update-admin');
    Route::post('/admin/commentaires/{commentaire}/moderate', [CommentaireController::class, 'moderate'])->name('commentaires.moderate');
    Route::delete('/admin/commentaires/{commentaire}', [CommentaireController::class, 'destroy'])->name('commentaires.destroy-admin');

    // Saveurs admin
    Route::resource('saveurs', SaveurController::class);

    // Commandes
    Route::get('/commandes',  [CommandeController::class, 'create'])->name('commandes.create');
    Route::post('/commandes', [CommandeController::class, 'store'])->name('commandes.store');
    Route::get('/mes-commandes', [CommandeController::class, 'userOrders'])->name('mes.commandes');

    // Admin commandes
    Route::get('/admin/commandes', [CommandeController::class, 'index'])->name('commandes.index');
    Route::get('/admin/commandes/{commande}', [CommandeController::class, 'show'])->name('commandes.show');
    Route::get('/admin/commandes/{commande}/edit', [CommandeController::class, 'edit'])->name('commandes.edit');
    Route::put('/admin/commandes/{commande}', [CommandeController::class, 'update'])->name('commandes.update');
    Route::delete('/admin/commandes/{commande}', [CommandeController::class, 'destroy'])->name('commandes.destroy');

    // Home Blade (si besoin)
    Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home.blade');
});

Auth::routes();

// Langue
Route::get('/lang/{locale}', [LocalizationController::class, 'index'])->name('lang.switch');
Route::get('/debug-lang', function () {
    return view('debug-lang');
})->name('debug.lang');

// Catch-all SPA : tout le reste => Vue (monopage.blade)
Route::get('/{any}', function () {
    return view('monopage');
})->where('any', '.*');
