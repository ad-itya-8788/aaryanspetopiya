<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->string('email', 254)->nullable()->after('mobile')->index();
            $table->index('full_name');
            $table->index('city');
            $table->index('district');
        });
    }

    public function down(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->dropIndex(['full_name']);
            $table->dropIndex(['city']);
            $table->dropIndex(['district']);
            $table->dropColumn('email');
        });
    }
};
