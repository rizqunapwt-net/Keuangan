<?php

namespace App\Filament\Resources\Accounting\JournalResource\Pages;

use App\Filament\Resources\Accounting\JournalResource;
use App\Models\Accounting\Account;
use App\Models\Accounting\JournalEntry;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Resources\Pages\Page;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Illuminate\Support\Facades\DB;

class FinancialReport extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string $resource = JournalResource::class;
    protected static string $view = 'filament.resources.accounting.journal-resource.pages.financial-report';
    protected static ?string $navigationIcon = 'heroicon-o-chart-pie';
    protected static ?string $navigationLabel = 'Financial Reports';
    protected static ?int $navigationSort = 3;

    public ?array $data = [];
    public string $activeTab = 'profit_loss'; // 'profit_loss' or 'balance_sheet'
    public array $reportData = [];

    public function mount(): void
    {
        $this->form->fill([
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => now()->toDateString(),
            'report_type' => 'profit_loss',
        ]);

        $this->generateReport();
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Section::make()
            ->schema([
                Select::make('report_type')
                ->label('Report Type')
                ->options([
                    'profit_loss' => 'Profit & Loss',
                    'balance_sheet' => 'Balance Sheet',
                ])
                ->required()
                ->live()
                ->afterStateUpdated(fn($state) => $this->activeTab = $state),
                DatePicker::make('start_date')
                ->label('Start Date')
                ->hidden(fn(Get $get) => $get('report_type') === 'balance_sheet')
                ->required(),
                DatePicker::make('end_date')
                ->label(fn(Get $get) => $get('report_type') === 'balance_sheet' ? 'As At Date' : 'End Date')
                ->required(),
            ])
            ->columns(3)
        ])->statePath('data');
    }

    public function generateReport()
    {
        $formData = $this->form->getState();
        $this->activeTab = $formData['report_type'];

        if ($this->activeTab === 'profit_loss') {
            $this->calculateProfitLoss($formData['start_date'], $formData['end_date']);
        }
        else {
            $this->calculateBalanceSheet($formData['end_date']);
        }
    }

    protected function calculateProfitLoss($start, $end)
    {
        $accounts = Account::whereIn('type', ['revenue', 'expense'])
            ->withSum(['entries' => function ($query) use ($start, $end) {
            $query->whereHas('journal', function ($q) use ($start, $end) {
                    $q->whereBetween('date', [$start, $end])->where('status', 'posted');
                }
                );
            }], 'amount')
            ->get();

        $revenue = $accounts->where('type', 'revenue');
        $expense = $accounts->where('type', 'expense');

        $totalRevenue = $revenue->sum('entries_sum_amount');
        $totalExpense = $expense->sum('entries_sum_amount');

        $this->reportData = [
            'revenue' => $revenue->where('entries_sum_amount', '>', 0),
            'expense' => $expense->where('entries_sum_amount', '>', 0),
            'total_revenue' => $totalRevenue,
            'total_expense' => $totalExpense,
            'net_profit' => $totalRevenue - $totalExpense,
            'start_date' => $start,
            'end_date' => $end,
        ];
    }

    protected function calculateBalanceSheet($asAt)
    {
        // 1. Calculate Balance for each account in Assets, Liabilities, Equity
        $accounts = Account::whereIn('type', ['asset', 'liability', 'equity'])
            ->get()
            ->map(function ($account) use ($asAt) {
            // Asset normally Debit (+)
            // Liability/Equity normally Credit (+)
            $balance = JournalEntry::where('account_id', $account->id)
                ->whereHas('journal', fn($q) => $q->where('date', '<=', $asAt)->where('status', 'posted'))
                ->select(DB::raw("SUM(CASE WHEN type = 'debit' THEN amount ELSE -amount END) as balance"))
                ->value('balance') ?? 0;

            // For Liabilities and Equity, we flip the sign for display (Credit is positive)
            if (in_array($account->type, ['liability', 'equity'])) {
                $balance = -$balance;
            }

            $account->current_balance = $balance;
            return $account;
        });

        // 2. Calculate Current Year Profit (Retained Earnings Component)
        $plRevenue = Account::where('type', 'revenue')
            ->withSum(['entries' => function ($query) use ($asAt) {
            $query->whereHas('journal', fn($q) => $q->where('date', '<=', $asAt)->where('status', 'posted'));
        }], 'amount')
            ->get()->sum('entries_sum_amount');

        $plExpense = Account::where('type', 'expense')
            ->withSum(['entries' => function ($query) use ($asAt) {
            $query->whereHas('journal', fn($q) => $q->where('date', '<=', $asAt)->where('status', 'posted'));
        }], 'amount')
            ->get()->sum('entries_sum_amount');

        $currentYearEarnings = $plRevenue - $plExpense;

        $this->reportData = [
            'assets' => $accounts->where('type', 'asset')->where('current_balance', '!=', 0),
            'liabilities' => $accounts->where('type', 'liability')->where('current_balance', '!=', 0),
            'equity' => $accounts->where('type', 'equity')->where('current_balance', '!=', 0),
            'total_assets' => $accounts->where('type', 'asset')->sum('current_balance'),
            'total_liabilities' => $accounts->where('type', 'liability')->sum('current_balance'),
            'total_equity' => $accounts->where('type', 'equity')->sum('current_balance') + $currentYearEarnings,
            'current_year_earnings' => $currentYearEarnings,
            'as_at' => $asAt,
        ];
    }
}