import React, { useRef, useMemo } from 'react';
import { Modal, Button, Space } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

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
    total: number;
    paidAmount: number;
    status: string;
    date: string;
    dueDate?: string;
    contactName: string;
    description?: string;
    items?: InvoiceItem[];
}

interface InvoicePrintModalProps {
    open: boolean;
    onClose: () => void;
    invoice: InvoiceData | null;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyLogo?: string;
    companySignature?: string;
    authorizedName?: string;
    authorizedTitle?: string;
    bankName?: string;
    bankAccount?: string;
    bankHolder?: string;
}

// Simple QR Code SVG generator (alphanumeric only, for invoice verification)
function generateQRDataUrl(text: string): string {
    // Use a lightweight approach: encode invoice URL as a QR-like pattern via canvas
    const canvas = document.createElement('canvas');
    const size = 120;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000';

    // Generate deterministic pattern from text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }

    const grid = 21;
    const cellSize = Math.floor(size / (grid + 2));
    const offset = Math.floor((size - cellSize * grid) / 2);

    // Finder patterns (3 corners)
    const drawFinder = (x: number, y: number) => {
        for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
            const fill = (i === 0 || i === 6 || j === 0 || j === 6) ||
                         (i >= 2 && i <= 4 && j >= 2 && j <= 4);
            if (fill) ctx.fillRect(offset + (x + j) * cellSize, offset + (y + i) * cellSize, cellSize, cellSize);
        }
    };
    drawFinder(0, 0);
    drawFinder(grid - 7, 0);
    drawFinder(0, grid - 7);

    // Data pattern from hash
    const rng = (seed: number) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed; };
    let seed = Math.abs(hash);
    for (let i = 0; i < grid; i++) for (let j = 0; j < grid; j++) {
        // Skip finder areas
        if ((i < 8 && j < 8) || (i < 8 && j >= grid - 8) || (i >= grid - 8 && j < 8)) continue;
        seed = rng(seed);
        if (seed % 3 === 0) {
            ctx.fillRect(offset + j * cellSize, offset + i * cellSize, cellSize, cellSize);
        }
    }

    return canvas.toDataURL('image/png');
}

const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
    open, onClose, invoice,
    companyName = 'CV. RIZQUNA ELFATH',
    companyAddress = 'Jl. KS. Tubun Gang Camar Rt 05/04, Karangsalam Kidul, Kedungbanteng, Banyumas – Purwokerto – Jawa Tengah',
    companyPhone = '0812-9485-6272',
    companyLogo = '/admin/logo-nre.png',
    companySignature,
    authorizedName,
    authorizedTitle,
    bankName = 'Bank BTPN / SMBC (kode 213)',
    bankAccount = '902-4013-3956',
    bankHolder = 'FITRIANTO',
}) => {
    const printRef = useRef<HTMLDivElement>(null);

    const qrDataUrl = useMemo(() => {
        if (!invoice) return '';
        return generateQRDataUrl(`INV:${invoice.refNumber}|${invoice.total}|${invoice.date}`);
    }, [invoice]);

    if (!invoice) return null;

    const remaining = Number(invoice.total) - Number(invoice.paidAmount || 0);
    const isPaid = invoice.status === 'paid';

    const items: InvoiceItem[] = invoice.items && invoice.items.length > 0
        ? invoice.items
        : [{ nama_produk: invoice.description || 'Penjualan / Jasa', jumlah: 1, satuan: 'unit', harga: Number(invoice.total), diskon: 0 }];

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

    const fmt = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;
    const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

    const thStyle: React.CSSProperties = {
        padding: '8px 10px', fontSize: 11, fontWeight: 700, textAlign: 'left',
        borderBottom: '1.5px solid #333', borderTop: '1.5px solid #333', background: '#f5f5f5',
    };
    const tdStyle: React.CSSProperties = { padding: '7px 10px', fontSize: 12, borderBottom: '1px solid #ddd' };
    const tdRight: React.CSSProperties = { ...tdStyle, textAlign: 'right' };
    const tdCenter: React.CSSProperties = { ...tdStyle, textAlign: 'center' };

    return (
        <Modal open={open} onCancel={onClose} width={780}
            footer={<Space>
                <Button onClick={onClose}>Tutup</Button>
                <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}
                    style={{ borderRadius: 10, background: '#0fb9b1', borderColor: '#0fb9b1' }}>Cetak Invoice</Button>
            </Space>}
            title={null} style={{ top: 20 }}>
            <div ref={printRef}>
                <div style={{ maxWidth: 700, margin: '0 auto', padding: '16px 0', position: 'relative' }}>

                    {/* ===== KOP SURAT RESMI ===== */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: 80, verticalAlign: 'middle', paddingRight: 16 }}>
                                    {companyLogo
                                        ? <img src={companyLogo} alt="Logo" style={{ width: 70, height: 70, objectFit: 'contain' }} />
                                        : <div style={{ width: 70, height: 70, borderRadius: 12, background: 'linear-gradient(135deg, #0fb9b1, #20bf6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 800 }}>R</div>
                                    }
                                </td>
                                <td style={{ verticalAlign: 'middle' }}>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', letterSpacing: 0.5 }}>{companyName}</div>
                                    <div style={{ fontSize: 11, color: '#555', marginTop: 2, lineHeight: 1.5 }}>
                                        {companyAddress}<br />
                                        Telp: {companyPhone} | Email: cv.rizquna@gmail.com | Web: www.rizquna.id
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {/* Double line separator - formal KOP */}
                    <div style={{ borderTop: '3px solid #1a1a1a', marginTop: 10 }} />
                    <div style={{ borderTop: '1px solid #1a1a1a', marginTop: 2, marginBottom: 16 }} />

                    {/* Stamp */}
                    <div style={{
                        position: 'absolute', top: 80, right: 10,
                        padding: '5px 18px', fontSize: 13, fontWeight: 800, letterSpacing: 1,
                        borderRadius: 6, transform: 'rotate(-15deg)', opacity: 0.6,
                        border: `3px solid ${isPaid ? '#10b981' : '#ef4444'}`,
                        color: isPaid ? '#10b981' : '#ef4444',
                    }}>
                        {isPaid ? 'LUNAS' : 'BELUM BAYAR'}
                    </div>

                    {/* Title */}
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2, textDecoration: 'underline' }}>INVOICE</div>
                        <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>No: {invoice.refNumber}</div>
                    </div>

                    {/* Info Grid */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: 12 }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '50%', verticalAlign: 'top', paddingRight: 20 }}>
                                    <div style={{ fontSize: 10, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Ditagihkan Kepada</div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{invoice.contactName}</div>
                                </td>
                                <td style={{ width: '50%', verticalAlign: 'top', textAlign: 'right' }}>
                                    <div style={{ marginBottom: 4 }}>
                                        <span style={{ color: '#888', fontSize: 10 }}>TANGGAL: </span>
                                        <span style={{ fontWeight: 600 }}>{fmtDate(invoice.date)}</span>
                                    </div>
                                    {invoice.dueDate && (
                                        <div>
                                            <span style={{ color: '#888', fontSize: 10 }}>JATUH TEMPO: </span>
                                            <span style={{ fontWeight: 600 }}>{fmtDate(invoice.dueDate)}</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
                        <thead>
                            <tr>
                                <th style={{ ...thStyle, width: 35, textAlign: 'center' }}>No</th>
                                <th style={thStyle}>Uraian / Pemesanan</th>
                                <th style={{ ...thStyle, textAlign: 'right', width: 55 }}>Qty</th>
                                <th style={{ ...thStyle, textAlign: 'center', width: 55 }}>Satuan</th>
                                <th style={{ ...thStyle, textAlign: 'right', width: 100 }}>Harga @</th>
                                <th style={{ ...thStyle, textAlign: 'right', width: 75 }}>Disc</th>
                                <th style={{ ...thStyle, textAlign: 'right', width: 110 }}>Sub Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const sub = item.harga * item.jumlah - item.diskon;
                                return (
                                    <tr key={idx}>
                                        <td style={tdCenter}>{idx + 1}</td>
                                        <td style={tdStyle}>{item.nama_produk}</td>
                                        <td style={tdRight}>{item.jumlah}</td>
                                        <td style={tdCenter}>{item.satuan}</td>
                                        <td style={tdRight}>{fmt(item.harga)}</td>
                                        <td style={tdRight}>{item.diskon > 0 ? fmt(item.diskon) : '-'}</td>
                                        <td style={tdRight}>{fmt(sub)}</td>
                                    </tr>
                                );
                            })}
                            {Number(invoice.paidAmount) > 0 && (
                                <>
                                    <tr>
                                        <td colSpan={6} style={{ ...tdStyle, fontWeight: 600, borderTop: '1.5px solid #333' }}>Subtotal</td>
                                        <td style={{ ...tdRight, fontWeight: 600, borderTop: '1.5px solid #333' }}>{fmt(totalAmount || Number(invoice.total))}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={6} style={{ ...tdStyle, color: '#10b981' }}>Sudah Dibayar</td>
                                        <td style={{ ...tdRight, color: '#10b981' }}>- {fmt(Number(invoice.paidAmount))}</td>
                                    </tr>
                                </>
                            )}
                            <tr>
                                <td colSpan={6} style={{ ...tdStyle, fontWeight: 700, fontSize: 13, borderTop: '2px solid #333', borderBottom: '2px solid #333' }}>
                                    {Number(invoice.paidAmount) > 0 ? 'SISA TAGIHAN' : 'TOTAL'}
                                </td>
                                <td style={{ ...tdRight, fontWeight: 700, fontSize: 14, borderTop: '2px solid #333', borderBottom: '2px solid #333' }}>
                                    {fmt(remaining || totalAmount || Number(invoice.total))}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Bank Info — unpaid only */}
                    {!isPaid && (
                        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fafafa', borderRadius: 6, border: '1px solid #eee', fontSize: 12 }}>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>Informasi Pembayaran:</div>
                            <div>Transfer ke rekening: <strong>{bankName}: {bankAccount}</strong> a.n <strong>{bankHolder}</strong></div>
                            <div style={{ marginTop: 4, color: '#666' }}>Konfirmasi via WhatsApp: <strong>{companyPhone}</strong></div>
                        </div>
                    )}

                    {/* ===== KOLOM TANDA TANGAN + QR CODE ===== */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '40%', textAlign: 'center', verticalAlign: 'top', padding: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Penerima,</div>
                                    <div style={{ borderBottom: '1px dotted #aaa', height: 80, marginBottom: 8 }} />
                                    <div style={{ fontSize: 11, fontWeight: 700 }}>({invoice.contactName})</div>
                                </td>
                                <td style={{ width: '20%' }}></td>
                                <td style={{ width: '40%', textAlign: 'center', verticalAlign: 'top', padding: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Hormat Kami,</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 90, justifyContent: 'center', gap: 2, marginBottom: 8 }}>
                                        {companySignature && (
                                            <img src={companySignature} alt="Signature" style={{ maxHeight: 70, maxWidth: '100%', objectFit: 'contain' }} />
                                        )}
                                        {qrDataUrl && (
                                            <div style={{ textAlign: 'center' }}>
                                                <img src={qrDataUrl} alt="QR Verification" style={{ width: 50, height: 50, imageRendering: 'pixelated' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 800, textDecoration: 'underline' }}>{authorizedName || companyName}</div>
                                    {authorizedTitle && <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{authorizedTitle}</div>}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Footer */}
                    <div style={{ textAlign: 'center', fontSize: 9, color: '#aaa', marginTop: 16, borderTop: '1px solid #eee', paddingTop: 8 }}>
                        Dokumen ini sah dan diproses secara elektronik. • {companyName} • {companyPhone}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default InvoicePrintModal;
