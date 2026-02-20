<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LeaveRequestResource\Pages;
use App\Models\LeaveRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class LeaveRequestResource extends Resource
{
    protected static ?string $model = LeaveRequest::class;
    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';
    protected static ?string $navigationGroup = 'Manajemen SDM';
    protected static ?string $navigationLabel = 'Pengajuan Cuti';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('request_number')
                ->label('No. Pengajuan')
                ->disabled(),
            Forms\Components\Select::make('employee_id')
                ->label('Karyawan')
                ->relationship('employee', modifyQueryUsing: fn ($query) => $query->with('user'))
                ->getOptionLabelFromRecordUsing(fn ($record) => $record->user->name)
                ->required(),
            Forms\Components\Select::make('leave_type_id')
                ->label('Jenis Cuti')
                ->relationship('leaveType', 'name')
                ->required(),
            Forms\Components\DatePicker::make('start_date')
                ->label('Mulai')
                ->required(),
            Forms\Components\DatePicker::make('end_date')
                ->label('Selesai')
                ->required(),
            Forms\Components\Textarea::make('reason')
                ->label('Alasan')
                ->required()
                ->rows(3),
            Forms\Components\Select::make('status')
                ->label('Status')
                ->options([
                    'PENDING' => 'Pending',
                    'APPROVED' => 'Disetujui',
                    'REJECTED' => 'Ditolak',
                    'CANCELLED' => 'Dibatalkan',
                ])
                ->disabled(),
            Forms\Components\Textarea::make('review_notes')
                ->label('Catatan Review'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('request_number')
                    ->label('No.')
                    ->searchable(),
                Tables\Columns\TextColumn::make('employee.user.name')
                    ->label('Karyawan')
                    ->searchable(),
                Tables\Columns\TextColumn::make('leaveType.name')
                    ->label('Jenis'),
                Tables\Columns\TextColumn::make('start_date')
                    ->label('Mulai')
                    ->date('d M Y'),
                Tables\Columns\TextColumn::make('end_date')
                    ->label('Selesai')
                    ->date('d M Y'),
                Tables\Columns\TextColumn::make('total_days')
                    ->label('Hari')
                    ->suffix(' hari'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (?string $state) => match ($state) {
                        'PENDING' => 'warning',
                        'APPROVED' => 'success',
                        'REJECTED' => 'danger',
                        'CANCELLED' => 'gray',
                        default => 'gray',
                    }),
            ])
            ->defaultSort('submitted_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'PENDING' => 'Pending',
                        'APPROVED' => 'Disetujui',
                        'REJECTED' => 'Ditolak',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Setujui')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->visible(fn (LeaveRequest $record) => $record->status === 'PENDING')
                    ->requiresConfirmation()
                    ->action(fn (LeaveRequest $record) => $record->update([
                        'status' => 'APPROVED',
                        'reviewed_at' => now(),
                        'reviewed_by' => auth()->id(),
                    ])),
                Tables\Actions\Action::make('reject')
                    ->label('Tolak')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->visible(fn (LeaveRequest $record) => $record->status === 'PENDING')
                    ->requiresConfirmation()
                    ->action(fn (LeaveRequest $record) => $record->update([
                        'status' => 'REJECTED',
                        'reviewed_at' => now(),
                        'reviewed_by' => auth()->id(),
                    ])),
                Tables\Actions\ViewAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLeaveRequests::route('/'),
            'create' => Pages\CreateLeaveRequest::route('/create'),
        ];
    }
}