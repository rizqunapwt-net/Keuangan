<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payroll extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'payroll_number',
        'employee_id',
        'month',
        'year',
        'base_salary',
        'attendance_days',
        'daily_salary',
        'overtime_hours',
        'overtime_pay',
        'late_deduction',
        'absent_deduction',
        'allowances',
        'deductions',
        'gross_pay',
        'net_pay',
        'is_paid',
        'paid_at',
        'slip_url',
    ];

    protected function casts(): array
    {
        return [
            'month' => 'integer',
            'year' => 'integer',
            'base_salary' => 'decimal:2',
            'attendance_days' => 'integer',
            'daily_salary' => 'decimal:2',
            'overtime_hours' => 'decimal:2',
            'overtime_pay' => 'decimal:2',
            'late_deduction' => 'decimal:2',
            'absent_deduction' => 'decimal:2',
            'allowances' => 'decimal:2',
            'deductions' => 'decimal:2',
            'gross_pay' => 'decimal:2',
            'net_pay' => 'decimal:2',
            'is_paid' => 'boolean',
            'paid_at' => 'datetime',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public static function generatePayrollNumber(): string
    {
        $year = now()->year;
        $count = static::where('payroll_number', 'like', "PAY-{$year}%")->count();
        $number = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
        return "PAY-{$year}-{$number}";
    }

    public function getPeriodLabelAttribute(): string
    {
        $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return ($months[$this->month] ?? '') . " {$this->year}";
    }
}