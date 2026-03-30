<?php

namespace Tests\Feature;

use App\Domain\Percetakan\Services\PrintingCalculator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrintingCalculatorTest extends TestCase
{
    use RefreshDatabase;

    private PrintingCalculator $calculator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->calculator = new PrintingCalculator;
    }

    public function test_calculate_brosur_with_default_options(): void
    {
        $result = $this->calculator->calculateBrosur(
            quantity: 100,
            size: 'A4',
            paperType: 'art_paper_150gsm',
            colorOption: 'color_2sided'
        );

        $this->assertEquals('brosur', $result['product_type']);
        $this->assertEquals(100, $result['specifications']['quantity']);
        $this->assertEquals('A4', $result['specifications']['size']);
        $this->assertArrayHasKey('pricing', $result);
        $this->assertArrayHasKey('total', $result['pricing']);
        $this->assertGreaterThan(0, $result['pricing']['total']);
    }

    public function test_calculate_brosur_with_finishing(): void
    {
        $result = $this->calculator->calculateBrosur(
            quantity: 100,
            size: 'A4',
            paperType: 'art_paper_150gsm',
            colorOption: 'color_2sided',
            finishingOptions: ['laminasi_glossy', 'lipat_2']
        );

        $this->assertGreaterThan(0, $result['pricing']['finishing_cost_per_unit']);
        $this->assertEquals(260, $result['pricing']['finishing_cost_per_unit']); // 180 + 80
    }

    public function test_calculate_brosur_quantity_discount(): void
    {
        // No discount for < 50
        $result1 = $this->calculator->calculateBrosur(quantity: 10);
        $this->assertEquals(0, $result1['pricing']['discount_percentage']);

        // 10% discount for 100
        $result2 = $this->calculator->calculateBrosur(quantity: 100);
        $this->assertEquals(10, $result2['pricing']['discount_percentage']);

        // 20% discount for 1000
        $result3 = $this->calculator->calculateBrosur(quantity: 1000);
        $this->assertEquals(20, $result3['pricing']['discount_percentage']);

        // 30% discount for 5000
        $result4 = $this->calculator->calculateBrosur(quantity: 5000);
        $this->assertEquals(30, $result4['pricing']['discount_percentage']);
    }

    public function test_calculate_spanduk_vinyl(): void
    {
        $result = $this->calculator->calculateSpanduk(
            width: 100,
            height: 200,
            quantity: 5,
            material: 'vinyl'
        );

        $this->assertEquals('spanduk', $result['product_type']);
        $this->assertEquals(2.0, $result['specifications']['area_m2']); // 100x200cm = 2m²
        $this->assertEquals('vinyl', $result['specifications']['material']);
        $this->assertGreaterThan(0, $result['pricing']['total']);
    }

    public function test_calculate_spanduk_kain(): void
    {
        $result = $this->calculator->calculateSpanduk(
            width: 100,
            height: 200,
            quantity: 5,
            material: 'kain'
        );

        // Kain should be more expensive than vinyl
        $vinylResult = $this->calculator->calculateSpanduk(
            width: 100,
            height: 200,
            quantity: 5,
            material: 'vinyl'
        );

        $this->assertGreaterThan($vinylResult['pricing']['total'], $result['pricing']['total']);
    }

    public function test_calculate_buku_softcover(): void
    {
        $result = $this->calculator->calculateBuku(
            quantity: 50,
            pages: 100,
            size: 'A5',
            coverType: 'softcover'
        );

        $this->assertEquals('buku', $result['product_type']);
        $this->assertEquals(100, $result['specifications']['pages']);
        $this->assertEquals('softcover', $result['specifications']['cover_type']);
        $this->assertGreaterThan(0, $result['pricing']['total']);
    }

    public function test_calculate_buku_hardcover_more_expensive(): void
    {
        $softcoverResult = $this->calculator->calculateBuku(
            quantity: 50,
            pages: 100,
            size: 'A5',
            coverType: 'softcover'
        );

        $hardcoverResult = $this->calculator->calculateBuku(
            quantity: 50,
            pages: 100,
            size: 'A5',
            coverType: 'hardcover'
        );

        $this->assertGreaterThan($softcoverResult['pricing']['total'], $hardcoverResult['pricing']['total']);
    }

    public function test_calculate_kartu_nama_with_finishing(): void
    {
        $result = $this->calculator->calculateKartuNama(
            quantity: 200,
            printSides: '2_sides',
            lamination: 'matte',
            finishingOptions: ['hotprint']
        );

        $this->assertEquals('kartu_nama', $result['product_type']);
        $this->assertEquals(200, $result['specifications']['quantity']);
        $this->assertGreaterThan(0, $result['pricing']['finishing_total']);
        $this->assertGreaterThan(0, $result['total_price']);
    }

    public function test_calculate_stiker_with_cutting(): void
    {
        $result = $this->calculator->calculateStiker(
            width: 5,
            height: 5,
            sheetCount: 10,
            material: 'vinyl',
            cutType: 'kiss_cut'
        );

        $this->assertEquals('stiker', $result['product_type']);
        $this->assertEquals('vinyl', $result['specifications']['material']);
        $this->assertEquals('kiss_cut', $result['specifications']['cut_type']);
        $this->assertGreaterThan(0, $result['pricing']['finishing_cost_per_unit']);
    }

    public function test_production_time_estimation(): void
    {
        // Brosur should take 2 days
        $brosurResult = $this->calculator->calculateBrosur(quantity: 100);
        $this->assertEquals(2, $brosurResult['production_time']);

        // Spanduk should take 1 day
        $spandukResult = $this->calculator->calculateSpanduk(width: 100, height: 200, quantity: 5);
        $this->assertEquals(1, $spandukResult['production_time']);

        // Buku with 100 pages should take 4 days (3 + 100/100)
        $bukuResult = $this->calculator->calculateBuku(quantity: 50, pages: 100);
        $this->assertEquals(4, $bukuResult['production_time']);

        // Large quantity should add time
        $largeResult = $this->calculator->calculateBrosur(quantity: 1500);
        $this->assertGreaterThan(2, $largeResult['production_time']);
    }

    public function test_get_available_options(): void
    {
        $options = $this->calculator->getAvailableOptions();

        $this->assertIsArray($options['product_types']);
        $this->assertIsArray($options['paper_types']);
        $this->assertIsArray($options['sizes']);
        $this->assertIsArray($options['color_options']);
        $this->assertIsArray($options['finishing_options']);
        $this->assertIsArray($options['quantity_tiers']);

        $this->assertContains('brosur', $options['product_types']);
        $this->assertContains('banner_vinyl', $options['product_types']);
        $this->assertContains('buku_softcover', $options['product_types']);
    }

    // API Tests

    public function test_calculate_brosur_api(): void
    {
        $user = \App\Models\User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/percetakan/calculator/brosur', [
            'quantity' => 100,
            'size' => 'A4',
            'paper_type' => 'art_paper_150gsm',
            'color_option' => 'color_2sided',
            'finishing_options' => ['laminasi_glossy'],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'unit_price',
                    'total_price',
                    'estimated_days',
                    'product_type',
                    'specifications',
                    'pricing' => [
                        'base_price_per_unit',
                        'finishing_cost_per_unit',
                        'price_per_unit_before_discount',
                        'discount_percentage',
                        'discount_amount',
                        'price_per_unit_after_discount',
                        'subtotal',
                        'total',
                    ],
                    'production_time',
                ],
            ]);
    }

    public function test_calculate_spanduk_api(): void
    {
        $user = \App\Models\User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/percetakan/calculator/spanduk', [
            'width' => 150,
            'height' => 200,
            'quantity' => 5,
            'material' => 'vinyl',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'unit_price',
                    'total_price',
                    'estimated_days',
                    'print_method',
                    'product_type',
                    'specifications' => [
                        'width_cm',
                        'height_cm',
                        'area_m2',
                        'material',
                        'quantity',
                    ],
                    'pricing',
                    'production_time',
                ],
            ]);
    }

    public function test_calculate_buku_api(): void
    {
        $user = \App\Models\User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/percetakan/calculator/buku', [
            'quantity' => 50,
            'pages' => 120,
            'size' => 'A5',
            'cover_type' => 'softcover',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'unit_price',
                    'total_price',
                    'estimated_days',
                    'spine_width_mm',
                    'product_type',
                    'specifications' => [
                        'pages',
                        'size',
                        'cover_type',
                        'quantity',
                    ],
                    'pricing',
                    'production_time',
                ],
            ]);
    }

    public function test_calculate_kartu_nama_api(): void
    {
        $user = \App\Models\User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/percetakan/calculator/kartu-nama', [
            'quantity' => 200,
            'print_sides' => '2_sides',
            'lamination' => 'matte',
            'finishing' => ['hotprint'],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'product_type',
                    'unit_price',
                    'total_price',
                    'finishing_fees',
                    'estimated_days',
                    'specifications' => [
                        'quantity',
                        'paper_type',
                        'print_sides',
                    ],
                    'pricing',
                ],
            ]);
    }

    public function test_calculate_stiker_api(): void
    {
        $user = \App\Models\User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/percetakan/calculator/stiker', [
            'width_cm' => 5,
            'height_cm' => 5,
            'sheet_count' => 10,
            'material' => 'vinyl',
            'cut_type' => 'die_cut',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'product_type',
                    'unit_price',
                    'total_price',
                    'estimated_days',
                    'specifications' => [
                        'width_cm',
                        'height_cm',
                        'sheet_count',
                        'material',
                        'cut_type',
                    ],
                    'pricing',
                ],
            ]);
    }

    public function test_get_options_api(): void
    {
        $user = \App\Models\User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/v1/percetakan/calculator/options');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'product_types',
                    'paper_types',
                    'sizes',
                    'color_options',
                    'finishing_options',
                    'quantity_tiers',
                ],
            ]);
    }

    public function test_quick_calculate_api(): void
    {
        $user = \App\Models\User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/percetakan/calculator/quick', [
            'product_type' => 'brosur',
            'quantity' => 100,
            'custom_params' => [
                'size' => 'A4',
                'paper_type' => 'art_paper_150gsm',
            ],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }
}
