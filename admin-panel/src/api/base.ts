const rawApiUrl = String(import.meta.env.VITE_API_URL || '').trim();
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '');

export const API_V1_BASE = normalizedApiUrl || '/api/v1';
export const API_BASE = API_V1_BASE.endsWith('/v1') ? API_V1_BASE.slice(0, -3) : API_V1_BASE;
