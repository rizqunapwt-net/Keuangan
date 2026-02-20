<?php

namespace App\Exports;

use App\Models\Sale;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SalesExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Sale::with(['book', 'marketplace'])->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Period',
            'Buku',
            'Marketplace',
            'Transaksi ID',
            'Quantity',
            'Net Price',
            'Total',
            'Status',
            'Tanggal',
        ];
    }

    public function map($sale): array
    {
        return [
            $sale->id,
            $sale->period_month,
            $sale->book->title ?? '-',
            $sale->marketplace->name ?? '-',
            $sale->transaction_id,
            $sale->quantity,
            $sale->net_price,
            $sale->quantity * $sale->net_price,
            $sale->status,
            $sale->created_at,
        ];
    }
}