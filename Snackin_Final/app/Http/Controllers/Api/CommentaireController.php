<?php

namespace App\Http\Controllers\Api;

use App\Models\Commentaire;
use App\Models\Biscuit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentaireController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Commentaire::with(['biscuit', 'utilisateur']);

        // Filtrer par biscuit si spécifié
        if ($request->filled('biscuit_id')) {
            $query->where('biscuit_id', $request->biscuit_id);
        }

        // Filtrer les commentaires modérés si demandé
        if ($request->filled('modere')) {
            $query->where('modere', filter_var($request->modere, FILTER_VALIDATE_BOOLEAN));
        }

        // Si admin, voir tous les commentaires, sinon seulement les modérés
        if (!Auth::check() || (!Auth::user()->is_admin && Auth::user()->role !== 'ADMIN')) {
            $query->where('modere', true);
        }

        $commentaires = $query->orderByDesc('created_at')->get();

        return $this->successResponse($commentaires);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'biscuit_id' => 'required|exists:biscuits,id',
            'texte' => 'required|string',
            'note' => 'nullable|integer|min:1|max:5',
            'nom_visiteur' => 'nullable|string|max:255',
            'email_visiteur' => 'nullable|email|max:255',
        ]);

        // Si l'utilisateur n'est pas connecté, utiliser les champs visiteur
        if (!Auth::check()) {
            $validated['utilisateur_id'] = null;
            $validated['nom_visiteur'] = $request->input('nom_visiteur');
            $validated['email_visiteur'] = $request->input('email_visiteur');
            $validated['auteur_affiche'] = $validated['nom_visiteur'] ?? 'Anonyme';
        } else {
            $validated['utilisateur_id'] = Auth::id();
            $validated['nom_visiteur'] = null;
            $validated['email_visiteur'] = null;
            $validated['auteur_affiche'] = Auth::user()->name;
        }

        // Par défaut, les nouveaux commentaires sont modérés (approuvés)
        $validated['modere'] = $request->has('modere') ? (bool) $request->modere : true;

        $commentaire = Commentaire::create($validated);
        $commentaire->load(['biscuit', 'utilisateur']);

        return $this->successResponse($commentaire, 'Commentaire créé avec succès', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $commentaire = Commentaire::with(['biscuit', 'utilisateur'])->find($id);
        
        if (!$commentaire) {
            return $this->notFoundResponse('Commentaire non trouvé');
        }

        // Si le commentaire n'est pas modéré, seuls les admins peuvent le voir
        if (!$commentaire->modere && 
            (!Auth::check() || (!Auth::user()->is_admin && Auth::user()->role !== 'ADMIN'))) {
            return $this->forbiddenResponse('Commentaire non modéré');
        }

        return $this->successResponse($commentaire);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $commentaire = Commentaire::find($id);
        
        if (!$commentaire) {
            return $this->notFoundResponse('Commentaire non trouvé');
        }

        // Seuls les admins peuvent modifier les commentaires
        if (!Auth::check() || (!Auth::user()->is_admin && Auth::user()->role !== 'ADMIN')) {
            return $this->forbiddenResponse();
        }

        $validated = $request->validate([
            'biscuit_id' => 'required|exists:biscuits,id',
            'texte' => 'required|string',
            'note' => 'nullable|integer|min:1|max:5',
            'nom_visiteur' => 'nullable|string|max:255',
            'email_visiteur' => 'nullable|email|max:255',
            'auteur_affiche' => 'nullable|string|max:150',
            'modere' => 'nullable|boolean',
        ]);

        $commentaire->update($validated);
        $commentaire->load(['biscuit', 'utilisateur']);

        return $this->successResponse($commentaire, 'Commentaire mis à jour avec succès');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $commentaire = Commentaire::find($id);
        
        if (!$commentaire) {
            return $this->notFoundResponse('Commentaire non trouvé');
        }

        // Seuls les admins peuvent supprimer les commentaires
        if (!Auth::check() || (!Auth::user()->is_admin && Auth::user()->role !== 'ADMIN')) {
            return $this->forbiddenResponse();
        }

        $commentaire->delete();

        return $this->successResponse(null, 'Commentaire supprimé avec succès');
    }

    /**
     * Modérer un commentaire (approuver/rejeter)
     */
    public function moderate(Request $request, string $id)
    {
        $commentaire = Commentaire::find($id);
        
        if (!$commentaire) {
            return $this->notFoundResponse('Commentaire non trouvé');
        }

        if (!Auth::check() || (!Auth::user()->is_admin && Auth::user()->role !== 'ADMIN')) {
            return $this->forbiddenResponse();
        }

        $request->validate([
            'action' => 'required|in:approve,reject'
        ]);

        if ($request->action === 'approve') {
            $commentaire->update(['modere' => true]);
            $message = 'Commentaire approuvé';
        } else {
            $commentaire->delete();
            return $this->successResponse(null, 'Commentaire rejeté et supprimé');
        }

        return $this->successResponse($commentaire, $message);
    }
}

