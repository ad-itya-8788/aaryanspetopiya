<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Website copy is maintained in the React frontend, not in the admin database.
    }

    public function down(): void
    {
        Schema::dropIfExists('website_sections');
    }
};
