<?php

namespace Database\Seeders;

use App\Models\Accounting\Expense;
use App\Models\Accounting\Account;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Listrik & Air' => 5101,
            'Sewa Kantor' => 5102,
            'Gaji Karyawan' => 5103,
            'Alat Tulis Kantor' => 5104,
            'Biaya Transport' => 5105,
            'Iklan & Promosi' => 5106,
        ];

        $cashAccount = Account::where('code', '1101')->first();
        if (!$cashAccount) return;

        foreach ($categories as $name => $code) {
            $account = Account::where('code', (string)$code)->first();
            if (!$account) continue;

            for ($i = 0; $i < 3; $i++) {
                Expense::create([
                    'ref_number' => 'EXP-' . Carbon::now()->timestamp . '-' . rand(1000, 9999),
                    'date' => Carbon::now()->subDays(rand(1, 30)),
                    'status' => 'recorded',
                    'amount' => rand(10, 50) * 10000,
                    'description' => $name,
                    'account_id' => $account->id,
                    'pay_from_account_id' => $cashAccount->id,
                ]);
            }
        }
    }
}
