<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CashTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinanceReportController extends Controller
{
    public function daily(Request $request)
    {
        $month = $request->get('month', date('m'));
        $year = $request->get('year', date('Y'));

        $data = CashTransaction::select(
                DB::raw('date as date'),
                DB::raw('SUM(CASE WHEN type = \'income\' THEN amount ELSE 0 END) as income'),
                DB::raw('SUM(CASE WHEN type = \'expense\' THEN amount ELSE 0 END) as expense')
            )
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json($data);
    }

    public function monthly(Request $request)
    {
        $year = $request->get('year', date('Y'));

        $data = CashTransaction::select(
                DB::raw('EXTRACT(MONTH FROM date) as month'),
                DB::raw('SUM(CASE WHEN type = \'income\' THEN amount ELSE 0 END) as income'),
                DB::raw('SUM(CASE WHEN type = \'expense\' THEN amount ELSE 0 END) as expense')
            )
            ->whereYear('date', $year)
            ->groupBy(DB::raw('EXTRACT(MONTH FROM date)'))
            ->orderBy('month', 'asc')
            ->get();

        return response()->json($data);
    }

    public function yearly()
    {
        $data = CashTransaction::select(
                DB::raw('EXTRACT(YEAR FROM date) as year'),
                DB::raw('SUM(CASE WHEN type = \'income\' THEN amount ELSE 0 END) as income'),
                DB::raw('SUM(CASE WHEN type = \'expense\' THEN amount ELSE 0 END) as expense')
            )
            ->groupBy(DB::raw('EXTRACT(YEAR FROM date)'))
            ->orderBy('year', 'asc')
            ->get();

        return response()->json($data);
    }
}
