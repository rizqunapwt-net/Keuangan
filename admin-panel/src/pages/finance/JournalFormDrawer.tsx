import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, Button, Select, DatePicker, message, Space, InputNumber, Row, Col, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../../api';

const { Text } = Typography;

interface JournalFormDrawerProps {
    open: boolean;
    onClose: () => void;
}

const JournalFormDrawer: React.FC<JournalFormDrawerProps> = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [totals, setTotals] = useState({ debit: 0, credit: 0 });

    const { data: accounts = [] } = useQuery({
        queryKey: ['accountsForJournal'],
        queryFn: async () => {
            const res = await api.get('/finance/accounts');
            return res.data?.data || res.data || [];
        },
        enabled: open
    });

    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({
                transDate: dayjs(),
                memo: '',
                items: [
                    { accountId: null, debit: 0, credit: 0 },
                    { accountId: null, debit: 0, credit: 0 },
                ]
            });
            setTotals({ debit: 0, credit: 0 });
        }
    }, [open, form]);

    const handleValuesChange = (_: any, allValues: any) => {
        let debit = 0;
        let credit = 0;
        if (allValues.items && Array.isArray(allValues.items)) {
            allValues.items.forEach((item: any) => {
                debit += Number(item?.debit || 0);
                credit += Number(item?.credit || 0);
            });
        }
        setTotals({ debit, credit });
    };

    const submitMutation = useMutation({
        mutationFn: async (values: any) => {
            if (totals.debit !== totals.credit) {
                throw new Error('Total Debit dan Kredit harus seimbang (Balance).');
            }
            if (totals.debit === 0) {
                throw new Error('Total jurnal tidak boleh 0.');
            }

            const payload = {
                ...values,
                transDate: values.transDate.format('YYYY-MM-DD'),
                items: values.items.filter((i: any) => i.accountId && (Number(i.debit) > 0 || Number(i.credit) > 0))
            };
            return await api.post('/finance/journals', payload);
        },
        onSuccess: () => {
            message.success('Jurnal berhasil disimpan!');
            queryClient.invalidateQueries({ queryKey: ['journals'] });
            onClose();
        },
        onError: (err: any) => {
            message.error(err.message || err.response?.data?.message || 'Gagal menyimpan jurnal');
        }
    });

    return (
        <Drawer
            title="Buat Jurnal Umum"
            width={600}
            onClose={onClose}
            open={open}
            extra={
                <Space>
                    <Button onClick={onClose}>Batal</Button>
                    <Button
                        type="primary"
                        loading={submitMutation.isPending}
                        onClick={() => form.submit()}
                        disabled={totals.debit !== totals.credit || totals.debit === 0}
                    >
                        Simpan Jurnal
                    </Button>
                </Space>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={(values) => submitMutation.mutate(values)}
                onValuesChange={handleValuesChange}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="transDate" label="Tanggal Transaksi" rules={[{ required: true }]}>
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="memo" label="Catatan / Memo" rules={[{ required: true, message: 'Wajib diisi' }]}>
                            <Input placeholder="Contoh: Penyesuaian akhir bulan" />
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 600 }}>Baris Jurnal:</div>
                <Form.List name="items">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                                    <Col span={10}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'accountId']}
                                            rules={[{ required: true, message: 'Pilih Akun' }]}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Select
                                                showSearch
                                                optionFilterProp="children"
                                                placeholder="Pilih Akun"
                                                options={accounts.map((a: any) => ({
                                                    value: a.id,
                                                    label: `${a.code} - ${a.name}`
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'debit']}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={0}
                                                formatter={(value: any) => `${value || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                                placeholder="Debit"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'credit']}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={0}
                                                formatter={(value: any) => `${value || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                                placeholder="Kredit"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => remove(name)}
                                            disabled={fields.length <= 2}
                                        />
                                    </Col>
                                </Row>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ marginTop: 8 }}>
                                    Tambah Baris
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <div style={{ marginTop: 16, padding: '12px 16px', background: '#fafafa', borderRadius: 6 }}>
                    <Row gutter={8}>
                        <Col span={10} style={{ textAlign: 'right', fontWeight: 600 }}>Total:</Col>
                        <Col span={6} style={{ color: totals.debit !== totals.credit ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>
                            Rp {totals.debit.toLocaleString('id-ID')}
                        </Col>
                        <Col span={6} style={{ color: totals.debit !== totals.credit ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>
                            Rp {totals.credit.toLocaleString('id-ID')}
                        </Col>
                        <Col span={2}></Col>
                    </Row>
                    {totals.debit !== totals.credit && (
                        <Row style={{ marginTop: 8 }}>
                            <Col span={24}>
                                <Text type="danger" style={{ fontSize: 13 }}>
                                    Menunggu Balance: Selisih Rp {Math.abs(totals.debit - totals.credit).toLocaleString('id-ID')}
                                </Text>
                            </Col>
                        </Row>
                    )}
                </div>
            </Form>
        </Drawer>
    );
};

export default JournalFormDrawer;
