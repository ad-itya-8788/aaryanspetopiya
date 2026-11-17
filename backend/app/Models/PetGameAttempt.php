<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PetGameAttempt extends Model
{
    protected $fillable = [
        'game_player_id', 'pet_game_id', 'score', 'max_score', 'questions_answered',
        'correct_answers', 'wrong_answers', 'status', 'started_at', 'completed_at',
        'duration_seconds', 'token_hash',
    ];

    protected $hidden = ['token_hash'];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(GamePlayer::class, 'game_player_id');
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(PetGame::class, 'pet_game_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(PetGameAttemptAnswer::class, 'attempt_id');
    }
}
