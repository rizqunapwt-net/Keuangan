<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Breeze/Filament views call `@vite(...)`. In CI/tests we don't build assets,
        // so we create a minimal Vite "hot" file to avoid manifest lookup.
        if (app()->environment('testing')) {
            $hotFile = public_path('hot');
            $manifest = public_path('build/manifest.json');

            if (! file_exists($hotFile) && ! file_exists($manifest)) {
                @file_put_contents($hotFile, "http://localhost:5173\n");
            }
        }
    }
}
