<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PuneAreaController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'areas' => config('pune_areas.areas', []),
        ]);
    }
}
