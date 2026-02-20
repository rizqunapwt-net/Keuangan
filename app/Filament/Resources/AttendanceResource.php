<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AttendanceResource\Pages;
use App\Models\Attendance;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AttendanceResource extends Resource
{
    protected static ?string $model = Attendance::class;
    protected static ?string $navigationIcon = 'heroicon-o-clock';
    protected static ?string $navigationGroup = 'Manajemen SDM';
    protected static ?string $navigationLabel = 'Presensi';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('employee_id')
                ->label('Karyawan')
                ->relationship('employee', modifyQueryUsing: fn ($query) => $query->with('user'))
                ->getOptionLabelFromRecordUsing(fn ($record) => $record->user->name)
                ->searchable()
                ->required(),
            Forms\Components\DatePicker::make('attendance_date')
                ->label('Tanggal')
                ->required(),
            Forms\Components\TimePicker::make('check_in_time')
                ->label('Jam Masuk'),
            Forms\Components\TimePicker::make('check_out_time')
                ->label('Jam Keluar'),
            Forms\Components\Select::make('status')
                ->label('Status')
                ->options([
                    'HADIR' => 'Hadir',
                    'ABSEN' => 'Absen',
                    'IZIN' => 'Izin',
                    'WFH' => 'Work From Home',
                ])
                ->required(),
            Forms\Components\TextInput::make('late_minutes')
                ->label('Keterlambatan (menit)')
                ->numeric()
                ->default(0),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('employee.user.name')
                    ->label('Karyawan')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('attendance_date')
                    ->label('Tanggal')
                    ->date('d M Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('check_in_time')
                    ->label('Masuk')
                    ->time('H:i'),
                Tables\Columns\TextColumn::make('check_out_time')
                    ->label('Keluar')
                    ->time('H:i'),
                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (?string $state) => match ($state) {
                        'HADIR' => 'success',
                        'ABSEN' => 'danger',
                        'IZIN' => 'warning',
                        'WFH' => 'info',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('late_minutes')
                    ->label('Terlambat')
                    ->suffix(' menit')
                    ->sortable(),
            ])
            ->defaultSort('attendance_date', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'HADIR' => 'Hadir',
                        'ABSEN' => 'Absen',
                        'IZIN' => 'Izin',
                        'WFH' => 'WFH',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAttendances::route('/'),
            'create' => Pages\CreateAttendance::route('/create'),
            'edit' => Pages\EditAttendance::route('/{record}/edit'),
        ];
    }
}