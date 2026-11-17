<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GamePlayer;
use App\Models\PetGame;
use App\Models\PetGameAttempt;
use App\Models\PetGameQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class PetGamesAdminController extends Controller
{
    public function analytics(): JsonResponse
    {
        $popularGame = PetGame::query()
            ->withCount('attempts')
            ->orderByDesc('attempts_count')
            ->orderBy('title')
            ->first();

        return response()->json([
            'total_players' => GamePlayer::query()->count(),
            'total_attempts' => PetGameAttempt::query()->count(),
            'completed' => PetGameAttempt::query()->where('status', 'completed')->count(),
            'played_today' => PetGameAttempt::query()->whereDate('started_at', Carbon::today())->count(),
            'total_points' => PetGameAttempt::query()->where('status', 'completed')->sum('score'),
            'most_popular_game' => $popularGame && $popularGame->attempts_count
                ? ['title' => $popularGame->title, 'attempts' => $popularGame->attempts_count]
                : null,
            'highest_score' => PetGameAttempt::query()->where('status', 'completed')->max('score') ?? 0,
            'recent_activity' => PetGameAttempt::query()
                ->with(['player:id,name,mobile', 'game:id,title'])
                ->latest('started_at')
                ->limit(10)
                ->get()
                ->map(fn (PetGameAttempt $attempt) => [
                    'id' => $attempt->id,
                    'player' => $attempt->player->name,
                    'mobile' => $attempt->player->mobile,
                    'game' => $attempt->game->title,
                    'score' => $attempt->score,
                    'max_score' => $attempt->max_score,
                    'status' => $attempt->status,
                    'started_at' => $attempt->started_at,
                ]),
        ]);
    }

    public function games(): JsonResponse
    {
        return response()->json([
            'games' => PetGame::query()
                ->withCount(['questions', 'attempts'])
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function updateGame(Request $request, PetGame $game): JsonResponse
    {
        $values = $request->validate(['is_active' => ['required', 'boolean']]);
        $game->update($values);

        return response()->json(['game' => $game->fresh()]);
    }

    public function questions(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:150'],
            'game_id' => ['nullable', 'integer', 'exists:pet_games,id'],
            'is_active' => ['nullable', Rule::in(['0', '1'])],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $query = PetGameQuestion::query()->with('game:id,title,slug')->orderByDesc('id');

        if (! empty($filters['q'])) {
            $query->where(function ($builder) use ($filters) {
                $builder->where('question', 'like', '%'.$filters['q'].'%')
                    ->orWhere('correct_answer', 'like', '%'.$filters['q'].'%');
            });
        }
        if (! empty($filters['game_id'])) {
            $query->where('pet_game_id', $filters['game_id']);
        }
        if (isset($filters['is_active'])) {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        return response()->json($query->paginate($filters['per_page'] ?? 20));
    }

    public function storeQuestion(Request $request): JsonResponse
    {
        $question = PetGameQuestion::query()->create($this->validatedQuestion($request));

        return response()->json(['question' => $question->load('game:id,title')], 201);
    }

    public function updateQuestion(Request $request, PetGameQuestion $question): JsonResponse
    {
        $question->update($this->validatedQuestion($request, $question));

        return response()->json(['question' => $question->fresh('game:id,title')]);
    }

    public function disableQuestion(PetGameQuestion $question): JsonResponse
    {
        $question->update(['is_active' => false]);

        return response()->json(['message' => 'Question disabled.']);
    }

    public function players(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:150'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $query = GamePlayer::query()
            ->withCount('attempts')
            ->withMax('attempts', 'score')
            ->withMax('attempts', 'started_at')
            ->orderByDesc('id');

        if (! empty($filters['q'])) {
            $query->where(function ($builder) use ($filters) {
                $builder->where('name', 'like', '%'.$filters['q'].'%')
                    ->orWhere('mobile', 'like', '%'.$filters['q'].'%');
            });
        }

        return response()->json($query->paginate($filters['per_page'] ?? 20));
    }

    public function attempts(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:150'],
            'game_id' => ['nullable', 'integer', 'exists:pet_games,id'],
            'status' => ['nullable', Rule::in(['in_progress', 'completed', 'abandoned'])],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $query = PetGameAttempt::query()
            ->with(['player:id,name,mobile', 'game:id,title'])
            ->withCount(['answers as correct_count' => fn ($answers) => $answers->where('is_correct', true)])
            ->orderByDesc('started_at');

        if (! empty($filters['q'])) {
            $search = $filters['q'];
            $query->whereHas('player', fn ($player) => $player
                ->where('name', 'like', '%'.$search.'%')
                ->orWhere('mobile', 'like', '%'.$search.'%'));
        }
        if (! empty($filters['game_id'])) {
            $query->where('pet_game_id', $filters['game_id']);
        }
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['from'])) {
            $query->whereDate('started_at', '>=', $filters['from']);
        }
        if (! empty($filters['to'])) {
            $query->whereDate('started_at', '<=', $filters['to']);
        }

        return response()->json($query->paginate($filters['per_page'] ?? 20));
    }

    private function validatedQuestion(Request $request, ?PetGameQuestion $question = null): array
    {
        return $request->validate([
            'pet_game_id' => ['required', 'integer', 'exists:pet_games,id'],
            'question' => ['required', 'string', 'max:2000'],
            'image_or_audio' => ['nullable', 'string', 'max:500'],
            'correct_answer' => ['required', 'string', 'max:255'],
            'wrong_options' => ['nullable', 'array'],
            'wrong_options.*' => ['nullable', 'string', 'max:500'],
            'explanation' => ['nullable', 'string', 'max:3000'],
            'is_active' => ['sometimes', 'boolean'],
        ]) + ['is_active' => $request->boolean('is_active', $question?->is_active ?? true)];
    }
}
