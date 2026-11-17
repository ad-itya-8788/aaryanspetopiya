<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pet_varieties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_category_id')->constrained()->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('slug', 140);
            $table->string('short_description', 500)->nullable();
            $table->text('detailed_description')->nullable();
            $table->string('image_path')->nullable();
            $table->json('characteristics')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['pet_category_id', 'slug']);
            $table->index(['pet_category_id', 'is_active', 'display_order']);
        });

        Schema::create('pet_variety_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_variety_id')->constrained()->cascadeOnDelete();
            $table->string('image_path');
            $table->string('alt_text')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();

            $table->index(['pet_variety_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pet_variety_images');
        Schema::dropIfExists('pet_varieties');
    }
};
