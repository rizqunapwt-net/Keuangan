import React from 'react';
import { Card, Select, InputNumber, Checkbox, Typography, Row, Col } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { radius } from '../../theme/tokens';

const { Text } = Typography;
const { Option } = Select;

interface CalcSettingsPanelProps {
  // Product selection
  productCode?: string;
  onProductChange?: (value: string) => void;
  productOptions?: Array<{ value: string; label: string }>;
  
  // Size options
  size?: string;
  onSizeChange?: (value: string) => void;
  sizeOptions?: Array<{ value: string; label: string }>;
  
  // Paper options
  paperType?: string;
  onPaperTypeChange?: (value: string) => void;
  paperOptions?: Array<{ value: string; label: string }>;
  
  // Color options
  colorOption?: string;
  onColorOptionChange?: (value: string) => void;
  colorOptions?: Array<{ value: string; label: string }>;
  
  // Finishing options
  finishingOptions?: string[];
  onFinishingChange?: (values: string[]) => void;
  finishingList?: Array<{ value: string; label: string; price: number }>;
  
  // Pages (for books)
  pages?: number;
  onPagesChange?: (value: number | null) => void;
  
  // Ply (for NCR)
  ply?: number;
  onPlyChange?: (value: number) => void;
}

export const CalcSettingsPanel: React.FC<CalcSettingsPanelProps> = ({
  productCode,
  onProductChange,
  productOptions = [],
  size,
  onSizeChange,
  sizeOptions = [],
  paperType,
  onPaperTypeChange,
  paperOptions = [],
  colorOption,
  onColorOptionChange,
  colorOptions = [],
  finishingOptions = [],
  onFinishingChange,
  finishingList = [],
  pages,
  onPagesChange,
  ply,
  onPlyChange,
}) => {
  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingOutlined />
          <span>Pengaturan</span>
        </div>
      }
      size="small"
      bordered={false}
      style={{
        borderRadius: radius.lg,
        marginBottom: 16,
        backgroundColor: '#fafafa',
      }}
    >
      <Row gutter={[16, 16]}>
        {/* Product Selection */}
        {productOptions.length > 0 && (
          <Col span={24}>
            <Text strong>Produk:</Text>
            <Select
              value={productCode}
              onChange={onProductChange}
              options={productOptions}
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Pilih produk"
            />
          </Col>
        )}

        {/* Size Selection */}
        {sizeOptions.length > 0 && (
          <Col span={12}>
            <Text strong>Ukuran:</Text>
            <Select
              value={size}
              onChange={onSizeChange}
              options={sizeOptions}
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Ukuran"
            />
          </Col>
        )}

        {/* Paper Type */}
        {paperOptions.length > 0 && (
          <Col span={12}>
            <Text strong>Kertas:</Text>
            <Select
              value={paperType}
              onChange={onPaperTypeChange}
              options={paperOptions}
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Jenis kertas"
            />
          </Col>
        )}

        {/* Color Option */}
        {colorOptions.length > 0 && (
          <Col span={12}>
            <Text strong>Warna:</Text>
            <Select
              value={colorOption}
              onChange={onColorOptionChange}
              options={colorOptions}
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Opsi warna"
            />
          </Col>
        )}

        {/* Pages (Books) */}
        {pages !== undefined && onPagesChange && (
          <Col span={12}>
            <Text strong>Jumlah Halaman:</Text>
            <InputNumber
              value={pages}
              onChange={onPagesChange}
              min={8}
              max={2000}
              step={8}
              style={{ width: '100%', marginTop: 8 }}
              formatter={(value) => `${value} halaman`}
              parser={(value) => Number(value?.replace(' halaman', ''))}
            />
          </Col>
        )}

        {/* Ply (NCR) */}
        {ply !== undefined && onPlyChange && (
          <Col span={12}>
            <Text strong>Jumlah Ply:</Text>
            <Select
              value={ply}
              onChange={onPlyChange}
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Ply"
            >
              <Option value={2}>2 Ply (Putih + Kuning)</Option>
              <Option value={3}>3 Ply (Putih + Kuning + Merah)</Option>
              <Option value={4}>4 Ply (Putih + Kuning + Merah + Biru)</Option>
            </Select>
          </Col>
        )}

        {/* Finishing Options */}
        {finishingList.length > 0 && onFinishingChange && (
          <Col span={24}>
            <Text strong>Finishing:</Text>
            <Checkbox.Group
              value={finishingOptions}
              onChange={onFinishingChange as any}
              style={{ display: 'block', marginTop: 8 }}
            >
              <Row>
                {finishingList.map((item) => (
                  <Col span={12} key={item.value} style={{ marginBottom: 8 }}>
                    <Checkbox value={item.value}>
                      {item.label} (+Rp {item.price.toLocaleString('id-ID')})
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default CalcSettingsPanel;
