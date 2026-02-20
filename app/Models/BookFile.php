<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookFile extends Model
{
    protected $fillable = [
        'book_id',
        'file_type',
        'file_path',
        'original_name',
        'file_size',
        'uploaded_by',
        'notes',
    ];

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class , 'uploaded_by');
    }

    public function getFileTypeLabel(): string
    {
        return match ($this->file_type) {
                'manuscript' => 'Naskah Asli',
                'edited' => 'Hasil Editing',
                'layout' => 'File Layout',
                'proof' => 'Proof / Dummy',
                'isbn_cert' => 'Sertifikat ISBN',
                'cover_final' => 'Cover Final',
                'print_ready' => 'File Siap Cetak',
                default => $this->file_type,
            };
    }
}