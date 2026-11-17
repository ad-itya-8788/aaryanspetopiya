<?php

namespace App\Services;

use App\Models\PetCategory;
use App\Models\PetVariety;
use App\Models\PetVarietyImage;
use App\Models\WebsiteImage;
use Illuminate\Support\Facades\Storage;

class WebsiteMediaStorage
{
    public function deleteIfUnreferenced(array $paths): void
    {
        foreach (array_unique(array_filter($paths)) as $path) {
            $isReferenced = PetCategory::query()
                ->where('cover_image_path', $path)
                ->orWhere('banner_image_path', $path)
                ->exists()
                || WebsiteImage::query()->where('image_path', $path)->exists()
                || PetVariety::query()->where('image_path', $path)->exists()
                || PetVarietyImage::query()->where('image_path', $path)->exists();

            if (! $isReferenced) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}
