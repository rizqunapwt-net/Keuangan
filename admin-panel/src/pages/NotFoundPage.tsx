import React from 'react';
import { Result, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { RocketOutlined } from '@ant-design/icons';

const { Text } = Typography;

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <Result
                icon={<RocketOutlined style={{ fontSize: '72px', color: '#6366f1' }} />}
                title={<span className="text-3xl font-bold">404 - Tersesat?</span>}
                subTitle={
                    <div className="flex flex-col gap-2">
                        <Text type="secondary">Halaman yang Anda cari tidak ditemukan atau sedang dalam pengembangan.</Text>
                        <Text type="secondary">Jangan khawatir, data Anda tetap aman di orbit.</Text>
                    </div>
                }
                extra={
                    <Button
                        type="primary"
                        size="large"
                        className="bg-indigo-600 border-none h-12 px-8 rounded-full font-bold shadow-lg shadow-indigo-200"
                        onClick={() => navigate('/')}
                    >
                        Kembali ke Beranda
                    </Button>
                }
            />
        </div>
    );
};

export default NotFoundPage;
