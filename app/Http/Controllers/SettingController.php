<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::first();
        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $settings = Setting::first();
        if (!$settings) {
            $settings = new Setting();
        }

        $settings->fill($request->all());
        $settings->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully',
            'data' => $settings
        ]);
    }
}
