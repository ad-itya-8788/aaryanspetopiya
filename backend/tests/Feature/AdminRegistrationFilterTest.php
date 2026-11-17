<?php

namespace Tests\Feature;

use App\Models\Registration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class AdminRegistrationFilterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Config::set('admin.super_admin_email', 'admin@example.test');
        $this->actingAs(User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.test',
            'password' => 'a-strong-test-password',
        ]));
    }

    public function test_registrations_can_be_filtered_by_one_registration_date(): void
    {
        $matching = $this->registration('Matching Pet Parent');
        Registration::whereKey($matching->id)->update(['created_at' => '2026-11-10 10:30:00']);

        $other = $this->registration('Other Pet Parent');
        Registration::whereKey($other->id)->update(['created_at' => '2026-11-11 10:30:00']);

        $this->getJson('/api/admin/registrations?registered_date=2026-11-10')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matching->id);
    }

    private function registration(string $fullName): Registration
    {
        return Registration::create([
            'full_name' => $fullName,
            'mobile' => '9876543210',
            'email' => null,
            'state' => 'Maharashtra',
            'district' => 'Pune',
            'city' => 'Pune',
            'area' => 'Aundh',
            'address' => 'Near Aundh Market, Pune',
        ]);
    }
}
