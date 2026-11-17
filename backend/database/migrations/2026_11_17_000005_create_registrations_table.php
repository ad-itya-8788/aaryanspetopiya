<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->string('full_name', 150);
            $table->string('mobile', 10)->index();
            $table->string('pincode', 6);
            $table->string('state', 100);
            $table->string('district', 100);
            $table->string('city', 100);
            $table->string('area', 150);
            $table->text('address');
            $table->timestamps();

            $table->index(['created_at', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
