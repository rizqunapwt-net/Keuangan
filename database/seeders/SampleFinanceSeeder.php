<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\Debt;
use App\Models\Expense;
use App\Models\CashTransaction;
use App\Models\Bank;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SampleFinanceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        if (!$admin) return;

        // 1. Create Bank
        $bank = Bank::updateOrCreate(
            ['account_number' => '1234567890'],
            [
                'bank_name' => 'BCA',
                'branch_name' => 'Purwokerto',
                'account_holder' => 'Rizquna Kasir',
                'account_type' => 'saving',
                'currency' => 'IDR',
                'opening_balance' => 5000000,
                'opening_date' => now()->startOfYear(),
                'balance' => 5000000,
                'is_primary' => true,
                'manager_id' => $admin->id
            ]
        );

        // 2. Create Contacts
        $customer = Contact::updateOrCreate(
            ['email' => 'budi@example.com'],
            [
                'name' => 'Budi Santoso',
                'company_name' => 'PT Maju Terus',
                'phone' => '08123456789',
                'type' => 'customer',
                'created_by' => $admin->id
            ]
        );

        $vendor = Contact::updateOrCreate(
            ['name' => 'Anita Wijaya'],
            [
                'company_name' => 'Toko Kertas Jaya',
                'type' => 'vendor',
                'created_by' => $admin->id
            ]
        );

        // 3. Create Invoices (Receivables)
        Debt::updateOrCreate(
            ['description' => 'Cetak Buku Yasin 50 pcs'],
            [
                'type' => 'receivable',
                'status' => 'unpaid',
                'date' => now()->subDays(5),
                'due_date' => now()->addDays(10),
                'client_name' => $customer->name,
                'client_phone' => $customer->phone,
                'amount' => 1250000,
                'paid_amount' => 0,
                'bank_id' => $bank->id
            ]
        );

        Debt::updateOrCreate(
            ['description' => 'Cetak Spanduk Musholla'],
            [
                'type' => 'receivable',
                'status' => 'partial',
                'date' => now()->subDays(10),
                'due_date' => now()->addDays(5),
                'client_name' => 'H. Ahmad',
                'amount' => 500000,
                'paid_amount' => 200000,
                'bank_id' => $bank->id
            ]
        );

        // 4. Create Expenses
        Expense::updateOrCreate(
            ['expense_code' => 'EXP-20260310-001'],
            [
                'expense_date' => now()->subDays(2),
                'amount' => 350000,
                'description' => 'Pembelian Tinta Printer',
                'category' => 'Operational',
                'status' => 'approved',
                'user_id' => $admin->id,
                'bank_id' => $bank->id,
                'uuid' => (string) Str::uuid()
            ]
        );

        Expense::updateOrCreate(
            ['expense_code' => 'EXP-20260310-002'],
            [
                'expense_date' => now()->subDays(1),
                'amount' => 150000,
                'description' => 'Biaya Listrik Kantor',
                'category' => 'Utility',
                'status' => 'approved',
                'user_id' => $admin->id,
                'bank_id' => $bank->id,
                'uuid' => (string) Str::uuid()
            ]
        );

        // 5. Create Cash Transactions
        CashTransaction::create([
            'type' => 'income',
            'amount' => 200000,
            'date' => now()->subDays(10),
            'time' => '10:00:00',
            'description' => 'DP Cetak Spanduk H. Ahmad',
            'category' => 'Printing',
            'bank_id' => $bank->id,
            'running_balance' => 5200000
        ]);
        
        CashTransaction::create([
            'type' => 'expense',
            'amount' => 350000,
            'date' => now()->subDays(2),
            'time' => '14:30:00',
            'description' => 'Pembelian Tinta Printer',
            'category' => 'Supply',
            'bank_id' => $bank->id,
            'running_balance' => 4850000
        ]);
    }
}
