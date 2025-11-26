<?php

namespace App\Http\Controllers\Api;

use App\Models\Saveur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SaveurController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $saveurs = Saveur::orderBy('nom_saveur')->get();
        return $this->successResponse($saveurs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Seuls les admins peuvent créer des saveurs
        if (!Auth::check() || (!Auth::user()->is_admin && Auth::user()->role !== 'ADMIN')) {
            return $this->forbiddenResponse();
        }

        $validated = $request->validate([
            'nom_saveur' => 'required|string|max:255',
            'description' => 'nullable|string',
            'emoji' => 'nullable|string|max:10',
        ]);

        $saveur = Saveur::create($validated);

        return $this->successResponse($saveur, 'Saveur créée avec succès', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $saveur = Saveur::find($id);
        
        if (!$saveur) {
            return $this->notFoundResponse('Saveur non trouvée');
        }

        return $this->successResponse($saveur);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Seuls les admins peuvent modifier des saveurs
        if (!Auth::check() || (!Auth::user()->is_admin && Auth::user()->role !== 'ADMIN')) {
            return $this->forbiddenResponse();
        }

        $saveur = Saveur::find($id);
        
        if (!$saveur) {
            return $this->notFoundResponse('Saveur non trouvée');
        }

        $validated = $request->validate([
            'nom_saveur' => 'required|string|max:255',
            'description' => 'nullable|string',
            'emoji' => 'nullable|string|max:10',
        ]);

        $saveur->update($validated);

        return $this->successResponse($saveur, 'Saveur modifiée avec succès');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Seuls les admins peuvent supprimer des saveurs
        if (!Auth::check() || (!Auth::user()->is_admin && Auth::user()->role !== 'ADMIN')) {
            return $this->forbiddenResponse();
        }

        $saveur = Saveur::find($id);
        
        if (!$saveur) {
            return $this->notFoundResponse('Saveur non trouvée');
        }

        $saveur->delete();

        return $this->successResponse(null, 'Saveur supprimée avec succès');
    }
}

