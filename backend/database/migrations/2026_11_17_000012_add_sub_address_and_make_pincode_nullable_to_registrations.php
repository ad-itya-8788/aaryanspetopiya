<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->string('sub_address', 255)->nullable()->after('area');
        });

        Schema::table('registrations', function (Blueprint $table) {
            $table->string('pincode', 6)->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('registrations')->whereNull('pincode')->update(['pincode' => '']);

        Schema::table('registrations', function (Blueprint $table) {
            $table->string('pincode', 6)->nullable(false)->change();
        });

        Schema::table('registrations', function (Blueprint $table) {
            $table->dropColumn('sub_address');
        });
    }
};
