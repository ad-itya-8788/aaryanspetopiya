<?php

namespace Tests\Feature;

use App\Models\PetCategory;
use App\Models\PetVariety;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminContentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Config::set('admin.super_admin_email', 'admin@example.test');
        $this->actingAs(User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.test',
            'password' => 'a-strong-test-password',
        ]));
    }

    public function test_super_admin_can_edit_category_content(): void
    {
        $category = PetCategory::create([
            'title' => 'Dogs',
            'slug' => 'dogs',
            'display_order' => 1,
        ]);

        $this->putJson('/api/admin/categories/'.$category->id, [
            'title' => 'Dogs and Puppies',
            'slug' => 'manual-slug-should-be-ignored',
            'display_order' => 3,
            'is_active' => '1',
        ])->assertOk();

        $this->assertDatabaseHas('pet_categories', [
            'id' => $category->id,
            'slug' => 'dogs-and-puppies',
            'display_order' => 3,
            'is_active' => 1,
        ]);
    }

    public function test_super_admin_can_upload_a_category_image(): void
    {
        Storage::fake('public');
        $category = PetCategory::create([
            'title' => 'Dogs',
            'slug' => 'dogs',
            'display_order' => 1,
        ]);
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/r9sAAAAASUVORK5CYII=', true);

        $this->post('/api/admin/images', [
            'pet_category_id' => $category->id,
            'pet_name' => 'Buddy',
            'display_order' => 1,
            'is_active' => '1',
            'image' => UploadedFile::fake()->createWithContent('dog.png', $png),
        ], ['Accept' => 'application/json'])->assertCreated();

        $this->assertDatabaseHas('website_images', [
            'pet_category_id' => $category->id,
            'section_key' => null,
            'alt_text' => 'Buddy',
            'pet_name' => 'Buddy',
            'is_active' => 1,
        ]);

        $image = \App\Models\WebsiteImage::query()->firstOrFail();
        Storage::disk('public')->assertExists($image->image_path);
    }

    public function test_super_admin_can_create_category_details_and_cover_image(): void
    {
        Storage::fake('public');
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/r9sAAAAASUVORK5CYII=', true);

        $response = $this->post('/api/admin/categories', [
            'title' => 'Rabbits',
            'slug' => 'manual-slug-should-be-ignored',
            'short_description' => 'Friendly companions.',
            'detailed_description' => 'A longer description.',
            'display_order' => 7,
            'is_active' => '1',
            'cover_image' => UploadedFile::fake()->createWithContent('rabbit.png', $png),
        ], ['Accept' => 'application/json'])->assertCreated();

        $category = PetCategory::query()->where('slug', 'rabbits')->firstOrFail();
        $response->assertJsonPath('category.slug', 'rabbits')
            ->assertJsonPath('category.short_description', 'Friendly companions.');
        Storage::disk('public')->assertExists($category->cover_image_path);
    }

    public function test_varieties_are_scoped_to_their_category_and_publicly_filter_hidden_records(): void
    {
        Storage::fake('public');
        $category = PetCategory::create(['title' => 'Dogs', 'slug' => 'dogs', 'display_order' => 1]);
        $otherCategory = PetCategory::create(['title' => 'Cats', 'slug' => 'cats', 'display_order' => 2]);
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/r9sAAAAASUVORK5CYII=', true);

        $response = $this->post('/api/admin/categories/'.$category->id.'/varieties', [
            'name' => 'Labrador Retriever',
            'slug' => 'manual-slug-should-be-ignored',
            'short_description' => 'Friendly and active.',
            'characteristics' => ['size' => 'Large', 'temperament' => 'Friendly'],
            'display_order' => 1,
            'is_active' => '1',
            'image' => UploadedFile::fake()->createWithContent('labrador.png', $png),
            'additional_images' => [UploadedFile::fake()->createWithContent('labrador-extra.png', $png)],
        ], ['Accept' => 'application/json'])->assertCreated();

        $variety = PetVariety::query()->findOrFail($response->json('variety.id'));
        $this->assertSame($category->id, $variety->pet_category_id);
        $this->assertSame('labrador-retriever', $variety->slug);
        $this->assertNull($variety->characteristics);
        $this->assertDatabaseCount('pet_variety_images', 1);
        Storage::disk('public')->assertExists($variety->image_path);

        $this->getJson('/api/admin/categories/'.$category->id.'/varieties')
            ->assertOk()
            ->assertJsonPath('varieties.0.name', 'Labrador Retriever');
        $this->getJson('/api/admin/categories/'.$otherCategory->id.'/varieties')
            ->assertOk()
            ->assertJsonPath('varieties', []);
        $this->getJson('/api/categories/dogs')
            ->assertOk()
            ->assertJsonPath('varieties.0.name', 'Labrador Retriever');

        $this->putJson('/api/admin/varieties/'.$variety->id, [
            'name' => 'Labrador Retriever',
            'display_order' => 1,
            'is_active' => false,
        ])->assertOk();
        $this->getJson('/api/categories/dogs')->assertJsonPath('varieties', []);
    }
}
