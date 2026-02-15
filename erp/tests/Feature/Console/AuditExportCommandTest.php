<?php

namespace Tests\Feature\Console;

use App\Models\Author;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuditExportCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_exports_monthly_audit_csv(): void
    {
        config(['filesystems.default' => 'local']);
        Storage::fake('local');

        Author::factory()->create();

        $period = now()->format('Y-m');

        $this->artisan("audit:export {$period}")
            ->assertSuccessful();

        $path = "audit-reports/audit-{$period}.csv";

        Storage::disk('local')->assertExists($path);

        $content = Storage::disk('local')->get($path);
        $this->assertStringContainsString('id,log_name,description', $content);
    }
}
