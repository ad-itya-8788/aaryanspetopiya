<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PetGameQuestion extends Model
{
    protected $fillable = [
        'pet_game_id', 'question', 'image_or_audio', 'correct_answer',
        'wrong_options', 'explanation', 'is_active',
    ];

    protected function casts(): array
    {
        return ['wrong_options' => 'array', 'is_active' => 'boolean'];
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(PetGame::class, 'pet_game_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(PetGameAttemptAnswer::class, 'question_id');
    }
}
