import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Typography, Button, Space, Breadcrumb, Row, Col, Descriptions, message, Tabs, Statistic } from 'antd';
import { ArrowLeftOutlined, EditOutlined, MailOutlined, PhoneOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../api';
import AccessControl from '../../components/AccessControl';

const { Title, Text } = Typography;

interface Invoice {
    id: number;
    refNumber: string;
    transDate: string;
    status: string;
    total: number;
    paidAmount: number;
}

interface ContactDetail {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    taxId?: string;
    address?: string;
    type: string;
    invoices?: Invoice[];
}

const ContactDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState<ContactDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDetail = async () => {
        try {
            const res = await api.get(`/finance/contacts/${id}`);
            setContact(res.data);
        } catch {
            message.error('Gagal mengambil detail kontak');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!contact) return <div className="p-10 text-center text-red-500">Kontak tidak ditemukan</div>;

    const invoiceColumns = [
        {
            title: 'Nomor',
            dataIndex: 'refNumber',
            key: 'ref',
            render: (text: string, record: Invoice) => (
                <Text strong className="text-primary cursor-pointer" onClick={() => navigate(`/sales/invoices/${record.id}`)}>
                    {text}
                </Text>
            )
        },
        { title: 'Tgl Transaksi', dataIndex: 'transDate', key: 'date', render: (d: string) => new Date(d).toLocaleDateString('id-ID') },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'paid' ? 'green' : 'orange'}>{s.toUpperCase()}</Tag> },
        { title: 'Total', dataIndex: 'total', key: 'total', align: 'right' as const, render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}` },
    ];

    const unpaidBalance = contact.invoices?.reduce((sum: number, inv: Invoice) => sum + (Number(inv.total) - Number(inv.paidAmount)), 0) || 0;

    return (
        <div>
            <Breadcrumb className="mb-4" items={[
                { title: 'Beranda' },
                { title: 'Kontak', onClick: () => navigate('/contacts'), className: 'cursor-pointer' },
                { title: contact.name }
            ]} />

            <div className="flex justify-between items-center mb-6">
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <Title level={3} className="!m-0">{contact.name}</Title>
                    <Tag color="blue">{contact.type.toUpperCase()}</Tag>
                </Space>
                <Space>
                    <AccessControl permission="contacts_update">
                        <Button icon={<EditOutlined />} onClick={() => navigate(`/contacts/add?edit=${id}`)}>Edit Kontak</Button>
                    </AccessControl>
                    <AccessControl permission="invoices_create">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/sales/invoices/add')}>Buat Tagihan</Button>
                    </AccessControl>
                </Space>
            </div>

            <Row gutter={[24, 24]}>
                <Col span={8}>
                    <Card className="shadow-sm rounded-xl mb-6">
                        <Descriptions title="Informasi Kontak" column={1} size="small">
                            <Descriptions.Item label={<MailOutlined />}>{contact.email || '-'}</Descriptions.Item>
                            <Descriptions.Item label={<PhoneOutlined />}>{contact.phone || '-'}</Descriptions.Item>
                            <Descriptions.Item label="NPWP">{contact.taxId || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Alamat">{contact.address || '-'}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card className="shadow-sm rounded-xl bg-primary text-white border-none">
                        <Statistic
                            title={<span className="text-white opacity-80">Saldo Outstanding</span>}
                            value={unpaidBalance}
                            prefix="Rp"
                            groupSeparator="."
                            valueStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>

                <Col span={16}>
                    <Card className="shadow-sm rounded-xl">
                        <Tabs defaultActiveKey="invoices" items={[
                            {
                                key: 'invoices',
                                label: 'Transaksi Terbaru',
                                children: (
                                    <Table
                                        columns={invoiceColumns}
                                        dataSource={contact.invoices}
                                        rowKey="id"
                                        pagination={{ pageSize: 10 }}
                                    />
                                )
                            },
                            {
                                key: 'statement',
                                label: 'Pernyataan Akun',
                                children: <div className="p-10 text-center text-gray-400 italic">Fitur segera hadir...</div>
                            }
                        ]} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ContactDetailPage;
