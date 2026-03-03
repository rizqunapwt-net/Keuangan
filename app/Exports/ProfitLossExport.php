<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProfitLossExport implements FromCollection, WithHeadings, WithTitle, WithStyles, WithColumnWidths
{
    public function __construct(
        private array $data,
        private string $start,
        private string $end
    ) {}

    public function collection()
    {
        $rows = collect();

        // Section: Revenues
        $rows->push(['Pendapatan', '', '', '']);
        foreach ($this->data['revenues']['items'] as $item) {
            $rows->push(['', $item['code'] . ' - ' . $item['name'], $item['balance'], '']);
        }
        $rows->push(['Total Pendapatan', '', $this->data['revenues']['total'], '']);
        $rows->push(['', '', '', '']); // Empty row

        // Section: Expenses
        $rows->push(['Beban', '', '', '']);
        foreach ($this->data['expenses']['items'] as $item) {
            $rows->push(['', $item['code'] . ' - ' . $item['name'], '', $item['balance']]);
        }
        $rows->push(['Total Beban', '', '', $this->data['expenses']['total']]);
        $rows->push(['', '', '', '']); // Empty row

        // Section: Summary
        $rows->push(['LABA BERSIH', '', $this->data['net_profit'], '']);

        return $rows;
    }

    public function headings(): array
    {
        return [
            ['LAPORAN LABA RUGI'],
            ['Periode: ' . $this->start . ' s/d ' . $this->end],
            [''],
            ['Kategori', 'Keterangan', 'Kredit (Rp)', 'Debit (Rp)']
        ];
    }

    public function title(): string
    {
        return 'Laba Rugi';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            4 => ['font' => ['bold' => true]],
            // Add bold for section totals
            'A' => ['font' => ['bold' => true]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 20,
            'B' => 45,
            'C' => 15,
            'D' => 15,
        ];
    }
}
