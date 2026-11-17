<?php

namespace App\Http\Requests\PetGames;

use Illuminate\Foundation\Http\FormRequest;

class SubmitGameAnswerRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'question_id' => ['required', 'integer', 'exists:pet_game_questions,id'],
            'submitted_answer' => ['required', 'string', 'max:255'],
            'hint_used' => ['sometimes', 'boolean'],
        ];
    }
}
