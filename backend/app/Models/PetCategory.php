<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class PetCategory extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'short_description',
        'detailed_description',
        'cover_image_path',
        'banner_image_path',
        'display_order',
        'is_active',
    ];

    protected $appends = ['cover_image_url', 'banner_image_url'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function images(): HasMany
    {
        return $this->hasMany(WebsiteImage::class)->orderBy('display_order')->orderBy('id');
    }

    public function varieties(): HasMany
    {
        return $this->hasMany(PetVariety::class)->orderBy('display_order')->orderBy('id');
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        return $this->imageUrl($this->cover_image_path);
    }

    public function getBannerImageUrlAttribute(): ?string
    {
        return $this->imageUrl($this->banner_image_path);
    }

    private function imageUrl(?string $path): ?string
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }
}
