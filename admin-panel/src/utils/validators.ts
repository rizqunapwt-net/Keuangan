/**
 * Validation Rules for Forms
 */

export const validators = {
  /**
   * Email validation
   */
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email tidak valid',
  },

  /**
   * Phone validation (Indonesian format)
   */
  phone: {
    pattern: /^(\+62|62|0)[0-9]{9,12}$/,
    message: 'Nomor telepon tidak valid',
  },

  /**
   * NIK validation (Indonesian ID)
   */
  nik: {
    pattern: /^[0-9]{16}$/,
    message: 'NIK harus 16 digit angka',
  },

  /**
   * NPWP validation (Indonesian Tax ID)
   */
  npwp: {
    pattern: /^[0-9]{15}$/,
    message: 'NPWP harus 15 digit angka',
  },

  /**
   * URL validation
   */
  url: {
    pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    message: 'URL tidak valid',
  },
};

/**
 * Custom Validation Functions
 */

export const isValidEmail = (email: string): boolean => {
  return validators.email.pattern.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return validators.phone.pattern.test(phone);
};

export const isValidNIK = (nik: string): boolean => {
  return validators.nik.pattern.test(nik);
};

export const isValidNPWP = (npwp: string): boolean => {
  return validators.npwp.pattern.test(npwp);
};

export const isPositiveNumber = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

export const isValidRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

export const isRequired = (value: string | number | null | undefined): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== null && value !== undefined;
};

export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Form Rules for Ant Design
 */

export const formRules = {
  email: [
    { required: true, message: 'Email wajib diisi' },
    { pattern: validators.email.pattern, message: validators.email.message },
  ],
  phone: [
    { required: true, message: 'Nomor telepon wajib diisi' },
    { pattern: validators.phone.pattern, message: validators.phone.message },
  ],
  password: [
    { required: true, message: 'Password wajib diisi' },
    { min: 8, message: 'Password minimal 8 karakter' },
  ],
  required: [{ required: true, message: 'Field ini wajib diisi' }],
  url: [
    { pattern: validators.url.pattern, message: validators.url.message },
  ],
  nik: [
    { pattern: validators.nik.pattern, message: validators.nik.message },
  ],
  npwp: [
    { pattern: validators.npwp.pattern, message: validators.npwp.message },
  ],
};
