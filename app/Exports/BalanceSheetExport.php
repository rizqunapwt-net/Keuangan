<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class BalanceSheetExport implements FromCollection, WithHeadings, WithTitle, WithStyles, WithColumnWidths
{
    public function __construct(
        private array $data,
        private string $asOf
    ) {}

    public function collection()
    {
        $rows = collect();

        // 1. Assets
        $rows->push(['ASET', '', '', '']);
        foreach ($this->data['assets']['items'] as $item) {
            $rows->push(['', $item['code'] . ' - ' . $item['name'], $item['balance'], '']);
        }
        $rows->push(['Total Aset', '', $this->data['assets']['total'], '']);
        $rows->push(['', '', '', '']);

        // 2. Liabilities
        $rows->push(['KEWAJIBAN', '', '', '']);
        foreach ($this->data['liabilities']['items'] as $item) {
            $rows->push(['', $item['code'] . ' - ' . $item['name'], '', $item['balance']]);
        }
        $rows->push(['Total Kewajiban', '', '', $this->data['liabilities']['total']]);
        $rows->push(['', '', '', '']);

        // 3. Equity
        $rows->push(['MODAL', '', '', '']);
        foreach ($this->data['equity']['items'] as $item) {
            $rows->push(['', $item['code'] . ' - ' . $item['name'], '', $item['balance']]);
        }
        $rows->push(['', 'Laba Berjalan', '', $this->data['equity']['current_earnings']]);
        $rows->push(['Total Modal', '', '', $this->data['equity']['total']]);
        $rows->push(['', '', '', '']);

        // Summary
        $rows->push(['TOTAL KEWAJIBAN + MODAL', '', '', $this->data['liabilities']['total'] + $this->data['equity']['total']]);

        return $rows;
    }

    public function headings(): array
    {
        return [
            ['LAPORAN POSISI KEUANGAN (NERACA)'],
            ['Per Tanggal: ' . $this->asOf],
            [''],
            ['Kategori', 'Keterangan', 'Debit (Rp)', 'Kredit (Rp)']
        ];
    }

    public function title(): string
    {
        return 'Neraca';
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
            'B' => 45,
            'C' => 15,
            'D' => 15,
        ];
    }
}
