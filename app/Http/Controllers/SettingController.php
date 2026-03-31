<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class SettingController extends Controller
{
    public function index()
    {
        Gate::authorize('admin.access');

        $settings = Setting::first();

        return response()->json([
            'status' => 'success',
            'data' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        Gate::authorize('admin.access');

        $settings = Setting::first();
        if (! $settings) {
            $settings = new Setting;
        }

        $settings->fill($request->all());
        $settings->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully',
            'data' => $settings,
        ]);
    }
}
