<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class BaseController extends Controller
{
    /**
     * Retourne une réponse de succès
     */
    protected function successResponse($data = null, string $message = 'Opération réussie', int $code = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }

    /**
     * Retourne une réponse d'échec
     */
    protected function errorResponse(string $message = 'Une erreur est survenue', $errors = null, int $code = 400): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Retourne une réponse de validation échouée
     */
    protected function validationErrorResponse($errors, string $message = 'Erreur de validation'): JsonResponse
    {
        return $this->errorResponse($message, $errors, 422);
    }

    /**
     * Retourne une réponse de ressource non trouvée
     */
    protected function notFoundResponse(string $message = 'Ressource non trouvée'): JsonResponse
    {
        return $this->errorResponse($message, null, 404);
    }

    /**
     * Retourne une réponse d'accès refusé
     */
    protected function forbiddenResponse(string $message = 'Accès refusé'): JsonResponse
    {
        return $this->errorResponse($message, null, 403);
    }
}

