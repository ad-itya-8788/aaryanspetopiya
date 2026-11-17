<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PetCategory;
use App\Models\WebsiteImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class HomepageController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $categories = PetCategory::query()
            ->where('is_active', true)
            ->with(['images' => fn ($query) => $query->where('is_active', true)])
            ->withCount(['varieties as varieties_count' => fn ($query) => $query->where('is_active', true)])
            ->orderBy('display_order')
            ->orderBy('title')
            ->get()
            ->map(fn (PetCategory $category) => [
                'id' => $category->id,
                'title' => $category->title,
                'slug' => $category->slug,
                'short_description' => $category->short_description,
                'display_order' => $category->display_order,
                'varieties_count' => $category->varieties_count,
                'cover_image_url' => $category->cover_image_url,
                'banner_image_url' => $category->banner_image_url,
                'images' => $this->images($category->images),
            ]);

        $galleryImages = WebsiteImage::query()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->where('section_key', 'gallery')
                    ->orWhereNotNull('pet_category_id');
            })
            ->with('category')
            ->orderBy('display_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'categories' => $categories,
            'hero_images' => $this->images($this->sectionImages('hero')),
            'family_images' => $this->images($this->sectionImages('family')),
            'gallery_images' => $this->images($galleryImages, true),
        ]);
    }

    private function sectionImages(string $sectionKey): Collection
    {
        return WebsiteImage::query()
            ->where('section_key', $sectionKey)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('id')
            ->get();
    }

    private function images(Collection $images, bool $includeCategory = false): array
    {
        return $images->map(fn (WebsiteImage $image) => [
            'id' => $image->id,
            'url' => $image->url,
            'alt_text' => $image->alt_text,
            'pet_name' => $image->pet_name,
            'display_order' => $image->display_order,
            'category_name' => $includeCategory ? $image->category?->title : null,
        ])->all();
    }
}
