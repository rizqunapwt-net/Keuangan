import React, { useState, useEffect } from 'react';
import { Card, Tabs, DatePicker, Button, Table, Typography, Space, Divider, Row, Col, Spin, Alert } from 'antd';
import { Download, FileText, BarChart3, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import api from '../../../api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pl');
  const [loading, setLoading] = useState(false);
  const [dateRange, setRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs()]);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    fetchReport();
  }, [activeTab, dateRange]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      const params: any = {};

      if (activeTab === 'pl') {
        endpoint = '/finance/reports/profit-loss';
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      } else if (activeTab === 'bs') {
        endpoint = '/finance/reports/balance-sheet';
        params.as_of = dateRange[1].format('YYYY-MM-DD');
      } else if (activeTab === 'cf') {
        endpoint = '/finance/reports/cash-flow';
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }

      const response = await api.get(endpoint, { params });
      setReportData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  const renderPL = () => (
    <div style={{ padding: '20px' }}>
      <Row gutter={24}>
        <Col span={12}>
          <Title level={4}>Pendapatan</Title>
          <Table 
            dataSource={reportData?.revenues?.items || []} 
            pagination={false} 
            size="small"
            columns={[
              { title: 'Akun', dataIndex: 'name', key: 'name' },
              { title: 'Jumlah', dataIndex: 'balance', key: 'balance', align: 'right', render: formatIDR }
            ]}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontWeight: 'bold' }}>
            <Text>Total Pendapatan</Text>
            <Text>{formatIDR(reportData?.revenues?.total)}</Text>
          </div>
        </Col>
        <Col span={12}>
          <Title level={4}>Biaya & Beban</Title>
          <Table 
            dataSource={reportData?.expenses?.items || []} 
            pagination={false} 
            size="small"
            columns={[
              { title: 'Akun', dataIndex: 'name', key: 'name' },
              { title: 'Jumlah', dataIndex: 'balance', key: 'balance', align: 'right', render: formatIDR }
            ]}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontWeight: 'bold' }}>
            <Text>Total Biaya</Text>
            <Text>{formatIDR(reportData?.expenses?.total)}</Text>
          </div>
        </Col>
      </Row>
      <Divider />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">Laba (Rugi) Bersih</Text>
          <Title level={2} style={{ margin: 0, color: (reportData?.net_profit >= 0 ? '#059669' : '#dc2626') }}>
            {formatIDR(reportData?.net_profit)}
          </Title>
        </div>
      </div>
    </div>
  );

  const renderBS = () => (
    <div style={{ padding: '20px' }}>
      <Row gutter={48}>
        <Col span={12}>
          <Title level={4}>Aset (Aktiva)</Title>
          <Table 
            dataSource={reportData?.assets?.items || []} 
            pagination={false} 
            size="small"
            columns={[
              { title: 'Akun', dataIndex: 'name', key: 'name' },
              { title: 'Jumlah', dataIndex: 'balance', key: 'balance', align: 'right', render: formatIDR }
            ]}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontWeight: 'bold' }}>
            <Text>Total Aset</Text>
            <Text>{formatIDR(reportData?.assets?.total)}</Text>
          </div>
        </Col>
        <Col span={12}>
          <Title level={4}>Kewajiban & Ekuitas (Passiva)</Title>
          <Text strong>Kewajiban (Hutang)</Text>
          <Table 
            dataSource={reportData?.liabilities?.items || []} 
            pagination={false} 
            size="small"
            columns={[
              { title: 'Akun', dataIndex: 'name', key: 'name' },
              { title: 'Jumlah', dataIndex: 'balance', key: 'balance', align: 'right', render: formatIDR }
            ]}
          />
          <Divider style={{ margin: '12px 0' }} />
          <Text strong>Ekuitas (Modal)</Text>
          <Table 
            dataSource={[
              ...(reportData?.equity?.items || []),
              { name: 'Laba Tahun Berjalan', balance: reportData?.equity?.current_earnings }
            ]} 
            pagination={false} 
            size="small"
            showHeader={false}
            columns={[
              { title: 'Akun', dataIndex: 'name', key: 'name' },
              { title: 'Jumlah', dataIndex: 'balance', key: 'balance', align: 'right', render: formatIDR }
            ]}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontWeight: 'bold' }}>
            <Text>Total Passiva</Text>
            <Text>{formatIDR(reportData?.liabilities?.total + reportData?.equity?.total)}</Text>
          </div>
        </Col>
      </Row>
      {!reportData?.is_balanced && (
        <Alert message="Neraca tidak seimbang! Periksa entri jurnal Anda." type="warning" style={{ marginTop: '20px' }} showIcon />
      )}
    </div>
  );

  const handleExportPdf = () => {
    const start = dateRange[0].format('YYYY-MM-DD');
    const end = dateRange[1].format('YYYY-MM-DD');
    const token = localStorage.getItem('token');
    
    // Gunakan window.open untuk memicu download browser
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/finance/reports/profit-loss/pdf?start_date=${start}&end_date=${end}&token=${token}`, '_blank');
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Laporan Keuangan</Title>
          <Text type="secondary">Analisis performa bisnis Rizquna Kasir</Text>
        </div>
        <Space>
          <RangePicker 
            value={dateRange} 
            onChange={(v) => v && setRange(v as [Dayjs, Dayjs])} 
            allowClear={false}
          />
          <Button icon={<Download size={16} />} type="primary" onClick={handleExportPdf}>Export PDF</Button>
        </Space>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'pl', label: <span><TrendingUp size={16} style={{ marginRight: 8 }} /> Laba Rugi</span>, children: loading ? <Spin style={{ width: '100%', padding: '50px' }} /> : renderPL() },
            { key: 'bs', label: <span><Wallet size={16} style={{ marginRight: 8 }} /> Neraca</span>, children: loading ? <Spin style={{ width: '100%', padding: '50px' }} /> : renderBS() },
            { key: 'cf', label: <span><BarChart3 size={16} style={{ marginRight: 8 }} /> Arus Kas</span>, children: loading ? <Spin style={{ width: '100%', padding: '50px' }} /> : <div style={{ padding: '20px' }}><Text>Laporan Arus Kas Tersedia.</Text></div> },
          ]}
        />
      </Card>
    </div>
  );
};

export default ReportsPage;
