<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_login_url_redirects_to_the_frontend_login_page(): void
    {
        Config::set('admin.frontend_url', 'http://localhost:5173');

        $this->get('/admin/login')
            ->assertRedirect('http://localhost:5173/admin');
    }

    public function test_only_the_configured_admin_email_is_authorized(): void
    {
        Config::set('admin.super_admin_email', 'admin@example.test');

        $admin = new User(['email' => 'Admin@Example.Test']);
        $otherUser = new User(['email' => 'person@example.test']);

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($otherUser->isAdmin());
    }

    public function test_admin_access_is_denied_when_no_admin_email_is_configured(): void
    {
        Config::set('admin.super_admin_email', '');

        $user = new User(['email' => 'admin@example.test']);

        $this->assertFalse($user->isAdmin());
    }

    public function test_authenticated_non_admin_cannot_access_the_dashboard(): void
    {
        Config::set('admin.super_admin_email', 'admin@example.test');

        $this->actingAs(new User(['email' => 'person@example.test']))
            ->getJson('/api/admin/dashboard')
            ->assertForbidden();
    }

    public function test_non_admin_email_cannot_sign_in(): void
    {
        Config::set('admin.super_admin_email', 'admin@example.test');

        $this->postJson('/api/admin/login', [
                'email' => 'person@example.test',
                'password' => 'not-a-real-password',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_configured_super_admin_can_sign_in_and_manage_content(): void
    {
        Config::set('admin.super_admin_email', 'admin@example.test');
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.test',
            'password' => 'a-strong-test-password',
        ]);

        $this->postJson('/api/admin/login', [
            'email' => 'admin@example.test',
            'password' => 'a-strong-test-password',
        ])->assertOk()->assertJsonPath('user.email', 'admin@example.test');

        $this->assertAuthenticated();
        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure(['categories', 'images', 'stats']);
    }
}
