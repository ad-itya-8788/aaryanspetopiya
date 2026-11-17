<?php

namespace App\Http\Requests\PetGames;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class RegisterPlayerRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $mobile = preg_replace('/[\s-]+/', '', (string) $this->input('mobile'));
        if (preg_match('/^(?:\+?91|0)?([6-9]\d{9})$/', $mobile, $matches)) {
            $mobile = $matches[1];
        }

        $this->merge(['mobile' => $mobile]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:60'],
            'mobile' => ['required', 'string', 'regex:/^[6-9]\d{9}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'mobile.regex' => 'Enter a valid 10-digit Indian mobile number.',
        ];
    }
}
