<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PetCategory;
use App\Models\PetVariety;
use Illuminate\Http\JsonResponse;

class PetCategoryController extends Controller
{
    public function show(string $slug): JsonResponse
    {
        $category = PetCategory::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with([
                'images' => fn ($query) => $query->where('is_active', true),
                'varieties' => fn ($query) => $query->where('is_active', true)->with('images'),
            ])
            ->firstOrFail();

        return response()->json([
            'id' => $category->id,
            'title' => $category->title,
            'slug' => $category->slug,
            'short_description' => $category->short_description,
            'detailed_description' => $category->detailed_description,
            'cover_image_url' => $category->cover_image_url,
            'banner_image_url' => $category->banner_image_url,
            'images' => $category->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => $image->url,
                'alt_text' => $image->alt_text,
            ])->values(),
            'varieties' => $category->varieties->map(fn (PetVariety $variety) => [
                'id' => $variety->id,
                'name' => $variety->name,
                'slug' => $variety->slug,
                'short_description' => $variety->short_description,
                'detailed_description' => $variety->detailed_description,
                'image_url' => $variety->image_url,
                'characteristics' => $variety->characteristics,
                'images' => $variety->images->map(fn ($image) => [
                    'id' => $image->id,
                    'url' => $image->url,
                    'alt_text' => $image->alt_text,
                ])->values(),
            ])->values(),
        ]);
    }
}
