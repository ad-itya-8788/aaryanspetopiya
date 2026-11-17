<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PetVarietyImage extends Model
{
    protected $fillable = [
        'pet_variety_id',
        'image_path',
        'alt_text',
        'display_order',
    ];

    protected $appends = ['url'];

    protected function casts(): array
    {
        return ['display_order' => 'integer'];
    }

    public function variety(): BelongsTo
    {
        return $this->belongsTo(PetVariety::class, 'pet_variety_id');
    }

    public function getUrlAttribute(): ?string
    {
        if (! Storage::disk('public')->exists($this->image_path)) {
            return null;
        }

        return Storage::disk('public')->url($this->image_path);
    }
}
