<?php

namespace App\Http\Requests\PetGames;

use Illuminate\Foundation\Http\FormRequest;

class StartGameAttemptRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'player_id' => ['required', 'integer', 'exists:game_players,id'],
            'player_token' => ['required', 'string', 'min:40', 'max:100'],
        ];
    }
}
