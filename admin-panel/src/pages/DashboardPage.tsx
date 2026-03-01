import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Tag, Typography, Spin } from 'antd';
import {
  TrendingUp,
  ArrowUpRight,
  Receipt,
  Wallet,
  Calculator,
  Activity,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../api';
import './DashboardPage.css';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="Mempersiapkan data keuangan..." />
      </div>
    );
  }

  const summary = stats?.summary || {};
  const chartData = stats?.charts?.salesTrend || [];
  const recentTransactions = stats?.recentTransactions || [];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-modern">
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Ringkasan Finansial</Title>
          <Text type="secondary"><Calendar size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</Text>
        </div>
        <div className="header-status">
          <Tag icon={<Activity size={12} />} color="success">Sistem Online</Tag>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card-modern stat-blue">
            <div className="stat-icon-wrap"><TrendingUp size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Total Penjualan</span>
              <span className="stat-value">{formatIDR(summary.totalSales)}</span>
              <span className="stat-footer"><ArrowUpRight size={14} /> +12% dari bulan lalu</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card-modern stat-purple">
            <div className="stat-icon-wrap"><Receipt size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Total Pengeluaran</span>
              <span className="stat-value">{formatIDR(summary.totalExpenses)}</span>
              <span className="stat-footer">Stabil</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card-modern stat-amber">
            <div className="stat-icon-wrap"><Wallet size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Piutang Pending</span>
              <span className="stat-value">{formatIDR(summary.outstandingInvoices)}</span>
              <span className="stat-footer">Menunggu Pelunasan</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card-modern stat-emerald">
            <div className="stat-icon-wrap"><Calculator size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Laba Bersih</span>
              <span className="stat-value">{formatIDR(summary.netProfit)}</span>
              <span className="stat-footer">Estimasi Profitabilitas</span>
            </div>
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={<span style={{ fontWeight: 700 }}>Grafik Tren Penjualan</span>} className="chart-card-modern">
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `Rp ${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(v: any) => [formatIDR(v), 'Penjualan']}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<span style={{ fontWeight: 700 }}>Transaksi Terbaru</span>} className="table-card-modern">
            <Table
              dataSource={recentTransactions}
              rowKey="id"
              pagination={false}
              size="middle"
              columns={[
                { 
                  title: 'Tanggal', 
                  dataIndex: 'date', 
                  render: (d) => <Text style={{ fontSize: 12 }}>{d.split(' ')[0]}</Text> 
                },
                { 
                  title: 'Jumlah', 
                  dataIndex: 'amount', 
                  align: 'right',
                  render: (a) => <Text strong style={{ color: '#1e293b' }}>{formatIDR(a)}</Text> 
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  render: (s) => (
                    <Tag color={s === 'paid' ? 'success' : 'warning'} style={{ borderRadius: '6px', fontWeight: 600 }}>
                      {s.toUpperCase()}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
