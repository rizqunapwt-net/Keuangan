/**
 * Number and Currency Formatters
 */

export const formatCurrency = (value: number, locale = 'id-ID'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const parseNumber = (value: string): number => {
  return parseFloat(value.replace(/,/g, '.'));
};

/**
 * Date Formatters
 */

export const formatDate = (date: Date | string, format = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', day);
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d)} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Text Formatters
 */

export const truncate = (text: string, length: number, suffix = '...'): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const toTitleCase = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => capitalize(txt));
};
