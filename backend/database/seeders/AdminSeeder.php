<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('SUPER_ADMIN_EMAIL');
        $password = env('SUPER_ADMIN_PASSWORD');

        if (! $email || ! $password || strlen($password) < 5) {
            throw new RuntimeException('Set SUPER_ADMIN_EMAIL and a SUPER_ADMIN_PASSWORD of at least 14 characters in backend/.env before seeding.');
        }

        User::query()->firstOrCreate(
            ['email' => $email],
            ['name' => 'Super Admin', 'password' => $password],
        );
    }
}
