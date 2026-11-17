<?php

namespace Tests\Feature;

use App\Models\PetCategory;
use App\Models\PetVariety;
use App\Models\WebsiteImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomepageContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_returns_active_categories_and_managed_photos(): void
    {
        $category = PetCategory::create([
            'title' => 'Dogs',
            'slug' => 'dogs',
            'short_description' => 'Friendly companions.',
            'display_order' => 1,
        ]);
        PetCategory::create([
            'title' => 'Hidden category',
            'slug' => 'hidden-category',
            'display_order' => 2,
            'is_active' => false,
        ]);

        $categoryImage = WebsiteImage::create([
            'pet_category_id' => $category->id,
            'image_path' => 'website/dog.jpg',
            'alt_text' => 'Dogs',
            'display_order' => 1,
        ]);
        $heroImage = WebsiteImage::create([
            'section_key' => 'hero',
            'image_path' => 'website/hero.jpg',
            'alt_text' => 'Happy pets',
        ]);
        $galleryImage = WebsiteImage::create([
            'section_key' => 'gallery',
            'image_path' => 'website/gallery.jpg',
            'alt_text' => 'Milo',
            'pet_name' => 'Milo',
        ]);
        PetVariety::create([
            'pet_category_id' => $category->id,
            'name' => 'Labrador Retriever',
            'slug' => 'labrador-retriever',
            'short_description' => 'Friendly and active.',
            'display_order' => 1,
            'is_active' => true,
        ]);
        PetVariety::create([
            'pet_category_id' => $category->id,
            'name' => 'Hidden variety',
            'slug' => 'hidden-variety',
            'display_order' => 2,
            'is_active' => false,
        ]);

        $this->getJson('/api/homepage')
            ->assertOk()
            ->assertJsonPath('categories.0.title', 'Dogs')
            ->assertJsonPath('categories.0.short_description', 'Friendly companions.')
            ->assertJsonPath('categories.0.varieties_count', 1)
            ->assertJsonPath('categories.0.images.0.id', $categoryImage->id)
            ->assertJsonPath('hero_images.0.id', $heroImage->id)
            ->assertJsonFragment(['id' => $categoryImage->id, 'category_name' => 'Dogs'])
            ->assertJsonFragment([
                'id' => $galleryImage->id,
                'pet_name' => 'Milo',
                'category_name' => null,
            ])
            ->assertJsonMissing(['title' => 'Hidden category']);
    }

    public function test_homepage_returns_empty_photo_collections_when_database_has_no_content(): void
    {
        $this->getJson('/api/homepage')
            ->assertOk()
            ->assertExactJson([
                'categories' => [],
                'hero_images' => [],
                'family_images' => [],
                'gallery_images' => [],
            ]);
    }
}
