<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuthLog extends Model
{
    protected $fillable = [
        'event',
        'identifier',
        'user_id',
        'ip_address',
        'user_agent',
        'status',
        'reason',
    ];
}
