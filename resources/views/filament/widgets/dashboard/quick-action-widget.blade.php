<x-filament-widgets::widget>
    <x-filament::section>
        <div class="flex flex-col gap-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-lg font-bold tracking-tight text-gray-950 dark:text-white">
                        Good morning, {{ auth()->user()->name }}!
                    </h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ now()->format('l, d F Y') }} - Here's what's happening today.
                    </p>
                </div>
                <div class="hidden md:block">
                    <x-filament::badge color="success" icon="heroicon-m-check-badge">
                        System Online
                    </x-filament::badge>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {{-- Quick Sale --}}
                <a href="{{ \App\Filament\Resources\SaleResource::getUrl('create') }}"
                    class="group flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div
                        class="p-3 bg-primary-50 dark:bg-primary-950 rounded-lg group-hover:bg-primary-500 group-hover:text-white transition-colors duration-200 text-primary-600">
                        <x-heroicon-o-shopping-cart class="w-6 h-6" />
                    </div>
                    <span class="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">New Sale</span>
                </a>

                {{-- Add Author --}}
                {{-- Add Author --}}
                <a href="/admin/authors/create"
                    class="group flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div
                        class="p-3 bg-success-50 dark:bg-success-950 rounded-lg group-hover:bg-success-500 group-hover:text-white transition-colors duration-200 text-success-600">
                        <x-heroicon-o-pencil-square class="w-6 h-6" />
                    </div>
                    <span class="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Add Author</span>
                </a>

                {{-- Post Journal --}}
                <a href="/admin/accounting/journals/create"
                    class="group flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div
                        class="p-3 bg-warning-50 dark:bg-warning-950 rounded-lg group-hover:bg-warning-500 group-hover:text-white transition-colors duration-200 text-warning-600">
                        <x-heroicon-o-book-open class="w-6 h-6" />
                    </div>
                    <span class="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Post Journal</span>
                </a>

                {{-- Staff Leave --}}
                <a href="#"
                    class="group flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div
                        class="p-3 bg-danger-50 dark:bg-danger-950 rounded-lg group-hover:bg-danger-500 group-hover:text-white transition-colors duration-200 text-danger-600">
                        <x-heroicon-o-calendar-days class="w-6 h-6" />
                    </div>
                    <span class="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Staff Leave</span>
                </a>

                {{-- Reports --}}
                <a href="/admin/accounting/journals/financial-report"
                    class="group flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div
                        class="p-3 bg-info-50 dark:bg-info-950 rounded-lg group-hover:bg-info-500 group-hover:text-white transition-colors duration-200 text-info-600">
                        <x-heroicon-o-chart-bar class="w-6 h-6" />
                    </div>
                    <span class="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Reports</span>
                </a>
            </div>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>