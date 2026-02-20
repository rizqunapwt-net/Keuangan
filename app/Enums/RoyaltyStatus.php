<?php

namespace App\Enums;

enum RoyaltyStatus: string
{
    case Draft = 'draft';
    case Finalized = 'finalized';
    case Paid = 'paid';
}
