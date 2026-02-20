import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, DatePicker, Row, Col, Statistic, Breadcrumb, message, Button } from 'antd';
import { DollarOutlined, PrinterOutlined, ExportOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import api from '../../api';

interface CashFlowData {
    netCashFlow: number;
}

const { Title } = Typography;
const { RangePicker } = DatePicker;

const CashFlowPage: React.FC = () => {
    const [data, setData] = useState<CashFlowData | null>(null);
    const [dates, setDates] = useState<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs()]);

    const fetchReport = async () => {
        try {
            const response = await api.get('/reports/cash-flow', {
                params: {
                    startDate: dates[0].format('YYYY-MM-DD'),
                    endDate: dates[1].format('YYYY-MM-DD'),
                }
            });
            setData(response.data);
        } catch {
            message.error('Gagal mengambil laporan Arus Kas');
        }
    };

    useEffect(() => {
        fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dates]);

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Laporan' }, { title: 'Arus Kas' }]} />

            <div className="flex justify-between items-center mb-6">
                <Title level={3} className="!m-0">Arus Kas</Title>
                <Space>
                    <RangePicker
                        value={dates}
                        onChange={(val) => val && setDates(val as [Dayjs, Dayjs])}
                        className="rounded-lg"
                    />
                    <Button icon={<PrinterOutlined />}>Cetak</Button>
                    <Button type="primary" icon={<ExportOutlined />}>Export PDF</Button>
                </Space>
            </div>

            <Row gutter={[16, 16]} className="mb-6">
                <Col span={24}>
                    <Card className={`shadow-sm border-gray-100 rounded-xl ${(data?.netCashFlow ?? 0) >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                        <Statistic
                            title="Net Cash Flow"
                            value={data?.netCashFlow || 0}
                            prefix={<DollarOutlined />}
                            suffix="IDR"
                            valueStyle={{ color: (data?.netCashFlow ?? 0) >= 0 ? '#0958d9' : '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-gray-100 rounded-xl" title="Ringkasan Periode">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-600">Total Arus Kas Masuk/Keluar Bersih</span>
                    <span className={`text-xl font-bold ${(data?.netCashFlow ?? 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        Rp {Number(data?.netCashFlow || 0).toLocaleString('id-ID')}
                    </span>
                </div>
            </Card>
        </div>
    );
};

export default CashFlowPage;
