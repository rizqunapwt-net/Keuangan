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
    total?: number;
    paid_amount: number;
    paidAmount?: number;
    status: string;
    date: string;
    due_date?: string;
    dueDate?: string;
    contact?: {
        name: string;
    };
    contactName?: string;
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
    companyLogo = settings?.company_logo || settings?.logo_url || '/admin/logo-nre.png',
    companySignature = settings?.company_signature || settings?.signature_url || '',
    authorizedName = settings?.director_name || settings?.authorized_name || '',
    authorizedTitle = settings?.director_title || settings?.authorized_title || '',
    bankName = settings?.invoice_bank_name || settings?.bank_name || 'Bank BTPN / SMBC (kode 213)',
    bankAccount = settings?.invoice_bank_account || settings?.bank_account || '902-4013-3956',
    bankHolder = settings?.invoice_bank_holder || settings?.bank_holder || 'FITRIANTO',
}) => {
    const printRef = useRef<HTMLDivElement>(null);

    if (!invoice) return null;

    const isPaid = invoice.status === 'paid';
    const invoiceTotal = Number(invoice.total_amount ?? invoice.total ?? 0);
    const customerName = invoice.contact?.name || invoice.contactName || 'Umum';

    const items: InvoiceItem[] = invoice.items && invoice.items.length > 0
        ? invoice.items
        : [{ nama_produk: invoice.description || 'Penjualan / Jasa', jumlah: 1, satuan: 'unit', harga: invoiceTotal, diskon: 0 }];

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
                        <div style={{ fontWeight: 800 }}>Kepada Yth: {customerName}</div>
                        <div>berikut adalah Detail Order Anda:</div>
                    </div>

                    {/* === STEMPEL STATUS === */}
                    {(() => {
                        const stampConfig = {
                            paid: {
                                text: 'LUNAS',
                                color: '#16a34a',
                                borderColor: '#16a34a',
                            },
                            unpaid: {
                                text: 'BELUM LUNAS',
                                color: '#dc2626',
                                borderColor: '#dc2626',
                            },
                            partial: {
                                text: 'CICILAN',
                                color: '#ea580c',
                                borderColor: '#ea580c',
                            },
                        }[invoice.status] || {
                            text: 'BELUM LUNAS',
                            color: '#dc2626',
                            borderColor: '#dc2626',
                        };

                        return (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(-18deg)',
                                zIndex: 10,
                                pointerEvents: 'none',
                            }}>
                                <div style={{
                                    border: `5px solid ${stampConfig.borderColor}`,
                                    borderRadius: 12,
                                    padding: '8px 32px',
                                    position: 'relative',
                                    opacity: 0.7,
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        inset: 3,
                                        border: `2px solid ${stampConfig.borderColor}`,
                                        borderRadius: 8,
                                    }} />
                                    <div style={{
                                        fontSize: invoice.status === 'unpaid' ? 28 : 36,
                                        fontWeight: 900,
                                        color: stampConfig.color,
                                        letterSpacing: '4px',
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap',
                                        fontFamily: "'Inter', 'Arial Black', sans-serif",
                                        textAlign: 'center',
                                        lineHeight: 1.2,
                                        padding: '4px 0',
                                    }}>
                                        {stampConfig.text}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

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
                                <td style={{ padding: '8px', textAlign: 'right' }}>{fmtRp(totalAmount || invoiceTotal)}</td>
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

                    <div style={{ marginTop: 24, fontSize: 11, color: '#666', borderTop: '1px dotted #ccc', paddingTop: 8 }}>
                        {isPaid ? (
                            <div style={{ fontWeight: 700, color: '#16a34a' }}>✅ Invoice ini sudah LUNAS. Terima kasih.</div>
                        ) : (
                            <>
                                <div style={{ fontWeight: 700 }}>Pembayaran via:</div>
                                <div>{bankName} Account: {bankAccount} a.n {bankHolder}</div>
                                {invoice.status === 'partial' && (
                                    <div style={{ marginTop: 4, fontWeight: 600, color: '#ea580c' }}>
                                        Sisa tagihan: {fmtRp((invoice.total_amount ?? invoice.total ?? 0) - (invoice.paid_amount ?? invoice.paidAmount ?? 0))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default InvoicePrintModal;
