<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum PrintingBookStatus: string implements HasLabel, HasColor, HasIcon
{
    case DRAFT = 'draft';
    case INCOMING = 'incoming';
    case REVIEW = 'review';
    case EDITORIAL = 'editorial';
    case COVERING = 'covering';
    case PRODUCTION = 'production';
    case DONE = 'done';
    case REVISION = 'revision';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::INCOMING => 'Naskah Masuk',
            self::REVIEW => 'Review',
            self::EDITORIAL => 'Editing & Layout',
            self::COVERING => 'Desain Cover',
            self::PRODUCTION => 'Cetak',
            self::DONE => 'Selesai',
            self::REVISION => 'Revisi',
        };
    }

    public function getColor(): ?string
    {
        return match ($this) {
            self::DRAFT => 'gray',
            self::INCOMING => 'info',
            self::REVIEW => 'warning',
            self::EDITORIAL => 'primary',
            self::COVERING => 'purple',
            self::PRODUCTION => 'indigo',
            self::DONE => 'success',
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
            self::PRODUCTION => 'heroicon-o-printer',
            self::DONE => 'heroicon-o-check-badge',
            self::REVISION => 'heroicon-o-arrow-uturn-left',
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
            self::PRODUCTION => 5,
            self::DONE => 6,
            self::REVISION => 1,
        };
    }

    public function allowedTransitions(): array
    {
        return match ($this) {
            self::DRAFT => [self::INCOMING],
            self::INCOMING => [self::REVIEW],
            self::REVIEW => [self::EDITORIAL, self::COVERING, self::REVISION],
            self::EDITORIAL => [self::COVERING],
            self::COVERING => [self::PRODUCTION],
            self::PRODUCTION => [self::DONE],
            self::DONE => [],
            self::REVISION => [self::INCOMING],
        };
    }
}
