<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PayrollResource\Pages;
use App\Models\Payroll;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PayrollResource extends Resource
{
    protected static ?string $model = Payroll::class;
    protected static ?string $navigationIcon = 'heroicon-o-banknotes';
    protected static ?string $navigationGroup = 'Manajemen SDM';
    protected static ?string $navigationLabel = 'Payroll';
    protected static ?int $navigationSort = 5;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Info')->schema([
                Forms\Components\TextInput::make('payroll_number')
                    ->label('No. Slip')
                    ->disabled(),
                Forms\Components\Select::make('employee_id')
                    ->label('Karyawan')
                    ->relationship('employee', modifyQueryUsing: fn ($query) => $query->with('user'))
                    ->getOptionLabelFromRecordUsing(fn ($record) => $record->user->name)
                    ->disabled(),
                Forms\Components\TextInput::make('month')->label('Bulan')->disabled(),
                Forms\Components\TextInput::make('year')->label('Tahun')->disabled(),
            ])->columns(['default' => 2]),

            Forms\Components\Section::make('Detail Perhitungan')->schema([
                Forms\Components\TextInput::make('base_salary')->label('Gaji Pokok')->prefix('Rp')->disabled(),
                Forms\Components\TextInput::make('attendance_days')->label('Hari Hadir')->suffix(' hari')->disabled(),
                Forms\Components\TextInput::make('overtime_hours')->label('Jam Lembur')->suffix(' jam')->disabled(),
                Forms\Components\TextInput::make('overtime_pay')->label('Uang Lembur')->prefix('Rp')->disabled(),
                Forms\Components\TextInput::make('late_deduction')->label('Pot. Terlambat')->prefix('Rp')->disabled(),
                Forms\Components\TextInput::make('absent_deduction')->label('Pot. Absen')->prefix('Rp')->disabled(),
                Forms\Components\TextInput::make('gross_pay')->label('Gaji Kotor')->prefix('Rp')->disabled(),
                Forms\Components\TextInput::make('net_pay')->label('Gaji Bersih')->prefix('Rp')->disabled(),
            ])->columns(['default' => 2]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('payroll_number')
                    ->label('No. Slip')
                    ->searchable(),
                Tables\Columns\TextColumn::make('employee.user.name')
                    ->label('Karyawan')
                    ->searchable(),
                Tables\Columns\TextColumn::make('period_label')
                    ->label('Periode'),
                Tables\Columns\TextColumn::make('attendance_days')
                    ->label('Hari Hadir')
                    ->suffix(' hari'),
                Tables\Columns\TextColumn::make('gross_pay')
                    ->label('Gaji Kotor')
                    ->money('IDR'),
                Tables\Columns\TextColumn::make('net_pay')
                    ->label('Gaji Bersih')
                    ->money('IDR')
                    ->weight('bold'),
                Tables\Columns\IconColumn::make('is_paid')
                    ->label('Dibayar')
                    ->boolean(),
            ])
            ->defaultSort('year', 'desc')
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\Action::make('send_whatsapp')
                    ->label('Kirim WA')
                    ->icon('heroicon-o-chat-bubble-left-ellipsis')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (Payroll $record) {
                        $url = config('app.webhook_url') . '/generate-slip';
                        $data = [
                            'payroll_number' => $record->payroll_number,
                            'employee_name' => $record->employee->user->name,
                            'month' => $record->month,
                            'year' => $record->year,
                            'net_pay' => $record->net_pay,
                            'whatsapp' => $record->employee->user->phone ?? '-', 
                        ];

                        try {
                            \Illuminate\Support\Facades\Http::post($url, $data);
                            \Filament\Notifications\Notification::make()
                                ->title('Slip dikirim ke antrian WA')
                                ->success()
                                ->send();
                        } catch (\Exception $e) {
                            \Filament\Notifications\Notification::make()
                                ->title('Gagal mengirim ke n8n')
                                ->body($e->getMessage())
                                ->danger()
                                ->send();
                        }
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPayrolls::route('/'),
        ];
    }
}