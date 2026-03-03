import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import {
  Layout,
  Menu,
  Button,
  Space,
  Avatar,
  Dropdown,
  Spin,
  ConfigProvider,
} from 'antd';
import {
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DollarOutlined,
  BookOutlined,
  PrinterOutlined,
  TeamOutlined,
  SettingOutlined,
  AuditOutlined,
  FileSearchOutlined,
  BankOutlined,
  ContactsOutlined,
  DollarCircleOutlined,
  WalletOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

// Styles & Theme
import './App.css';
import themeConfig from './theme/themeConfig';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/auth/ProfilePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Dashboard
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));

// Finance
const FinanceOverviewPage = React.lazy(() => import('./pages/finance/FinanceOverviewPage'));
const InvoicesPage = React.lazy(() => import('./pages/finance/InvoicesPage'));
const ExpensesPage = React.lazy(() => import('./pages/finance/ExpensesPage'));
const JournalEntriesPage = React.lazy(() => import('./pages/finance/JournalEntriesPage'));
const ChartOfAccountsPage = React.lazy(() => import('./pages/finance/ChartOfAccountsPage'));
const BanksPage = React.lazy(() => import('./pages/finance/BanksPage'));
const ContactsPage = React.lazy(() => import('./pages/finance/ContactsPage'));

// Reports
const ReportsPage = React.lazy(() => import('./pages/finance/ReportsIndexPage'));
const ProfitLossPage = React.lazy(() => import('./pages/finance/ProfitLossPage'));
const BalanceSheetPage = React.lazy(() => import('./pages/finance/BalanceSheetPage'));
const CashFlowPage = React.lazy(() => import('./pages/finance/CashFlowPage'));
const TrialBalancePage = React.lazy(() => import('./pages/finance/TrialBalancePage'));
const GeneralLedgerPage = React.lazy(() => import('./pages/finance/GeneralLedgerPage'));
const DebtsPage = React.lazy(() => import('./pages/finance/DebtsPage'));
const ReceivablesPage = React.lazy(() => import('./pages/finance/ReceivablesPage'));
const CashBookPage = React.lazy(() => import('./pages/finance/CashBookPage'));
const FinanceReportsPage = React.lazy(() => import('./pages/finance/FinanceReportsPage'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
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

const { Header, Content, Sider } = Layout;

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems: MenuProps['items'] = [
    { key: '/dashboard', icon: <HomeOutlined />, label: 'Dashboard' },
    { type: 'divider' },

    {
      label: 'KEUANGAN', type: 'group', children: [
        { key: '/finance/invoices', icon: <AuditOutlined />, label: 'Invoice' },
        { key: '/finance/expenses', icon: <DollarOutlined />, label: 'Biaya' },
        { key: '/finance/debts', icon: <FileSearchOutlined />, label: 'Utang' },
        { key: '/finance/receivables', icon: <DollarCircleOutlined />, label: 'Piutang' },
        { key: '/finance/cash-book', icon: <WalletOutlined />, label: 'Buku Kas' },
        { key: '/finance/reports', icon: <BarChartOutlined />, label: 'Laporan Kas' },
        { key: '/finance/reports-index', icon: <BarChartOutlined />, label: 'Laporan Akuntansi' },
        { key: '/finance/journals', icon: <FileSearchOutlined />, label: 'Jurnal' },
        { key: '/finance/accounts', icon: <AuditOutlined />, label: 'Akun' },
        { key: '/finance/banks', icon: <BankOutlined />, label: 'Bank' },
        { key: '/finance/contacts', icon: <ContactsOutlined />, label: 'Kontak' },
      ]
    },

    {
      label: 'MODUL LAIN', type: 'group', children: [
        { key: '/publishing', icon: <BookOutlined />, label: 'Penerbitan' },
        { key: '/percetakan', icon: <PrinterOutlined />, label: 'Percetakan' },
      ]
    },

    { type: 'divider' },
    { key: '/users', icon: <TeamOutlined />, label: 'User Admin' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Pengaturan' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Keluar', danger: true, onClick: logout },
  ];

  const userMenuItems = [
    {
      key: 'userinfo',
      label: (
        <div style={{ padding: '8px 4px' }}>
          <div style={{ fontWeight: 600 }}>{user?.name || 'Admin'}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{user?.email}</div>
        </div>
      ),
      disabled: true,
    },
    { key: '/profile', label: 'Profil Saya', icon: <UserOutlined /> },
    { type: 'divider' as const },
    { key: 'logout', label: 'Keluar', danger: true, onClick: logout },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
      {/* Background Decorative Shapes */}
      <div className="bg-shape bg-shape-1" />
      <div className="bg-shape bg-shape-2" />

      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        width={280}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflowY: 'auto'
        }}
      >
        <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #0fb9b1, #20bf6b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 20,
            boxShadow: '0 8px 16px rgba(15, 185, 177, 0.25)'
          }}>
            R
          </div>
          {!collapsed && (
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5 }}>
              Rizquna <span style={{ color: '#0fb9b1' }}>Kasir</span>
            </span>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 'none', padding: '0 8px' }}
          onClick={({ key }) => {
            if (key !== 'logout') navigate(key);
          }}
        />

        <div style={{ padding: '24px', marginTop: 'auto' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ width: '100%', color: '#94a3b8', height: 48, borderRadius: 12 }}
          />
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: 'transparent' }}>
        <Header
          className="premium-header"
          style={{
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 80,
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 18, color: '#1e293b' }}>
            {(menuItems.find((item: any) => item?.key === location.pathname) as any)?.label || 'Dashboard'}
          </div>

          <Dropdown menu={{ items: userMenuItems, onClick: ({ key }) => key === 'logout' ? logout() : navigate(key) }} placement="bottomRight" trigger={['click']}>
            <Space style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: 16, background: '#f1f5f9' }}>
              <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{user?.name || 'Admin'}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Administrator</div>
              </div>
              <Avatar
                size={40}
                icon={<UserOutlined />}
                style={{ background: 'linear-gradient(135deg, #0fb9b1, #20bf6b)', color: '#fff' }}
              />
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ padding: '32px', minHeight: 'calc(100vh - 80px)' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                {children}
              </PageTransition>
            </AnimatePresence>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) return <PageLoader />;
  if (!token || !user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ConfigProvider theme={themeConfig}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/*"
                  element={
                    <AuthGuard>
                      <MainLayout>
                        <Routes>
                          <Route path="/dashboard" element={<DashboardPage />} />

                          <Route path="/finance" element={<FinanceOverviewPage />} />
                          <Route path="/finance/invoices" element={<InvoicesPage />} />
                          <Route path="/finance/expenses" element={<ExpensesPage />} />
                          <Route path="/finance/debts" element={<DebtsPage />} />
                          <Route path="/finance/receivables" element={<ReceivablesPage />} />
                          <Route path="/finance/cash-book" element={<CashBookPage />} />
                          <Route path="/finance/reports" element={<FinanceReportsPage />} />
                          <Route path="/finance/reports-index" element={<ReportsPage />} />
                          <Route path="/finance/journals" element={<JournalEntriesPage />} />
                          <Route path="/finance/accounts" element={<ChartOfAccountsPage />} />
                          <Route path="/finance/banks" element={<BanksPage />} />
                          <Route path="/finance/contacts" element={<ContactsPage />} />

                          <Route path="/reports/profit-loss" element={<ProfitLossPage />} />
                          <Route path="/reports/balance-sheet" element={<BalanceSheetPage />} />
                          <Route path="/reports/cash-flow" element={<CashFlowPage />} />
                          <Route path="/reports/trial-balance" element={<TrialBalancePage />} />
                          <Route path="/reports/general-ledger" element={<GeneralLedgerPage />} />
                          <Route path="/accounts/journals" element={<JournalEntriesPage />} />

                          <Route path="/profile" element={<ProfilePage />} />

                          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
    </ConfigProvider>
  );
};

export default App;
