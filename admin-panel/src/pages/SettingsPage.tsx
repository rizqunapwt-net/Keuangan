import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Divider,
  Upload,
} from 'antd';
import { SaveOutlined, LockOutlined, PictureOutlined, SafetyOutlined } from '@ant-design/icons';
import api from '../api';
import PageHeader from '../components/PageHeader';
import { motion } from 'framer-motion';
import { setSecurityPin, isPinConfigured, clearPinSession, verifyPin } from '../components/FinancePinGuard';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SETTINGS_KEY = 'app_settings';

interface AppSettings {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_npwp: string;
  company_website: string;
  company_ig: string;
  company_wa: string;
  company_logo: string;

  director_name: string;
  director_title: string;
  invoice_bank_name: string;
  invoice_bank_account: string;
  invoice_bank_holder: string;
  currency: string;
  tax_rate: number;

  footer_note: string;
}

const defaultSettings: AppSettings = {
  company_name: 'RIZQUNA',
  company_address: 'Jl. KS. Tubun Gang Camar Rt 05/04, Karangsalam Kidul, Kedungbanteng, Banyumas – Purwokerto – Jawa Tengah',
  company_phone: '0812-9485-6272',
  company_email: 'cv.rizquna@gmail.com',
  company_npwp: '',
  company_website: 'www.rizquna.id',
  company_ig: '@penerbit_rizquna',
  company_wa: '0812-9485-6272',
  company_logo: '/admin/logo-nre.png',

  director_name: 'SUDARYONO',
  director_title: 'Direktur',
  invoice_bank_name: 'Bank BTPN / SMBC (kode 213)',
  invoice_bank_account: '902-4013-3956',
  invoice_bank_holder: 'FITRIANTO',
  currency: 'IDR',
  tax_rate: 11,

  footer_note: 'Terima kasih atas kepercayaan Anda kepada kami.',
};

const SESSION_DURATION_KEY = 'finance_pin_duration';

const PinSetupForm: React.FC = () => {
  const [pinForm] = Form.useForm();
  const [hasPinSet, setHasPinSet] = useState(isPinConfigured());
  const [sessionMinutes, setSessionMinutes] = useState(() => {
    return Number(localStorage.getItem(SESSION_DURATION_KEY)) || 15;
  });

  const handleSetPin = (values: any) => {
    // If PIN already exists, verify old PIN first
    if (hasPinSet) {
      if (!values.old_pin || values.old_pin.length !== 6) {
        message.error('Masukkan PIN lama yang valid (6 digit)');
        return;
      }
      if (!verifyPin(values.old_pin)) {
        message.error('PIN lama salah! Tidak bisa mengubah PIN.');
        return;
      }
    }

    if (values.new_pin !== values.confirm_pin) {
      message.error('Konfirmasi PIN tidak cocok!');
      return;
    }
    if (values.new_pin.length !== 6) {
      message.error('PIN harus 6 digit!');
      return;
    }
    setSecurityPin(values.new_pin);
    clearPinSession();
    setHasPinSet(true);
    pinForm.resetFields();
    message.success(hasPinSet ? 'PIN berhasil diubah! 🔐' : 'PIN keamanan berhasil diatur! 🔐');
  };

  const handleSessionDuration = (minutes: number) => {
    setSessionMinutes(minutes);
    localStorage.setItem(SESSION_DURATION_KEY, String(minutes));
    message.success(`Durasi sesi diubah ke ${minutes} menit`);
  };

  const inputStyle = { borderRadius: 12, height: 44, background: '#fcfcfc', letterSpacing: 8, textAlign: 'center' as const, fontSize: 18, fontWeight: 700 };

  return (
    <div>
      <Form form={pinForm} layout="vertical" onFinish={handleSetPin} requiredMark={false}>
        {/* Old PIN — only shown when changing existing PIN */}
        {hasPinSet && (
          <Form.Item
            name="old_pin"
            label={<Text strong style={{ fontSize: 13 }}>PIN Saat Ini</Text>}
            rules={[{ required: true, message: 'Masukkan PIN saat ini' }, { len: 6, message: 'PIN harus 6 digit' }]}
          >
            <Input.Password
              maxLength={6}
              placeholder="••••••"
              prefix={<LockOutlined style={{ color: '#ef4444' }} />}
              style={{ ...inputStyle, borderColor: '#fecaca' }}
            />
          </Form.Item>
        )}

        <Form.Item
          name="new_pin"
          label={<Text strong style={{ fontSize: 13 }}>{hasPinSet ? 'PIN Baru' : 'Buat PIN (6 digit)'}</Text>}
          rules={[{ required: true, message: 'Masukkan PIN' }, { len: 6, message: 'PIN harus 6 digit' }]}
        >
          <Input.Password
            maxLength={6}
            placeholder="••••••"
            prefix={<LockOutlined style={{ color: '#0fb9b1' }} />}
            style={inputStyle}
          />
        </Form.Item>

        <Form.Item
          name="confirm_pin"
          label={<Text strong style={{ fontSize: 13 }}>Konfirmasi PIN</Text>}
          dependencies={['new_pin']}
          rules={[
            { required: true, message: 'Konfirmasi PIN' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('new_pin') === value) return Promise.resolve();
                return Promise.reject(new Error('PIN tidak cocok!'));
              },
            }),
          ]}
        >
          <Input.Password
            maxLength={6}
            placeholder="••••••"
            prefix={<LockOutlined style={{ color: '#0fb9b1' }} />}
            style={inputStyle}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          icon={<SafetyOutlined />}
          block
          style={{ borderRadius: 12, height: 44, fontWeight: 700, marginBottom: 20 }}
        >
          {hasPinSet ? 'Ubah PIN' : 'Aktifkan PIN'}
        </Button>
      </Form>

      {hasPinSet && (
        <div style={{
          padding: '16px 20px',
          background: '#f8fffe',
          borderRadius: 14,
          border: '1px solid #e0f2f1',
        }}>
          <Text strong style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 8 }}>
            ⏱ Durasi Sesi (menit)
          </Text>
          <Text style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 12 }}>
            Setelah memasukkan PIN, akses terbuka selama durasi ini sebelum perlu memasukkan PIN lagi.
          </Text>
          <div style={{ display: 'flex', gap: 8 }}>
            {[5, 15, 30, 60].map(m => (
              <Button
                key={m}
                type={sessionMinutes === m ? 'primary' : 'default'}
                size="small"
                onClick={() => handleSessionDuration(m)}
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 12,
                  ...(sessionMinutes === m ? {} : { border: '1px solid #e0e0e0' }),
                }}
              >
                {m} menit
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data?.data) {
          const fetched = res.data.data;
          form.setFieldsValue({ ...defaultSettings, ...fetched });
          if (fetched.company_logo) setLogoPreview(fetched.company_logo);
          // Also sync to localStorage for fast local access in components
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(fetched));
        } else {
          form.setFieldsValue(defaultSettings);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          form.setFieldsValue({ ...defaultSettings, ...parsed });
          if (parsed.company_logo) setLogoPreview(parsed.company_logo);
        } else {
          form.setFieldsValue(defaultSettings);
        }
      }
    };
    fetchSettings();
  }, [form]);

  const handleLogoUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) { message.error('Tipe file tidak didukung!'); return false; }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) { message.error('Ukuran maksimal 2MB!'); return false; }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setLogoPreview(base64);
      form.setFieldsValue({ company_logo: base64 });
      message.success('Logo diperbarui!');
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    form.setFieldsValue({ company_logo: '' });
    message.info('Logo dihapus');
  };



  const handleChangePassword = async (values: any) => {
    setChangingPassword(true);
    try {
      await api.post('/auth/change-password', values);
      message.success('Password berhasil diubah');
      passwordForm.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSave = async (values: AppSettings) => {
    setSaving(true);
    try {
      await api.post('/settings', values);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(values));
      message.success('Pengaturan berhasil disinkronkan ke server! ✅');
    } catch {
      message.error('Gagal menyimpan ke server, tersimpan lokal saja.');
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(values));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
      <PageHeader
        title="Pengaturan Sistem"
        description="Konfigurasi identitas bisnis dan otentikasi akun Anda."
        breadcrumb={[{ label: 'ADMIN' }, { label: 'PENGATURAN' }]}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        requiredMark={false}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card className="premium-card" style={{ borderRadius: 20, height: '100%' }} bodyStyle={{ padding: '32px' }}>
              <Title level={5} style={{ marginBottom: 8, fontWeight: 700, color: '#333' }}>Informasi Perusahaan</Title>
              <Text style={{ display: 'block', marginBottom: 24, color: '#aaa', fontSize: 13, fontWeight: 500 }}>
                Detail profil bisnis yang akan muncul pada invoice.
              </Text>
              
              <Form.Item name="company_name" label={<Text strong style={{ fontSize: 13 }}>Nama Perusahaan</Text>} rules={[{ required: true }]}>
                <Input placeholder="Contoh: CV Rizquna Mandiri" style={{ borderRadius: 12, height: 44, background: '#fcfcfc' }} />
              </Form.Item>

              <Form.Item name="company_address" label={<Text strong style={{ fontSize: 13 }}>Alamat Kantor</Text>}>
                <TextArea rows={3} placeholder="Alamat lengkap..." style={{ borderRadius: 12, background: '#fcfcfc' }} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="company_phone" label={<Text strong style={{ fontSize: 13 }}>Telepon</Text>}>
                    <Input style={{ borderRadius: 12, height: 44, background: '#fcfcfc' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="company_email" label={<Text strong style={{ fontSize: 13 }}>Email Bisnis</Text>}>
                    <Input style={{ borderRadius: 12, height: 44, background: '#fcfcfc' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="company_website" label={<Text strong style={{ fontSize: 13 }}>Website</Text>}>
                    <Input style={{ borderRadius: 12, height: 44, background: '#fcfcfc' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="company_wa" label={<Text strong style={{ fontSize: 13 }}>WhatsApp</Text>}>
                    <Input style={{ borderRadius: 12, height: 44, background: '#fcfcfc' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="company_logo" hidden><Input /></Form.Item>
              <Form.Item label={<Text strong style={{ fontSize: 13 }}>Logo Instansi</Text>} style={{ marginTop: 8 }}>
                <div style={{
                  border: '2px dashed #eee',
                  borderRadius: 16,
                  padding: logoPreview ? 20 : 32,
                  textAlign: 'center',
                  background: '#fcfcfc',
                  transition: 'all 0.3s ease'
                }}>
                  {logoPreview ? (
                    <div>
                      <img src={logoPreview} alt="Logo" style={{ maxHeight: 72, maxWidth: '100%', objectFit: 'contain', marginBottom: 16 }} />
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                        <Upload showUploadList={false} beforeUpload={handleLogoUpload as any} accept="image/*">
                          <Button size="small" style={{ borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Ganti</Button>
                        </Upload>
                        <Button size="small" danger onClick={handleRemoveLogo} style={{ borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Hapus</Button>
                      </div>
                    </div>
                  ) : (
                    <Upload showUploadList={false} beforeUpload={handleLogoUpload as any} accept="image/*">
                      <div style={{ cursor: 'pointer' }}>
                        <PictureOutlined style={{ fontSize: 32, color: '#ccc', marginBottom: 8 }} />
                        <div style={{ color: '#aaa', fontSize: 12, fontWeight: 600 }}>Klik untuk upload logo</div>
                      </div>
                    </Upload>
                  )}
                </div>
              </Form.Item>


            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card className="premium-card" style={{ borderRadius: 20, height: '100%' }} bodyStyle={{ padding: '32px' }}>
              <Title level={5} style={{ marginBottom: 8, fontWeight: 700, color: '#333' }}>Konfigurasi Invoice</Title>
              <Text style={{ display: 'block', marginBottom: 24, color: '#aaa', fontSize: 13, fontWeight: 500 }}>
                Pengaturan nomor seri, bank, dan penomoran berkas.
              </Text>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="director_name" label={<Text strong style={{ fontSize: 13 }}>Penanggung Jawab</Text>}>
                    <Input style={{ borderRadius: 12, height: 44, background: '#fcfcfc' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="director_title" label={<Text strong style={{ fontSize: 13 }}>Jabatan</Text>}>
                    <Input placeholder="Direktur" style={{ borderRadius: 12, height: 44, background: '#fcfcfc' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '8px 0 24px' }} />

              <Form.Item name="invoice_bank_name" label={<Text strong style={{ fontSize: 13 }}>Nama Bank & Cabang</Text>}>
                <Input style={{ borderRadius: 12, height: 44, background: '#fcfcfc' }} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="invoice_bank_account" label={<Text strong style={{ fontSize: 13 }}>Nomor Rekening</Text>}>
                    <Input style={{ borderRadius: 12, height: 44, background: '#fcfcfc' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="invoice_bank_holder" label={<Text strong style={{ fontSize: 13 }}>Atas Nama (Holder)</Text>}>
                    <Input style={{ borderRadius: 12, height: 44, background: '#fcfcfc' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '8px 0 24px' }} />



              <Form.Item name="footer_note" label={<Text strong style={{ fontSize: 13 }}>Catatan Footer</Text>}>
                <TextArea rows={2} style={{ borderRadius: 12, background: '#fcfcfc' }} />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 32, textAlign: 'right' }}>
           <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            icon={<SaveOutlined />}
            style={{ 
              borderRadius: 14, 
              height: 48, 
              paddingInline: 40, 
              fontWeight: 700, 
              boxShadow: '0 8px 16px rgba(15, 185, 177, 0.25)' 
            }}
          >
            Simpan Perubahan
          </Button>
        </div>
      </Form>

      <Row gutter={[24, 24]} style={{ marginTop: 40 }}>
        <Col xs={24} lg={12}>
          <Card className="premium-card" style={{ borderRadius: 20 }} bodyStyle={{ padding: '32px' }}>
            <Title level={5} style={{ marginBottom: 8, fontWeight: 700, color: '#333' }}>Keamanan Akun</Title>
            <Text style={{ display: 'block', marginBottom: 24, color: '#aaa', fontSize: 13, fontWeight: 500 }}>
              Ganti password secara berkala untuk menjaga keamanan data.
            </Text>

            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
              requiredMark={false}
            >
              <Form.Item name="current_password" label={<Text strong style={{ fontSize: 13 }}>Password Sekarang</Text>} rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined style={{ color: '#ccc' }} />} placeholder="••••••••" style={{ borderRadius: 12, height: 44, background: '#fcfcfc' }} />
              </Form.Item>

              <Form.Item name="new_password" label={<Text strong style={{ fontSize: 13 }}>Password Baru</Text>} rules={[{ required: true, min: 8 }]}>
                <Input.Password prefix={<LockOutlined style={{ color: '#ccc' }} />} placeholder="Minimal 8 karakter" style={{ borderRadius: 12, height: 44, background: '#fcfcfc' }} />
              </Form.Item>

              <Form.Item
                name="new_password_confirmation"
                label={<Text strong style={{ fontSize: 13 }}>Konfirmasi Password</Text>}
                dependencies={['new_password']}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password') === value) return Promise.resolve();
                      return Promise.reject(new Error('Password tidak cocok!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#ccc' }} />} placeholder="Ulangi password baru" style={{ borderRadius: 12, height: 44, background: '#fcfcfc' }} />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={changingPassword}
                icon={<LockOutlined />}
                block
                style={{ borderRadius: 12, height: 44, fontWeight: 700, marginTop: 12 }}
              >
                Perbarui Password
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* ===== PIN Keamanan Keuangan ===== */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card className="premium-card" style={{ borderRadius: 20 }} bodyStyle={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #0fb9b1, #20bf6b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <SafetyOutlined style={{ fontSize: 20, color: '#fff' }} />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, fontWeight: 700, color: '#333' }}>PIN Keamanan Keuangan</Title>
                <Text style={{ color: '#aaa', fontSize: 12 }}>
                  {isPinConfigured() ? '✅ PIN aktif — halaman keuangan terlindungi' : '⚠️ PIN belum diatur — halaman keuangan bisa diakses bebas'}
                </Text>
              </div>
            </div>
            <Text style={{ display: 'block', marginBottom: 20, color: '#888', fontSize: 13 }}>
              Seperti verifikasi CVC kartu kredit — setiap kali mengakses menu <strong>Bank</strong> (data rekening perusahaan), Anda harus memasukkan PIN 6 digit terlebih dahulu.
            </Text>
            
            <PinSetupForm />
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default SettingsPage;
