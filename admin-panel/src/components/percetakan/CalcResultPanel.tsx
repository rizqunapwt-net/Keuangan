import React from 'react';
import { Card, Row, Col, Typography, Divider, Tag, Space, Statistic, Alert } from 'antd';
import { DollarOutlined, ClockCircleOutlined, GiftOutlined } from '@ant-design/icons';
import { radius } from '../../theme/tokens';

const { Title, Text } = Typography;

interface CalcResultPanelProps {
  productName: string;
  category?: string;
  dimensions?: string;
  area?: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountPercent?: number;
  discountAmount?: number;
  finishingTotal?: number;
  finishing?: Array<{ name: string; qty: number; price: number }>;
  total: number;
  productionTime?: string;
  loading?: boolean;
}

export const CalcResultPanel: React.FC<CalcResultPanelProps> = ({
  productName,
  category,
  dimensions,
  area,
  quantity,
  unitPrice,
  subtotal,
  discountPercent = 0,
  discountAmount = 0,
  finishingTotal = 0,
  finishing = [],
  total,
  productionTime,
  loading = false,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card
        title="Menghitung..."
        loading={true}
        style={{ borderRadius: radius.lg, backgroundColor: '#f5f5f5' }}
      />
    );
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DollarOutlined />
          <span>Rincian Harga</span>
        </div>
      }
      bordered={false}
      style={{
        borderRadius: radius.lg,
        backgroundColor: '#f5f5f5',
        position: 'sticky',
        top: 24,
      }}
    >
      <Row gutter={[16, 16]}>
        {/* Product Info */}
        <Col span={24}>
          <Title level={5} style={{ marginBottom: 8 }}>{productName}</Title>
          {category && <Tag color="blue">{category.toUpperCase()}</Tag>}
          {dimensions && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">{dimensions}</Text>
              {area !== undefined && (
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  ({area.toFixed(2)} m²)
                </Text>
              )}
            </div>
          )}
        </Col>

        <Col span={24}>
          <Divider style={{ margin: '12px 0' }} />
        </Col>

        {/* Quantity & Unit Price */}
        <Col span={12}>
          <Text>Quantity:</Text>
          <br />
          <Text strong>{quantity}</Text>
        </Col>
        <Col span={12}>
          <Text>Harga per unit:</Text>
          <br />
          <Text strong type="danger">
            {formatCurrency(unitPrice)}
          </Text>
        </Col>

        {/* Subtotal */}
        <Col span={24}>
          <Statistic
            title="Subtotal"
            value={subtotal}
            prefix="Rp"
            valueStyle={{ fontSize: 18 }}
            formatter={(val) => Number(val).toLocaleString('id-ID')}
          />
        </Col>

        {/* Discount */}
        {discountPercent > 0 && (
          <>
            <Col span={24}>
              <Space>
                <GiftOutlined style={{ color: '#52c41a' }} />
                <Text>Diskon ({discountPercent}%):</Text>
              </Space>
            </Col>
            <Col span={24}>
              <Text type="success" strong>
                - {formatCurrency(discountAmount)}
              </Text>
            </Col>
          </>
        )}

        {/* Finishing */}
        {finishing.length > 0 && (
          <>
            <Col span={24}>
              <Divider style={{ margin: '12px 0' }} />
              <Text strong>Finishing:</Text>
            </Col>
            {finishing.map((item, idx) => (
              <Col span={12} key={idx}>
                <Text type="secondary">
                  • {item.name} (×{item.qty})
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatCurrency(item.price)}
                </Text>
              </Col>
            ))}
            <Col span={24}>
              <Text>Total Finishing:</Text>
              <br />
              <Text type="success">
                {formatCurrency(finishingTotal)}
              </Text>
            </Col>
          </>
        )}

        {/* Grand Total */}
        <Col span={24}>
          <Divider style={{ margin: '12px 0', borderColor: 'rgba(0,0,0,0.1)' }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #0fb9b1, #20bf6b)',
              padding: 16,
              borderRadius: 12,
              color: 'white',
            }}
          >
            <Title level={4} style={{ margin: 0, color: 'white' }}>TOTAL:</Title>
            <Title level={3} style={{ margin: 0, color: 'white' }}>
              {formatCurrency(total)}
            </Title>
          </div>
        </Col>

        {/* Production Time */}
        {productionTime && (
          <Col span={24}>
            <Alert
              message={`Estimasi produksi: ${productionTime}`}
              type="info"
              showIcon
              icon={<ClockCircleOutlined />}
              style={{ fontSize: 13 }}
            />
          </Col>
        )}

        {/* Trust Badges */}
        <Col span={24}>
          <Divider style={{ margin: '12px 0' }} />
          <Space wrap size={[8, 8]}>
            <Tag color="green">✅ Harga Terbaik</Tag>
            <Tag color="blue">🔒 Aman & Terpercaya</Tag>
            <Tag color="purple">⚡ Pengerjaan Cepat</Tag>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default CalcResultPanel;
