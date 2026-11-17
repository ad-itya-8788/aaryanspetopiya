<?php

namespace Tests\Feature;

use App\Models\PetGame;
use App\Models\PetGameAttempt;
use App\Models\PetGameQuestion;
use App\Models\User;
use Database\Seeders\PetGamesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class PetGamesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PetGamesSeeder::class);
    }

    public function test_invalid_player_details_are_rejected_and_mobile_is_normalized_and_reused(): void
    {
        $this->postJson('/api/pet-games/players', ['name' => 'A', 'mobile' => '123'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'mobile']);

        $first = $this->postJson('/api/pet-games/players', [
            'name' => 'First Player',
            'mobile' => ' +91-98765 43210 ',
        ])->assertOk()->json();
        $second = $this->postJson('/api/pet-games/players', [
            'name' => 'Updated Player',
            'mobile' => '9876543210',
        ])->assertOk()->json();

        $this->assertSame($first['player_id'], $second['player_id']);
        $this->assertDatabaseCount('game_players', 1);
        $this->assertDatabaseHas('game_players', [
            'id' => $first['player_id'],
            'name' => 'Updated Player',
            'mobile' => '9876543210',
        ]);
    }

    public function test_public_games_are_seeded_and_start_returns_questions_without_answers(): void
    {
        $this->getJson('/api/pet-games')
            ->assertOk()
            ->assertJsonCount(3, 'games');

        $this->assertSame(3, PetGame::query()->where('is_active', true)->count());
        $this->assertGreaterThanOrEqual(
            30,
            PetGame::query()->where('slug', 'guess-the-animal')->firstOrFail()->questions()->count(),
        );
        $this->assertGreaterThanOrEqual(
            30,
            PetGame::query()->where('slug', 'pet-knowledge-quiz')->firstOrFail()->questions()->count(),
        );
        $this->assertGreaterThanOrEqual(
            30,
            PetGame::query()->where('slug', 'animal-crossword')->firstOrFail()->questions()->count(),
        );

        $player = $this->postJson('/api/pet-games/players', [
            'name' => 'Game Player',
            'mobile' => '9876543210',
        ])->assertOk()->json();
        $response = $this->postJson('/api/pet-games/guess-the-animal/attempts', [
            'player_id' => $player['player_id'],
            'player_token' => $player['player_token'],
        ])->assertCreated();

        $data = $response->json();
        $this->assertCount(10, $data['questions']);
        $this->assertArrayNotHasKey('correct_answer', $data['questions'][0]);
        $this->assertDatabaseCount('pet_game_attempts', 1);
    }

    public function test_attempt_token_prevents_tampering_duplicate_answers_and_double_completion(): void
    {
        $player = $this->postJson('/api/pet-games/players', [
            'name' => 'Game Player',
            'mobile' => '9876543210',
        ])->assertOk()->json();
        $attempt = $this->postJson('/api/pet-games/pet-knowledge-quiz/attempts', [
            'player_id' => $player['player_id'],
            'player_token' => $player['player_token'],
        ])->assertCreated()->json();
        $questionId = $attempt['questions'][0]['id'];
        $question = \App\Models\PetGameQuestion::query()->findOrFail($questionId);

        $this->postJson("/api/pet-games/attempts/{$attempt['attempt_id']}/answers", [
            'question_id' => $questionId,
            'submitted_answer' => $question->correct_answer,
            'score' => 999,
        ], ['X-Pet-Game-Token' => $attempt['attempt_token']])
            ->assertOk()
            ->assertJsonPath('is_correct', true)
            ->assertJsonMissingPath('score');

        $this->postJson("/api/pet-games/attempts/{$attempt['attempt_id']}/answers", [
            'question_id' => $questionId,
            'submitted_answer' => $question->correct_answer,
        ], ['X-Pet-Game-Token' => $attempt['attempt_token']])->assertStatus(409);

        $this->postJson("/api/pet-games/attempts/{$attempt['attempt_id']}/complete", [], [
            'X-Pet-Game-Token' => $attempt['attempt_token'],
        ])->assertOk()->assertJsonPath('score', 1)->assertJsonPath('max_score', 10);
        $this->postJson("/api/pet-games/attempts/{$attempt['attempt_id']}/complete", [], [
            'X-Pet-Game-Token' => $attempt['attempt_token'],
        ])->assertStatus(409);
        $this->assertDatabaseHas('pet_game_attempts', [
            'id' => $attempt['attempt_id'],
            'score' => 1,
            'status' => 'completed',
        ]);
    }

    public function test_each_start_creates_a_new_attempt_and_an_attempt_can_be_abandoned(): void
    {
        $player = $this->postJson('/api/pet-games/players', [
            'name' => 'Game Player',
            'mobile' => '9876543210',
        ])->assertOk()->json();
        $headers = ['Content-Type' => 'application/json'];
        $start = fn () => $this->postJson('/api/pet-games/guess-the-animal/attempts', [
            'player_id' => $player['player_id'],
            'player_token' => $player['player_token'],
        ])->assertCreated()->json();

        $first = $start();
        $second = $start();
        $this->assertNotSame($first['attempt_id'], $second['attempt_id']);
        $this->assertSame(2, PetGameAttempt::query()->count());

        $this->postJson("/api/pet-games/attempts/{$first['attempt_id']}/abandon", [], [
            ...$headers,
            'X-Pet-Game-Token' => $first['attempt_token'],
        ])->assertOk()->assertJsonPath('status', 'abandoned');
        $this->assertDatabaseHas('pet_game_attempts', ['id' => $first['attempt_id'], 'status' => 'abandoned']);
        $this->assertDatabaseHas('pet_game_attempts', ['id' => $second['attempt_id'], 'status' => 'in_progress']);
    }

    public function test_crossword_hint_is_recorded_on_the_server_and_hint_answer_scores_zero(): void
    {
        $player = $this->postJson('/api/pet-games/players', [
            'name' => 'Crossword Player',
            'mobile' => '9876543210',
        ])->assertOk()->json();
        $attempt = $this->postJson('/api/pet-games/animal-crossword/attempts', [
            'player_id' => $player['player_id'],
            'player_token' => $player['player_token'],
        ])->assertCreated()->json();
        $question = PetGameQuestion::query()->findOrFail($attempt['questions'][0]['id']);
        $tokenHeader = ['X-Pet-Game-Token' => $attempt['attempt_token']];

        $this->postJson("/api/pet-games/attempts/{$attempt['attempt_id']}/questions/{$question->id}/hint", [], $tokenHeader)
            ->assertOk()
            ->assertJsonStructure(['hint']);
        $this->postJson("/api/pet-games/attempts/{$attempt['attempt_id']}/answers", [
            'question_id' => $question->id,
            'submitted_answer' => $question->correct_answer,
            'hint_used' => false,
        ], $tokenHeader)->assertOk()->assertJsonPath('hint_used', true);
        $this->postJson("/api/pet-games/attempts/{$attempt['attempt_id']}/complete", [], $tokenHeader)
            ->assertOk()
            ->assertJsonPath('score', 0)
            ->assertJsonPath('correct_answers', 1);
    }

    public function test_admin_game_routes_require_authentication_and_admin_analytics_use_database_values(): void
    {
        $this->getJson('/api/admin/pet-games/analytics')->assertUnauthorized();

        Config::set('admin.super_admin_email', 'admin@example.test');
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.test',
            'password' => 'a-strong-test-password',
        ]);
        $this->actingAs($admin)->getJson('/api/admin/pet-games/analytics')
            ->assertOk()
            ->assertJsonPath('total_players', 0)
            ->assertJsonPath('total_attempts', 0)
            ->assertJsonPath('total_points', 0);

        $player = \App\Models\GamePlayer::query()->create([
            'name' => 'Analytics Player',
            'mobile' => '9876543210',
            'access_token_hash' => hash('sha256', 'test-token'),
        ]);
        $secondPlayer = \App\Models\GamePlayer::query()->create([
            'name' => 'Second Player',
            'mobile' => '9123456789',
            'access_token_hash' => hash('sha256', 'second-token'),
        ]);
        $game = PetGame::query()->where('slug', 'guess-the-animal')->firstOrFail();
        PetGameAttempt::query()->create([
            'game_player_id' => $player->id,
            'pet_game_id' => $game->id,
            'score' => 8,
            'max_score' => 10,
            'questions_answered' => 10,
            'correct_answers' => 8,
            'wrong_answers' => 2,
            'status' => 'completed',
            'started_at' => now(),
            'completed_at' => now(),
            'duration_seconds' => 45,
            'token_hash' => hash('sha256', 'attempt-token'),
        ]);
        PetGameAttempt::query()->create([
            'game_player_id' => $secondPlayer->id,
            'pet_game_id' => $game->id,
            'max_score' => 10,
            'status' => 'abandoned',
            'started_at' => now()->subDay(),
            'duration_seconds' => 12,
            'token_hash' => hash('sha256', 'abandoned-token'),
        ]);
        $this->getJson('/api/admin/pet-games/analytics')
            ->assertOk()
            ->assertJsonPath('total_players', 2)
            ->assertJsonPath('total_attempts', 2)
            ->assertJsonPath('completed', 1)
            ->assertJsonPath('total_points', 8)
            ->assertJsonPath('highest_score', 8)
            ->assertJsonPath('most_popular_game.title', $game->title);
        $this->getJson('/api/admin/pet-games/players?q=Analytics&per_page=1')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.name', 'Analytics Player');
        $this->getJson('/api/admin/pet-games/players?per_page=1&page=2')
            ->assertOk()
            ->assertJsonPath('total', 2)
            ->assertJsonPath('current_page', 2)
            ->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/pet-games/attempts?q=9876543210&status=completed&game_id='.$game->id.'&per_page=1')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.score', 8);
        $this->getJson('/api/admin/pet-games/attempts?status=abandoned&per_page=1')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.status', 'abandoned');
        $this->getJson('/api/admin/pet-games/questions?q=Which%20animal&game_id='.$game->id.'&per_page=1&page=2')
            ->assertOk()
            ->assertJsonPath('total', 100)
            ->assertJsonPath('current_page', 2)
            ->assertJsonCount(1, 'data');
    }
}
