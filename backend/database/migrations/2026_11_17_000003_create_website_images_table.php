<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('website_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_category_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('section_key', 80)->nullable();
            $table->string('image_path');
            $table->string('alt_text');
            $table->string('pet_name')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('website_images');
    }
};
