<?php

namespace App\Exports;

use App\Models\RoyaltyCalculation;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class RoyaltyCalculationExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return RoyaltyCalculation::with('author')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Period',
            'Author',
            'Total Amount',
            'Status',
            'Calculated At',
        ];
    }

    public function map($calculation): array
    {
        return [
            $calculation->id,
            $calculation->period_month,
            $calculation->author->name ?? '-',
            $calculation->total_amount,
            $calculation->status,
            $calculation->calculated_at,
        ];
    }
}