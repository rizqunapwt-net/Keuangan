<?php

namespace App\Exports;

use App\Models\Attendance;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AttendanceExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Attendance::with('employee.user')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Employee',
            'Date',
            'Check In',
            'Check Out',
            'Status',
            'Note',
        ];
    }

    public function map($attendance): array
    {
        return [
            $attendance->id,
            $attendance->employee->user->name ?? '-',
            $attendance->date,
            $attendance->check_in,
            $attendance->check_out,
            $attendance->status,
            $attendance->note,
        ];
    }
}