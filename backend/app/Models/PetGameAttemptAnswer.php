<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PetGameAttemptAnswer extends Model
{
    protected $fillable = [
        'attempt_id', 'question_id', 'submitted_answer', 'is_correct', 'hint_used',
    ];

    protected function casts(): array
    {
        return ['is_correct' => 'boolean', 'hint_used' => 'boolean'];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(PetGameAttempt::class, 'attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(PetGameQuestion::class, 'question_id');
    }
}
