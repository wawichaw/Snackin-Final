<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
     ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\Localization::class,
        ]);
        
        // Enregistrer le middleware personnalisé avec un alias
        $middleware->alias([
            'admin.or.verified' => \App\Http\Middleware\EnsureAdminOrVerified::class,
        ]);
    })
    
    ->withExceptions(function (Exceptions $exceptions): void {
        // Forcer les routes API à retourner du JSON même en cas d'erreur
        $exceptions->shouldRenderJsonWhen(function ($request, Throwable $e) {
            if ($request->is('api/*')) {
                return true;
            }
            return $request->expectsJson();
        });
    })->create();
