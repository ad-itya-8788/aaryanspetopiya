<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PetGame extends Model
{
    protected $fillable = ['title', 'slug', 'description', 'game_type', 'difficulty', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function questions(): HasMany
    {
        return $this->hasMany(PetGameQuestion::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(PetGameAttempt::class);
    }
}
