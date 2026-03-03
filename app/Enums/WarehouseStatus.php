<?php

namespace App\Enums;

enum WarehouseStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case MAINTENANCE = 'maintenance';
    case CLOSED = 'closed';
}
