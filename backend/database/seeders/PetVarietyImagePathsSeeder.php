<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PetVarietyImagePathsSeeder extends Seeder
{
    public function run(): void
    {
        $images = [
            ['category' => 'dogs', 'slug' => 'tibetan-mastiff', 'path' => 'website/varieties/tibetan-mastiff.jpg'],
            ['category' => 'dogs', 'slug' => 'shih-tzu', 'path' => 'website/varieties/shih-tzu.jpg'],
            ['category' => 'dogs', 'slug' => 'great-dane', 'path' => 'website/varieties/great-dane.jpg'],
            ['category' => 'dogs', 'slug' => 'labrador-retriever', 'path' => 'website/varieties/labrador-retriever.jpg'],
            ['category' => 'birds', 'slug' => 'macaw', 'path' => 'website/varieties/macaw.jpg'],
            ['category' => 'birds', 'slug' => 'galah-cockatoo', 'path' => 'website/varieties/galah-cockatoo.jpg'],
            ['category' => 'birds', 'slug' => 'lovebirds', 'path' => 'website/varieties/lovebirds.jpg'],
            ['category' => 'birds', 'slug' => 'sun-conure', 'path' => 'website/varieties/sun-conure.jpg'],
            ['category' => 'birds', 'slug' => 'african-grey', 'path' => 'website/varieties/african-grey.jpg'],
            ['category' => 'birds', 'slug' => 'yellow-crested-cockatoo', 'path' => 'website/varieties/yellow-crested-cockatoo.jpg'],
            ['category' => 'birds', 'slug' => 'sulphur-crested-cockatoo', 'path' => 'website/varieties/sulphur-crested-cockatoo.jpg'],
            ['category' => 'hamsters', 'slug' => 'hamster', 'path' => 'website/varieties/hamster.jpg'],
            ['category' => 'hares', 'slug' => 'hare', 'path' => 'website/varieties/hare.jpg'],
            ['category' => 'rabbits', 'slug' => 'rabbit', 'path' => 'website/varieties/rabbit.jpg'],
            ['category' => 'horses', 'slug' => 'thoroughbred', 'path' => 'website/varieties/thoroughbred.jpg'],
            ['category' => 'horses', 'slug' => 'kathiawari', 'path' => 'website/varieties/kathiawari.jpg'],
            ['category' => 'iguana', 'slug' => 'iguana', 'path' => 'website/varieties/iguana.jpg'],
        ];

        foreach ($images as $image) {
            $path = $image['path'];
            if (! Storage::disk('public')->exists($path) || ! is_file(public_path('storage/'.$path))) {
                $this->command->warn("Skipping {$image['slug']}: public image file is missing ({$path}).");
                continue;
            }

            $categoryId = DB::table('pet_categories')
                ->where('slug', $image['category'])
                ->value('id');

            $variety = $categoryId
                ? DB::table('pet_varieties')
                    ->where('pet_category_id', $categoryId)
                    ->where('slug', $image['slug'])
                    ->first(['id', 'image_path'])
                : null;

            if (! $variety) {
                $this->command->warn("Skipping {$image['slug']}: matching pet variety was not found.");
                continue;
            }

            if ($variety->image_path === $path) {
                $this->command->line("Already current: {$image['slug']} -> {$path}");
                continue;
            }

            DB::table('pet_varieties')
                ->where('id', $variety->id)
                ->update(['image_path' => $path]);

            $this->command->info("Updated {$image['slug']} -> {$path}");
        }
    }
}
