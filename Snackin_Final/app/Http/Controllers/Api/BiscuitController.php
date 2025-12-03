<?php

namespace App\Http\Controllers\Api;

use App\Models\Biscuit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BiscuitController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Biscuit::with('saveur');

        // Recherche par nom ou description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom_biscuit', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Filtre par saveur
        if ($request->filled('saveur')) {
            $saveur = $request->saveur;
            $query->whereHas('saveur', function($q) use ($saveur) {
                $q->where('nom_saveur', 'LIKE', $saveur);
            });
        }

        // Tri par prix
        if ($request->filled('prix')) {
            $query->orderBy('prix', $request->prix);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Limiter les résultats (par défaut 50, max 100)
        $limit = min($request->get('limit', 50), 100);
        $biscuits = $query->limit($limit)->get();
        
        return $this->successResponse($biscuits);
    }
        /**
     * Autocomplétion pour les biscuits (titre / description)
     */
    public function autocomplete(Request $request)
    {
        $term = $request->get('term', '');

        if (empty($term)) {
            return response()->json([]);
        }

        $biscuits = Biscuit::with('saveur')
            ->where(function ($q) use ($term) {
                $q->where('nom_biscuit', 'LIKE', "%{$term}%")
                  ->orWhere('description', 'LIKE', "%{$term}%");
            })
            ->limit(5)
            ->get()
            ->map(function ($biscuit) {
                return [
                    'id'         => $biscuit->id,
                    'nom'        => $biscuit->nom_biscuit,
                    'nom_saveur' => $biscuit->saveur ? $biscuit->saveur->nom_saveur : null,
                ];
            });

        // SearchBar.jsx attend juste un tableau simple (resp.data)
        return response()->json($biscuits, 200, [], JSON_UNESCAPED_UNICODE);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_biscuit' => 'required',
            'prix' => 'required|numeric',
            'description' => 'nullable',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg',
            'saveur_id' => 'required|exists:saveurs,id',
        ]);

        // Téléversement image
        if($request->hasFile('image')){
            $imageName = time(). '.' . $request->image->extension();
            $request->image->move(public_path('Contenu/img'), $imageName);
            $validated['image'] = $imageName;
        }

        $biscuit = Biscuit::create($validated);

        return $this->successResponse($biscuit, 'Biscuit créé avec succès', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $biscuit = Biscuit::with('saveur')->find($id);
        
        if (!$biscuit) {
            return $this->notFoundResponse('Biscuit non trouvé');
        }

        return $this->successResponse($biscuit);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $biscuit = Biscuit::find($id);
        
        if (!$biscuit) {
            return $this->notFoundResponse('Biscuit non trouvé');
        }

        $validated = $request->validate([
            'nom_biscuit' => 'required',
            'prix' => 'required|numeric',
            'description' => 'nullable',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg',
            'saveur_id' => 'required|exists:saveurs,id',
        ]);

        // Si nouvelle image
        if($request->hasFile('image')) {
            // Supprimer ancienne image
            if($biscuit->image && file_exists(public_path('Contenu/img/'. $biscuit->image))) {
                unlink(public_path('Contenu/img/' . $biscuit->image));
            }

            // Enregistrer nouvelle image
            $imageName = time(). '.' . $request->image->extension();
            $request->image->move(public_path('Contenu/img'), $imageName);
            $validated['image'] = $imageName;
        }

        $biscuit->update($validated);

        return $this->successResponse($biscuit, 'Biscuit modifié avec succès');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $biscuit = Biscuit::find($id);
        
        if (!$biscuit) {
            return $this->notFoundResponse('Biscuit non trouvé');
        }

        // Suppression fichier image
        if($biscuit->image && file_exists(public_path('Contenu/img/' . $biscuit->image))) {
            unlink(public_path('Contenu/img/' . $biscuit->image));
        }

        $biscuit->delete();

        return $this->successResponse(null, 'Biscuit supprimé avec succès');
    }
}
