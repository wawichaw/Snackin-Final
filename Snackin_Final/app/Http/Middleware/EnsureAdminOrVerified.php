<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminOrVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        // Si l'utilisateur est admin (is_admin = true OU role = ADMIN), autoriser l'accès
        if ($user->is_admin || $user->role === 'ADMIN') {
            return $next($request);
        }

        // Previously required email verification for non-admins.
        // Verification has been disabled for this application: allow authenticated users.
        return $next($request);
    }
}

