<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Biscuit;
use App\Models\Saveur;

class AddBaseBiscuitsSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer les saveurs existantes
        $saveurs = Saveur::all();
        
        if ($saveurs->isEmpty()) {
            $this->command->warn('Aucune saveur trouvée. Exécutez d\'abord SaveurSeeder.');
            return;
        }

        // Trouver les saveurs par nom
        $chocolat = $saveurs->where('nom_saveur', 'Chocolat')->first();
        $oreo = $saveurs->where('nom_saveur', 'Oreo')->first();
        $vanille = $saveurs->where('nom_saveur', 'Vanille')->first();
        $caramel = $saveurs->where('nom_saveur', 'Caramel')->first();
        $original = $saveurs->where('nom_saveur', 'Original')->first();
        $smores = $saveurs->where('nom_saveur', "S'mores")->first();

        $biscuits = [
            [
                'nom_biscuit' => 'Cookie Chocolat Classique',
                'prix' => 3.50,
                'description' => 'Notre cookie signature au chocolat noir, croquant à l\'extérieur et fondant à l\'intérieur.',
                'saveur_id' => $chocolat ? $chocolat->id : $saveurs->first()->id,
            ],
            [
                'nom_biscuit' => 'Cookie Oreo Deluxe',
                'prix' => 3.80,
                'description' => 'Un cookie inspiré du célèbre biscuit, avec des morceaux d\'Oreo et une crème onctueuse.',
                'saveur_id' => $oreo ? $oreo->id : $saveurs->first()->id,
            ],
            [
                'nom_biscuit' => 'Cookie Vanille Bourbon',
                'prix' => 3.25,
                'description' => 'Un cookie délicat à la vanille bourbon, parfait pour les amateurs de saveurs douces.',
                'saveur_id' => $vanille ? $vanille->id : $saveurs->first()->id,
            ],
            [
                'nom_biscuit' => 'Cookie Caramel Beurre Salé',
                'prix' => 3.75,
                'description' => 'L\'alliance parfaite entre le caramel et le beurre salé, un délice irrésistible.',
                'saveur_id' => $caramel ? $caramel->id : $saveurs->first()->id,
            ],
            [
                'nom_biscuit' => 'Cookie Original Snackin',
                'prix' => 3.00,
                'description' => 'Notre recette originale, simple et délicieuse, le classique qui fait notre réputation.',
                'saveur_id' => $original ? $original->id : $saveurs->first()->id,
            ],
            [
                'nom_biscuit' => 'Cookie S\'mores',
                'prix' => 4.00,
                'description' => 'Guimauve grillée, chocolat et biscuit graham, le goût du feu de camp dans un cookie.',
                'saveur_id' => $smores ? $smores->id : $saveurs->first()->id,
            ],
        ];

        foreach ($biscuits as $biscuitData) {
            // Vérifier si le biscuit existe déjà
            $exists = Biscuit::where('nom_biscuit', $biscuitData['nom_biscuit'])->first();
            if (!$exists) {
                Biscuit::create($biscuitData);
                $this->command->info("Biscuit créé : {$biscuitData['nom_biscuit']}");
            } else {
                $this->command->warn("Biscuit déjà existant : {$biscuitData['nom_biscuit']}");
            }
        }
    }
}

