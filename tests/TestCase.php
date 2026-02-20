<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Disable Vite in tests — avoids manifest not found errors
        // when assets haven't been built (CI, local dev, macOS permission issues)
        $this->withoutVite();
    }
}