<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            SaveurSeeder::class,
            BiscuitSeeder::class,
            CommentaireSeeder::class,
            UtilisateurSeeder::class,
            CommandeSeeder::class,
        ]);
    }
}
