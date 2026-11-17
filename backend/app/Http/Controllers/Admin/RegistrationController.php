<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RegistrationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $this->validateFilters($request, true);
        $registrations = $this->filteredQuery($filters)
            ->latest('id')
            ->paginate((int) ($filters['per_page'] ?? 25));

        return response()->json([
            'data' => collect($registrations->items())
                ->map(fn (Registration $registration) => $this->registrationSummary($registration))
                ->values(),
            'current_page' => $registrations->currentPage(),
            'last_page' => $registrations->lastPage(),
            'per_page' => $registrations->perPage(),
            'total' => $registrations->total(),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->validateFilters($request);
        $columns = $this->exportColumns();
        $registrations = $this->filteredQuery($filters)->latest('id')->cursor();

        $filename = 'registrations-'.now()->format('Y-m-d').'.xls';

        return response()->stream(function () use ($registrations, $columns): void {
            echo "\xEF\xBB\xBF";
            echo '<?xml version="1.0"?>';
            echo '<?mso-application progid="Excel.Sheet"?>';
            echo '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">';
            echo '<Styles>';
            echo '<Style ss:ID="Title"><Font ss:Bold="1" ss:Size="16" ss:Color="#FFFFFF"/><Interior ss:Color="#1F7A3A" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>';
            echo '<Style ss:ID="Subtitle"><Font ss:Bold="1" ss:Color="#2E6B3F"/><Interior ss:Color="#EAF6EB" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>';
            echo '<Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#2D8A49" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1F5E31"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1F5E31"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1F5E31"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1F5E31"/></Borders></Style>';
            echo '<Style ss:ID="CellOdd"><Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E3EBE4"/></Borders></Style>';
            echo '<Style ss:ID="CellEven"><Interior ss:Color="#F2FAF3" ss:Pattern="Solid"/><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9EADD"/></Borders></Style>';
            echo '</Styles>';
            echo '<Worksheet ss:Name="Registrations">';
            echo '<Table>';
            echo '<Column ss:Width="55"/><Column ss:Width="170"/><Column ss:Width="115"/><Column ss:Width="220"/><Column ss:Width="85"/><Column ss:Width="110"/><Column ss:Width="95"/><Column ss:Width="95"/><Column ss:Width="150"/><Column ss:Width="150"/><Column ss:Width="300"/><Column ss:Width="165"/><Column ss:Width="165"/>';
            echo '<Row ss:Height="32"><Cell ss:MergeAcross="'.(count($columns) - 1).'" ss:StyleID="Title"><Data ss:Type="String">Aaryans Pet Paradise Registrations</Data></Cell></Row>';
            echo '<Row ss:Height="22"><Cell ss:MergeAcross="'.(count($columns) - 1).'" ss:StyleID="Subtitle"><Data ss:Type="String">Exported on '.now()->format('d M Y, h:i A').'</Data></Cell></Row>';
            echo '<Row ss:Height="30">';
            foreach ($columns as $label => $attribute) {
                echo $this->xmlCell($label, 'Header');
            }
            echo '</Row>';

            $rowIndex = 0;
            foreach ($registrations as $registration) {
                $style = $rowIndex % 2 === 0 ? 'CellEven' : 'CellOdd';
                echo '<Row>';
                foreach ($columns as $attribute) {
                    $value = $attribute === 'id' ? (string) $registration->id : (string) ($registration->{$attribute} ?? '');
                    echo $this->xmlCell($value, $style, $attribute === 'id' ? 'Number' : 'String');
                }
                echo '</Row>';
                $rowIndex++;
            }

            echo '</Table>';
            echo '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><SplitHorizontal>3</SplitHorizontal><TopRowBottomPane>3</TopRowBottomPane><ActivePane>3</ActivePane></WorksheetOptions>';
            echo '</Worksheet>';
            echo '</Workbook>';
        }, 200, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    public function show(Registration $registration): JsonResponse
    {
        return response()->json([
            'registration' => $this->registrationSummary($registration, true),
        ]);
    }

    private function validateFilters(Request $request, bool $withPagination = false): array
    {
        $rules = [
            'q' => ['nullable', 'string', 'max:254'],
            'id' => ['nullable', 'integer', 'min:1'],
            'full_name' => ['nullable', 'string', 'max:150'],
            'mobile' => ['nullable', 'string', 'max:10'],
            'email' => ['nullable', 'string', 'max:254'],
            'insta_id' => ['nullable', 'string', 'max:100'],
            'pincode' => ['nullable', 'string', 'max:6'],
            'state' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'area' => ['nullable', 'string', 'max:150'],
            'address' => ['nullable', 'string', 'max:1000'],
            'registered_date' => ['nullable', 'date_format:Y-m-d'],
        ];

        if ($withPagination) {
            $rules['page'] = ['nullable', 'integer', 'min:1'];
            $rules['per_page'] = ['nullable', 'integer', 'min:1', 'max:100'];
        }

        return $request->validate($rules);
    }

    private function filteredQuery(array $filters): Builder
    {
        $query = Registration::query();

        $search = trim((string) ($filters['q'] ?? ''));
        if ($search !== '') {
            $query->where(function (Builder $registrations) use ($search): void {
                foreach (['full_name', 'mobile', 'email', 'insta_id', 'area'] as $index => $column) {
                    $method = $index === 0 ? 'where' : 'orWhere';
                    $registrations->{$method}($column, 'like', '%'.$search.'%');
                }

                if (ctype_digit($search)) {
                    $registrations->orWhere('id', (int) $search);
                }
            });
        }

        foreach (['full_name', 'mobile', 'email', 'insta_id', 'pincode', 'state', 'district', 'city', 'area'] as $column) {
            $value = trim((string) ($filters[$column] ?? ''));
            if ($value !== '') {
                $query->where($column, 'like', $value.'%');
            }
        }

        if (! empty($filters['id'])) {
            $query->whereKey($filters['id']);
        }

        $address = trim((string) ($filters['address'] ?? ''));
        if ($address !== '') {
            $query->where('address', 'like', '%'.$address.'%');
        }

        if (! empty($filters['registered_date'])) {
            $day = Carbon::parse($filters['registered_date'])->startOfDay();
            $query->whereBetween('created_at', [$day, $day->copy()->endOfDay()]);
        }

        return $query;
    }

    private function registrationSummary(Registration $registration, bool $includeAddress = false): array
    {
        $summary = $registration->only([
            'id',
            'full_name',
            'mobile',
            'email',
            'insta_id',
            'pincode',
            'state',
            'district',
            'city',
            'area',
            'created_at',
        ]);

        if ($includeAddress) {
            $summary['address'] = $registration->address;
        }

        return $summary;
    }

    private function exportColumns(): array
    {
        return [
            'ID' => 'id',
            'Full Name' => 'full_name',
            'Mobile Number' => 'mobile',
            'Email' => 'email',
            'Instagram ID' => 'insta_id',
            'PIN Code' => 'pincode',
            'State' => 'state',
            'District' => 'district',
            'City' => 'city',
            'Area / Locality' => 'area',
            'Sub Address' => 'sub_address',
            'Complete Address' => 'address',
            'Registered At' => 'created_at',
            'Updated At' => 'updated_at',
        ];
    }

    private function xmlCell(string $value, string $style, string $type = 'String'): string
    {
        return '<Cell ss:StyleID="'.$style.'"><Data ss:Type="'.$type.'">'.htmlspecialchars($value, ENT_QUOTES | ENT_XML1, 'UTF-8').'</Data></Cell>';
    }
}
