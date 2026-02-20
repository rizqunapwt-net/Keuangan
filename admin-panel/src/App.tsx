import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import {
  Layout,
  Menu,
  theme,
  Button,
  Space,
  Avatar,
  Dropdown,
  Divider,
  Input,
  Badge,
  Tooltip,
  FloatButton,
  Spin,
} from 'antd';
import {
  HomeOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  BankOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  UsergroupAddOutlined,
  GlobalOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  DollarOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  CustomerServiceOutlined,
  InboxOutlined,
  DesktopOutlined,
  PhoneOutlined,
  TeamOutlined,
  PrinterOutlined,
  FactoryOutlined,
} from '@ant-design/icons';
import logoHorizontal from './assets/logo/logo_horizontal.png';

// Auth pages - loaded eagerly (needed for first paint)
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// All other pages - lazy loaded
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const InvoicesPage = React.lazy(() => import('./pages/finance/InvoicesPage'));
const AddInvoicePage = React.lazy(() => import('./pages/finance/AddInvoicePage'));
const ContactsPage = React.lazy(() => import('./pages/finance/ContactsPage'));
const AddContactPage = React.lazy(() => import('./pages/finance/AddContactPage'));
const DeliveriesPage = React.lazy(() => import('./pages/finance/DeliveriesPage'));
const ProductsPage = React.lazy(() => import('./pages/finance/ProductsPage'));
const AddProductPage = React.lazy(() => import('./pages/finance/AddProductPage'));
const ProfitLossPage = React.lazy(() => import('./pages/finance/ProfitLossPage'));
const CashFlowPage = React.lazy(() => import('./pages/finance/CashFlowPage'));
const BanksPage = React.lazy(() => import('./pages/finance/BanksPage'));
const MarketplacePage = React.lazy(() => import('./pages/finance/MarketplacePage'));
const FixedAssetsPage = React.lazy(() => import('./pages/finance/FixedAssetsPage'));
const AddAssetPage = React.lazy(() => import('./pages/finance/AddAssetPage'));
const EmployeesPage = React.lazy(() => import('./pages/finance/EmployeesPage'));
const AddEmployeePage = React.lazy(() => import('./pages/finance/AddEmployeePage'));
const WarehousesPage = React.lazy(() => import('./pages/finance/WarehousesPage'));
const AddWarehousePage = React.lazy(() => import('./pages/finance/AddWarehousePage'));
const PaymentsPage = React.lazy(() => import('./pages/finance/PaymentsPage'));
const CurrenciesPage = React.lazy(() => import('./pages/finance/CurrenciesPage'));
const CompanyProfilePage = React.lazy(() => import('./pages/finance/CompanyProfilePage'));
const PurchasesPage = React.lazy(() => import('./pages/finance/PurchasesPage'));
const AddPurchasePage = React.lazy(() => import('./pages/finance/AddPurchasePage'));
const ExpensesPage = React.lazy(() => import('./pages/finance/ExpensesPage'));
const AddExpensePage = React.lazy(() => import('./pages/finance/AddExpensePage'));
const BalanceSheetPage = React.lazy(() => import('./pages/finance/BalanceSheetPage'));
const TrialBalancePage = React.lazy(() => import('./pages/finance/TrialBalancePage'));
const GeneralLedgerPage = React.lazy(() => import('./pages/finance/GeneralLedgerPage'));
const InvoiceDetailPage = React.lazy(() => import('./pages/finance/InvoiceDetailPage'));
const ContactDetailPage = React.lazy(() => import('./pages/finance/ContactDetailPage'));
const ProductDetailPage = React.lazy(() => import('./pages/finance/ProductDetailPage'));
const ChartOfAccountsPage = React.lazy(() => import('./pages/finance/ChartOfAccountsPage'));
const JournalEntriesPage = React.lazy(() => import('./pages/finance/JournalEntriesPage'));
const AddJournalEntryPage = React.lazy(() => import('./pages/finance/AddJournalEntryPage'));
const SalesOverviewPage = React.lazy(() => import('./pages/finance/SalesOverviewPage'));
const PurchaseOverviewPage = React.lazy(() => import('./pages/finance/PurchaseOverviewPage'));
const ReportsIndexPage = React.lazy(() => import('./pages/finance/ReportsIndexPage'));
const SettingsPage = React.lazy(() => import('./pages/finance/SettingsPage'));
const SalesOrdersPage = React.lazy(() => import('./pages/finance/SalesOrdersPage'));
const SalesQuotesPage = React.lazy(() => import('./pages/finance/SalesQuotesPage'));
const PurchaseOrdersPage = React.lazy(() => import('./pages/finance/PurchaseOrdersPage'));
const PurchaseQuotesPage = React.lazy(() => import('./pages/finance/PurchaseQuotesPage'));
const InventoryPage = React.lazy(() => import('./pages/finance/InventoryPage'));
const CRMPage = React.lazy(() => import('./pages/finance/CRMPage'));
const POSPage = React.lazy(() => import('./pages/finance/POSPage'));
const FAQPage = React.lazy(() => import('./pages/finance/FAQPage'));
const ProfilePage = React.lazy(() => import('./pages/auth/ProfilePage'));

const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// ── NRE Feature Pages ──
const KaryawanPage = React.lazy(() => import('./pages/nre/KaryawanPage'));
const PresensiPage = React.lazy(() => import('./pages/nre/PresensiPage'));
const CutiPage = React.lazy(() => import('./pages/nre/CutiPage'));
const LemburPage = React.lazy(() => import('./pages/nre/LemburPage'));
const ManajemenBukuPage = React.lazy(() => import('./pages/nre/ManajemenBukuPage'));
const NaskahPenerbitanPage = React.lazy(() => import('./pages/nre/NaskahPenerbitanPage'));
const NaskahCetakPage = React.lazy(() => import('./pages/nre/NaskahCetakPage'));
const ProsesISBNPage = React.lazy(() => import('./pages/nre/ProsesISBNPage'));
const PenulisPage = React.lazy(() => import('./pages/nre/PenulisPage'));
const KontrakPage = React.lazy(() => import('./pages/nre/KontrakPage'));
const PenjualanBukuPage = React.lazy(() => import('./pages/nre/PenjualanBukuPage'));
const OrderCetakPage = React.lazy(() => import('./pages/nre/OrderCetakPage'));
const PayrollNREPage = React.lazy(() => import('./pages/nre/PayrollPage'));

// ── Percetakan (Printing Press) Pages ──
const OrderEntryPage = React.lazy(() => import('./pages/percetakan/OrderEntryPage'));
const OrderListPage = React.lazy(() => import('./pages/percetakan/OrderListPage'));
const OrderDetailPage = React.lazy(() => import('./pages/percetakan/OrderDetailPage'));
const ProductionDashboardPage = React.lazy(() => import('./pages/percetakan/ProductionDashboardPage'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
    <Spin size="large" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const { Header, Content, Sider, Footer } = Layout;


const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, loading, user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (loading) return <div>Loading...</div>;

  // ── Sidebar Menu Items ──
  const menuItems = [
    { key: '/dashboard', icon: <HomeOutlined />, label: 'Beranda' },
    // ── NRE: Manajemen Buku ──
    { key: '/books', icon: <BookOutlined />, label: 'Manajemen Buku', permission: 'publishing_read' },
    // ── NRE: Penerbitan Buku ──
    {
      key: 'publishing',
      icon: <FileTextOutlined />,
      label: 'Penerbitan Buku',
      permission: 'publishing_read',
      children: [
        { key: '/publishing/manuscripts', label: 'Naskah & Alur Kerja' },
        { key: '/publishing/authors', label: 'Penulis' },
        { key: '/publishing/contracts', label: 'Kontrak' },
        { key: '/publishing/isbn', label: 'Proses ISBN' },
        { key: '/publishing/sales', label: 'Penjualan Buku' },
      ],
    },
    // ── NRE: Pencetakan Buku ──
    {
      key: 'printing',
      icon: <PrinterOutlined />,
      label: 'Pencetakan Buku',
      permission: 'publishing_read',
      children: [
        { key: '/printing/manuscripts', label: 'Daftar Naskah Cetak' },
        { key: '/printing/orders', label: 'Order Cetak' },
      ],
    },
    // ── PERCETAKAN (Printing Press System) ──
    {
      key: 'percetakan',
      icon: <FactoryOutlined />,
      label: '🏭 Percetakan',
      permission: 'publishing_read',
      children: [
        { key: '/percetakan/orders', label: 'Orders' },
        { key: '/percetakan/production', label: 'Production' },
        { key: '/percetakan/materials', label: 'Materials' },
        { key: '/percetakan/machines', label: 'Machines' },
        { key: '/percetakan/customers', label: 'Customers' },
      ],
    },
    // ── NRE: SDM & HR ──
    {
      key: 'sdm',
      icon: <TeamOutlined />,
      label: 'SDM',
      permission: 'hr_read',
      children: [
        { key: '/sdm/karyawan', label: 'Karyawan' },
        { key: '/sdm/presensi', label: 'Presensi' },
        { key: '/sdm/cuti', label: 'Pengajuan Cuti' },
        { key: '/sdm/lembur', label: 'Lembur' },
      ],
    },
    // ── NRE: Payroll ──
    { key: '/payroll', icon: <UsergroupAddOutlined />, label: 'Payroll', permission: 'payroll_read' },

    // ── Finance & Accounting ──
    {
      key: 'sales',
      icon: <ShoppingCartOutlined />,
      label: 'Penjualan',
      permission: 'invoices_read',
      children: [
        { key: '/sales/overview', label: 'Overview' },
        { key: '/sales/invoices', label: 'Tagihan' },
        { key: '/sales/deliveries', label: 'Pengiriman', permission: 'warehouse_read' },
        { key: '/sales/orders', label: 'Pemesanan' },
        { key: '/sales/quotes', label: 'Penawaran' },
      ],
    },
    {
      key: 'purchases',
      icon: <ShoppingOutlined />,
      label: 'Pembelian',
      permission: 'purchases_read',
      children: [
        { key: '/purchases/overview', label: 'Overview' },
        { key: '/purchases', label: 'Tagihan Pembelian' },
        { key: '/purchases/deliveries', label: 'Pengiriman Pembelian' },
        { key: '/purchases/orders', label: 'Pesanan Pembelian' },
        { key: '/purchases/quotes', label: 'Penawaran Pembelian' },
      ],
    },
    { key: '/expenses', icon: <DollarOutlined />, label: 'Biaya', permission: 'expenses_read' },
    { key: '/products', icon: <InboxOutlined />, label: 'Produk', permission: 'products_read' },
    { key: '/inventory', icon: <AppstoreOutlined />, label: 'Inventori', permission: 'products_read' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Laporan', permission: 'report_financial' },
    { key: '/bank', icon: <BankOutlined />, label: 'Kas & Bank', permission: 'bank_read' },
    { key: '/accounts/coa', icon: <BookOutlined />, label: 'Akun', permission: 'accounts_read' },
    { key: '/assets', icon: <FileTextOutlined />, label: 'Aset Tetap', permission: 'assets_read' },
    { key: '/contacts', icon: <UserOutlined />, label: 'Kontak', permission: 'contacts_read' },
    { key: '/crm', icon: <PhoneOutlined />, label: 'CRM' },
    {
      key: 'pos',
      icon: <DesktopOutlined />,
      label: 'POS',
      children: [
        { key: '/pos/download', label: 'Download' },
        { key: '/pos/favorites', label: 'Produk Favorit' },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Pengaturan',
      permission: 'settings_read',
      children: [
        { key: '/settings/company', label: 'Perusahaan' },
        { key: '/settings/marketplace', label: 'Marketplace' },
        { key: '/settings/payments', label: 'Pembayaran' },
        { key: '/settings/currencies', label: 'Mata Uang' },
      ],
    },
    { key: '/faq', icon: <QuestionCircleOutlined />, label: 'FAQ' },
  ];

  interface MenuItem {
    key: string;
    icon?: React.ReactNode;
    label: string;
    permission?: string;
    children?: MenuItem[];
  }

  // Filter menu items based on permissions
  const filterMenu = (items: MenuItem[]): MenuItem[] => {
    return items.filter((item: MenuItem) => {
      if (item.permission && !hasPermission(item.permission)) return false;
      if (item.children) {
        item.children = filterMenu(item.children);
        if (item.children.length === 0) return false;
      }
      return true;
    });
  };

  const filteredMenuItems = filterMenu([...menuItems]);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // ── Header Quick Action Buttons ──
  const quickActionItems = [
    {
      key: 'sell',
      label: (
        <span onClick={() => navigate('/sales/invoices/add')}>
          <PlusOutlined /> Tagihan Penjualan
        </span>
      ),
    },
    {
      key: 'sell-order',
      label: (
        <span onClick={() => navigate('/sales/orders')}>
          <PlusOutlined /> Pemesanan Penjualan
        </span>
      ),
    },
    {
      key: 'sell-quote',
      label: (
        <span onClick={() => navigate('/sales/quotes')}>
          <PlusOutlined /> Penawaran Penjualan
        </span>
      ),
    },
  ];

  const quickBuyItems = [
    {
      key: 'buy',
      label: (
        <span onClick={() => navigate('/purchases/add')}>
          <PlusOutlined /> Tagihan Pembelian
        </span>
      ),
    },
    {
      key: 'buy-order',
      label: (
        <span onClick={() => navigate('/purchases/orders')}>
          <PlusOutlined /> Pesanan Pembelian
        </span>
      ),
    },
  ];

  const userMenuItems = [
    {
      key: 'greeting',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600 }}>Halo, {user?.name || 'User'}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>Elite Free Trial</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{user?.email}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    { key: 'profile', label: 'Profil', onClick: () => navigate('/profile') },
    { key: 'logout', label: 'Keluar', danger: true, onClick: logout },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          borderRight: '1px solid #f0f0f0',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
        width={220}
      >
        {/* Logo */}
        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => navigate('/dashboard')}
          >
            {collapsed ? (
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 16,
                overflow: 'hidden'
              }}>
                <img src={logoHorizontal} alt="R" style={{ width: '150%', height: '150%', objectFit: 'cover' }} />
              </div>
            ) : (
              <img src={logoHorizontal} alt="New Rizquna Elfath" style={{ height: 32, objectFit: 'contain' }} />
            )}
          </div>
        </div>

        {/* Dummy data warning banner */}
        {!collapsed && (
          <div style={{
            margin: '0 12px 8px', padding: '6px 10px',
            background: '#fffbe6', border: '1px solid #ffe58f',
            borderRadius: 6, fontSize: 11, color: '#ad6800',
            textAlign: 'center',
          }}>
            ⚠️ Data dummy aktif
          </div>
        )}

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={[]}
          items={filteredMenuItems as MenuProps['items']}
          style={{ borderRight: 'none', fontSize: 13 }}
          onClick={handleMenuClick}
        />

        {/* Collapse button at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, width: '100%',
          borderTop: '1px solid #f0f0f0', padding: '8px 0',
          textAlign: 'center',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ width: '100%' }}
          />
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        {/* ── Header ── */}
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            height: 48,
            lineHeight: '48px',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          {/* Left side: Quick actions */}
          <Space size={4}>
            <Dropdown menu={{ items: quickActionItems }} placement="bottomLeft">
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                style={{ background: '#52c41a', borderColor: '#52c41a', fontWeight: 600, fontSize: 12 }}
              >
                Jual
              </Button>
            </Dropdown>
            <Dropdown menu={{ items: quickBuyItems }} placement="bottomLeft">
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                style={{ fontWeight: 600, fontSize: 12 }}
              >
                Beli
              </Button>
            </Dropdown>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => navigate('/expenses/add')}
              style={{ background: '#fa8c16', borderColor: '#fa8c16', fontWeight: 600, fontSize: 12 }}
            >
              Biaya
            </Button>
            <Input
              placeholder="Cari..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              size="small"
              style={{ width: 160, marginLeft: 8 }}
            />
          </Space>

          {/* Right side: Company, Language, Clock, Bell, Dark Mode, Profile */}
          <Space size={8} align="center">
            <span style={{ fontWeight: 600, fontSize: 12, color: '#262626', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {user?.tenant?.name || 'RIZQUNA ELFATH'}
            </span>
            <Divider type="vertical" style={{ margin: '0 4px' }} />
            <Tooltip title="Bahasa">
              <Button type="text" size="small" icon={<GlobalOutlined />} style={{ fontSize: 12 }}>
                id
              </Button>
            </Tooltip>
            <Tooltip title="Riwayat Aktivitas">
              <Button type="text" size="small" icon={<ClockCircleOutlined />} />
            </Tooltip>
            <Tooltip title="Notifikasi">
              <Badge count={0} size="small">
                <Button type="text" size="small" icon={<BellOutlined />} />
              </Badge>
            </Tooltip>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Avatar
                size={28}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer', background: '#4f46e5' }}
              />
            </Dropdown>
          </Space>
        </Header>

        {/* ── Content ── */}
        <Content
          style={{
            margin: '16px',
            padding: 20,
            minHeight: 280,
            background: '#f5f5f5',
            borderRadius: borderRadiusLG,
          }}
        >
          <div style={{ background: colorBgContainer, borderRadius: borderRadiusLG, padding: 24, minHeight: 'calc(100vh - 160px)' }}>
            {children}
          </div>
        </Content>

        {/* ── Footer ── */}
        <Footer style={{
          textAlign: 'center',
          padding: '12px 50px',
          background: colorBgContainer,
          borderTop: '1px solid #f0f0f0',
          fontSize: 12,
          color: '#8c8c8c',
        }}>
          © 2026 NRE Enterprise v3.0.95 All rights reserved
        </Footer>
      </Layout>

      {/* ── Floating Help Button ── */}
      <FloatButton
        icon={<CustomerServiceOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24, width: 48, height: 48 }}
        tooltip="Bantuan"
      />
    </Layout>
  );
};

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) return <div>Loading Profile...</div>;

  if (!token || !user) {
    // Stay within the React SPA — redirect to the SPA login page
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/admin">
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/*"
                element={
                  <AuthGuard>
                    <MainLayout>
                      <Routes>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        {/* Contacts */}
                        <Route path="/contacts" element={<ContactsPage />} />
                        <Route path="/contacts/add" element={<AddContactPage />} />
                        <Route path="/contacts/:id" element={<ContactDetailPage />} />
                        {/* Sales */}
                        <Route path="/sales/invoices" element={<InvoicesPage />} />
                        <Route path="/sales/invoices/add" element={<AddInvoicePage />} />
                        <Route path="/sales/invoices/:id" element={<InvoiceDetailPage />} />
                        <Route path="/sales/overview" element={<SalesOverviewPage />} />
                        <Route path="/sales/deliveries" element={<DeliveriesPage />} />
                        <Route path="/sales/orders" element={<SalesOrdersPage />} />
                        <Route path="/sales/quotes" element={<SalesQuotesPage />} />
                        {/* Products & Inventory */}
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/add" element={<AddProductPage />} />
                        <Route path="/products/:id" element={<ProductDetailPage />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        {/* Reports */}
                        <Route path="/reports" element={<ReportsIndexPage />} />
                        <Route path="/reports/profit-loss" element={<ProfitLossPage />} />
                        <Route path="/reports/cash-flow" element={<CashFlowPage />} />
                        <Route path="/reports/balance-sheet" element={<BalanceSheetPage />} />
                        <Route path="/reports/trial-balance" element={<TrialBalancePage />} />
                        <Route path="/reports/general-ledger" element={<GeneralLedgerPage />} />
                        {/* Purchases */}
                        <Route path="/purchases" element={<PurchasesPage />} />
                        <Route path="/purchases/add" element={<AddPurchasePage />} />
                        <Route path="/purchases/overview" element={<PurchaseOverviewPage />} />
                        <Route path="/purchases/deliveries" element={<DeliveriesPage />} />
                        <Route path="/purchases/orders" element={<PurchaseOrdersPage />} />
                        <Route path="/purchases/quotes" element={<PurchaseQuotesPage />} />
                        {/* Expenses */}
                        <Route path="/expenses" element={<ExpensesPage />} />
                        <Route path="/expenses/add" element={<AddExpensePage />} />
                        {/* Bank */}
                        <Route path="/bank" element={<BanksPage />} />
                        {/* Accounts */}
                        <Route path="/accounts/coa" element={<ChartOfAccountsPage />} />
                        <Route path="/accounts/journals" element={<JournalEntriesPage />} />
                        <Route path="/accounts/journals/add" element={<AddJournalEntryPage />} />
                        {/* Fixed Assets */}
                        <Route path="/assets" element={<FixedAssetsPage />} />
                        <Route path="/assets/add" element={<AddAssetPage />} />
                        {/* Payroll */}
                        <Route path="/payroll/employees" element={<EmployeesPage />} />
                        <Route path="/payroll/employees/add" element={<AddEmployeePage />} />
                        {/* CRM */}
                        <Route path="/crm" element={<CRMPage />} />
                        {/* POS */}
                        <Route path="/pos" element={<POSPage />} />
                        <Route path="/pos/download" element={<POSPage />} />
                        <Route path="/pos/favorites" element={<POSPage />} />
                        {/* Warehouses */}
                        <Route path="/warehouses" element={<WarehousesPage />} />
                        <Route path="/warehouses/add" element={<AddWarehousePage />} />
                        {/* Settings */}
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/settings/marketplace" element={<MarketplacePage />} />
                        <Route path="/settings/payments" element={<PaymentsPage />} />
                        <Route path="/settings/currencies" element={<CurrenciesPage />} />
                        <Route path="/settings/company" element={<CompanyProfilePage />} />
                        {/* Profile */}
                        <Route path="/profile" element={<ProfilePage />} />
                        {/* FAQ */}
                        <Route path="/faq" element={<FAQPage />} />
                        {/* ── NRE: SDM Routes ── */}
                        <Route path="/sdm/karyawan" element={<KaryawanPage />} />
                        <Route path="/sdm/presensi" element={<PresensiPage />} />
                        <Route path="/sdm/cuti" element={<CutiPage />} />
                        <Route path="/sdm/lembur" element={<LemburPage />} />
                        {/* ── NRE: Manajemen Buku ── */}
                        <Route path="/books" element={<ManajemenBukuPage />} />
                        {/* ── NRE: Penerbitan Buku Routes ── */}
                        <Route path="/publishing/manuscripts" element={<NaskahPenerbitanPage />} />
                        <Route path="/publishing/authors" element={<PenulisPage />} />
                        <Route path="/publishing/contracts" element={<KontrakPage />} />
                        <Route path="/publishing/isbn" element={<ProsesISBNPage />} />
                        <Route path="/publishing/sales" element={<PenjualanBukuPage />} />
                        {/* ── NRE: Pencetakan Buku Routes ── */}
                        <Route path="/printing/manuscripts" element={<NaskahCetakPage />} />
                        <Route path="/printing/orders" element={<OrderCetakPage />} />
                        {/* ── NRE: Payroll Route ── */}
                        <Route path="/payroll" element={<PayrollNREPage />} />
                        {/* ── PERCETAKAN (Printing Press) Routes ── */}
                        <Route path="/percetakan/orders" element={<OrderListPage />} />
                        <Route path="/percetakan/orders/new" element={<OrderEntryPage />} />
                        <Route path="/percetakan/orders/:id" element={<OrderDetailPage />} />
                        <Route path="/percetakan/production" element={<ProductionDashboardPage />} />
                        {/* 404 */}
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </MainLayout>
                  </AuthGuard>
                }
              />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
