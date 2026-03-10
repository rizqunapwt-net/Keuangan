import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#0fb9b1',
    colorInfo: '#0fb9b1',
    borderRadius: 14,
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    colorBgLayout: '#f5f5f5',
    colorLink: '#0fb9b1',
    colorText: '#333333',
    colorTextSecondary: '#888888',
    colorBorder: '#eeeeee',
    colorBorderSecondary: '#f0f0f0',
    fontSize: 14,
  },
  components: {
    Button: {
      borderRadius: 10,
      fontWeight: 600,
      controlHeight: 42,
    },
    Card: {
      borderRadiusLG: 20,
      boxShadowTertiary: '0 2px 12px rgba(0, 0, 0, 0.04)',
    },
    Menu: {
      itemBorderRadius: 14,
      itemSelectedBg: 'rgba(15, 185, 177, 0.12)',
      itemSelectedColor: '#0fb9b1',
      itemHoverBg: 'rgba(15, 185, 177, 0.06)',
      itemHoverColor: '#0fb9b1',
      groupTitleFontSize: 11,
      groupTitleColor: '#aaa',
    },
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#999',
      headerBorderRadius: 14,
    },
    Input: {
      borderRadius: 10,
    },
    Select: {
      borderRadius: 10,
    },
    Modal: {
      borderRadiusLG: 20,
    },
    Tag: {
      borderRadiusSM: 8,
    },
    Tabs: {
      itemSelectedColor: '#0fb9b1',
      inkBarColor: '#0fb9b1',
    },
  },
};

export default theme;
