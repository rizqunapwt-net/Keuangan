<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum BookStatus: string implements HasLabel, HasColor, HasIcon
{
    case DRAFT = 'draft';
    case INCOMING = 'incoming';
    case REVIEW = 'review';
    case EDITORIAL = 'editorial';
    case COVERING = 'covering';
    case APPROVING = 'approving';
    case SURAT_PERNYATAAN = 'surat_pernyataan';
    case IS_ISBN_PROCESS = 'isbn_process';
    case PRODUCTION = 'production';
    case WAREHOUSE = 'warehouse';
    case PUBLISHED = 'published';
    case REVISION = 'revision';
    case ARCHIVED = 'archived';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::INCOMING => 'Naskah Masuk',
            self::REVIEW => 'Review',
            self::EDITORIAL => 'Editing & Layout',
            self::COVERING => 'Desain Cover',
            self::APPROVING => 'Approval',
            self::SURAT_PERNYATAAN => 'Surat Pernyataan',
            self::IS_ISBN_PROCESS => 'Proses ISBN',
            self::PRODUCTION => 'Cetak',
            self::WAREHOUSE => 'Stok Gudang',
            self::PUBLISHED => 'Terbit & Jual',
            self::REVISION => 'Revisi Penulis',
            self::ARCHIVED => 'Arsip Lama',
        };
    }

    public function getColor(): ?string
    {
        return match ($this) {
            self::DRAFT, self::ARCHIVED => 'gray',
            self::INCOMING => 'info',
            self::REVIEW => 'warning',
            self::EDITORIAL => 'primary',
            self::COVERING => 'purple',
            self::APPROVING => 'orange',
            self::SURAT_PERNYATAAN => 'cyan',
            self::IS_ISBN_PROCESS => 'danger',
            self::PRODUCTION => 'indigo',
            self::WAREHOUSE => 'success',
            self::PUBLISHED => 'success',
            self::REVISION => 'red',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::DRAFT => 'heroicon-o-document',
            self::INCOMING => 'heroicon-o-inbox-arrow-down',
            self::REVIEW => 'heroicon-o-magnifying-glass',
            self::EDITORIAL => 'heroicon-o-pencil-square',
            self::COVERING => 'heroicon-o-photo',
            self::APPROVING => 'heroicon-o-shield-check',
            self::SURAT_PERNYATAAN => 'heroicon-o-document-check',
            self::IS_ISBN_PROCESS => 'heroicon-o-identification',
            self::PRODUCTION => 'heroicon-o-printer',
            self::WAREHOUSE => 'heroicon-o-archive-box',
            self::PUBLISHED => 'heroicon-o-check-badge',
            self::REVISION => 'heroicon-o-arrow-uturn-left',
            self::ARCHIVED => 'heroicon-o-trash',
        };
    }

    public function getStep(): int
    {
        return match ($this) {
            self::DRAFT => 0,
            self::INCOMING => 1,
            self::REVIEW => 2,
            self::EDITORIAL => 3,
            self::COVERING => 4,
            self::APPROVING => 5,
            self::SURAT_PERNYATAAN => 6,
            self::IS_ISBN_PROCESS => 7,
            self::PRODUCTION => 8,
            self::WAREHOUSE => 9,
            self::PUBLISHED => 10,
            self::REVISION => 1,
            self::ARCHIVED => 0,
        };
    }

    /**
     * Allowed next statuses from the current status.
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::DRAFT => [self::INCOMING],
            self::INCOMING => [self::REVIEW],
            self::REVIEW => [self::EDITORIAL, self::COVERING, self::REVISION], // bisa langsung ke covering jika tidak perlu editing
            self::EDITORIAL => [self::COVERING],
            self::COVERING => [self::APPROVING],
            self::APPROVING => [self::SURAT_PERNYATAAN, self::REVIEW], // bisa kembalikan ke review
            self::SURAT_PERNYATAAN => [self::IS_ISBN_PROCESS],
            self::IS_ISBN_PROCESS => [self::PRODUCTION],
            self::PRODUCTION => [self::WAREHOUSE],
            self::WAREHOUSE => [self::PUBLISHED],
            self::PUBLISHED => [self::ARCHIVED],
            self::REVISION => [self::INCOMING], // penulis kirim ulang
            self::ARCHIVED => [],
        };
    }
}