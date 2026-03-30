<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CashTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $isSqlite = DB::getDriverName() === 'sqlite';
        $monthExpr = $isSqlite ? "strftime('%m', date)" : "EXTRACT(MONTH FROM date)";

        $data = CashTransaction::select(
            DB::raw("{$monthExpr} as month"),
            DB::raw('SUM(CASE WHEN type = \'income\' THEN amount ELSE 0 END) as income'),
            DB::raw('SUM(CASE WHEN type = \'expense\' THEN amount ELSE 0 END) as expense')
        )
            ->whereYear('date', $year)
            ->groupBy(DB::raw($monthExpr))
            ->orderBy('month', 'asc')
            ->get();

        return response()->json($data);
    }

    public function yearly()
    {
        $isSqlite = DB::getDriverName() === 'sqlite';
        $yearExpr = $isSqlite ? "strftime('%Y', date)" : "EXTRACT(YEAR FROM date)";

        $data = CashTransaction::select(
            DB::raw("{$yearExpr} as year"),
            DB::raw('SUM(CASE WHEN type = \'income\' THEN amount ELSE 0 END) as income'),
            DB::raw('SUM(CASE WHEN type = \'expense\' THEN amount ELSE 0 END) as expense')
        )
            ->groupBy(DB::raw($yearExpr))
            ->orderBy('year', 'asc')
            ->get();

        return response()->json($data);
    }
}
