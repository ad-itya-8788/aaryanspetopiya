<?php

namespace Tests\Feature;

use App\Models\Registration;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class AdminRegistrationExportTest extends TestCase
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

    public function test_registrations_are_loaded_with_server_side_pagination(): void
    {
        foreach (range(1, 3) as $index) {
            $this->registration('Paginated Parent '.$index);
        }

        $this->getJson('/api/admin/registrations?per_page=2&page=2')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('current_page', 2)
            ->assertJsonPath('last_page', 2)
            ->assertJsonPath('per_page', 2)
            ->assertJsonPath('total', 3);
    }

    public function test_dashboard_reports_total_and_today_registration_counts(): void
    {
        $today = $this->registration('Today Parent');
        $older = $this->registration('Older Parent');
        Registration::whereKey($older->id)->update(['created_at' => Carbon::yesterday()]);

        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('stats.registrations', 2)
            ->assertJsonPath('stats.registrations_today', 1);
    }

    public function test_excel_export_contains_all_columns_with_styled_cells(): void
    {
        $registration = $this->registration('Export Parent');
        Registration::whereKey($registration->id)->update(['sub_address' => 'Flat 2']);

        $response = $this->get('/api/admin/registrations/export');
        $response->assertOk()
            ->assertHeader('Content-Type', 'application/vnd.ms-excel; charset=UTF-8')
            ->assertHeader('Content-Disposition', 'attachment; filename="registrations-'.now()->format('Y-m-d').'.xls"');

        ob_start();
        $response->baseResponse->sendContent();
        $content = ob_get_clean();

        foreach ([
            'Aaryans Pet Paradise Registrations',
            'Full Name',
            'Mobile Number',
            'Email',
            'PIN Code',
            'State',
            'District',
            'City',
            'Area / Locality',
            'Sub Address',
            'Complete Address',
            'Registered At',
            'Updated At',
            'Export Parent',
            'Flat 2',
            '411001',
            'ss:StyleID="Header"',
            'ss:StyleID="CellEven"',
            '#2D8A49',
        ] as $needle) {
            $this->assertStringContainsString($needle, $content);
        }
    }

    private function registration(string $fullName): Registration
    {
        return Registration::create([
            'full_name' => $fullName,
            'mobile' => '9876543210',
            'email' => 'parent@example.test',
            'pincode' => '411001',
            'state' => 'Maharashtra',
            'district' => 'Pune',
            'city' => 'Pune',
            'area' => 'Aundh',
            'address' => 'Near Aundh Market, Pune',
        ]);
    }
}
