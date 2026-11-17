<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('game_players', 'access_token_hash')) {
            Schema::table('game_players', function (Blueprint $table) {
                $table->string('access_token_hash', 64)->nullable();
            });
        }

        if (! Schema::hasTable('pet_game_attempt_questions')) {
            Schema::create('pet_game_attempt_questions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('attempt_id')->constrained('pet_game_attempts')->cascadeOnDelete();
                $table->foreignId('question_id')->constrained('pet_game_questions')->restrictOnDelete();
                $table->unsignedSmallInteger('position');
                $table->timestamps();

                $table->unique(['attempt_id', 'question_id']);
                $table->unique(['attempt_id', 'position']);
            });
        }

        if (! Schema::hasTable('pet_game_attempt_hints')) {
            Schema::create('pet_game_attempt_hints', function (Blueprint $table) {
                $table->id();
                $table->foreignId('attempt_id')->constrained('pet_game_attempts')->cascadeOnDelete();
                $table->foreignId('question_id')->constrained('pet_game_questions')->restrictOnDelete();
                $table->timestamps();

                $table->unique(['attempt_id', 'question_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('pet_game_attempt_hints');
        Schema::dropIfExists('pet_game_attempt_questions');

        if (Schema::hasColumn('game_players', 'access_token_hash')) {
            Schema::table('game_players', function (Blueprint $table) {
                $table->dropColumn('access_token_hash');
            });
        }
    }
};
