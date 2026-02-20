<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EmployeeResource\Pages;
use App\Models\Employee;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class EmployeeResource extends Resource
{
    protected static ?string $model = Employee::class;
    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationGroup = 'ERP';
    protected static ?string $navigationLabel = 'Karyawan';
    protected static ?int $navigationSort = 1;
    protected static ?string $recordTitleAttribute = 'name';

    public static function getGloballySearchableAttributes(): array
    {
        return ['user.name', 'employee_code', 'user.username'];
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Data Pengguna')
            ->schema([
                Forms\Components\TextInput::make('name')
                ->label('Nama Lengkap')
                ->required(),
                Forms\Components\TextInput::make('username')
                ->label('Username')
                ->required(),
                Forms\Components\TextInput::make('email')
                ->label('Email')
                ->email()
                ->required(),
                Forms\Components\Select::make('role')
                ->label('Role')
                ->options([
                    'KARYAWAN' => 'Karyawan',
                    'ADMIN' => 'Admin',
                    'OWNER' => 'Owner',
                ])
                ->default('KARYAWAN')
                ->required(),
                Forms\Components\TextInput::make('password')
                ->label('Password')
                ->password()
                ->required(fn(string $operation): bool => $operation === 'create'),
            ])->columns(['default' => 2]),

            Forms\Components\Section::make('Data Karyawan')->schema([
                Forms\Components\TextInput::make('employee_code')
                ->label('Kode Karyawan')
                ->nullable(),
                Forms\Components\Select::make('category')
                ->label('Kategori')
                ->options([
                    'REGULER' => 'Reguler',
                    'MAHASISWA' => 'Mahasiswa',
                    'KEBUN' => 'Kebun',
                ])
                ->default('REGULER')
                ->required(),
                Forms\Components\TextInput::make('base_salary')
                ->label('Gaji Pokok')
                ->numeric()
                ->prefix('Rp')
                ->default(5000000),
            ])->columns(['default' => 2]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
            Tables\Columns\TextColumn::make('user.name')
            ->label('Nama')
            ->searchable()
            ->sortable(),
            Tables\Columns\TextColumn::make('employee_code')
            ->label('Kode')
            ->searchable(),
            Tables\Columns\TextColumn::make('user.username')
            ->label('Username')
            ->searchable(),
            Tables\Columns\TextColumn::make('category')
            ->label('Kategori')
            ->badge()
            ->color(fn(string $state) => match ($state) {
            'REGULER' => 'primary',
            'MAHASISWA' => 'info',
            'KEBUN' => 'success',
            default => 'gray',
        }),
            Tables\Columns\TextColumn::make('user.role')
            ->label('Role')
            ->badge()
            ->color(fn(string $state) => match ($state) {
            'OWNER' => 'danger',
            'ADMIN' => 'warning',
            default => 'gray',
        }),
            Tables\Columns\IconColumn::make('user.is_active')
            ->label('Aktif')
            ->boolean(),
            Tables\Columns\TextColumn::make('base_salary')
            ->label('Gaji Pokok')
            ->money('IDR')
            ->sortable(),
        ])
            ->filters([
            Tables\Filters\SelectFilter::make('category')
            ->options([
                'REGULER' => 'Reguler',
                'MAHASISWA' => 'Mahasiswa',
                'KEBUN' => 'Kebun',
            ]),
        ])
            ->actions([
            Tables\Actions\ActionGroup::make([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('delegate')
                ->label('Delegasi Role')
                ->icon('heroicon-o-shield-check')
                ->color('success')
                ->form([
                    Forms\Components\Select::make('roles')
                    ->label('Ganti Role User')
                    ->relationship('user.roles', 'name')
                    ->multiple()
                    ->preload()
                    ->required(),
                ])
                ->action(function (Employee $record, array $data): void {
            $user = $record->user;
            $user->syncRoles($data['roles']);

            $firstRole = \Spatie\Permission\Models\Role::whereIn('id', $data['roles'])->first();
            if ($firstRole) {
                $user->update(['role' => strtoupper($firstRole->name)]);
            }

            \Filament\Notifications\Notification::make()
                    ->title('Role User Berhasil Diperbarui')
                    ->success()
                    ->send();
        }),
                Tables\Actions\ViewAction::make(),
            ])
        ])
            ->bulkActions([
            Tables\Actions\BulkActionGroup::make([
                Tables\Actions\DeleteBulkAction::make(),
            ]),
        ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEmployees::route('/'),
            'create' => Pages\CreateEmployee::route('/create'),
            'edit' => Pages\EditEmployee::route('/{record}/edit'),
        ];
    }
}