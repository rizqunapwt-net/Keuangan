import React, { useState } from 'react';
import { Collapse, Typography, Breadcrumb, Input, Card } from 'antd';
import { SearchOutlined, QuestionCircleOutlined, BookOutlined, PlayCircleOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const faqData = [
    {
        category: 'Akun & Billing',
        items: [
            { q: 'Bagaimana cara mengubah paket langganan?', a: 'Masuk ke Pengaturan > Perusahaan > Billing, lalu pilih paket yang diinginkan. Perubahan akan berlaku di periode billing berikutnya.' },
            { q: 'Berapa batas pengguna yang bisa ditambahkan?', a: 'Tergantung paket Anda. Paket Pro mendukung hingga 20 pengguna, sedangkan paket Elite unlimited.' },
            { q: 'Bagaimana cara menambahkan pengguna baru?', a: 'Masuk ke Pengaturan > Akun & Pengguna > Daftar User, klik tombol "Tambah User" dan isi form undangan.' },
        ],
    },
    {
        category: 'Penjualan',
        items: [
            { q: 'Bagaimana cara membuat invoice?', a: 'Klik menu Penjualan > Tagihan Penjualan > Tambah, isi data pelanggan dan produk, lalu simpan.' },
            { q: 'Bagaimana cara mengirim invoice ke pelanggan?', a: 'Buka detail invoice, klik tombol "Kirim Email" atau "Kirim WhatsApp" untuk mengirim ke pelanggan.' },
            { q: 'Bagaimana cara mencatat pembayaran invoice?', a: 'Buka detail invoice, klik "Terima Pembayaran", pilih akun kas/bank, masukkan jumlah, dan simpan.' },
            { q: 'Apa perbedaan Pemesanan dan Tagihan?', a: 'Pemesanan (Sales Order) adalah komitmen pelanggan untuk membeli, sedangkan Tagihan (Invoice) adalah permintaan pembayaran resmi.' },
        ],
    },
    {
        category: 'Pembelian',
        items: [
            { q: 'Bagaimana cara mencatat pembelian?', a: 'Klik menu Pembelian > Tagihan Pembelian > Tambah, isi data vendor dan produk yang dibeli.' },
            { q: 'Bagaimana cara membuat Purchase Order?', a: 'Masuk ke Pembelian > Pesanan Pembelian > Tambah, isi data vendor dan item yang ingin dipesan.' },
        ],
    },
    {
        category: 'Produk & Inventori',
        items: [
            { q: 'Bagaimana cara menambahkan produk baru?', a: 'Klik menu Produk > Tambah Produk, isi SKU, nama, harga beli/jual, satuan, dan simpan.' },
            { q: 'Bagaimana cara melakukan penyesuaian stok?', a: 'Masuk ke Inventori > Penyesuaian Stok, pilih produk, masukkan qty penyesuaian, dan simpan.' },
            { q: 'Bagaimana cara transfer stok antar gudang?', a: 'Masuk ke Inventori > Transfer Gudang, pilih gudang asal dan tujuan, pilih produk, dan simpan.' },
        ],
    },
    {
        category: 'Laporan Keuangan',
        items: [
            { q: 'Bagaimana cara melihat laporan laba rugi?', a: 'Klik menu Laporan > Laba Rugi, pilih periode yang diinginkan, dan klik "Tampilkan".' },
            { q: 'Apa itu Neraca Saldo?', a: 'Neraca Saldo (Trial Balance) adalah daftar semua saldo akun pada periode tertentu. Digunakan untuk memverifikasi keseimbangan debit dan kredit.' },
            { q: 'Bagaimana cara export laporan ke Excel?', a: 'Buka laporan yang diinginkan, klik tombol "Export" di pojok kanan atas, pilih format Excel.' },
        ],
    },
    {
        category: 'Kas & Bank',
        items: [
            { q: 'Bagaimana cara rekonsiliasi bank?', a: 'Masuk ke Kas & Bank > pilih akun bank > Rekonsiliasi. Cocokkan transaksi dari mutasi bank dengan data di Rizquna Elfath.' },
            { q: 'Bagaimana cara transfer antar akun?', a: 'Di halaman Kas & Bank, klik tombol "Transfer", pilih akun asal dan tujuan, masukkan jumlah, dan simpan.' },
        ],
    },
];

const FAQPage: React.FC = () => {
    const [search, setSearch] = useState('');

    const filteredFaq = faqData.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter(cat => cat.items.length > 0);

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'FAQ' }]} />

            {/* Hero */}
            <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', marginBottom: 24, textAlign: 'center', padding: '24px 0' }}>
                <QuestionCircleOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 12 }} />
                <Title level={3} style={{ color: '#fff', margin: 0 }}>Pusat Bantuan</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8, marginBottom: 16 }}>
                    Temukan jawaban untuk pertanyaan yang sering diajukan
                </Paragraph>
                <Input
                    placeholder="Cari pertanyaan..."
                    prefix={<SearchOutlined />}
                    size="large"
                    style={{ maxWidth: 400, margin: '0 auto' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </Card>

            {/* Quick Links */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <Card hoverable bordered={false} style={{ borderRadius: 8, flex: 1, minWidth: 200 }} bodyStyle={{ padding: 16, textAlign: 'center' }}>
                    <BookOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                    <div><Text strong style={{ fontSize: 13 }}>Panduan Lengkap</Text></div>
                    <Text type="secondary" style={{ fontSize: 11 }}>Dokumentasi fitur A-Z</Text>
                </Card>
                <Card hoverable bordered={false} style={{ borderRadius: 8, flex: 1, minWidth: 200 }} bodyStyle={{ padding: 16, textAlign: 'center' }}>
                    <PlayCircleOutlined style={{ fontSize: 24, color: '#722ed1', marginBottom: 8 }} />
                    <div><Text strong style={{ fontSize: 13 }}>Video Tutorial</Text></div>
                    <Text type="secondary" style={{ fontSize: 11 }}>Belajar lewat video</Text>
                </Card>
                <Card hoverable bordered={false} style={{ borderRadius: 8, flex: 1, minWidth: 200 }} bodyStyle={{ padding: 16, textAlign: 'center' }}>
                    <MessageOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                    <div><Text strong style={{ fontSize: 13 }}>Hubungi Support</Text></div>
                    <Text type="secondary" style={{ fontSize: 11 }}>Chat dengan tim kami</Text>
                </Card>
            </div>

            {/* FAQ Accordion */}
            {filteredFaq.map((cat) => (
                <div key={cat.category} style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 14, color: '#595959', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {cat.category}
                    </Text>
                    <Collapse expandIconPosition="end" style={{ marginTop: 8, borderRadius: 8, background: '#fff' }}>
                        {cat.items.map((item, idx) => (
                            <Panel key={`${cat.category}-${idx}`} header={<Text strong style={{ fontSize: 13 }}>{item.q}</Text>}>
                                <Paragraph style={{ marginBottom: 0, color: '#595959' }}>{item.a}</Paragraph>
                            </Panel>
                        ))}
                    </Collapse>
                </div>
            ))}
        </div>
    );
};

export default FAQPage;
