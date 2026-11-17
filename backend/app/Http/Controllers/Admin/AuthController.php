<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function csrfToken(): JsonResponse
    {
        return response()->json(['csrf_token' => csrf_token()]);
    }

    public function store(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);
        $credentials['email'] = trim($credentials['email']);
        $adminEmail = config('admin.super_admin_email');

        if (
            ! is_string($adminEmail)
            || $adminEmail === ''
            || ! hash_equals(strtolower($adminEmail), strtolower($credentials['email']))
            || ! Auth::attempt($credentials)
        ) {
            return response()->json([
                'message' => 'The provided administrator credentials are incorrect.',
                'errors' => ['email' => ['The provided administrator credentials are incorrect.']],
            ], 422);
        }

        $request->session()->regenerate();

        return $this->userResponse(Auth::user());
    }

    public function me(): JsonResponse
    {
        return $this->userResponse(Auth::user());
    }

    public function destroy(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Signed out.']);
    }

    private function userResponse(?User $user): JsonResponse
    {
        if (! $user || ! $user->isAdmin()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json([
            'user' => ['name' => $user->name, 'email' => $user->email],
            'csrf_token' => csrf_token(),
        ]);
    }
}
