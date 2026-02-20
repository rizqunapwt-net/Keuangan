<?php

namespace App\Domain\Sales;

use App\Enums\ContractStatus;
use App\Enums\SaleStatus;
use App\Enums\SalesImportStatus;
use App\Models\Book;
use App\Models\Contract;
use App\Models\Marketplace;
use App\Models\Sale;
use App\Models\SalesImport;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SalesImportService
{
    private const REQUIRED_HEADERS = [
        'period_month',
        'marketplace_code',
        'isbn',
        'transaction_id',
        'quantity',
        'net_price',
        'status',
    ];

    public function import(UploadedFile $file, string $periodMonth, string $marketplaceCode, User $user): SalesImport
    {
        $marketplace = Marketplace::query()
            ->where('code', $marketplaceCode)
            ->where('is_active', true)
            ->first();

        if (! $marketplace) {
            throw ValidationException::withMessages([
                'marketplace_code' => ['Marketplace tidak ditemukan atau tidak aktif.'],
            ]);
        }

        $import = SalesImport::create([
            'period_month' => $periodMonth,
            'marketplace_code' => $marketplaceCode,
            'file_name' => $file->getClientOriginalName(),
            'status' => SalesImportStatus::Processing,
            'imported_by' => $user->id,
        ]);

        $failedRows = [];
        $importedRows = 0;
        $totalRows = 0;

        $periodStart = Carbon::createFromFormat('Y-m', $periodMonth)->startOfMonth();
        $periodEnd = Carbon::createFromFormat('Y-m', $periodMonth)->endOfMonth();

        $handle = fopen($file->getRealPath(), 'rb');

        if (! $handle) {
            throw ValidationException::withMessages([
                'file' => ['File CSV tidak dapat dibaca.'],
            ]);
        }

        $header = fgetcsv($handle);

        if (! $header) {
            fclose($handle);

            throw ValidationException::withMessages([
                'file' => ['Header CSV tidak ditemukan.'],
            ]);
        }

        $normalizedHeader = array_map(static fn ($item) => trim((string) $item), $header);

        foreach (self::REQUIRED_HEADERS as $requiredHeader) {
            if (! in_array($requiredHeader, $normalizedHeader, true)) {
                fclose($handle);

                throw ValidationException::withMessages([
                    'file' => ["Kolom {$requiredHeader} wajib ada di CSV."],
                ]);
            }
        }

        $headerMap = array_flip($normalizedHeader);

        while (($row = fgetcsv($handle)) !== false) {
            $totalRows++;

            $parsed = [
                'period_month' => trim((string) ($row[$headerMap['period_month']] ?? '')),
                'marketplace_code' => trim((string) ($row[$headerMap['marketplace_code']] ?? '')),
                'isbn' => trim((string) ($row[$headerMap['isbn']] ?? '')),
                'transaction_id' => trim((string) ($row[$headerMap['transaction_id']] ?? '')),
                'quantity' => trim((string) ($row[$headerMap['quantity']] ?? '')),
                'net_price' => trim((string) ($row[$headerMap['net_price']] ?? '')),
                'status' => trim((string) ($row[$headerMap['status']] ?? '')),
            ];

            $error = $this->validateRow($parsed, $periodMonth, $marketplaceCode, $marketplace->id, $periodStart, $periodEnd);

            if ($error !== null) {
                $failedRows[] = [...$parsed, 'error' => $error];

                continue;
            }

            DB::transaction(function () use ($parsed, $import, $marketplace, $user, &$importedRows): void {
                $book = Book::query()->where('isbn', $parsed['isbn'])->firstOrFail();

                Sale::create([
                    'sales_import_id' => $import->id,
                    'marketplace_id' => $marketplace->id,
                    'book_id' => $book->id,
                    'transaction_id' => $parsed['transaction_id'],
                    'period_month' => $parsed['period_month'],
                    'quantity' => (int) $parsed['quantity'],
                    'net_price' => (float) $parsed['net_price'],
                    'status' => $parsed['status'],
                    'imported_by' => $user->id,
                ]);

                $importedRows++;
            });
        }

        fclose($handle);

        $errorReportPath = null;

        if ($failedRows !== []) {
            $csv = $this->buildErrorReportCsv($failedRows);
            $errorReportPath = 'sales-import-errors/'.$import->id.'.csv';
            Storage::disk(config('filesystems.default'))->put($errorReportPath, $csv);
        }

        $status = $importedRows > 0 ? SalesImportStatus::Completed : SalesImportStatus::Failed;

        $import->update([
            'total_rows' => $totalRows,
            'imported_rows' => $importedRows,
            'failed_rows' => count($failedRows),
            'status' => $status,
            'error_report_path' => $errorReportPath,
        ]);

        return $import->refresh();
    }

    private function validateRow(
        array $row,
        string $expectedPeriod,
        string $expectedMarketplace,
        int $marketplaceId,
        Carbon $periodStart,
        Carbon $periodEnd
    ): ?string {
        if ($row['period_month'] !== $expectedPeriod) {
            return 'period_month tidak sesuai dengan periode import.';
        }

        if ($row['marketplace_code'] !== $expectedMarketplace) {
            return 'marketplace_code tidak sesuai dengan marketplace import.';
        }

        if ($row['isbn'] === '' || $row['transaction_id'] === '') {
            return 'isbn dan transaction_id wajib diisi.';
        }

        if (! is_numeric($row['quantity']) || (int) $row['quantity'] <= 0) {
            return 'quantity harus angka dan > 0.';
        }

        if (! is_numeric($row['net_price']) || (float) $row['net_price'] < 0) {
            return 'net_price harus angka dan >= 0.';
        }

        if (! in_array($row['status'], [SaleStatus::Completed->value, SaleStatus::Refunded->value], true)) {
            return 'status harus completed atau refunded.';
        }

        if (Sale::query()->where('marketplace_id', $marketplaceId)->where('transaction_id', $row['transaction_id'])->exists()) {
            return 'transaction_id sudah pernah diimport untuk marketplace ini.';
        }

        $book = Book::query()->where('isbn', $row['isbn'])->first();

        if (! $book) {
            return 'Buku dengan ISBN ini tidak ditemukan.';
        }

        $approvedContract = Contract::query()
            ->where('book_id', $book->id)
            ->where('status', ContractStatus::Approved)
            ->whereDate('start_date', '<=', $periodEnd)
            ->whereDate('end_date', '>=', $periodStart)
            ->exists();

        if (! $approvedContract) {
            return 'Buku belum memiliki kontrak approved aktif untuk periode ini.';
        }

        return null;
    }

    private function buildErrorReportCsv(array $failedRows): string
    {
        $headers = array_keys($failedRows[0]);
        $lines = [implode(',', $headers)];

        foreach ($failedRows as $row) {
            $escaped = array_map(static function ($value): string {
                $value = str_replace('"', '""', (string) $value);

                return '"'.$value.'"';
            }, $row);

            $lines[] = implode(',', $escaped);
        }

        return implode(PHP_EOL, $lines);
    }
}
