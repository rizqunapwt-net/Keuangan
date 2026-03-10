import React from 'react';
import { Card, Row, Col, Typography, Divider, Alert } from 'antd';
import { CalculatorOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { radius } from '../../theme/tokens';

const { Title, Text } = Typography;

interface PriceBreakdown {
    productName: string;
    dimensions?: string;
    area?: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    finishing?: { name: string; qty: number; price: number }[];
    finishingTotal?: number;
    total: number;
    productionTime?: string;
}

interface LivePricePreviewProps {
    visible?: boolean;
    breakdown: PriceBreakdown;
}

export const LivePricePreview: React.FC<LivePricePreviewProps> = ({
    visible = true,
    breakdown,
}) => {
    if (!visible) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Card
            size="small"
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalculatorOutlined />
                    <span>Rincian Harga</span>
                </div>
            }
            bordered={false}
            style={{
                borderRadius: radius.lg,
                backgroundColor: '#f5f5f5',
            }}
        >
            <Row gutter={[16, 8]}>
                {/* Product Info */}
                <Col span={24}>
                    <Text strong>{breakdown.productName}</Text>
                    {breakdown.dimensions && (
                        <div>
                            <Text type="secondary">{breakdown.dimensions}</Text>
                            {breakdown.area !== undefined && (
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    ({breakdown.area} m²)
                                </Text>
                            )}
                        </div>
                    )}
                </Col>

                <Col span={24}>
                    <Divider style={{ margin: '8px 0' }} />
                </Col>

                {/* Quantity & Unit Price */}
                <Col span={12}>
                    <Text>Quantity:</Text><br />
                    <Text strong>{breakdown.quantity}</Text>
                </Col>
                <Col span={12}>
                    <Text>Harga per unit:</Text><br />
                    <Text strong type="danger">
                        {formatCurrency(breakdown.unitPrice)}
                    </Text>
                </Col>

                {/* Subtotal */}
                <Col span={24}>
                    <Text>Subtotal:</Text><br />
                    <Text>{formatCurrency(breakdown.subtotal)}</Text>
                </Col>

                {/* Finishing Options */}
                {breakdown.finishing && breakdown.finishing.length > 0 && (
                    <>
                        <Col span={24}>
                            <Divider style={{ margin: '8px 0' }} />
                            <Text strong>Finishing:</Text>
                        </Col>
                        {breakdown.finishing.map((item, idx) => (
                            <Col span={12} key={idx}>
                                <Text type="secondary">
                                    • {item.name} (×{item.qty})
                                </Text><br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {formatCurrency(item.price)}
                                </Text>
                            </Col>
                        ))}
                        <Col span={24}>
                            <Text>Total Finishing:</Text><br />
                            <Text type="success">
                                {formatCurrency(breakdown.finishingTotal || 0)}
                            </Text>
                        </Col>
                    </>
                )}

                {/* Grand Total */}
                <Col span={24}>
                    <Divider style={{ margin: '8px 0' }} />
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Title level={5} style={{ margin: 0 }}>TOTAL:</Title>
                        <Title level={4} type="danger" style={{ margin: 0 }}>
                            {formatCurrency(breakdown.total)}
                        </Title>
                    </div>
                </Col>

                {/* Production Time */}
                {breakdown.productionTime && (
                    <Col span={24}>
                        <Alert
                            message={`Estimasi produksi: ${breakdown.productionTime}`}
                            type="info"
                            showIcon
                            icon={<InfoCircleOutlined />}
                            style={{ fontSize: 12 }}
                        />
                    </Col>
                )}
            </Row>
        </Card>
    );
};

export default LivePricePreview;
