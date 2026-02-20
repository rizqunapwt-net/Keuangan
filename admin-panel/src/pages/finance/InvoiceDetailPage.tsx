import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Typography, Button, Space, Breadcrumb, Divider, message, Row, Col, Result, Modal, Form, InputNumber, Input, DatePicker } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, EditOutlined, DeleteOutlined, CreditCardOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import api from '../../api';
import AccessControl from '../../components/AccessControl';

const { Title, Text } = Typography;

interface InvoiceItem {
    id: number;
    product?: { name: string };
    qty: number;
    price: number;
    discount: number;
    total: number;
}

interface InvoicePayment {
    id: number;
    transDate: string;
    refNumber: string;
    amount: number;
}

interface InvoiceDetail {
    id: number;
    refNumber: string;
    transDate: string;
    dueDate: string;
    status: string;
    total: number;
    taxTotal: number;
    paidAmount: number;
    contact?: { name: string };
    currency?: { code: string };
    items: InvoiceItem[];
    invoicePayments: InvoicePayment[];
    notes?: string;
    [key: string]: unknown;
}

const InvoiceDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentForm] = Form.useForm();

    const fetchDetail = async () => {
        try {
            const res = await api.get(`/finance/invoices/${id}`);
            setInvoice(res.data);
        } catch {
            message.error('Gagal mengambil detail tagihan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleDelete = () => {
        Modal.confirm({
            title: 'Hapus Tagihan',
            icon: <ExclamationCircleOutlined />,
            content: `Yakin ingin menghapus tagihan ${invoice?.refNumber}? Tindakan ini tidak dapat dibatalkan.`,
            okText: 'Hapus',
            okType: 'danger',
            cancelText: 'Batal',
            onOk: async () => {
                try {
                    await api.put(`/finance/invoices/${id}/status`, { status: 'void' });
                    message.success('Tagihan berhasil dihapus');
                    navigate('/sales/invoices');
                } catch {
                    message.error('Gagal menghapus tagihan');
                }
            },
        });
    };

    const handleRecordPayment = async () => {
        try {
            const values = await paymentForm.validateFields();
            await api.post(`/finance/invoices/${id}/payments`, {
                amount: values.amount,
                refNumber: values.refNumber,
                memo: values.memo,
                transDate: values.transDate?.format('YYYY-MM-DD'),
            });
            message.success('Pembayaran berhasil dicatat');
            setPaymentModalOpen(false);
            paymentForm.resetFields();
            fetchDetail();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            message.error(error.response?.data?.message || 'Gagal mencatat pembayaran');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!invoice) return <Result status="404" title="Tagihan tidak ditemukan" />;

    const itemColumns = [
        { title: 'Produk', dataIndex: ['product', 'name'], key: 'product' },
        { title: 'Qty', dataIndex: 'qty', key: 'qty', align: 'right' as const },
        { title: 'Harga', dataIndex: 'price', key: 'price', align: 'right' as const, render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}` },
        { title: 'Diskon', dataIndex: 'discount', key: 'discount', align: 'right' as const, render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}` },
        { title: 'Total', dataIndex: 'total', key: 'total', align: 'right' as const, render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}` },
    ];

    const paymentColumns = [
        { title: 'Tanggal', dataIndex: 'transDate', key: 'date', render: (d: string) => new Date(d).toLocaleDateString('id-ID') },
        { title: 'Referensi', dataIndex: 'refNumber', key: 'ref' },
        { title: 'Jumlah', dataIndex: 'amount', key: 'amount', align: 'right' as const, render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}` },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[
                { title: 'Beranda' },
                { title: 'Penjualan' },
                { title: 'Tagihan', onClick: () => navigate('/sales/invoices'), className: 'cursor-pointer' },
                { title: invoice.refNumber }
            ]} />

            <div className="flex justify-between items-center mb-6">
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <Title level={3} className="!m-0">{invoice.refNumber}</Title>
                    <Tag color={invoice.status === 'paid' ? 'green' : 'orange'}>{invoice.status.toUpperCase()}</Tag>
                </Space>
                <Space>
                    <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Cetak</Button>
                    <AccessControl permission="invoices_update">
                        <Button icon={<EditOutlined />} onClick={() => navigate(`/sales/invoices/add?edit=${id}`)}>Edit</Button>
                    </AccessControl>
                    <AccessControl permission="invoices_delete">
                        <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>Hapus</Button>
                    </AccessControl>
                    {invoice.status !== 'paid' && (
                        <Button type="primary" icon={<CreditCardOutlined />} size="large" onClick={() => setPaymentModalOpen(true)}>Terima Pembayaran</Button>
                    )}
                </Space>
            </div>

            <Row gutter={[24, 24]}>
                <Col span={16}>
                    <Card title="Item Tagihan" className="shadow-sm rounded-xl mb-6">
                        <Table
                            columns={itemColumns}
                            dataSource={invoice.items}
                            rowKey="id"
                            pagination={false}
                        />
                        <div className="mt-4 flex justify-end">
                            <div className="w-64">
                                <Row justify="space-between" className="mb-2">
                                    <Text type="secondary">Subtotal</Text>
                                    <Text strong>Rp {Number(invoice.total - invoice.taxTotal).toLocaleString('id-ID')}</Text>
                                </Row>
                                <Row justify="space-between" className="mb-2">
                                    <Text type="secondary">Pajak</Text>
                                    <Text strong>Rp {Number(invoice.taxTotal).toLocaleString('id-ID')}</Text>
                                </Row>
                                <Divider className="my-2" />
                                <Row justify="space-between">
                                    <Text strong className="text-lg">Total</Text>
                                    <Text strong className="text-lg text-primary">Rp {Number(invoice.total).toLocaleString('id-ID')}</Text>
                                </Row>
                            </div>
                        </div>
                    </Card>

                    <Card title="Riwayat Pembayaran" className="shadow-sm rounded-xl">
                        <Table
                            columns={paymentColumns}
                            dataSource={invoice.invoicePayments}
                            rowKey="id"
                            pagination={false}
                            locale={{ emptyText: 'Belum ada pembayaran recorded' }}
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title="Informasi Umum" className="shadow-sm rounded-xl mb-6">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Pelanggan">
                                <Text strong className="text-primary">{invoice.contact?.name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tgl Transaksi">
                                {new Date(invoice.transDate).toLocaleDateString('id-ID')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Jatuh Tempo">
                                {new Date(invoice.dueDate).toLocaleDateString('id-ID')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mata Uang">
                                {invoice.currency?.code || 'IDR'}
                            </Descriptions.Item>
                        </Descriptions>
                        {invoice.notes && (
                            <div className="mt-4">
                                <Text type="secondary">Catatan:</Text>
                                <p className="text-gray-600 italic mt-1">{invoice.notes}</p>
                            </div>
                        )}
                    </Card>

                    <AccessControl permission="report_financial">
                        <Card title="Status Keuangan" className="shadow-sm rounded-xl bg-gray-50 border-none">
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Total Tagihan">
                                    Rp {Number(invoice.total).toLocaleString('id-ID')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Sudah Dibayar">
                                    <Text type="success">Rp {Number(invoice.paidAmount).toLocaleString('id-ID')}</Text>
                                </Descriptions.Item>
                                <Divider className="my-2" />
                                <Descriptions.Item label="Sisa Tagihan">
                                    <Text strong type="danger">Rp {Number(invoice.total - invoice.paidAmount).toLocaleString('id-ID')}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </AccessControl>
                </Col>
            </Row>

            <Modal
                title="Terima Pembayaran"
                open={paymentModalOpen}
                onOk={handleRecordPayment}
                onCancel={() => { setPaymentModalOpen(false); paymentForm.resetFields(); }}
                okText="Simpan"
                cancelText="Batal"
            >
                <Form form={paymentForm} layout="vertical">
                    <Form.Item name="amount" label="Jumlah Pembayaran" rules={[{ required: true, message: 'Masukkan jumlah' }]}>
                        <InputNumber
                            min={0.01}
                            max={Number(invoice.total) - Number(invoice.paidAmount)}
                            style={{ width: '100%' }}
                            formatter={v => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        />
                    </Form.Item>
                    <Form.Item name="transDate" label="Tanggal Pembayaran">
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="refNumber" label="No. Referensi">
                        <Input placeholder="Opsional" />
                    </Form.Item>
                    <Form.Item name="memo" label="Catatan">
                        <Input.TextArea rows={2} placeholder="Opsional" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default InvoiceDetailPage;
