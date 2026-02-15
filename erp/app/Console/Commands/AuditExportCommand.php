<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\Models\Activity;

class AuditExportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'audit:export {period? : Format YYYY-MM}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export activity_log bulanan ke CSV untuk kebutuhan audit';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $period = $this->argument('period') ?: now()->subMonth()->format('Y-m');
        $start = Carbon::createFromFormat('Y-m', $period)->startOfMonth();
        $end = Carbon::createFromFormat('Y-m', $period)->endOfMonth();

        $rows = Activity::query()
            ->whereBetween('created_at', [$start, $end])
            ->orderBy('created_at')
            ->get(['id', 'log_name', 'description', 'subject_type', 'subject_id', 'causer_type', 'causer_id', 'properties', 'created_at']);

        $filePath = "audit-reports/audit-{$period}.csv";
        $stream = fopen('php://temp', 'wb+');

        fputcsv($stream, ['id', 'log_name', 'description', 'subject_type', 'subject_id', 'causer_type', 'causer_id', 'properties', 'created_at']);

        foreach ($rows as $row) {
            fputcsv($stream, [
                $row->id,
                $row->log_name,
                $row->description,
                $row->subject_type,
                $row->subject_id,
                $row->causer_type,
                $row->causer_id,
                json_encode($row->properties, JSON_UNESCAPED_UNICODE),
                optional($row->created_at)->toIso8601String(),
            ]);
        }

        rewind($stream);
        $csv = stream_get_contents($stream);
        fclose($stream);

        Storage::disk(config('filesystems.default'))->put($filePath, $csv);

        $this->info("Audit report berhasil diekspor ke: {$filePath}");

        return self::SUCCESS;
    }
}
