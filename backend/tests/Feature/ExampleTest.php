<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_homepage_api_returns_photo_collections(): void
    {
        $this->getJson('/api/homepage')
            ->assertOk()
            ->assertJsonStructure(['categories', 'hero_images', 'family_images', 'gallery_images']);
    }
}
