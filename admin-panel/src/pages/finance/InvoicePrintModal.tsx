import React, { useRef } from 'react';
import { Modal, Button, Space } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { fmtRp, fmtDate } from '../../utils/formatters';

interface InvoiceItem {
    nama_produk: string;
    jumlah: number;
    satuan: string;
    harga: number;
    diskon: number;
}

interface InvoiceData {
    id: number;
    refNumber: string;
    number: string;
    total_amount: number;
    paid_amount: number;
    status: string;
    date: string;
    due_date?: string;
    contact?: {
        name: string;
    };
    description?: string;
    items?: InvoiceItem[];
}

interface InvoicePrintModalProps {
    open: boolean;
    onClose: () => void;
    invoice: InvoiceData | null;
    settings?: any;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyWebsite?: string;
    companyIG?: string;
    companyLogo?: string;
    companySignature?: string;
    authorizedName?: string;
    authorizedTitle?: string;
    bankName?: string;
    bankAccount?: string;
    bankHolder?: string;
}

const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
    open, onClose, invoice, settings,
    companyName = settings?.company_name || 'CV. RIZQUNA MANDIRI',
    companyEmail = settings?.company_email || 'cv.rizquna@gmail.com',
    companyWebsite = settings?.company_website || 'www.rizquna.id',
    companyIG = settings?.company_ig || '@penerbit_rizquna',
    companyLogo = settings?.logo_url || '/admin/logo-nre.png',
    companySignature = settings?.signature_url,
    authorizedName = settings?.authorized_name,
    authorizedTitle = settings?.authorized_title,
    bankName = settings?.bank_name || 'Bank BTPN / SMBC (kode 213)',
    bankAccount = settings?.bank_account || '902-4013-3956',
    bankHolder = settings?.bank_holder || 'FITRIANTO',
}) => {
    const printRef = useRef<HTMLDivElement>(null);

    if (!invoice) return null;

    const isPaid = invoice.status === 'paid';

    const items: InvoiceItem[] = invoice.items && invoice.items.length > 0
        ? invoice.items
        : [{ nama_produk: invoice.description || 'Penjualan / Jasa', jumlah: 1, satuan: 'unit', harga: Number(invoice.total_amount), diskon: 0 }];

    const totalAmount = items.reduce((s, item) => s + (item.harga * item.jumlah - item.diskon), 0);

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;
        const pw = window.open('', '_blank', 'width=800,height=900');
        if (!pw) return;
        pw.document.write(`<!DOCTYPE html><html><head>
            <title>Invoice ${invoice.refNumber}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Inter', Helvetica, sans-serif; color: #1e293b; padding: 30px 40px; background: #fff; font-size: 13px; }
                @media print { body { padding: 15px 20px; } }
            </style>
        </head><body>${content.innerHTML}
            <script>window.onload = function() { window.print(); }<\/script>
        </body></html>`);
        pw.document.close();
    };

    return (
        <Modal open={open} onCancel={onClose} width={780}
            footer={<Space>
                <Button onClick={onClose}>Tutup</Button>
                <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}
                    style={{ borderRadius: 10, background: '#0fb9b1', borderColor: '#0fb9b1' }}>Cetak Invoice</Button>
            </Space>}
            title={null} style={{ top: 20 }}>
            <div ref={printRef}>
                <div style={{ maxWidth: 700, margin: '0 auto', padding: '16px 0', position: 'relative', color: '#000' }}>

                    <div style={{ textAlign: 'center', marginBottom: 10 }}>
                        {companyLogo && (
                            <img src={companyLogo} alt="Logo" style={{ maxHeight: 85, maxWidth: '100%', objectFit: 'contain', marginBottom: 6 }} />
                        )}
                        <div style={{ fontSize: 13, color: '#000', fontWeight: 500 }}>
                            <span style={{ color: '#0000FF', textDecoration: 'underline' }}>{companyWebsite}</span> | {companyEmail} | IG: <span style={{ color: '#0000FF' }}>{companyIG}</span>
                        </div>
                    </div>

                    <div style={{ borderTop: '2px solid #000', marginBottom: 8 }} />

                    <div style={{ 
                        borderTop: '1px solid #000', 
                        borderBottom: '1px solid #000', 
                        padding: '4px 0', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: 16,
                        fontSize: 14,
                        fontWeight: 600
                    }}>
                        <span>Kode Invoice : {invoice.refNumber}</span>
                        <span>Tanggal order: {fmtDate(invoice.date)}</span>
                    </div>

                    <div style={{ marginBottom: 16, fontSize: 13 }}>
                        <div style={{ fontWeight: 800 }}>Kepada Yth: {invoice.contact?.name || 'Umum'}</div>
                        <div>berikut adalah Detail Order Anda:</div>
                    </div>

                    {isPaid && (
                        <div style={{
                            position: 'absolute', top: 120, right: 20,
                            padding: '10px 30px', fontSize: 24, fontWeight: 900,
                            borderRadius: 4, transform: 'rotate(-8deg)', opacity: 0.7,
                            border: `4px double #ef4444`,
                            color: '#ef4444',
                            zIndex: 10
                        }}>
                            LUNAS
                        </div>
                    )}

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #000' }}>
                                <th style={{ padding: '6px 8px', textAlign: 'left', width: 40 }}>No.</th>
                                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Pemesanan</th>
                                <th style={{ padding: '6px 8px', textAlign: 'center', width: 60 }}>Jumlah</th>
                                <th style={{ padding: '6px 8px', textAlign: 'center', width: 60 }}>satuan</th>
                                <th style={{ padding: '6px 8px', textAlign: 'right', width: 100 }}>Harga @</th>
                                <th style={{ padding: '6px 8px', textAlign: 'right', width: 80 }}>Disc</th>
                                <th style={{ padding: '6px 8px', textAlign: 'right', width: 110 }}>Sub Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{idx + 1}</td>
                                    <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{item.nama_produk}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #000' }}>{item.jumlah}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #000' }}>{item.satuan}</td>
                                    <td style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #000' }}>{fmtRp(item.harga)}</td>
                                    <td style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #000' }}>{item.diskon > 0 ? fmtRp(item.diskon) : 'Rp.0'}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>{fmtRp(item.harga * item.jumlah - item.diskon)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ borderTop: '1px solid #000', fontWeight: 800 }}>
                                <td colSpan={6} style={{ padding: '8px', textAlign: 'left' }}>TOTAL</td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>{fmtRp(totalAmount || Number(invoice.total_amount))}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: 20, fontSize: 13 }}>
                        <div>Dibuat pada tanggal : {fmtDate(invoice.date)}</div>
                        <div style={{ marginBottom: 12 }}>Terima kasih atas kepercayaan Anda kepada kami:</div>
                        
                        <div style={{ position: 'relative', textAlign: 'center', width: 220, paddingRight: 40 }}>
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>{authorizedTitle || 'Direktur'},</div>
                            <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {companySignature && (
                                    <img src={companySignature} alt="Signature" style={{ maxHeight: 85, maxWidth: '100%', objectFit: 'contain' }} />
                                )}
                            </div>
                            <div style={{ fontWeight: 800, textTransform: 'uppercase' }}>{authorizedName || companyName}</div>
                        </div>
                    </div>

                    {!isPaid && (
                        <div style={{ marginTop: 24, fontSize: 11, color: '#666', borderTop: '1px dotted #ccc', paddingTop: 8 }}>
                            <div style={{ fontWeight: 700 }}>Pembayaran via:</div>
                            <div>{bankName} Account: {bankAccount} a.n {bankHolder}</div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default InvoicePrintModal;
