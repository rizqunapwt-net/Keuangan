import { useState } from 'react';

// =========================================
// PRICING DATA (Hardcoded untuk simplicity)
// Bisa di-replace dengan API call nanti
// =========================================

const PRODUCT_PRICES: Record<string, number> = {
    // Spanduk (per m²)
    'spanduk_vinyl_280': 25000,
    'spanduk_vinyl_340': 32000,
    'spanduk_vinyl_440': 42000,
    'spanduk_kain': 35000,
    'spanduk_canvas': 65000,
    'spanduk_albatros': 28000,
    'spanduk_luster': 32000,
    'spanduk_mesh': 55000,
    
    // Sticker (per m²)
    'sticker_vinyl': 55000,
    'sticker_ritrama': 75000,
    'sticker_one_way': 95000,
    
    // Display (per unit, stand included)
    'rollup_banner': 150000,
    'x_banner': 100000,
    'backdrop_portable': 200000,
    
    // Flyer/Brosur (per 100 pcs, base price A4)
    'flyer_art_paper_120gsm': 8000,
    'flyer_art_paper_150gsm': 9500,
    'flyer_art_paper_190gsm': 12000,
    'flyer_art_paper_230gsm': 15000,
    'flyer_art_paper_260gsm': 18000,
    'flyer_hvs_80gsm': 6000,
    'flyer_hvs_100gsm': 7500,
    'flyer_ivory_210gsm': 14000,
    'flyer_ivory_250gsm': 17000,
    'flyer_ivory_310gsm': 21000,
    
    // Kartu Nama (per 100 pcs)
    'kartu_nama_art_carton_260gsm': 25000,
    'kartu_nama_art_carton_310gsm': 30000,
    'kartu_nama_solid_white': 35000,
    'kartu_nama_transparent': 45000,
    
    // NCR Form (per 100 sets, 2-4 ply)
    'ncr_2ply_a4': 18000,
    'ncr_2ply_a5': 12000,
    'ncr_3ply_a4': 24000,
    'ncr_3ply_a5': 16000,
    'ncr_4ply_a4': 30000,
    'ncr_4ply_a5': 20000,
    
    // Dokumen (per 100 pcs)
    'amplop_f4': 25000,
    'amplop_a4': 30000,
    'map_kertas': 35000,
    
    // Buku (per 50 pcs, per 100 pages)
    'buku_softcover_a5': 25000,
    'buku_softcover_a4': 35000,
    'buku_hardcover_a5': 45000,
    'buku_hardcover_a4': 60000,
};

const FINISHING_PRICES: Record<string, number> = {
    // Spanduk finishing
    'mata_ayam': 2000, // per pcs
    'mata_ayam_logam': 3000,
    'slongson': 10000, // per meter
    'lubang_kayu': 15000,
    'hemming': 5000, // per meter
    'lipat_saja': 5000,
    'pocket_rod': 10000,
    'velcro': 15000,
    
    // Brosur finishing
    'laminasi_doff': 200,
    'laminasi_glossy': 180,
    'laminasi_elegant': 350,
    'laminasi_emboss': 500,
    'uv_varnish': 300,
    'lipat_2': 50,
    'lipat_3': 80,
    'lipat_z': 120,
    'saddle_stitch': 150,
    'perfect_binding': 2000,
    'spiral_kawat': 1500,
    'spiral_plastik': 1200,
    
    // Sticker cutting
    'kiss_cut': 15000, // per m²
    'die_cut': 25000,
    'square_cut': 10000,
    'no_cut': 0,
    
    // Buku binding
    'block_glue': 1000,
    'hot_melt': 1500,
    'sewn_binding': 3000,
    
    // NCR Form
    'perforation': 2000, // per meter
    'numbering': 300, // per pcs
    'carbonless_coating': 1500, // per m²
    
    // Special finishing
    'foil_stamping_gold': 5000,
    'foil_stamping_silver': 4500,
    'emboss_deboss': 7500,
    'spot_uv': 8000,
    'rounded_corners': 1500,
};

const QUANTITY_TIERS: Record<string, { min: number; discount: number }[]> = {
    'spanduk': [
        { min: 10, discount: 8 },
        { min: 50, discount: 16 },
        { min: 100, discount: 24 },
    ],
    'sticker': [
        { min: 10, discount: 5 },
        { min: 50, discount: 10 },
        { min: 100, discount: 15 },
    ],
    'rollup_banner': [
        { min: 5, discount: 5 },
        { min: 10, discount: 10 },
        { min: 20, discount: 15 },
    ],
    'flyer': [
        { min: 500, discount: 10 },
        { min: 1000, discount: 18 },
        { min: 2000, discount: 25 },
        { min: 5000, discount: 35 },
    ],
    'kartu_nama': [
        { min: 200, discount: 8 },
        { min: 500, discount: 15 },
        { min: 1000, discount: 25 },
    ],
    'buku': [
        { min: 50, discount: 5 },
        { min: 100, discount: 12 },
        { min: 200, discount: 20 },
        { min: 500, discount: 30 },
    ],
    'ncr': [
        { min: 50, discount: 8 },
        { min: 100, discount: 15 },
        { min: 200, discount: 22 },
    ],
};

// =========================================
// TYPES
// =========================================

interface CalculatorInput {
    category: string;
    productCode: string;
    width?: number; // in meters
    height?: number; // in meters
    quantity: number;
    pages?: number; // for books
    size?: string; // A3, A4, A5, A6
    finishingOptions?: { code: string; quantity: number }[];
}

interface CalculatorResult {
    area: number;
    billableQuantity: number;
    unitPrice: number;
    baseTotal: number;
    finishingTotal: number;
    grandTotal: number;
    discount: number;
    discountPercent: number;
    productionTime: string;
    breakdown: {
        productName: string;
        dimensions?: string;
        area?: number;
        quantity: number;
        unitPrice: number;
        subtotal: number;
        finishing?: { name: string; qty: number; price: number }[];
        finishingTotal: number;
        total: number;
        productionTime: string;
    };
}

// =========================================
// HOOK
// =========================================

export const usePrintingCalculator = () => {
    const [result, setResult] = useState<CalculatorResult | null>(null);

    const calculate = (input: CalculatorInput): CalculatorResult => {
        const {
            category,
            productCode,
            width = 1,
            height = 1,
            quantity = 1,
            pages = 100,
            finishingOptions = [],
        } = input;

        // Get base price
        const basePrice = PRODUCT_PRICES[productCode] || 0;

        // Calculate area for spanduk/sticker
        const area = category === 'spanduk' || category === 'sticker'
            ? width * height
            : 0;

        // Determine billable quantity based on category
        let billableQuantity = quantity;
        let unitPrice = basePrice;
        
        if (category === 'spanduk' || category === 'sticker') {
            // Area-based: m² × quantity
            billableQuantity = Math.max(area, 1) * quantity;
        } else if (category === 'flyer' || category === 'kartu_nama') {
            // Volume-based: per 100 pcs
            billableQuantity = Math.ceil(quantity / 100) * 100;
        } else if (category === 'buku') {
            // Book: per 50 pcs, adjusted by pages
            const pageMultiplier = pages / 100; // Base is 100 pages
            billableQuantity = Math.ceil(quantity / 50) * 50;
            unitPrice = basePrice * pageMultiplier;
        }

        // Apply tier discount
        const tiers = QUANTITY_TIERS[category] || [];
        let discountPercent = 0;
        for (const tier of tiers) {
            if (billableQuantity >= tier.min) {
                discountPercent = tier.discount;
            }
        }

        // Calculate unit price with discount
        unitPrice = unitPrice * (1 - discountPercent / 100);

        // Calculate base total
        const baseTotal = unitPrice * billableQuantity;

        // Calculate finishing
        let finishingTotal = 0;
        const finishingBreakdown = finishingOptions.map(opt => {
            const finishingPrice = FINISHING_PRICES[opt.code] || 0;
            const subtotal = finishingPrice * opt.quantity;
            finishingTotal += subtotal;
            return {
                name: opt.code.replace(/_/g, ' ').toUpperCase(),
                qty: opt.quantity,
                price: finishingPrice,
                subtotal,
            };
        });

        // Grand total
        const grandTotal = baseTotal + finishingTotal;

        // Production time
        let productionTime = '2-3 hari';
        if (category === 'spanduk') productionTime = '1-2 hari';
        if (category === 'buku') productionTime = `${3 + Math.ceil(pages / 100)} hari`;
        if (quantity > 500) productionTime = `${parseInt(productionTime) + 2} hari`;

        const calcResult: CalculatorResult = {
            area,
            billableQuantity,
            unitPrice,
            baseTotal,
            finishingTotal,
            grandTotal,
            discount: basePrice * billableQuantity - baseTotal,
            discountPercent,
            productionTime,
            breakdown: {
                productName: productCode.replace(/_/g, ' ').toUpperCase(),
                dimensions: category === 'spanduk' ? `${width}m × ${height}m` : undefined,
                area: category === 'spanduk' ? area : undefined,
                quantity,
                unitPrice,
                subtotal: baseTotal,
                finishing: finishingBreakdown,
                finishingTotal,
                total: grandTotal,
                productionTime,
            },
        };

        setResult(calcResult);
        return calcResult;
    };

    const reset = () => {
        setResult(null);
    };

    return {
        result,
        calculate,
        reset,
        getProductPrice: (code: string) => PRODUCT_PRICES[code] || 0,
        getFinishingPrice: (code: string) => FINISHING_PRICES[code] || 0,
    };
};

export default usePrintingCalculator;
