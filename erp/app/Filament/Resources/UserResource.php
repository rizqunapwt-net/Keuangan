<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationGroup = 'Sistem';
    protected static ?string $navigationLabel = 'Manajemen User';
    protected static ?int $navigationSort = 100;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Identitas')->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('email')
                    ->email()
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),
                Forms\Components\TextInput::make('username')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),
                Forms\Components\TextInput::make('password')
                    ->password()
                    ->dehydrateStateUsing(fn ($state) => Hash::make($state))
                    ->dehydrated(fn ($state) => filled($state))
                    ->required(fn (string $operation): bool => $operation === 'create'),
            ])->columns(['default' => 2]),

            Forms\Components\Section::make('Akses & Status')->schema([
                Forms\Components\Select::make('roles')
                    ->relationship('roles', 'name')
                    ->multiple()
                    ->preload()
                    ->searchable(),
                Forms\Components\Toggle::make('is_active')
                    ->label('Aktif')
                    ->default(true),
                Forms\Components\Select::make('role')
                    ->label('Role Label (Legacy)')
                    ->options([
                        'ADMIN' => 'Admin',
                        'KARYAWAN' => 'Karyawan',
                        'OWNER' => 'Owner',
                    ])
                    ->helperText('Hanya untuk kompatibilitas aplikasi lama.'),
            ])->columns(['default' => 2]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('email')->searchable(),
                Tables\Columns\TextColumn::make('username')->searchable(),
                Tables\Columns\TextColumn::make('roles.name')
                    ->badge()
                    ->color('primary'),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean(),
                Tables\Columns\TextColumn::make('last_login_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active'),
                Tables\Filters\SelectFilter::make('roles')
                    ->relationship('roles', 'name')
                    ->multiple(),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\EditAction::make()
                        ->label('Edit Profil')
                        ->color('primary'),
                    Tables\Actions\Action::make('delegate')
                        ->label('Delegasi Role')
                        ->icon('heroicon-o-shield-check')
                        ->color('success')
                        ->form([
                            Forms\Components\Select::make('roles')
                                ->label('Ganti Role Ke')
                                ->relationship('roles', 'name')
                                ->multiple()
                                ->preload()
                                ->required(),
                        ])
                        ->action(function (User $record, array $data): void {
                            $record->syncRoles($data['roles']);
                            
                            // Ambil role pertama sebagai legacy label
                            $firstRole = \Spatie\Permission\Models\Role::whereIn('id', $data['roles'])->first();
                            if ($firstRole) {
                                $record->update(['role' => strtoupper($firstRole->name)]);
                            }

                            \Filament\Notifications\Notification::make()
                                ->title('Role Berhasil Didelegasikan')
                                ->success()
                                ->send();
                        })
                        ->visible(fn (User $record) => auth()->user()->can('update', $record)),
                    Tables\Actions\ViewAction::make(),
                    Tables\Actions\DeleteAction::make()
                        ->hidden(fn (User $record) => $record->id === auth()->id()),
                ])
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}