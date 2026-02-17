@php
$health = $this->getHealthData();
@endphp

<x-filament-widgets::widget>
    <x-filament::section>
        <div class="flex flex-col md:flex-row items-center gap-8 py-4">
            {{-- Circular Progress / Score --}}
            <div class="relative flex items-center justify-center">
                <svg class="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" stroke-width="8" fill="transparent"
                        class="text-gray-200 dark:text-gray-800" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" stroke-width="8" fill="transparent"
                        stroke-dasharray="364.4" stroke-dashoffset="{{ 364.4 * (1 - $health['score'] / 100) }}"
                        class="text-{{ $health['color'] }}-500 transition-all duration-1000 ease-out" />
                </svg>
                <div class="absolute flex flex-col items-center">
                    <span class="text-3xl font-bold text-gray-950 dark:text-white">{{ $health['ratio'] }}</span>
                    <span class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Ratio</span>
                </div>
            </div>

            {{-- Info Content --}}
            <div class="flex-1 text-center md:text-left">
                <div class="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <h3 class="text-xl font-bold text-gray-950 dark:text-white">Financial Health Check</h3>
                    <x-filament::badge :color="$health['color']" size="sm" class="capitalize">
                        {{ $health['status'] }}
                    </x-filament::badge>
                </div>
                <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-2xl">
                    {{ $health['message'] }}
                </p>

                <div
                    class="mt-6 flex flex-wrap justify-center md:justify-start gap-6 border-t border-gray-100 dark:border-gray-800 pt-6">
                    <div>
                        <span class="text-[10px] uppercase text-gray-500 font-bold">Current Assets</span>
                        <p class="text-sm font-semibold text-emerald-600">Rp {{ number_format($health['assets'], 0, ',',
                            '.') }}</p>
                    </div>
                    <div>
                        <span class="text-[10px] uppercase text-gray-500 font-bold">Current Liabilities</span>
                        <p class="text-sm font-semibold text-rose-600">Rp {{ number_format($health['liabilities'], 0,
                            ',', '.') }}</p>
                    </div>
                </div>
            </div>

            {{-- Action --}}
            <div class="hidden lg:block">
                <x-filament::button color="gray" icon="heroicon-m-document-text" target="_blank"
                    href="/admin/accounting/journals/financial-report">
                    View Details
                </x-filament::button>
            </div>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>