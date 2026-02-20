import { Collapse, Typography, Breadcrumb, Space, Tag, List } from 'antd';
import {
    ShopOutlined, AppstoreOutlined, LayoutOutlined, TeamOutlined,
    DatabaseOutlined, ApiOutlined, RightOutlined,
    FileTextOutlined, SafetyOutlined, GlobalOutlined,
    MailOutlined, WhatsAppOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface SettingItem {
    title: string;
    description: string;
    route?: string;
    tag?: string;
    icon?: React.ReactNode;
}

const settingGroups = [
    {
        key: 'company',
        icon: <ShopOutlined style={{ color: '#1890ff' }} />,
        title: 'Perusahaan',
        items: [
            { title: 'Billing', description: 'Kelola paket langganan dan pembayaran', icon: <FileTextOutlined /> },
            { title: 'Data Perusahaan', description: 'Nama, alamat, NPWP, dan informasi perusahaan', route: '/settings/company', icon: <ShopOutlined /> },
            { title: 'Multi-Cabang', description: 'Kelola cabang dan unit bisnis', tag: 'Pro', icon: <GlobalOutlined /> },
        ],
    },
    {
        key: 'workflow',
        icon: <AppstoreOutlined style={{ color: '#52c41a' }} />,
        title: 'Alur Bisnis',
        items: [
            { title: 'Penomoran Otomatis', description: 'Konfigurasi format nomor transaksi', icon: <FileTextOutlined /> },
            { title: 'Pemetaan Akun', description: 'Mapping akun default untuk transaksi', icon: <DatabaseOutlined /> },
            { title: 'Approval', description: 'Alur persetujuan transaksi', tag: 'Pro', icon: <SafetyOutlined /> },
            { title: 'Audit Trail', description: 'Log aktivitas pengguna', icon: <FileTextOutlined /> },
        ],
    },
    {
        key: 'layout',
        icon: <LayoutOutlined style={{ color: '#722ed1' }} />,
        title: 'Layout & Template',
        items: [
            { title: 'Layout Invoice', description: 'Desain dan kustomisasi layout faktur penjualan', icon: <FileTextOutlined /> },
            { title: 'Layout Laporan', description: 'Desain kop surat dan laporan keuangan', icon: <FileTextOutlined /> },
            { title: 'Template Email', description: 'Template email untuk pengiriman invoice', icon: <MailOutlined /> },
            { title: 'Template WhatsApp', description: 'Template pesan WhatsApp untuk notifikasi', icon: <WhatsAppOutlined /> },
        ],
    },
    {
        key: 'users',
        icon: <TeamOutlined style={{ color: '#fa8c16' }} />,
        title: 'Akun & Pengguna',
        items: [
            { title: 'Daftar User', description: 'Kelola pengguna dan undang anggota baru', icon: <TeamOutlined /> },
            { title: 'Roles & Permissions', description: 'Atur hak akses dan peran pengguna', icon: <SafetyOutlined /> },
        ],
    },
    {
        key: 'master',
        icon: <DatabaseOutlined style={{ color: '#eb2f96' }} />,
        title: 'Data Master',
        items: [
            { title: 'Pajak', description: 'Konfigurasi tarif pajak (PPN, PPh, dll)', icon: <FileTextOutlined /> },
            { title: 'Mata Uang', description: 'Kelola mata uang dan kurs', route: '/settings/currencies', icon: <GlobalOutlined /> },
            { title: 'Tag', description: 'Label/tag untuk menandai transaksi', icon: <FileTextOutlined /> },
            { title: 'Satuan', description: 'Satuan produk (pcs, kg, liter, dll)', icon: <FileTextOutlined /> },
            { title: 'Backup Data', description: 'Backup dan restore data perusahaan', icon: <DatabaseOutlined /> },
        ],
    },
    {
        key: 'integration',
        icon: <ApiOutlined style={{ color: '#13c2c2' }} />,
        title: 'Integrasi',
        items: [
            { title: 'Marketplace', description: 'Hubungkan dengan Tokopedia, Shopee, dll', route: '/settings/marketplace', icon: <AppstoreOutlined /> },
            { title: 'Payment Gateway', description: 'Integrasi pembayaran online', route: '/settings/payments', icon: <FileTextOutlined /> },
            { title: 'Webhooks & API', description: 'Konfigurasi webhook dan API key', icon: <ApiOutlined /> },
            { title: 'WhatsApp', description: 'Integrasi notifikasi WhatsApp', icon: <WhatsAppOutlined /> },
        ],
    },
];

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Pengaturan' }]} />
            <Title level={4} style={{ marginBottom: 20 }}>Pengaturan</Title>

            <Collapse
                defaultActiveKey={['company']}
                expandIconPosition="end"
                style={{ background: '#fff', borderRadius: 8 }}
            >
                {settingGroups.map((group) => (
                    <Panel
                        key={group.key}
                        header={
                            <Space>
                                {group.icon}
                                <Text strong style={{ fontSize: 14 }}>{group.title}</Text>
                            </Space>
                        }
                    >
                        <List
                            dataSource={group.items}
                            renderItem={(item: SettingItem) => (
                                <List.Item
                                    onClick={() => item.route && navigate(item.route)}
                                    style={{
                                        cursor: item.route ? 'pointer' : 'default',
                                        padding: '12px 16px',
                                        borderRadius: 6,
                                        transition: 'background 0.2s',
                                    }}
                                    extra={item.route ? <RightOutlined style={{ color: '#d9d9d9' }} /> : null}
                                >
                                    <List.Item.Meta
                                        avatar={<div style={{ paddingTop: 4, color: '#8c8c8c' }}>{item.icon}</div>}
                                        title={
                                            <Space>
                                                <Text style={{ fontSize: 13 }}>{item.title}</Text>
                                                {item.tag && <Tag color="blue" style={{ fontSize: 10 }}>{item.tag}</Tag>}
                                            </Space>
                                        }
                                        description={<Text type="secondary" style={{ fontSize: 11 }}>{item.description}</Text>}
                                    />
                                </List.Item>
                            )}
                        />
                    </Panel>
                ))}
            </Collapse>
        </div>
    );
};

export default SettingsPage;
