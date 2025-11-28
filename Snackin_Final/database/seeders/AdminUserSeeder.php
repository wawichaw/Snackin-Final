<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = 'admin@snackin.com';
        $user = User::where('email', $email)->first();
        if (!$user) {
            User::create([
                'name' => 'Admin',
                'email' => $email,
                'password' => Hash::make('admin'),
                'is_admin' => true,
                'role' => User::ADMIN_ROLE ?? 'ADMIN',
            ]);
        } else {
            $user->update([
                'name' => 'Admin',
                'password' => Hash::make('admin'),
                'is_admin' => true,
                'role' => User::ADMIN_ROLE ?? 'ADMIN',
            ]);
        }
        
        $uemail = 'user@snackin.com';
        $user2 = User::where('email', $uemail)->first();
        if (!$user2) {
            User::create([
                'name' => 'Utilisateur Test',
                'email' => $uemail,
                'password' => Hash::make('password'),
                'is_admin' => false,
                'role' => User::USER_ROLE ?? 'USER',
            ]);
        }
    }
}
