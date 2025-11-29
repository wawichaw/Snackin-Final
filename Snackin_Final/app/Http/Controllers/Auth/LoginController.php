<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function __construct()
    {
        // invité pour login, mais logout accessible seulement si connecté
        $this->middleware('guest')->except('logout');
        $this->middleware('auth')->only('logout');
    }

    /**
     * Login avec reCAPTCHA + Sanctum (pour API / React)
     */
    public function login(Request $request)
    {
        // 1) Validation
        $validator = Validator::make($request->all(), [
            'email'                => ['required', 'email'],
            'password'             => ['required', 'string'],
            'g-recaptcha-response' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // 2) Vérification Google reCAPTCHA
        $googleResponse = Http::asForm()->post(
            'https://www.google.com/recaptcha/api/siteverify',
            [
                'secret'   => env('RECAPTCHA_SECRET_KEY'),
                'response' => $request['g-recaptcha-response'],
            ]
        );

        $captchaData = $googleResponse->json();

        if (!($captchaData['success'] ?? false)) {
            return response()->json([
                'message' => 'Échec de la vérification reCAPTCHA.',
            ], 400);
        }

        // 3) Vérifier les identifiants
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Identifiants invalides.',
            ], 401);
        }

        $user = Auth::user();

        // 4) Générer un token Sanctum pour l’API
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'user'    => $user,
            'token'   => $token,
        ], 200);
    }

    /**
     * Logout : gère à la fois API (token) et web (session)
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        // 1) Si on utilise un token Sanctum, on le supprime
        if ($user && method_exists($user, 'currentAccessToken')) {
            $token = $user->currentAccessToken();
            if ($token) {
                $token->delete();   // ici on vérifie bien que ce n’est pas null
            }
        }

        // 2) Déconnexion session (route /logout côté Blade / web)
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // 3) Réponse : JSON pour l’API, redirect pour le site web classique
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => 'Déconnexion réussie.',
            ]);
        }

        return redirect('/');
    }
}
