<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum BookStatus: string implements HasLabel, HasColor, HasIcon
{
    case DRAFT = 'draft';
    case INCOMING = 'incoming';
    case EDITORIAL = 'editorial';
    case LAYOUTING = 'layouting';
    case IS_ISBN_PROCESS = 'isbn_process';
    case PRODUCTION = 'production';
    case WAREHOUSE = 'warehouse';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::INCOMING => 'Naskah Masuk',
            self::EDITORIAL => 'Editorial & Proofing',
            self::LAYOUTING => 'Proses Layout',
            self::IS_ISBN_PROCESS => 'Proses Pengajuan ISBN',
            self::PRODUCTION => 'Antrean Cetak',
            self::WAREHOUSE => 'Stok Gudang',
            self::PUBLISHED => 'Terbit & Jual',
            self::ARCHIVED => 'Arsip Lama',
        };
    }

    public function getColor(): ?string
    {
        return match ($this) {
            self::DRAFT, self::ARCHIVED => 'gray',
            self::INCOMING => 'info',
            self::EDITORIAL => 'warning',
            self::LAYOUTING => 'primary',
            self::IS_ISBN_PROCESS => 'danger',
            self::PRODUCTION => 'indigo',
            self::WAREHOUSE => 'success',
            self::PUBLISHED => 'success',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::DRAFT => 'heroicon-o-document',
            self::INCOMING => 'heroicon-o-inbox-arrow-down',
            self::EDITORIAL => 'heroicon-o-pencil-square',
            self::LAYOUTING => 'heroicon-o-photo',
            self::IS_ISBN_PROCESS => 'heroicon-o-identification',
            self::PRODUCTION => 'heroicon-o-printer',
            self::WAREHOUSE => 'heroicon-o-archive-box',
            self::PUBLISHED => 'heroicon-o-check-badge',
            self::ARCHIVED => 'heroicon-o-trash',
        };
    }
}