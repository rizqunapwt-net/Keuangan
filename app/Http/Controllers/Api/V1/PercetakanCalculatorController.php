<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Percetakan\Services\PrintingCalculator;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class PercetakanCalculatorController extends Controller
{
    public function __construct(protected PrintingCalculator $calculator)
    {
    }

    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'nullable|integer|required_without_all:category,product_code',
            'category' => 'nullable|string|required_without_all:product_id,product_code',
            'product_code' => 'nullable|string|required_without_all:product_id,category',
            'quantity' => 'required|integer|min:1',
            'width' => 'nullable|numeric|min:0.1',
            'height' => 'nullable|numeric|min:0.1',
            'width_cm' => 'nullable|numeric|min:0.1',
            'height_cm' => 'nullable|numeric|min:0.1',
            'sheet_count' => 'nullable|integer|min:1',
            'paper_type' => 'nullable|string',
            'print_sides' => 'nullable|string',
            'color_option' => 'nullable|string',
            'lamination' => 'nullable|string',
            'fold_type' => 'nullable|string',
            'paper_size' => 'nullable|string',
            'size' => 'nullable|string',
            'page_count' => 'nullable|integer|min:8|max:2000',
            'pages' => 'nullable|integer|min:8|max:2000',
            'color_mode' => 'nullable|string',
            'binding_type' => 'nullable|string',
            'cover_type' => 'nullable|string',
            'material' => 'nullable|string',
            'cut_type' => 'nullable|string',
            'finishing' => 'nullable|array',
            'finishing.*' => 'string',
            'finishing_options' => 'nullable|array',
            'finishing_options.*' => 'string',
        ]);

        return $this->respondSafely(fn (): array => $this->calculator->calculate($validated));
    }

    public function calculateBrosur(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'size' => 'nullable|string',
            'paper_type' => 'nullable|string',
            'color_option' => 'nullable|string',
            'print_sides' => 'nullable|string',
            'lamination' => 'nullable|string',
            'fold_type' => 'nullable|string',
            'finishing_options' => 'nullable|array',
            'finishing_options.*' => 'string',
        ]);

        return $this->respondSafely(function () use ($validated): array {
            $finishingOptions = $this->brosurFinishingFromRequest($validated);

            return $this->calculator->calculateBrosur(
                quantity: (int) $validated['quantity'],
                size: (string) ($validated['size'] ?? 'A4'),
                paperType: (string) ($validated['paper_type'] ?? 'art_paper_150gsm'),
                colorOption: (string) ($validated['color_option'] ?? $validated['print_sides'] ?? '2_sides'),
                finishingOptions: $finishingOptions,
            );
        });
    }

    public function calculateSpanduk(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'width' => 'nullable|numeric|min:0.1|required_without:width_cm',
            'height' => 'nullable|numeric|min:0.1|required_without:height_cm',
            'width_cm' => 'nullable|numeric|min:0.1|required_without:width',
            'height_cm' => 'nullable|numeric|min:0.1|required_without:height',
            'quantity' => 'required|integer|min:1',
            'material' => 'nullable|string',
            'product_code' => 'nullable|string',
            'product_id' => 'nullable|integer',
            'finishing' => 'nullable|array',
            'finishing.*' => 'string',
        ]);

        return $this->respondSafely(function () use ($validated): array {
            $material = (string) ($validated['material'] ?? $validated['product_code'] ?? $validated['product_id'] ?? 'vinyl');

            return $this->calculator->calculateSpanduk(
                width: (float) ($validated['width'] ?? $validated['width_cm']),
                height: (float) ($validated['height'] ?? $validated['height_cm']),
                quantity: (int) $validated['quantity'],
                material: $material,
                finishingOptions: (array) ($validated['finishing'] ?? []),
            );
        });
    }

    public function calculateBuku(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'pages' => 'nullable|integer|min:8|max:2000',
            'page_count' => 'nullable|integer|min:8|max:2000',
            'size' => 'nullable|string',
            'paper_size' => 'nullable|string',
            'cover_type' => 'nullable|string',
            'paper_type' => 'nullable|string',
            'color_mode' => 'nullable|string',
            'binding_type' => 'nullable|string',
            'lamination' => 'nullable|string',
        ]);

        return $this->respondSafely(function () use ($validated): array {
            return $this->calculator->calculateBuku(
                quantity: (int) $validated['quantity'],
                pages: (int) ($validated['pages'] ?? $validated['page_count'] ?? 100),
                size: (string) ($validated['size'] ?? $validated['paper_size'] ?? 'A5'),
                coverType: (string) ($validated['cover_type'] ?? 'softcover'),
                paperType: (string) ($validated['paper_type'] ?? 'hvs_70gsm'),
                colorMode: (string) ($validated['color_mode'] ?? 'bw'),
                bindingType: (string) ($validated['binding_type'] ?? 'perfect'),
                lamination: (string) ($validated['lamination'] ?? 'matte'),
            );
        });
    }

    public function calculateKartuNama(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'print_sides' => 'nullable|string',
            'lamination' => 'nullable|string',
            'finishing' => 'nullable|array',
            'finishing.*' => 'string',
        ]);

        return $this->respondSafely(function () use ($validated): array {
            return $this->calculator->calculateKartuNama(
                quantity: (int) $validated['quantity'],
                printSides: (string) ($validated['print_sides'] ?? '2_sides'),
                lamination: (string) ($validated['lamination'] ?? 'matte'),
                finishingOptions: (array) ($validated['finishing'] ?? []),
            );
        });
    }

    public function calculateStiker(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'width' => 'nullable|numeric|min:0.1|required_without:width_cm',
            'height' => 'nullable|numeric|min:0.1|required_without:height_cm',
            'width_cm' => 'nullable|numeric|min:0.1|required_without:width',
            'height_cm' => 'nullable|numeric|min:0.1|required_without:height',
            'sheet_count' => 'required|integer|min:1',
            'material' => 'nullable|string',
            'cut_type' => 'nullable|string',
        ]);

        return $this->respondSafely(function () use ($validated): array {
            return $this->calculator->calculateStiker(
                width: (float) ($validated['width'] ?? $validated['width_cm']),
                height: (float) ($validated['height'] ?? $validated['height_cm']),
                sheetCount: (int) $validated['sheet_count'],
                material: (string) ($validated['material'] ?? 'chromo'),
                cutType: (string) ($validated['cut_type'] ?? 'die_cut'),
            );
        });
    }

    public function getOptions(): JsonResponse
    {
        return $this->respond($this->calculator->getAvailableOptions());
    }

    public function quickCalculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_type' => 'required|string',
            'quantity' => 'nullable|integer|min:1',
            'custom_params' => 'nullable|array',
        ]);

        return $this->respondSafely(function () use ($validated): array {
            $params = (array) ($validated['custom_params'] ?? []);

            if (isset($validated['quantity']) && ! isset($params['quantity'])) {
                $params['quantity'] = (int) $validated['quantity'];
            }

            return $this->calculator->quickCalculate(
                (string) $validated['product_type'],
                $params,
            );
        });
    }

    private function respond(array $data): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    private function respondSafely(callable $callback): JsonResponse
    {
        try {
            return $this->respond($callback());
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], 422);
        }
    }

    private function brosurFinishingFromRequest(array $validated): array
    {
        $finishing = array_values((array) ($validated['finishing_options'] ?? []));
        $lamination = $validated['lamination'] ?? null;
        $foldType = $validated['fold_type'] ?? null;

        if (is_string($lamination) && trim($lamination) !== '' && strtolower($lamination) !== 'none') {
            $finishing[] = $lamination;
        }

        if (is_string($foldType) && trim($foldType) !== '' && strtolower($foldType) !== 'none') {
            $finishing[] = $foldType;
        }

        return $finishing;
    }
}
