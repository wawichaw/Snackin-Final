<?php

namespace App\Http\Controllers\Api;

use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ArticleController extends BaseController
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'contenu' => 'required|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Téléverser l'image si présente
        if ($request->hasFile('photo')) {
            $imageName = time() . '.' . $request->photo->extension();
            $request->photo->move(public_path('Contenu/img'), $imageName);
            $validated['photo'] = $imageName;
        }

        // Associer l'article à l'utilisateur connecté
        $validated['utilisateur_id'] = Auth::id();

        $article = Article::create($validated);
        $article->load('utilisateur');

        return $this->successResponse($article, 'Article créé avec succès', 201);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $articles = Article::with('utilisateur')->orderBy('created_at', 'desc')->get();
        return $this->successResponse($articles);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $article = Article::with('utilisateur')->find($id);
        
        if (!$article) {
            return $this->notFoundResponse('Article non trouvé');
        }

        return $this->successResponse($article);
    }
}
