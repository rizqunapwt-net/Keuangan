import { useState, useCallback } from 'react';

/**
 * Hook untuk menyimpan & memuat custom settings kalkulator dari localStorage.
 * Setiap kalkulator punya key sendiri, misal 'calc_spanduk', 'calc_brosur', dll.
 */
export function useCalcSettings<T>(key: string, defaultValue: T): [T, (val: T) => void, () => void] {
    const storageKey = `rizquna_calc_${key}`;

    const [value, setValue] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) return { ...defaultValue, ...JSON.parse(stored) };
        } catch { }
        return defaultValue;
    });

    const save = useCallback((newVal: T) => {
        setValue(newVal);
        try { localStorage.setItem(storageKey, JSON.stringify(newVal)); } catch { }
    }, [storageKey]);

    const reset = useCallback(() => {
        setValue(defaultValue);
        try { localStorage.removeItem(storageKey); } catch { }
    }, [storageKey, defaultValue]);

    return [value, save, reset];
}
