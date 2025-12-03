<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateAdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = 'admin@snackin.com';
        $password = 'Admin123!';
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            User::create([
                'name' => 'Admin',
                'email' => $email,
                'password' => Hash::make($password),
                'is_admin' => true,
                'role' => User::ADMIN_ROLE,
            ]);
            $this->command->info("Admin créé : {$email} / {$password}");
        } else {
            $user->update([
                'name' => 'Admin',
                'password' => Hash::make($password),
                'is_admin' => true,
                'role' => User::ADMIN_ROLE,
            ]);
            $this->command->info("Admin mis à jour : {$email} / {$password}");
        }
    }
}

