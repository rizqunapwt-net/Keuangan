import React from 'react';
import { Card, Typography, Tag, Empty } from 'antd';

const { Title, Paragraph } = Typography;

const PenjualanBukuPage: React.FC = () => {
    return (
        <div>
            <Title level={4}>Penjualan Buku</Title>
            <Card>
                <Empty description="Fitur Penjualan Buku sedang dalam pengembangan" />
                <Paragraph type="secondary" style={{ textAlign: 'center', marginTop: 16 }}>
                    Modul ini akan menampilkan data penjualan dan royalti buku.
                    <br />
                    <Tag color="blue">Coming Soon</Tag>
                </Paragraph>
            </Card>
        </div>
    );
};

export default PenjualanBukuPage;
