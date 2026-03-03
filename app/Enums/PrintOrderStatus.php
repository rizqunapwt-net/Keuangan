<?php

namespace App\Enums;

enum PrintOrderStatus: string
{
    case INQUIRY = 'inquiry';
    case QUOTED = 'quoted';
    case CONFIRMED = 'confirmed';
    case IN_PRODUCTION = 'in_production';
    case COMPLETED = 'completed';
    case READY_DELIVERY = 'ready_delivery';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::INQUIRY => 'Inquiry',
            self::QUOTED => 'Penawaran',
            self::CONFIRMED => 'Terkonfirmasi',
            self::IN_PRODUCTION => 'Sedang Produksi',
            self::COMPLETED => 'Selesai',
            self::READY_DELIVERY => 'Siap Kirim',
            self::DELIVERED => 'Terkirim',
            self::CANCELLED => 'Dibatalkan',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::INQUIRY => 'default',
            self::QUOTED => 'processing',
            self::CONFIRMED => 'cyan',
            self::IN_PRODUCTION => 'blue',
            self::COMPLETED => 'success',
            self::READY_DELIVERY => 'purple',
            self::DELIVERED => 'green',
            self::CANCELLED => 'error',
        };
    }

    public function allowedTransitions(): array
    {
        return match ($this) {
            self::INQUIRY => [self::QUOTED, self::CANCELLED],
            self::QUOTED => [self::CONFIRMED, self::CANCELLED],
            self::CONFIRMED => [self::IN_PRODUCTION, self::CANCELLED],
            self::IN_PRODUCTION => [self::COMPLETED, self::CANCELLED],
            self::COMPLETED => [self::READY_DELIVERY],
            self::READY_DELIVERY => [self::DELIVERED],
            default => [],
        };
    }

    public function canTransitionTo(self $newStatus): bool
    {
        return in_array($newStatus, $this->allowedTransitions());
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $status): string => $status->value,
            self::cases()
        );
    }
}
