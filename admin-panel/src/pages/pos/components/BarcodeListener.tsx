import React, { useCallback } from 'react';
import { message } from 'antd';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { useCartStore } from '../../../stores/cartStore';
import api from '../../../api';

const BarcodeListener: React.FC = () => {
  const { addItem } = useCartStore();

  const handleScan = useCallback(async (barcode: string) => {
    try {
      const { data } = await api.get(`/finance/products`, { params: { barcode } });
      const product = data.data.find((p: any) => p.barcode === barcode);
      
      if (product) {
        addItem(product);
        message.success(`${product.name} ditambahkan ke keranjang`, 1);
      } else {
        message.warning(`Produk dengan barcode "${barcode}" tidak ditemukan`, 2);
      }
    } catch (error) {
      console.error('Barcode lookup error:', error);
      message.error(`Gagal mencari barcode "${barcode}"`, 2);
    }
  }, [addItem]);

  useBarcodeScanner(handleScan);

  return null; // Component does not render anything visually
};

export default BarcodeListener;
