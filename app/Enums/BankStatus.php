<?php

namespace App\Enums;

enum BankStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case SUSPENDED = 'suspended';
    case CLOSED = 'closed';
}
