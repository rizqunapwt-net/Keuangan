import React, { useState, useEffect } from 'react';
import { Card, Input, Row, Col, Typography, Badge, Spin, Empty } from 'antd';
import { Search, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../../stores/cartStore';
import api from '../../../api';

const { Title, Text } = Typography;

const ProductGrid: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const { addItem } = useCartStore();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/finance/products', {
        params: { search, limit: 20 }
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
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
    <div className="product-grid-container">
      <div className="search-header" style={{ marginBottom: 20 }}>
        <Input
          size="large"
          placeholder="Cari nama produk atau SKU..."
          prefix={<Search size={20} color="#9ca3af" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" tip="Memuat produk..." />
        </div>
      ) : products.length > 0 ? (
        <Row gutter={[16, 16]}>
          {products.map((product) => (
            <Col xs={12} sm={8} md={6} lg={6} xl={4} key={product.id}>
              <Card
                hoverable
                cover={
                  <div style={{ height: 120, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingCart size={40} color="#d1d5db" />
                  </div>
                }
                onClick={() => product.stock_qty > 0 && addItem(product)}
                style={{ height: '100%', opacity: product.stock_qty <= 0 ? 0.6 : 1 }}
                bodyStyle={{ padding: '12px' }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Text strong ellipsis={{ tooltip: product.name }} style={{ display: 'block' }}>
                    {product.name}
                  </Text>
                  <Text type="secondary" size="small" style={{ fontSize: '11px' }}>
                    SKU: {product.sku}
                  </Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Title level={5} style={{ margin: 0, color: '#059669' }}>
                    {formatIDR(product.unit_price)}
                  </Title>
                  <Badge 
                    count={`Stok: ${product.stock_qty}`} 
                    style={{ backgroundColor: product.stock_qty <= 5 ? '#ef4444' : '#6b7280', fontSize: '10px' }} 
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="Tidak ada produk ditemukan" />
      )}
    </div>
  );
};

export default ProductGrid;
