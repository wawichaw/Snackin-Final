<?php

namespace App\Http\Controllers\Api;

use App\Models\Commande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommandeController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Si l'utilisateur est admin, voir toutes les commandes
        // Sinon, voir uniquement ses commandes
        if (Auth::check() && (Auth::user()->is_admin || Auth::user()->role === 'ADMIN')) {
            $commandes = Commande::orderBy('created_at', 'desc')->get();
        } else {
            $commandes = Commande::where('utilisateur_id', Auth::id())
                ->orWhere('client_email', Auth::user()->email ?? '')
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return $this->successResponse($commandes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'taille_boite' => 'nullable|string',
            'quantites' => 'nullable|array',
            'email_client' => 'required|email',
            'nom_client' => 'required|string',
        ]);

        $commande = new Commande();
        $commande->utilisateur_id = Auth::id();
        $commande->client_nom = $request->input('nom_client');
        $commande->client_email = $request->input('email_client');
        
        // Calculer le prix total basé sur la taille de boîte
        $tailleBoite = $request->input('taille_boite');
        $prixBoite = $this->calculerPrixBoite($tailleBoite);
        
        $commande->details_json = json_encode([
            'taille' => $tailleBoite,
            'quantites' => $request->input('quantites', []),
        ]);
        $commande->status = 'en_attente';
        $commande->total_prix = $prixBoite;
        $commande->save();

        return $this->successResponse($commande, 'Commande créée avec succès', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $commande = Commande::find($id);
        
        if (!$commande) {
            return $this->notFoundResponse('Commande non trouvée');
        }

        // Vérifier les permissions
        if (!Auth::check() || 
            (!Auth::user()->is_admin && Auth::user()->role !== 'ADMIN' && 
             $commande->utilisateur_id !== Auth::id() && 
             $commande->client_email !== Auth::user()->email)) {
            return $this->forbiddenResponse();
        }

        return $this->successResponse($commande);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $commande = Commande::find($id);
        
        if (!$commande) {
            return $this->notFoundResponse('Commande non trouvée');
        }

        // Seuls les admins peuvent modifier les commandes
        if (!Auth::check() || (!Auth::user()->is_admin && Auth::user()->role !== 'ADMIN')) {
            return $this->forbiddenResponse();
        }

        $validated = $request->validate([
            'client_nom' => 'required|string|max:255',
            'client_email' => 'required|email',
            'status' => 'required|string|in:en_attente,en_preparation,prete,livree,annulee',
            'total_prix' => 'nullable|numeric|min:0',
        ]);

        $commande->update($validated);

        return $this->successResponse($commande, 'Commande mise à jour avec succès');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $commande = Commande::find($id);
        
        if (!$commande) {
            return $this->notFoundResponse('Commande non trouvée');
        }

        // Seuls les admins peuvent supprimer les commandes
        if (!Auth::check() || (!Auth::user()->is_admin && Auth::user()->role !== 'ADMIN')) {
            return $this->forbiddenResponse();
        }

        $commande->delete();

        return $this->successResponse(null, 'Commande supprimée avec succès');
    }

    /**
     * Calculer le prix d'une boîte selon sa taille
     */
    private function calculerPrixBoite($tailleBoite)
    {
        $prixParTaille = [
            '4' => 15.00,
            '6' => 20.00,
            '12' => 35.00,
        ];

        return $prixParTaille[$tailleBoite] ?? 0.00;
    }
}
