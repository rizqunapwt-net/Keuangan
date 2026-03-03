<?php

namespace Tests\Unit;

use App\Enums\BookStatus;
use App\Enums\ExpenseStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use PHPUnit\Framework\TestCase;

class EnumsTest extends TestCase
{
    public function test_book_status_enum_has_expected_values(): void
    {
        $this->assertTrue(defined('App\Enums\BookStatus::DRAFT'));
        $this->assertTrue(defined('App\Enums\BookStatus::PUBLISHED'));
        $this->assertTrue(defined('App\Enums\BookStatus::ARCHIVED'));
    }

    public function test_product_status_enum_has_expected_values(): void
    {
        $this->assertTrue(defined('App\Enums\ProductStatus::ACTIVE'));
        $this->assertTrue(defined('App\Enums\ProductStatus::INACTIVE'));
        $this->assertTrue(defined('App\Enums\ProductStatus::DISCONTINUED'));
        $this->assertTrue(defined('App\Enums\ProductStatus::OUT_OF_STOCK'));
    }

    public function test_payment_status_enum_has_expected_values(): void
    {
        $this->assertTrue(defined('App\Enums\PaymentStatus::Unpaid'));
        $this->assertTrue(defined('App\Enums\PaymentStatus::Paid'));
    }

    public function test_expense_status_enum_has_expected_values(): void
    {
        $this->assertTrue(defined('App\Enums\ExpenseStatus::PENDING'));
        $this->assertTrue(defined('App\Enums\ExpenseStatus::APPROVED'));
        $this->assertTrue(defined('App\Enums\ExpenseStatus::VOIDED'));
    }

    public function test_enum_values_are_strings(): void
    {
        $this->assertIsString(BookStatus::DRAFT->value);
        $this->assertIsString(ProductStatus::ACTIVE->value);
        $this->assertIsString(PaymentStatus::Unpaid->value);
        $this->assertIsString(ExpenseStatus::PENDING->value);
    }
}
