<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class RegisterController extends Controller
{
    
    public function register(Request $request)
    {
        // 1) Validation de base
        $validator = Validator::make($request->all(), [
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'g-recaptcha-response'  => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // 2) Vérification reCAPTCHA Google
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
                'captcha' => $captchaData,
            ], 400);
        }

        // 3) Création du nouvel utilisateur
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => User::USER_ROLE,
        ]);

        // 4) Création d’un token Sanctum pour SPA
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie.',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }
}
