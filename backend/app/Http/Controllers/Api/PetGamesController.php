<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PetGames\RegisterPlayerRequest;
use App\Http\Requests\PetGames\StartGameAttemptRequest;
use App\Http\Requests\PetGames\SubmitGameAnswerRequest;
use App\Models\GamePlayer;
use App\Models\PetGame;
use App\Models\PetGameAttempt;
use App\Models\PetGameAttemptAnswer;
use App\Models\PetGameQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PetGamesController extends Controller
{
    public function index(): JsonResponse
    {
        $games = PetGame::query()
            ->where('is_active', true)
            ->withCount(['questions' => fn ($query) => $query->where('is_active', true)])
            ->orderBy('id')
            ->get(['id', 'title', 'slug', 'description', 'game_type', 'difficulty']);

        return response()->json(['games' => $games]);
    }

    public function registerPlayer(RegisterPlayerRequest $request): JsonResponse
    {
        $values = $request->validated();
        $playerToken = Str::random(64);
        $player = GamePlayer::query()->firstOrCreate(
            ['mobile' => $values['mobile']],
            ['name' => trim($values['name']), 'access_token_hash' => hash('sha256', $playerToken)],
        );

        $player->update([
            'name' => trim($values['name']),
            'access_token_hash' => hash('sha256', $playerToken),
        ]);

        return response()->json(['player_id' => $player->id, 'player_token' => $playerToken], 200);
    }

    public function start(StartGameAttemptRequest $request, string $slug): JsonResponse
    {
        $game = PetGame::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
        $player = GamePlayer::query()->findOrFail($request->integer('player_id'));
        abort_unless(
            hash_equals($player->access_token_hash, hash('sha256', $request->string('player_token')->toString())),
            403,
            'Register your details before starting a game.',
        );
        $questionLimit = $game->game_type === 'crossword' ? 6 : 10;
        $questions = $game->questions()
            ->where('is_active', true)
            ->inRandomOrder()
            ->limit($questionLimit)
            ->get();

        if ($questions->count() < $questionLimit) {
            return response()->json(['message' => 'This game is not ready yet. Please try again later.'], 503);
        }

        $token = Str::random(64);
        $attempt = PetGameAttempt::query()->create([
            'game_player_id' => $player->id,
            'pet_game_id' => $game->id,
            'max_score' => $questionLimit,
            'status' => 'in_progress',
            'started_at' => now(),
            'token_hash' => hash('sha256', $token),
        ]);
        foreach ($questions->values() as $index => $question) {
            DB::table('pet_game_attempt_questions')->insert([
                'attempt_id' => $attempt->id,
                'question_id' => $question->id,
                'position' => $index + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $publicQuestions = $questions->map(function (PetGameQuestion $question) use ($game) {
            $data = [
                'id' => $question->id,
                'question' => $question->question,
                'image_or_audio' => $question->image_or_audio,
            ];

            if ($game->game_type === 'crossword') {
                $data['answer_length'] = mb_strlen(preg_replace('/[^a-z0-9]/i', '', $question->correct_answer));
                $data['hint'] = is_array($question->wrong_options)
                    ? ($question->wrong_options['hint'] ?? null)
                    : null;
            } else {
                $data['options'] = collect($question->wrong_options ?? [])
                    ->push($question->correct_answer)
                    ->shuffle()
                    ->values();
            }

            return $data;
        });

        return response()->json([
            'attempt_id' => $attempt->id,
            'attempt_token' => $token,
            'game' => ['title' => $game->title, 'game_type' => $game->game_type],
            'questions' => $publicQuestions,
        ], 201);
    }

    public function hint(Request $request, int $attemptId, int $questionId): JsonResponse
    {
        $attempt = $this->authorizedAttempt($request, $attemptId);
        abort_if($attempt->status !== 'in_progress', 409, 'This attempt is no longer active.');
        $question = $attempt->game->questions()
            ->whereKey($questionId)
            ->where('is_active', true)
            ->whereExists(fn ($query) => $query->selectRaw('1')
                ->from('pet_game_attempt_questions')
                ->whereColumn('pet_game_attempt_questions.question_id', 'pet_game_questions.id')
                ->where('pet_game_attempt_questions.attempt_id', $attempt->id))
            ->firstOrFail();
        abort_unless($attempt->game->game_type === 'crossword', 422, 'Hints are only available for crossword questions.');
        abort_if($attempt->answers()->where('question_id', $questionId)->exists(), 409, 'This question has already been answered.');

        $hint = is_array($question->wrong_options) ? ($question->wrong_options['hint'] ?? null) : null;
        abort_if(! $hint, 404, 'No hint is available for this word.');

        DB::table('pet_game_attempt_hints')->insertOrIgnore([
            'attempt_id' => $attempt->id,
            'question_id' => $question->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['hint' => $hint]);
    }

    public function answer(SubmitGameAnswerRequest $request, int $attemptId): JsonResponse
    {
        $values = $request->validated();

        return DB::transaction(function () use ($request, $attemptId, $values) {
            $attempt = PetGameAttempt::query()->lockForUpdate()->findOrFail($attemptId);
            $this->assertToken($request, $attempt);
            abort_if($attempt->status !== 'in_progress', 409, 'This attempt is no longer active.');
            $question = $attempt->game->questions()
                ->whereKey($values['question_id'])
                ->where('is_active', true)
                ->whereExists(fn ($query) => $query->selectRaw('1')
                    ->from('pet_game_attempt_questions')
                    ->whereColumn('pet_game_attempt_questions.question_id', 'pet_game_questions.id')
                    ->where('pet_game_attempt_questions.attempt_id', $attempt->id))
                ->firstOrFail();
            abort_if($attempt->answers()->where('question_id', $question->id)->exists(), 409, 'This question has already been answered.');

            $submitted = trim($values['submitted_answer']);
            $correct = $this->normalizeAnswer($submitted) === $this->normalizeAnswer($question->correct_answer);
            $hintUsed = DB::table('pet_game_attempt_hints')
                ->where('attempt_id', $attempt->id)
                ->where('question_id', $question->id)
                ->exists();

            PetGameAttemptAnswer::query()->create([
                'attempt_id' => $attempt->id,
                'question_id' => $question->id,
                'submitted_answer' => $submitted,
                'is_correct' => $correct,
                'hint_used' => $hintUsed,
            ]);

            return response()->json([
                'is_correct' => $correct,
                'correct_answer' => $question->correct_answer,
                'explanation' => $question->explanation,
                'hint_used' => $hintUsed,
            ]);
        });
    }

    public function complete(Request $request, int $attemptId): JsonResponse
    {
        return DB::transaction(function () use ($request, $attemptId) {
            $attempt = PetGameAttempt::query()->with('answers')->lockForUpdate()->findOrFail($attemptId);
            $this->assertToken($request, $attempt);
            abort_if($attempt->status !== 'in_progress', 409, 'This attempt has already been completed or abandoned.');

            $questionsAnswered = $attempt->answers->count();
            $correctAnswers = $attempt->answers->where('is_correct', true)->count();
            $score = $attempt->answers
                ->filter(fn (PetGameAttemptAnswer $answer) => $answer->is_correct && ! $answer->hint_used)
                ->count();

            $attempt->update([
                'score' => $score,
                'questions_answered' => $questionsAnswered,
                'correct_answers' => $correctAnswers,
                'wrong_answers' => $questionsAnswered - $correctAnswers,
                'status' => 'completed',
                'completed_at' => now(),
                'duration_seconds' => max(0, $attempt->started_at->diffInSeconds(now())),
            ]);

            return response()->json([
                'status' => $attempt->status,
                'score' => $attempt->score,
                'max_score' => $attempt->max_score,
                'questions_answered' => $attempt->questions_answered,
                'correct_answers' => $attempt->correct_answers,
                'wrong_answers' => $attempt->wrong_answers,
                'duration_seconds' => $attempt->duration_seconds,
            ]);
        });
    }

    public function abandon(Request $request, int $attemptId): JsonResponse
    {
        return DB::transaction(function () use ($request, $attemptId) {
            $attempt = PetGameAttempt::query()->lockForUpdate()->findOrFail($attemptId);
            $this->assertToken($request, $attempt);
            abort_if($attempt->status !== 'in_progress', 409, 'This attempt is no longer active.');
            $attempt->update([
                'status' => 'abandoned',
                'duration_seconds' => max(0, $attempt->started_at->diffInSeconds(now())),
            ]);

            return response()->json(['status' => 'abandoned']);
        });
    }

    private function authorizedAttempt(Request $request, int $attemptId): PetGameAttempt
    {
        $attempt = PetGameAttempt::query()->with('game')->findOrFail($attemptId);
        $this->assertToken($request, $attempt);

        return $attempt;
    }

    private function assertToken(Request $request, PetGameAttempt $attempt): void
    {
        $token = (string) $request->header('X-Pet-Game-Token');
        abort_unless(
            $token !== ''
            && hash_equals($attempt->token_hash, hash('sha256', $token))
            && $attempt->started_at->diffInHours(now()) < 2,
            403,
            'The game session is invalid or has expired.',
        );
    }

    private function normalizeAnswer(string $answer): string
    {
        return mb_strtolower(preg_replace('/[^a-z0-9]/i', '', trim($answer)));
    }
}
