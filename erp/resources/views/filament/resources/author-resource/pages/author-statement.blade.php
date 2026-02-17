<x-filament-panels::page>
    <div class="flex flex-col gap-6">
        {{-- Author Info Header --}}
        <x-filament::section>
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center gap-4">
                    <div
                        class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl uppercase">
                        {{ substr($record->name, 0, 1) }}
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $record->name }}</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $record->email }} | {{ $record->phone }}
                        </p>
                    </div>
                </div>
                <div class="flex flex-col items-end">
                    <span class="text-xs text-gray-400 uppercase font-black tracking-widest">Outstanding Balance</span>
                    <span
                        class="text-3xl font-black {{ $this->getTransactions()->last()?->balance > 0 ? 'text-rose-600' : 'text-emerald-600' }}">
                        Rp {{ number_format($this->getTransactions()->last()?->balance ?? 0, 0, ',', '.') }}
                    </span>
                </div>
            </div>
        </x-filament::section>

        {{-- Statement Table --}}
        <div
            class="bg-white dark:bg-gray-950 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Description</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Reference</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Debit
                            (Company Pays)</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">
                            Credit (Author Earns)</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">
                            Balance</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                    @forelse($this->getTransactions() as $tx)
                    <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                        <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {{ \Carbon\Carbon::parse($tx->date)->format('d M Y') }}
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ $tx->description }}</div>
                            <div class="text-[10px] text-gray-400 uppercase mt-0.5 tracking-tighter">{{ $tx->type }}
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm font-mono text-gray-500">
                            {{ $tx->reference }}
                        </td>
                        <td class="px-6 py-4 text-sm text-right font-medium text-rose-500">
                            {{ $tx->type === 'payment' ? 'Rp ' . number_format($tx->amount, 0, ',', '.') : '-' }}
                        </td>
                        <td class="px-6 py-4 text-sm text-right font-medium text-emerald-500">
                            {{ $tx->type === 'royalty' ? 'Rp ' . number_format($tx->amount, 0, ',', '.') : '-' }}
                        </td>
                        <td class="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-white">
                            Rp {{ number_format($tx->balance, 0, ',', '.') }}
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="px-6 py-12 text-center text-gray-500 italic">
                            No financial activity recorded for this author.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
                {{-- Footer Summary --}}
                <tfoot class="bg-gray-50 dark:bg-gray-900/50">
                    <tr class="font-bold border-t-2 border-gray-200 dark:border-gray-700">
                        <td colspan="5"
                            class="px-6 py-4 text-right text-gray-900 dark:text-white uppercase text-xs tracking-widest">
                            Final Outstanding to Author</td>
                        <td class="px-6 py-4 text-right text-lg text-primary-600 dark:text-primary-400">
                            Rp {{ number_format($this->getTransactions()->last()?->balance ?? 0, 0, ',', '.') }}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

        {{-- Action Buttons --}}
        <div class="flex justify-end gap-3 no-print">
            <x-filament::button color="gray" icon="heroicon-m-printer" onclick="window.print()">
                Print Statement
            </x-filament::button>
            <x-filament::button icon="heroicon-m-envelope">
                Send to Author Email
            </x-filament::button>
        </div>
    </div>

    <style>
        @media print {

            .no-print,
            .fi-sidebar,
            .fi-topbar,
            .fi-header-actions {
                display: none !important;
            }

            body {
                background: white !important;
            }

            .fi-main {
                padding: 0 !important;
            }

            table {
                border: 1px solid #eee !important;
            }
        }
    </style>
</x-filament-panels::page>
    </style>
</x-filament-panels::page>