<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:150'],
            'mobile' => ['required', 'string', 'regex:/^[6-9][0-9]{9}$/'],
            'email' => ['nullable', 'email:rfc', 'max:254'],
            'insta_id' => ['nullable', 'string', 'max:100'],
            'area' => ['required', 'string', 'max:150'],
            'address' => ['required', 'string', 'max:1000'],
        ]);

        $data['state'] = 'Maharashtra';
        $data['district'] = 'Pune';
        $data['city'] = 'Pune';

        Registration::create($data);

        return response()->json(['message' => 'Registration received.'], 201);
    }
}
