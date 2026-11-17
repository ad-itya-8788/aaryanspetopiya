<?php

namespace Tests\Feature;

use App\Models\Registration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_pune_area_list_is_exposed_from_shared_configuration(): void
    {
        $this->getJson('/api/pune-areas')
            ->assertOk()
            ->assertJsonCount(119, 'areas')
            ->assertJsonPath('areas.0', '9 DRD')
            ->assertJsonPath('areas.118', 'Yerawada T. S.');
    }

    public function test_registration_accepts_pune_area_with_optional_email_and_no_pincode(): void
    {
        $this->postJson('/api/registrations', [
            'full_name' => 'Test Pet Parent',
            'mobile' => '9876543210',
            'email' => 'pet.parent@example.com',
            'insta_id' => '@petparent',
            'area' => 'Aundh',
            'address' => 'Near Aundh Market, Pune',
        ])
            ->assertCreated()
            ->assertJsonPath('message', 'Registration received.');

        $this->assertDatabaseHas('registrations', [
            'full_name' => 'Test Pet Parent',
            'mobile' => '9876543210',
            'email' => 'pet.parent@example.com',
            'insta_id' => '@petparent',
            'pincode' => null,
            'state' => 'Maharashtra',
            'district' => 'Pune',
            'city' => 'Pune',
            'area' => 'Aundh',
            'sub_address' => null,
            'address' => 'Near Aundh Market, Pune',
        ]);
    }

    public function test_registration_accepts_a_manually_entered_area(): void
    {
        $this->postJson('/api/registrations', [
            'full_name' => 'Test Pet Parent',
            'mobile' => '9876543210',
            'area' => 'Kothrud Extension',
            'address' => 'Near Aundh Market, Pune',
        ])
            ->assertCreated();

        $this->assertDatabaseHas('registrations', [
            'area' => 'Kothrud Extension',
        ]);
    }

    public function test_registration_requires_complete_address(): void
    {
        $this->postJson('/api/registrations', [
            'full_name' => 'Test Pet Parent',
            'mobile' => '9876543210',
            'area' => 'Aundh',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('address');
    }
}
