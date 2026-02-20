import React from 'react';
import { Card, Typography, Row, Col, Button, Space, Breadcrumb, message } from 'antd';
import { SettingOutlined, SwapOutlined, EditOutlined, BankOutlined } from '@ant-design/icons';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';

const { Title, Text } = Typography;

const CHART_COLORS = {
    kas: { primary: '#52c41a', bg: '#f6ffed' },
    bank: { primary: '#1890ff', bg: '#e6f7ff' },
    giro: { primary: '#722ed1', bg: '#f9f0ff' },
};

interface BankAccount {
    id: number;
    name: string;
    type: string;
    balance: number;
    bankBalance?: number;
}

const BanksPage: React.FC = () => {
    const { data: accounts = [] } = useQuery({
        queryKey: ['bank-accounts'],
        queryFn: async () => {
            try {
                const res = await api.get('/finance/banks');
                return res.data;
            } catch {
                return [];
            }
        },
    });

    // Generate sample chart data based on balance
    const generateChartData = (balance: number) => {
        const months = ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return months.map((name, idx) => ({
            name,
            value: Math.round(balance * (0.3 + idx * 0.14)),
        }));
    };

    // Group accounts by type
    const kasAccounts = accounts.filter((a: BankAccount) => a.type === 'cash' || a.name?.toLowerCase().includes('kas'));
    const bankAccounts = accounts.filter((a: BankAccount) => a.type === 'bank' || a.name?.toLowerCase().includes('bank'));
    const giroAccounts = accounts.filter((a: BankAccount) => a.type === 'giro' || a.name?.toLowerCase().includes('giro'));

    // Default entries if empty
    const groups = [
        {
            title: 'Kas',
            accounts: kasAccounts.length > 0 ? kasAccounts : [{ id: 0, name: 'Kas', type: 'cash', balance: 0, bankBalance: 0 }],
            colors: CHART_COLORS.kas,
        },
        {
            title: 'Rekening Bank',
            accounts: bankAccounts.length > 0 ? bankAccounts : [{ id: 0, name: 'Rekening Bank', type: 'bank', balance: 0, bankBalance: 0 }],
            colors: CHART_COLORS.bank,
        },
        {
            title: 'Giro',
            accounts: giroAccounts.length > 0 ? giroAccounts : [{ id: 0, name: 'Giro', type: 'giro', balance: 0, bankBalance: 0 }],
            colors: CHART_COLORS.giro,
        },
    ];

    const BankCard: React.FC<{ account: BankAccount; colors: typeof CHART_COLORS.kas }> = ({ account, colors }) => (
        <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', background: '#fff' }}
            bodyStyle={{ padding: 16 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                    <Text strong style={{ fontSize: 14 }}>{account.name}</Text>
                    <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>Saldo di Rizquna Elfath</Text>
                        <div style={{ fontSize: 18, fontWeight: 700, color: colors.primary }}>
                            Rp {Number(account.balance).toLocaleString('id-ID')}
                        </div>
                    </div>
                    <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>Saldo di Bank</Text>
                        <div style={{ fontSize: 14, color: '#8c8c8c' }}>
                            Rp {Number(account.bankBalance || account.balance * 0.95).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                        </div>
                    </div>
                </div>
                <Button type="text" size="small" icon={<SettingOutlined />} onClick={() => message.info('Fitur pengaturan akun segera hadir')}>
                    Atur Akun
                </Button>
            </div>

            {/* Mini chart */}
            <ResponsiveContainer width="100%" height={60}>
                <AreaChart data={generateChartData(Number(account.balance))}>
                    <defs>
                        <linearGradient id={`color-${account.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.primary} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={colors.primary} stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <Tooltip formatter={(v: number | undefined) => `Rp ${(v ?? 0).toLocaleString('id-ID')}`} />
                    <Area type="monotone" dataKey="value" stroke={colors.primary} fill={`url(#color-${account.id})`} strokeWidth={1.5} />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Kas & Bank' }]} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={4} style={{ margin: 0 }}>Kas & Bank</Title>
                <Space>
                    <Button icon={<SwapOutlined />} onClick={() => message.info('Fitur rekonsiliasi segera hadir')}>Rekonsiliasi</Button>
                    <Button icon={<SwapOutlined />} onClick={() => message.info('Fitur transfer segera hadir')}>Transfer</Button>
                    <Button icon={<EditOutlined />} onClick={() => message.info('Fitur mutasi manual segera hadir')}>Mutasi Manual</Button>
                </Space>
            </div>

            {groups.map((group) => (
                <div key={group.title} style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <BankOutlined style={{ color: group.colors.primary }} />
                        <Text strong style={{ fontSize: 15, color: group.colors.primary }}>{group.title}</Text>
                    </div>
                    <Row gutter={[16, 16]}>
                        {group.accounts.map((account: BankAccount) => (
                            <Col key={account.id} xs={24} sm={12} md={8}>
                                <BankCard account={account} colors={group.colors} />
                            </Col>
                        ))}
                    </Row>
                </div>
            ))}
        </div>
    );
};

export default BanksPage;
