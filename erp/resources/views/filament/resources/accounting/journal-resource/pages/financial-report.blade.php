<x-filament-panels::page>
    <div class="flex flex-col gap-8">
        {{-- Report Filters --}}
        <x-filament::section>
            <form wire:submit="generateReport">
                {{ $this->form }}
                <div class="mt-4 flex justify-end">
                    <x-filament::button type="submit" icon="heroicon-m-magnifying-glass">
                        Generate Report
                    </x-filament::button>
                </div>
            </form>
        </x-filament::section>

        {{-- Report Content --}}
        <div id="report-container"
            class="bg-white dark:bg-gray-900 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 p-8">
            {{-- Report Header --}}
            <div class="text-center mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                    {{ $activeTab === 'profit_loss' ? 'Profit and Loss' : 'Balance Sheet' }}
                </h1>
                <p class="text-gray-500 dark:text-gray-400 font-medium">NRE Enterprise (Putrihati Group)</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    @if($activeTab === 'profit_loss')
                    For the period from {{ \Carbon\Carbon::parse($reportData['start_date'])->format('d M Y') }} to {{
                    \Carbon\Carbon::parse($reportData['end_date'])->format('d M Y') }}
                    @else
                    As at {{ \Carbon\Carbon::parse($reportData['as_at'])->format('d M Y') }}
                    @endif
                </p>
            </div>

            @if($activeTab === 'profit_loss')
            {{-- PROFIT & LOSS VIEW --}}
            <div class="space-y-8 max-w-4xl mx-auto">
                {{-- Revenue --}}
                <div>
                    <h2
                        class="text-sm font-bold text-gray-900 dark:text-white uppercase border-b border-gray-900 dark:border-gray-100 pb-1 mb-4">
                        Trading Income</h2>
                    <div class="space-y-px">
                        @foreach($reportData['revenue'] as $account)
                        <div
                            class="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 transition-colors">
                            <span class="text-gray-700 dark:text-gray-300">{{ $account->name }}</span>
                            <span class="font-mono text-gray-900 dark:text-white">Rp {{
                                number_format($account->entries_sum_amount, 0, ',', '.') }}</span>
                        </div>
                        @endforeach
                    </div>
                    <div class="flex justify-between py-3 mt-2 bg-gray-50 dark:bg-gray-800 px-4 rounded-lg font-bold">
                        <span class="text-gray-900 dark:text-white">Total Trading Income</span>
                        <span class="text-gray-900 dark:text-white border-t-2 border-black dark:border-white pt-1">Rp {{
                            number_format($reportData['total_revenue'], 0, ',', '.') }}</span>
                    </div>
                </div>

                {{-- Cost of Sales (COGS) - If needed --}}
                {{-- Standard Expenses --}}
                <div>
                    <h2
                        class="text-sm font-bold text-gray-900 dark:text-white uppercase border-b border-gray-900 dark:border-gray-100 pb-1 mb-4">
                        Operating Expenses</h2>
                    <div class="space-y-px">
                        @foreach($reportData['expense'] as $account)
                        <div
                            class="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 transition-colors">
                            <span class="text-gray-700 dark:text-gray-300">{{ $account->name }}</span>
                            <span class="font-mono text-gray-900 dark:text-white">Rp {{
                                number_format($account->entries_sum_amount, 0, ',', '.') }}</span>
                        </div>
                        @endforeach
                    </div>
                    <div class="flex justify-between py-3 mt-2 bg-gray-50 dark:bg-gray-800 px-4 rounded-lg font-bold">
                        <span class="text-gray-900 dark:text-white">Total Operating Expenses</span>
                        <span class="text-gray-900 dark:text-white border-t-2 border-black dark:border-white pt-1">Rp {{
                            number_format($reportData['total_expense'], 0, ',', '.') }}</span>
                    </div>
                </div>

                {{-- Net Profit --}}
                <div class="border-t-4 border-double border-primary-500 pt-6 mt-12">
                    <div class="flex justify-between items-center bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl">
                        <span class="text-xl font-black text-primary-700 dark:text-primary-400">NET PROFIT</span>
                        <span
                            class="text-2xl font-black {{ $reportData['net_profit'] >= 0 ? 'text-emerald-600' : 'text-rose-600' }}">
                            Rp {{ number_format($reportData['net_profit'], 0, ',', '.') }}
                        </span>
                    </div>
                </div>
            </div>
            @else
            {{-- BALANCE SHEET VIEW --}}
            <div class="space-y-12 max-w-4xl mx-auto">
                {{-- Assets --}}
                <div>
                    <h2 class="text-lg font-black text-gray-950 dark:text-white mb-6 flex items-center gap-2">
                        <div class="w-2 h-6 bg-primary-500 rounded-full"></div>
                        Assets
                    </h2>
                    @php $assets = $reportData['assets'] ?? []; @endphp
                    <div class="space-y-px pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                        @forelse($assets as $account)
                        <div class="flex justify-between py-3 border-b border-gray-50 dark:border-gray-800/50">
                            <span class="text-gray-600 dark:text-gray-400 font-medium">{{ $account->code }} - {{
                                $account->name }}</span>
                            <span class="font-mono text-gray-900 dark:text-white font-bold text-lg">Rp {{
                                number_format($account->current_balance, 0, ',', '.') }}</span>
                        </div>
                        @empty
                        <p class="text-sm text-gray-400 italic">No asset records found.</p>
                        @endforelse
                    </div>
                    <div
                        class="flex justify-between py-4 mt-4 bg-primary-50/50 dark:bg-primary-900/10 px-6 rounded-xl font-black text-xl">
                        <span class="text-primary-800 dark:text-primary-200">Total Assets</span>
                        <span
                            class="text-primary-600 dark:text-primary-400 border-b-4 border-double border-primary-400 pb-1">Rp
                            {{ number_format($reportData['total_assets'], 0, ',', '.') }}</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {{-- Liabilities --}}
                    <div>
                        <h2 class="text-lg font-black text-gray-950 dark:text-white mb-6 flex items-center gap-2">
                            <div class="w-2 h-6 bg-rose-500 rounded-full"></div>
                            Liabilities
                        </h2>
                        @php $liabilities = $reportData['liabilities'] ?? []; @endphp
                        <div class="space-y-px pl-4 border-l-2 border-rose-100 dark:border-rose-900/30">
                            @forelse($liabilities as $account)
                            <div class="flex justify-between py-3 border-b border-gray-50 dark:border-gray-800/50">
                                <div class="flex flex-col">
                                    <span
                                        class="text-xs text-rose-500 font-bold tracking-widest uppercase">Liability</span>
                                    <span class="text-gray-600 dark:text-gray-400">{{ $account->name }}</span>
                                </div>
                                <span class="font-mono text-gray-900 dark:text-white self-center">Rp {{
                                    number_format($account->current_balance, 0, ',', '.') }}</span>
                            </div>
                            @empty
                            <p class="text-sm text-gray-400 italic">No liability records found.</p>
                            @endforelse
                        </div>
                        <div
                            class="flex justify-between py-4 mt-4 bg-rose-50/50 dark:bg-rose-900/10 px-4 rounded-lg font-bold">
                            <span class="text-rose-900 dark:text-rose-200">Total Liabilities</span>
                            <span class="text-rose-600 dark:text-rose-400">Rp {{
                                number_format($reportData['total_liabilities'], 0, ',', '.') }}</span>
                        </div>
                    </div>

                    {{-- Equity --}}
                    <div>
                        <h2 class="text-lg font-black text-gray-950 dark:text-white mb-6 flex items-center gap-2">
                            <div class="w-2 h-6 bg-amber-500 rounded-full"></div>
                            Equity
                        </h2>
                        @php $equity = $reportData['equity'] ?? []; @endphp
                        <div class="space-y-px pl-4 border-l-2 border-amber-100 dark:border-amber-900/30">
                            @foreach($equity as $account)
                            <div class="flex justify-between py-3 border-b border-gray-50 dark:border-gray-800/50">
                                <span class="text-gray-600 dark:text-gray-400 font-medium">{{ $account->name }}</span>
                                <span class="font-mono text-gray-900 dark:text-white">Rp {{
                                    number_format($account->current_balance, 0, ',', '.') }}</span>
                            </div>
                            @endforeach
                            {{-- Retained Earnings Bridge --}}
                            <div
                                class="flex justify-between py-3 border-b border-gray-50 dark:border-gray-800/50 italic">
                                <span class="text-gray-500 dark:text-gray-500">Current Year Earnings</span>
                                <span class="font-mono text-gray-900 dark:text-white">Rp {{
                                    number_format($reportData['current_year_earnings'], 0, ',', '.') }}</span>
                            </div>
                        </div>
                        <div
                            class="flex justify-between py-4 mt-4 bg-amber-50/50 dark:bg-amber-900/10 px-4 rounded-lg font-bold">
                            <span class="text-amber-900 dark:text-amber-200">Total Equity</span>
                            <span class="text-amber-600 dark:text-amber-400">Rp {{
                                number_format($reportData['total_equity'], 0, ',', '.') }}</span>
                        </div>
                    </div>
                </div>

                {{-- Net Assets Check (Liabilities + Equity) --}}
                <div class="border-t-4 border-double border-gray-900 dark:border-gray-100 pt-6 mt-12">
                    <div class="flex justify-between items-center bg-gray-950 dark:bg-black p-6 rounded-xl">
                        <span class="text-xl font-black text-white">TOTAL LIABILITIES & EQUITY</span>
                        <span class="text-2xl font-black text-sky-400">
                            Rp {{ number_format($reportData['total_liabilities'] + $reportData['total_equity'], 0, ',',
                            '.') }}
                        </span>
                    </div>
                    {{-- Accounting Equation Check --}}
                    @if(round($reportData['total_assets'], 2) !== round($reportData['total_liabilities'] +
                    $reportData['total_equity'], 2))
                    <p class="text-rose-500 text-xs font-bold text-center mt-2 italic">Note: Balance Sheet is currently
                        out of balance due to unassigned historical entries.</p>
                    @endif
                </div>
            </div>
            @endif
        </div>

        {{-- Footer Printing Info --}}
        <div class="text-center text-gray-400 text-xs mt-4 print:block hidden">
            Report generated on {{ now()->format('d M Y H:i') }} by NRE Enterprise Cloud
        </div>
    </div>

    <style>
        @media print {

            .fi-header,
            .fi-sidebar,
            .fi-topbar,
            x-filament::section {
                display: none !important;
            }

            body {
                background: white !important;
            }

            #report-container {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
            }
        }
    </style>
</x-filament-panels::page>
    </style>
</x-filament-panels::page>