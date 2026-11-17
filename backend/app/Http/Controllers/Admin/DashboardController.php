<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PetCategory;
use App\Models\Registration;
use App\Models\WebsiteImage;
use Illuminate\Support\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $categories = PetCategory::query()
            ->with('images')
            ->withCount([
                'varieties',
                'varieties as published_varieties_count' => fn ($query) => $query->where('is_active', true),
            ])
            ->orderBy('display_order')
            ->get();
        $images = WebsiteImage::query()
            ->with('category')
            ->orderBy('display_order')
            ->orderByDesc('id')
            ->get();
        $activityStart = Carbon::now()->subDays(29)->startOfDay();
        $activity = Registration::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', $activityStart)
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        $destinations = $images->where('is_active', true)
            ->map(fn (WebsiteImage $image) => $image->pet_category_id
                ? 'category:'.$image->pet_category_id
                : $image->section_key)
            ->filter()
            ->unique()
            ->count();

        return response()->json([
            'categories' => $categories->map(fn (PetCategory $category) => [
                'id' => $category->id,
                'title' => $category->title,
                'slug' => $category->slug,
                'short_description' => $category->short_description,
                'detailed_description' => $category->detailed_description,
                'cover_image_url' => $category->cover_image_url,
                'banner_image_url' => $category->banner_image_url,
                'display_order' => $category->display_order,
                'is_active' => $category->is_active,
                'images_count' => $category->images->where('is_active', true)->count(),
                'varieties_count' => $category->varieties_count,
                'published_varieties_count' => $category->published_varieties_count,
            ]),
            'category_overview' => $categories->map(fn (PetCategory $category) => [
                'id' => $category->id,
                'title' => $category->title,
                'is_active' => $category->is_active,
                'images_count' => $category->images->where('is_active', true)->count(),
                'varieties_count' => $category->published_varieties_count,
            ]),
            'website_activity' => $activity,
            'images' => $images->map(fn (WebsiteImage $image) => [
                'id' => $image->id,
                'url' => $image->url,
                'section_key' => $image->section_key,
                'pet_category_id' => $image->pet_category_id,
                'category_name' => $image->category?->title,
                'pet_name' => $image->pet_name,
                'alt_text' => $image->alt_text,
                'display_order' => $image->display_order,
                'is_active' => $image->is_active,
            ]),
            'stats' => [
                'categories' => $categories->where('is_active', true)->count(),
                'photos' => $images->where('is_active', true)->count(),
                'registrations' => Registration::query()->count(),
                'registrations_today' => Registration::query()
                    ->whereDate('created_at', Carbon::today())
                    ->count(),
                'registrations_last_30_days' => Registration::query()
                    ->where('created_at', '>=', $activityStart)
                    ->count(),
                'photo_destinations' => $destinations,
            ],
        ]);
    }
}
