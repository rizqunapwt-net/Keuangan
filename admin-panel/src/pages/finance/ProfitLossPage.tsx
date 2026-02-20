import { Card, Typography, Space, DatePicker, Row, Col, Statistic, Table, Breadcrumb, message, Button } from 'antd';
import { PrinterOutlined, ExportOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import api from '../../api';
import { useState, useEffect } from 'react';

interface ProfitLossData {
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
}

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ProfitLossPage: React.FC = () => {
    const [data, setData] = useState<ProfitLossData | null>(null);
    const [dates, setDates] = useState<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs()]);

    const fetchReport = async () => {
        try {
            const response = await api.get('/reports/profit-loss', {
                params: {
                    startDate: dates[0].format('YYYY-MM-DD'),
                    endDate: dates[1].format('YYYY-MM-DD'),
                }
            });
            setData(response.data);
        } catch {
            message.error('Gagal mengambil laporan Laba Rugi');
        } finally {
            // Done
        }
    };

    useEffect(() => {
        fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dates]);

    const reportItems = [
        { key: '1', title: 'Pendapatan Penjualan', amount: data?.totalRevenue || 0, type: 'revenue' },
        { key: '2', title: 'Beban Operasional', amount: data?.totalExpense || 0, type: 'expense' },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Laporan' }, { title: 'Laba Rugi' }]} />

            <div className="flex justify-between items-center mb-6">
                <Title level={3} className="!m-0">Laba Rugi</Title>
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
                <Col span={8}>
                    <Card className="shadow-sm border-gray-100 rounded-xl">
                        <Statistic
                            title="Total Pendapatan"
                            value={data?.totalRevenue || 0}
                            prefix="Rp"
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card className="shadow-sm border-gray-100 rounded-xl">
                        <Statistic
                            title="Total Beban"
                            value={data?.totalExpense || 0}
                            prefix="Rp"
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card className={`shadow-sm border-gray-100 rounded-xl ${(data?.netProfit ?? 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <Statistic
                            title="Laba Bersih"
                            value={data?.netProfit || 0}
                            prefix="Rp"
                            valueStyle={{ color: (data?.netProfit ?? 0) >= 0 ? '#3f8600' : '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-gray-100 rounded-xl" title="Rincian Laporan">
                <Table
                    pagination={false}
                    columns={[
                        { title: 'Keterangan', dataIndex: 'title', key: 'title' },
                        {
                            title: 'Total',
                            dataIndex: 'amount',
                            key: 'amount',
                            align: 'right',
                            render: (val) => <Text strong>Rp {Number(val).toLocaleString('id-ID')}</Text>
                        }
                    ]}
                    dataSource={reportItems}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row className="bg-gray-50 font-bold">
                                <Table.Summary.Cell index={0}>LABA BERSIH</Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="right">
                                    Rp {Number(data?.netProfit || 0).toLocaleString('id-ID')}
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </Card>
        </div>
    );
};

export default ProfitLossPage;
