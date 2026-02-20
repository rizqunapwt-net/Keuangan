import React from 'react';
import { Card, Typography, Tag, Empty } from 'antd';

const { Title, Paragraph } = Typography;

const AssignmentPage: React.FC = () => {
    return (
        <div>
            <Title level={4}>Assignment Buku</Title>
            <Card>
                <Empty description="Fitur Assignment sedang dalam pengembangan" />
                <Paragraph type="secondary" style={{ textAlign: 'center', marginTop: 16 }}>
                    Modul ini akan menghubungkan penulis dengan proyek buku.
                    <br />
                    <Tag color="blue">Coming Soon</Tag>
                </Paragraph>
            </Card>
        </div>
    );
};

export default AssignmentPage;
