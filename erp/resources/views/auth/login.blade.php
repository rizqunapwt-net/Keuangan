<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NRE Enterprise System | PT NEW RIZQUNA ELFATH</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap"
        rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
    </style>
</head>

<body
    class="bg-[#FDFDFD] text-slate-900 border-t-4 border-amber-500 min-h-screen flex items-center justify-center p-6 relative overflow-hidden">

    <!-- Decorative Elements -->
    <div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-amber-50/50 to-transparent -z-10"></div>
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl -z-10"></div>
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-amber-100/10 rounded-full blur-3xl -z-10"></div>

    <div class="w-full max-w-sm">
        <!-- Logo -->
        <div class="text-center mb-10">
            <div
                class="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-amber-200/50 flex items-center justify-center border border-amber-50 mx-auto mb-6 p-4">
                <img src="/logo-icon.png" alt="Logo" class="w-full h-full object-contain">
            </div>
            <h1 class="text-xs font-black text-amber-600 uppercase tracking-[0.4em] mb-1">Rizquna Elfath</h1>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Resource Planning</p>
        </div>

        <!-- Card -->
        <div class="glass-card rounded-[40px] shadow-2xl shadow-slate-200/60 p-8 mb-8">
            <div class="mb-8">
                <h2 class="text-2xl font-black text-slate-900 tracking-tight mb-1">Selamat Datang</h2>
                <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Pintu Masuk Utama Sistem</p>
            </div>

            <form method="POST" action="{{ route('login') }}" class="space-y-5">
                @csrf

                <!-- Login (Email or Username) -->
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email atau
                        Username</label>
                    <input type="text" name="login" value="{{ old('login') }}" required autofocus
                        placeholder="Masukkan identitas Anda"
                        class="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all text-slate-900 placeholder:text-slate-300">
                    @error('login')
                    <p class="text-[10px] font-bold text-red-500 mt-1 ml-2">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Password -->
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kata
                        Sandi</label>
                    <input type="password" name="password" required placeholder="••••••••"
                        class="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all text-slate-900 placeholder:text-slate-300">
                    @error('password')
                    <p class="text-[10px] font-bold text-red-500 mt-1 ml-2">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Remember & Forgot -->
                <div class="flex items-center justify-between px-2">
                    <label class="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" name="remember"
                            class="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500">
                        <span
                            class="text-[11px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Ingat
                            Saya</span>
                    </label>
                    @if (Route::has('password.request'))
                    <a href="{{ route('password.request') }}"
                        class="text-[11px] font-bold text-amber-600 hover:text-amber-700">Lupa Sandi?</a>
                    @endif
                </div>

                <!-- Submit -->
                <button type="submit"
                    class="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2">
                    <span>Masuk ke Sistem</span>
                    <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
            </form>
        </div>

        <!-- Footer -->
        <div class="text-center">
            <p class="text-[10px] text-slate-400 font-bold tracking-wide">
                PT NEW RIZQUNA ELFATH<br>
                <span class="text-amber-600/60 uppercase tracking-widest text-[8px]">Cloud Managed Infrastructure</span>
            </p>
        </div>
    </div>
</body>

</html>