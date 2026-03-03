<?php

namespace App\Domain\Finance\Services;

use App\Models\Accounting\Expense;
use App\Models\Accounting\Journal;
use App\Models\Accounting\JournalEntry;
use Illuminate\Support\Facades\DB;

class AccountingService
{
    /**
     * Record a general journal entry.
     */
    public function recordJournal(array $data, int $userId): Journal
    {
        return DB::transaction(function () use ($data, $userId) {
            $journal = Journal::create([
                'date' => $data['date'],
                'description' => $data['description'],
                'reference' => $data['reference'] ?? null,
                'total_amount' => 0,
                'status' => 'posted',
                'created_by' => $userId,
            ]);

            foreach ($data['items'] as $item) {
                JournalEntry::create([
                    'journal_id' => $journal->id,
                    'account_id' => $item['account_id'],
                    'type' => $item['type'], // debit or credit
                    'amount' => $item['amount'],
                    'memo' => $item['memo'] ?? null,
                ]);
            }

            return $journal->load('entries');
        });
    }

    /**
     * Record an expense and its corresponding journal entry.
     */
    public function recordExpense(array $data, int $userId): Expense
    {
        return DB::transaction(function () use ($data, $userId) {
            $expense = Expense::create([
                'ref_number' => $data['refNumber'],
                'date' => $data['transDate'],
                'account_id' => $data['accountId'],
                'pay_from_account_id' => $data['payFromAccountId'],
                'amount' => $data['amount'],
                'description' => $data['description'] ?? '',
                'status' => 'recorded',
                'created_by' => $userId,
            ]);

            // Journal Entry for Expense
            // Debit: Expense Account, Credit: Cash/Bank Account
            $this->recordJournal([
                'date' => $data['transDate'],
                'description' => 'Biaya: '.($data['description'] ?? $data['refNumber']),
                'reference' => $data['refNumber'],
                'items' => [
                    [
                        'account_id' => $data['accountId'],
                        'type' => 'debit',
                        'amount' => $data['amount'],
                    ],
                    [
                        'account_id' => $data['payFromAccountId'],
                        'type' => 'credit',
                        'amount' => $data['amount'],
                    ],
                ],
            ], $userId);

            return $expense;
        });
    }

    /**
     * Void an expense and its corresponding journal.
     */
    public function voidExpense(Expense $expense, int $userId): void
    {
        DB::transaction(function () use ($expense, $userId) {
            $expense->update(['status' => 'void']);

            // Find and reverse the journal entry
            $journal = Journal::where('reference', $expense->ref_number)->first();
            if ($journal) {
                $this->reverseJournal($journal, $userId);
            }
        });
    }

    /**
     * Reverse a journal entry (create a new journal with opposite entries).
     */
    public function reverseJournal(Journal $journal, int $userId): Journal
    {
        return DB::transaction(function () use ($journal, $userId) {
            $reversedJournal = Journal::create([
                'date' => now(),
                'description' => 'Reversal of Journal #'.($journal->journal_number ?? $journal->id),
                'reference' => $journal->reference,
                'status' => 'posted',
                'created_by' => $userId,
            ]);

            foreach ($journal->entries as $entry) {
                JournalEntry::create([
                    'journal_id' => $reversedJournal->id,
                    'account_id' => $entry->account_id,
                    'type' => $entry->type === 'debit' ? 'credit' : 'debit',
                    'amount' => $entry->amount,
                    'memo' => 'Reversal: '.$entry->memo,
                ]);
            }

            $journal->update(['status' => 'draft']); // Or mark as reversed

            return $reversedJournal;
        });
    }
}
