<?php

namespace App\Enums;

enum ExpenseStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case VOIDED = 'voided';
}
