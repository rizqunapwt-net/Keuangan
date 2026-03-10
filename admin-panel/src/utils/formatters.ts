/**
 * Format angka ke format Rupiah Indonesia
 * @example fmtRp(1250000) → "Rp 1.250.000"
 */
export const fmtRp = (n: number | string): string => {
    return `Rp ${Number(n).toLocaleString('id-ID')}`;
};

/**
 * Format angka ke format Rupiah tanpa spasi (untuk tabel yang padat)
 * @example fmtRpCompact(1250000) → "Rp1.250.000"
 */
export const fmtRpCompact = (n: number | string): string => {
    return `Rp${Number(n).toLocaleString('id-ID')}`;
};

/**
 * Format tanggal ke format Indonesia
 * @example fmtDate('2026-03-05') → "5 Maret 2026"
 */
export const fmtDate = (d: string | Date): string => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

/**
 * Format tanggal ringkas
 * @example fmtDateShort('2026-03-05') → "5 Mar 2026"
 */
export const fmtDateShort = (d: string | Date): string => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};
