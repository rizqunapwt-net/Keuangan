<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CashFlowExport implements FromCollection, WithColumnWidths, WithHeadings, WithStyles, WithTitle
{
    public function __construct(
        private array $data,
        private string $start,
        private string $end
    ) {}

    public function collection()
    {
        $rows = collect();

        // Operating Activities
        $rows->push(['AKTIVITAS OPERASI', '', '']);
        foreach ($this->data['operating']['items'] ?? [] as $item) {
            $rows->push(['', $item['description'] ?? $item['reference'] ?? '-', $item['amount'] ?? 0]);
        }
        $rows->push(['Total Operasi', '', $this->data['operating']['total'] ?? 0]);
        $rows->push(['', '', '']);

        // Investing Activities
        $rows->push(['AKTIVITAS INVESTASI', '', '']);
        foreach ($this->data['investing']['items'] ?? [] as $item) {
            $rows->push(['', $item['description'] ?? $item['reference'] ?? '-', $item['amount'] ?? 0]);
        }
        $rows->push(['Total Investasi', '', $this->data['investing']['total'] ?? 0]);
        $rows->push(['', '', '']);

        // Financing Activities
        $rows->push(['AKTIVITAS PENDANAAN', '', '']);
        foreach ($this->data['financing']['items'] ?? [] as $item) {
            $rows->push(['', $item['description'] ?? $item['reference'] ?? '-', $item['amount'] ?? 0]);
        }
        $rows->push(['Total Pendanaan', '', $this->data['financing']['total'] ?? 0]);
        $rows->push(['', '', '']);

        // Net Cash Flow
        $rows->push(['ARUS KAS BERSIH', '', $this->data['net_cash_flow'] ?? 0]);

        return $rows;
    }

    public function headings(): array
    {
        return [
            ['LAPORAN ARUS KAS'],
            ['Periode: '.$this->start.' s/d '.$this->end],
            [''],
            ['Kategori', 'Keterangan', 'Jumlah (Rp)'],
        ];
    }

    public function title(): string
    {
        return 'Arus Kas';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            4 => ['font' => ['bold' => true]],
            'A' => ['font' => ['bold' => true]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 25,
            'B' => 50,
            'C' => 18,
        ];
    }
}
