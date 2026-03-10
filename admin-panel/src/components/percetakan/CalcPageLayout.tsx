import React, { ReactNode } from 'react';
import { Form, Button, Typography, Row, Col } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface CalcPageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  calculationResult?: any;
  onCalculate: () => void;
  calculating?: boolean;
  form: any;
}

export const CalcPageLayout: React.FC<CalcPageLayoutProps> = ({
  title,
  description,
  children,
  calculationResult,
  onCalculate,
  calculating = false,
  form,
}) => {
  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* Left Column - Form */}
        <Col xs={24} lg={14}>
          <Form form={form} layout="vertical" onFinish={onCalculate}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <Title level={2}>{title}</Title>
              {description && <Text type="secondary">{description}</Text>}
            </div>

            {/* Form Fields */}
            {children}

            {/* Calculate Button */}
            <Form.Item style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CalculatorOutlined />}
                loading={calculating}
                size="large"
                block
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none',
                  borderRadius: 10,
                  height: 48,
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
                }}
              >
                Hitung Harga
              </Button>
            </Form.Item>
          </Form>
        </Col>

        {/* Right Column - Result (will be rendered by parent) */}
        <Col xs={24} lg={10}>
          {calculationResult && (
            <div style={{ position: 'sticky', top: 24 }}>
              {/* Result panel will be injected here */}
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CalcPageLayout;
