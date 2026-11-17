<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GamePlayer extends Model
{
    protected $fillable = ['name', 'mobile', 'access_token_hash'];

    protected $hidden = ['access_token_hash'];

    public function attempts(): HasMany
    {
        return $this->hasMany(PetGameAttempt::class);
    }
}
