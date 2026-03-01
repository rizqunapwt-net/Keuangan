import React, { useState, useEffect, useRef } from 'react';
import { Modal, InputNumber, Radio, Button, Divider, message, Typography, Space } from 'antd';
import { Banknote, CreditCard, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../../../stores/cartStore';
import api from '../../../api';

const { Title, Text } = Typography;

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onClose, onSuccess }) => {
  const { items, total, clear } = useCartStore();
  const [method, setMethod] = useState<'cash' | 'transfer'>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<any>(null);

  const totalBill = total();
  const change = paidAmount - totalBill;

  useEffect(() => {
    if (open) {
      setPaidAmount(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (method === 'cash' && paidAmount < totalBill) {
      message.error('Uang yang dibayarkan kurang!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        payment_method: method,
        paid_amount: paidAmount,
        customer_name: 'Pelanggan POS',
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.price,
          discount_amount: i.discount || 0,
        })),
      };

      const response = await api.post('/sales', payload);
      
      const sale = response.data.data;

      // Handle Online Payment (Midtrans)
      if (['qris', 'transfer', 'midtrans'].includes(method) || sale.snap_token) {
        if ((window as any).snap) {
          (window as any).snap.pay(sale.snap_token, {
            onSuccess: (result: any) => {
              message.success('Pembayaran Berhasil!');
              clear();
              onSuccess();
              window.open(`/api/v1/finance/receipts/${sale.id}`, '_blank');
            },
            onPending: (result: any) => {
              message.info('Menunggu pembayaran...');
              clear();
              onSuccess();
            },
            onError: (result: any) => {
              message.error('Pembayaran gagal!');
            },
            onClose: () => {
              message.warning('Anda menutup pop-up pembayaran sebelum menyelesaikan transaksi');
            }
          });
        } else {
          message.error('Sistem pembayaran (Snap.js) belum termuat.');
        }
        setSubmitting(false);
        return;
      }

      message.success('Transaksi Berhasil!');
      
      // Open receipt in new tab
      if (sale.id) {
        window.open(`/api/v1/finance/receipts/${sale.id}`, '_blank');
      }

      clear();
      onSuccess();
    } catch (error: any) {
      console.error('Payment error:', error);
      message.error(error.response?.data?.message || 'Gagal memproses transaksi');
    } finally {
      setSubmitting(false);
    }
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Proses Pembayaran"
      width={450}
      centered
    >
      <div style={{ padding: '8px 0' }}>
        <div style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px', textAlign: 'center', marginBottom: '24px' }}>
          <Text type="secondary">Total yang harus dibayar</Text>
          <Title level={2} style={{ margin: '8px 0 0 0', color: '#111827', fontSize: '32px' }}>
            {formatIDR(totalBill)}
          </Title>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size={20}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Metode Pembayaran</Text>
            <Radio.Group 
              value={method} 
              onChange={(e) => setMethod(e.target.value)} 
              buttonStyle="solid" 
              style={{ width: '100%', display: 'flex', gap: '8px' }}
            >
              <Radio.Button value="cash" style={{ flex: 1, height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px' }}>
                <Banknote size={18} /> Tunai
              </Radio.Button>
              <Radio.Button value="qris" style={{ flex: 1, height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px' }}>
                <CreditCard size={18} /> QRIS / Online
              </Radio.Button>
            </Radio.Group>
          </div>

          {method === 'cash' && (
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Uang Diterima</Text>
              <InputNumber
                ref={inputRef}
                style={{ width: '100%', height: '50px', fontSize: '20px' }}
                placeholder="Rp 0"
                formatter={(v) => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={(v) => v!.replace(/Rp\s?|(\.*)/g, '')}
                value={paidAmount}
                onChange={(v) => setPaidAmount(v || 0)}
                onPressEnter={handleSubmit}
              />
              
              {paidAmount > 0 && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  backgroundColor: change >= 0 ? '#ecfdf5' : '#fef2f2',
                  textAlign: 'center',
                  border: `1px solid ${change >= 0 ? '#10b981' : '#ef4444'}`
                }}>
                  <Text type="secondary">{change >= 0 ? 'Kembalian' : 'Kurang'}</Text>
                  <Title level={3} style={{ margin: '4px 0 0 0', color: change >= 0 ? '#059669' : '#dc2626' }}>
                    {formatIDR(Math.abs(change))}
                  </Title>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px' }}>
                {[50000, 100000, 200000].map(amt => (
                  <Button key={amt} onClick={() => setPaidAmount(amt)}>{formatIDR(amt)}</Button>
                ))}
              </div>
            </div>
          )}

          <Divider style={{ margin: '12px 0' }} />

          <Button
            type="primary"
            size="large"
            block
            style={{ height: '55px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#059669', borderColor: '#059669' }}
            icon={<CheckCircle2 size={20} />}
            loading={submitting}
            onClick={handleSubmit}
            disabled={method === 'cash' && paidAmount < totalBill}
          >
            Selesaikan Transaksi
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default PaymentModal;
