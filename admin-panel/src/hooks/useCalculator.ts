import { useState, useCallback } from 'react';
import { message } from 'antd';
import { AxiosError } from 'axios';
import api from '../api';

interface UseCalculatorOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

interface CalculatorResult {
  product: {
    code: string;
    name: string;
    category: string;
  };
  specifications: {
    dimensions?: string;
    area_m2?: number;
    quantity: number;
    billable_quantity: number;
  };
  pricing: {
    base_price: number;
    discount_percent: number;
    unit_price: number;
    base_total: number;
    finishing: Array<{ code: string; name: string; price: number }>;
    finishing_total: number;
    grand_total: number;
  };
  production_time: string;
  breakdown: {
    productName: string;
    dimensions?: string;
    area?: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    finishing: Array<{ name: string; qty: number; price: number }>;
    finishingTotal: number;
    total: number;
    productionTime: string;
  };
}

export const useCalculator = (options: UseCalculatorOptions = {}) => {
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const calculate = useCallback(async (
    category: string,
    productCode: string,
    params: {
      quantity: number;
      width_cm?: number;
      height_cm?: number;
      pages?: number;
      size?: string;
      ply?: number;
      finishing?: string[];
    }
  ) => {
    setCalculating(true);
    setError(null);

    try {
      const payload = {
        category,
        product_code: productCode,
        quantity: params.quantity,
        width_cm: params.width_cm,
        height_cm: params.height_cm,
        pages: params.pages,
        size: params.size,
        ply: params.ply,
        finishing: params.finishing || [],
      };

      const response = await api.post('/percetakan/calculator/calculate', payload);
      const calculationResult = response.data?.data;

      if (calculationResult) {
        setResult(calculationResult);
        options.onSuccess?.(calculationResult);
      }

      return calculationResult;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Gagal menghitung harga';
      
      setError(new Error(errorMessage));
      options.onError?.(new Error(errorMessage));
      message.error(errorMessage);
      
      return null;
    } finally {
      setCalculating(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    calculating,
    result,
    error,
    calculate,
    reset,
  };
};

export default useCalculator;
