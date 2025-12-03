<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class RegisterController extends BaseController
{
    /**
     * Enregistrer un nouvel utilisateur et créer un token
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => User::USER_ROLE,
        ]);

        // Validation reCAPTCHA si fourni
        if ($request->has('g-recaptcha-response') && $request->input('g-recaptcha-response')) {
            if(!$this->validateCaptcha($request->input('g-recaptcha-response'))) {
                return response()->json(['message' => 'Captcha invalide'], 400);
            }
        }

        // Créer un token pour l'utilisateur
        $token = $user->createToken('auth_token')->plainTextToken;

        // S'assurer que is_admin et role sont inclus dans la réponse
        $userData = $user->only(['id', 'name', 'email', 'is_admin', 'role']);
        $userData['is_admin'] = (bool) $user->is_admin;
        $userData['role'] = $user->role;

        return $this->successResponse([
            'user' => $userData,
            'token' => $token,
            'token_type' => 'Bearer'
        ], 'Utilisateur enregistré avec succès', 201);
}

    /**
     * Connecter un utilisateur et créer un token
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        // Vérifier les identifiants
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->errorResponse('Identifiants invalides', null, 401);
        }

        // Créer un token pour l'utilisateur
        $token = $user->createToken('auth_token')->plainTextToken;

        // S'assurer que is_admin et role sont inclus dans la réponse
        $userData = $user->only(['id', 'name', 'email', 'is_admin', 'role']);
        $userData['is_admin'] = (bool) $user->is_admin;
        $userData['role'] = $user->role;

        return $this->successResponse([
            'user' => $userData,
            'token' => $token,
            'token_type' => 'Bearer'
        ], 'Connexion réussie');
    }

    /**
     * Déconnecter l'utilisateur (révoquer le token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Déconnexion réussie');
    }

    public function validateCaptcha($token) {
        if (empty($token) || empty(env('RECAPTCHA_SECRET_KEY'))) {
            return true; // Si pas de clé configurée, on accepte
        }
        try {
            $response = \Illuminate\Support\Facades\Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => env('RECAPTCHA_SECRET_KEY'),
                'response' => $token,
            ])->json();
            return $response['success'] ?? false;
        } catch (\Exception $e) {
            // En cas d'erreur, on accepte pour ne pas bloquer
            return true;
        }
    }
}

