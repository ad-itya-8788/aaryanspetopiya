<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_players', function (Blueprint $table) {
            $table->id();
            $table->string('name', 60);
            $table->string('mobile', 10)->unique()->index();
            $table->string('access_token_hash', 64);
            $table->timestamps();
        });

        Schema::create('pet_games', function (Blueprint $table) {
            $table->id();
            $table->string('title', 120);
            $table->string('slug', 120)->unique();
            $table->text('description');
            $table->string('game_type', 40);
            $table->string('difficulty', 30);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('pet_game_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_game_id')->constrained()->cascadeOnDelete();
            $table->text('question');
            $table->string('image_or_audio')->nullable();
            $table->string('correct_answer', 255);
            $table->json('wrong_options')->nullable();
            $table->text('explanation')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->index(['pet_game_id', 'is_active']);
        });

        Schema::create('pet_game_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_player_id')->constrained('game_players')->cascadeOnDelete();
            $table->foreignId('pet_game_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('score')->default(0);
            $table->unsignedInteger('max_score')->default(0);
            $table->unsignedInteger('questions_answered')->default(0);
            $table->unsignedInteger('correct_answers')->default(0);
            $table->unsignedInteger('wrong_answers')->default(0);
            $table->string('status', 20)->default('in_progress')->index();
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->string('token_hash', 64);
            $table->timestamps();

            $table->index(['pet_game_id', 'status', 'created_at']);
        });

        Schema::create('pet_game_attempt_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('pet_game_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('pet_game_questions')->restrictOnDelete();
            $table->text('submitted_answer');
            $table->boolean('is_correct');
            $table->boolean('hint_used')->default(false);
            $table->timestamps();

            $table->unique(['attempt_id', 'question_id']);
        });

        Schema::create('pet_game_attempt_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('pet_game_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('pet_game_questions')->restrictOnDelete();
            $table->unsignedSmallInteger('position');
            $table->timestamps();

            $table->unique(['attempt_id', 'question_id']);
            $table->unique(['attempt_id', 'position']);
        });

        Schema::create('pet_game_attempt_hints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('pet_game_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('pet_game_questions')->restrictOnDelete();
            $table->timestamps();

            $table->unique(['attempt_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pet_game_attempt_hints');
        Schema::dropIfExists('pet_game_attempt_questions');
        Schema::dropIfExists('pet_game_attempt_answers');
        Schema::dropIfExists('pet_game_attempts');
        Schema::dropIfExists('pet_game_questions');
        Schema::dropIfExists('pet_games');
        Schema::dropIfExists('game_players');
    }
};
