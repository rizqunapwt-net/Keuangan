import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#0fb9b1', // Rizquna Teal
    colorInfo: '#0fb9b1',
    borderRadius: 12,
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    colorBgLayout: '#f8fafc',
    colorLink: '#0fb9b1',
  },
  components: {
    Button: {
      borderRadius: 12,
      fontWeight: 600,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 24,
      boxShadowTertiary: '0 10px 15px -3px rgba(0, 0, 0, 0.04)',
    },
    Menu: {
      itemBorderRadius: 12,
      itemSelectedBg: 'rgba(15, 185, 177, 0.1)',
      itemSelectedColor: '#0fb9b1',
    },
    Layout: {
      headerBg: 'rgba(255, 255, 255, 0.8)',
      siderBg: '#ffffff',
    },
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#64748b',
      headerBorderRadius: 12,
    },
  },
};

export default theme;
