<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pet_categories', function (Blueprint $table) {
            $table->string('short_description', 500)->nullable();
            $table->text('detailed_description')->nullable();
            $table->string('cover_image_path')->nullable();
            $table->string('banner_image_path')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('pet_categories', function (Blueprint $table) {
            $table->dropColumn([
                'short_description',
                'detailed_description',
                'cover_image_path',
                'banner_image_path',
            ]);
        });
    }
};
