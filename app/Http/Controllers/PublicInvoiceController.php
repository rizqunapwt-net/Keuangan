<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use Illuminate\Http\Request;

class PublicInvoiceController extends Controller
{
    /**
     * Show the public invoice view.
     */
    public function show(string $kodeinvoice)
    {
        $invoice = Debt::where('kodeinvoice', $kodeinvoice)
            ->where('type', 'receivable')
            ->firstOrFail();

        return view('public.invoice', compact('invoice'));
    }
}
