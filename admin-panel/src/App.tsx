import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import {
  Layout,
  Menu,
  Button,
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
  SettingOutlined,
  BankOutlined,
  ContactsOutlined,
  WalletOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  ScheduleOutlined,
  PieChartOutlined,

  TransactionOutlined,
  AuditOutlined,
  GlobalOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

// Styles & Theme
import './App.css';
import themeConfig from './theme/themeConfig';
import logoNre from './assets/logo-nre.png';

// Security
import FinancePinGuard, { clearPinSession } from './components/FinancePinGuard';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/auth/ProfilePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Dashboard
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));

// Finance
const InvoicesPage = React.lazy(() => import('./pages/finance/InvoicesPage'));
const ExpensesPage = React.lazy(() => import('./pages/finance/ExpensesPage'));


const BanksPage = React.lazy(() => import('./pages/finance/BanksPage'));
const ContactsPage = React.lazy(() => import('./pages/finance/ContactsPage'));

// Reports
const ProfitLossPage = React.lazy(() => import('./pages/finance/ProfitLossPage'));
const BalanceSheetPage = React.lazy(() => import('./pages/finance/BalanceSheetPage'));
const CashFlowPage = React.lazy(() => import('./pages/finance/CashFlowPage'));
const TrialBalancePage = React.lazy(() => import('./pages/finance/TrialBalancePage'));
const GeneralLedgerPage = React.lazy(() => import('./pages/finance/GeneralLedgerPage'));
const DebtsPage = React.lazy(() => import('./pages/finance/DebtsPage'));
const ReceivablesPage = React.lazy(() => import('./pages/finance/ReceivablesPage'));
const CashBookPage = React.lazy(() => import('./pages/finance/CashBookPage'));
const FinanceReportsPage = React.lazy(() => import('./pages/finance/FinanceReportsPage'));

// Security & Sessions
const AuditLogsPage = React.lazy(() => import('./pages/AuditLogsPage'));
const SecuritySessionsPage = React.lazy(() => import('./pages/auth/SecuritySessionsPage'));

// Percetakan
// Removing Orders and Materials as per user request (finance only)

// Kalkulator
const CalculatorIndexPage = React.lazy(() => import('./pages/kalkulator/CalculatorIndexPage'));
const SpandukCalculatorPage = React.lazy(() => import('./pages/kalkulator/SpandukCalculatorPage'));
const BrosurCalculatorPage = React.lazy(() => import('./pages/kalkulator/BrosurCalculatorPage'));
const BukuCalculatorPage = React.lazy(() => import('./pages/kalkulator/BukuCalculatorPage'));
const KartuNamaCalculatorPage = React.lazy(() => import('./pages/kalkulator/KartuNamaCalculatorPage'));
const StikerCalculatorPage = React.lazy(() => import('./pages/kalkulator/StikerCalculatorPage'));
const SpineCalculatorPage = React.lazy(() => import('./pages/kalkulator/SpineCalculatorPage'));
const BeratCalculatorPage = React.lazy(() => import('./pages/kalkulator/BeratCalculatorPage'));

// Settings
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

// Admin
const UserManagementPage = React.lazy(() => import('./pages/admin/UserManagementPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

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
    { key: '/dashboard', icon: <HomeOutlined style={{ color: '#3b82f6', filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2))' }} />, label: 'Dashboard' },
    { type: 'divider' as const },

    {
      label: 'KEUANGAN', type: 'group' as const, children: [
        { key: '/finance/invoices', icon: <FileTextOutlined style={{ color: '#0fb9b1' }} />, label: 'Invoice' },
        ...(user?.role === 'Admin' ? [
          { key: '/finance/expenses', icon: <DollarOutlined style={{ color: '#ef4444' }} />, label: 'Biaya' },
          { key: '/finance/debts', icon: <ScheduleOutlined style={{ color: '#f59e0b' }} />, label: 'Utang' },
          { key: '/finance/receivables', icon: <TransactionOutlined style={{ color: '#10b981' }} />, label: 'Piutang' },
          { key: '/finance/cash-book', icon: <WalletOutlined style={{ color: '#6366f1' }} />, label: 'Buku Kas' },
          { key: '/finance/reports', icon: <PieChartOutlined style={{ color: '#f97316' }} />, label: 'Laporan Kas' },
          { key: '/finance/banks', icon: <BankOutlined style={{ color: '#0ea5e9' }} />, label: 'Bank' },
          { key: '/finance/contacts', icon: <ContactsOutlined style={{ color: '#ec4899' }} />, label: 'Kontak' },
        ] : [])
      ]
    },

    {
      label: 'PERCETAKAN', type: 'group' as const, children: [
        { key: '/kalkulator', icon: <CalculatorOutlined style={{ color: '#10b981' }} />, label: 'Kalkulator Cetak' },
      ]
    },

    ...(user?.role === 'Admin' ? [{
      label: 'ADMIN', type: 'group' as const, children: [
        { key: '/admin/users', icon: <TeamOutlined style={{ color: '#8b5cf6' }} />, label: 'Pengguna' },
        { key: '/audit/logs', icon: <AuditOutlined style={{ color: '#6366f1' }} />, label: 'Log Aktivitas' },
        { key: '/user/sessions', icon: <GlobalOutlined style={{ color: '#14b8a6' }} />, label: 'Sesi Aktif' },
      ]
    }] : []),

    { type: 'divider' as const },
    { key: '/settings', icon: <SettingOutlined style={{ color: '#94a3b8' }} />, label: 'Pengaturan' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Keluar', danger: true, onClick: () => { clearPinSession(); logout(); } },
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
    { key: 'logout', label: 'Keluar', danger: true, onClick: () => { clearPinSession(); logout(); } },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Background Decorative Shapes */}
      <div className="bg-shape bg-shape-1" />
      <div className="bg-shape bg-shape-2" />

      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        width={280}
        collapsedWidth={80}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo Section — Clean branding */}
        <div style={{
          padding: collapsed ? '24px 16px' : '24px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid #f0f0f0',
          marginBottom: 8,
        }}>
          <img
            src={logoNre}
            alt="Logo"
            style={{ width: 38, height: 38, objectFit: 'contain', flexShrink: 0 }}
          />
          {!collapsed && (
            <div style={{ fontSize: 17, fontWeight: 800, color: '#333', letterSpacing: '0.5px' }}>
              RIZQUNA.ID
            </div>
          )}
        </div>

        {/* Menu */}
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 8 }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ borderRight: 'none', padding: '0 4px' }}
            onClick={({ key }) => {
              if (key !== 'logout') navigate(key);
            }}
          />
        </div>

        {/* Bottom: User Profile + Collapse — Fillow-style */}
        <div style={{ borderTop: '1px solid #f0f0f0', padding: collapsed ? '12px 8px' : '16px' }}>
          {!collapsed && user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              borderRadius: 14,
              background: '#f8f8f8',
              marginBottom: 10,
            }}>
              <Avatar
                size={36}
                icon={<UserOutlined />}
                style={{ background: 'linear-gradient(135deg, #0fb9b1, #20bf6b)', flexShrink: 0 }}
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ width: '100%', color: '#aaa', height: 40, borderRadius: 10, fontSize: 16 }}
          />
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: 'transparent' }}>
        <Header
          className="premium-header"
          style={{
            padding: '0 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 72,
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 20, color: '#333', letterSpacing: -0.3 }}>
            {(() => {
              // Find label from flat + grouped items
              for (const item of menuItems || []) {
                if ((item as any)?.key === location.pathname) return (item as any).label;
                if ((item as any)?.children) {
                  const child = (item as any).children.find((c: any) => c?.key === location.pathname);
                  if (child) return child.label;
                }
              }
              return 'Dashboard';
            })()}
          </div>

          <Dropdown menu={{ items: userMenuItems, onClick: ({ key }) => key === 'logout' ? logout() : navigate(key) }} placement="bottomRight" trigger={['click']}>
            <Avatar
              size={42}
              icon={<UserOutlined />}
              style={{
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #0fb9b1, #20bf6b)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(15, 185, 177, 0.25)',
                transition: 'all 0.3s',
              }}
            />
          </Dropdown>
        </Header>

        <Content style={{ padding: '28px 40px', minHeight: 'calc(100vh - 72px)' }}>
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

  if (loading) return <PageLoader />;
  // ✅ Rely only on user state from httpOnly cookie session, not localStorage
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ConfigProvider theme={themeConfig}>
      <QueryClientProvider client={queryClient}>
        <Router basename="/admin">
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

                          {/* Financial pages */}
                          <Route path="/finance/invoices" element={<InvoicesPage />} />
                          <Route path="/finance/expenses" element={<ExpensesPage />} />
                          <Route path="/finance/debts" element={<DebtsPage />} />
                          <Route path="/finance/receivables" element={<ReceivablesPage />} />
                          <Route path="/finance/cash-book" element={<CashBookPage />} />
                          <Route path="/finance/reports" element={<FinanceReportsPage />} />


                          {/* Bank page — protected by PIN guard (sensitive account data) */}
                          <Route path="/finance/banks" element={<FinancePinGuard><BanksPage /></FinancePinGuard>} />
                          <Route path="/finance/contacts" element={<ContactsPage />} />

                          <Route path="/reports/profit-loss" element={<ProfitLossPage />} />
                          <Route path="/reports/balance-sheet" element={<BalanceSheetPage />} />
                          <Route path="/reports/cash-flow" element={<CashFlowPage />} />
                          <Route path="/reports/trial-balance" element={<TrialBalancePage />} />
                          <Route path="/reports/general-ledger" element={<GeneralLedgerPage />} />



                          <Route path="/audit/logs" element={<AuditLogsPage />} />
                          <Route path="/user/sessions" element={<SecuritySessionsPage />} />

                          <Route path="/kalkulator" element={<CalculatorIndexPage />} />
                          <Route path="/kalkulator/spanduk" element={<SpandukCalculatorPage />} />
                          <Route path="/kalkulator/brosur" element={<BrosurCalculatorPage />} />
                          <Route path="/kalkulator/buku" element={<BukuCalculatorPage />} />
                          <Route path="/kalkulator/kartu-nama" element={<KartuNamaCalculatorPage />} />
                          <Route path="/kalkulator/stiker" element={<StikerCalculatorPage />} />
                          <Route path="/kalkulator/spine" element={<SpineCalculatorPage />} />
                          <Route path="/kalkulator/berat" element={<BeratCalculatorPage />} />

                          <Route path="/admin/users" element={<UserManagementPage />} />

                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/profile" element={<ProfilePage />} />

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
    </ConfigProvider>
  );
};

export default App;
