<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\Debt;
use App\Models\Expense;
use App\Models\CashTransaction;
use App\Models\Accounting\Account;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SampleFinanceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = \App\Models\User::first();
        if (!$admin) return;

        // 1. Create Contacts
        $customer = Contact::create([
            'name' => 'Budi Santoso',
            'company_name' => 'PT Maju Terus',
            'email' => 'budi@example.com',
            'phone' => '08123456789',
            'type' => 'customer',
            'created_by' => $admin->id
        ]);

        $vendor = Contact::create([
            'name' => 'Anita Wijaya',
            'company_name' => 'Toko Kertas Jaya',
            'type' => 'vendor',
            'created_by' => $admin->id
        ]);

        // 2. Create Invoices (Receivables)
        Debt::create([
            'type' => 'receivable',
            'status' => 'unpaid',
            'date' => now()->subDays(5),
            'due_date' => now()->addDays(10),
            'client_name' => $customer->name,
            'client_phone' => $customer->phone,
            'amount' => 1250000,
            'paid_amount' => 0,
            'description' => 'Cetak Buku Yasin 50 pcs'
        ]);

        Debt::create([
            'type' => 'receivable',
            'status' => 'partial',
            'date' => now()->subDays(10),
            'due_date' => now()->addDays(5),
            'client_name' => 'H. Ahmad',
            'amount' => 500000,
            'paid_amount' => 200000,
            'description' => 'Cetak Spanduk Musholla'
        ]);

        // 3. Create Expenses
        Expense::create([
            'expense_code' => 'EXP-' . date('Ymd') . '-001',
            'expense_date' => now()->subDays(2),
            'amount' => 350000,
            'description' => 'Pembelian Tinta Printer',
            'category' => 'Operational',
            'status' => 'approved'
        ]);

        Expense::create([
            'expense_code' => 'EXP-' . date('Ymd') . '-002',
            'expense_date' => now()->subDays(1),
            'amount' => 150000,
            'description' => 'Biaya Listrik Kantor',
            'category' => 'Utility',
            'status' => 'approved'
        ]);

        // 4. Create Cash Transactions
        CashTransaction::create([
            'type' => 'income',
            'amount' => 200000,
            'date' => now()->subDays(10),
            'description' => 'DP Cetak Spanduk H. Ahmad',
            'ref_type' => 'debt',
            'category' => 'Printing'
        ]);
        
        CashTransaction::create([
            'type' => 'expense',
            'amount' => 350000,
            'date' => now()->subDays(2),
            'description' => 'Pembelian Tinta Printer',
            'ref_type' => 'expense',
            'category' => 'Supply'
        ]);
    }
}
