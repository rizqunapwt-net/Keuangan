import React from 'react';
import { Breadcrumb, Typography } from 'antd';
import { spacing } from '../theme/tokens';


const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumb?: { label: string; path?: string }[];
  extra?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, description, breadcrumb, extra }) => {
  return (
    <div
      className="page-header-container"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: spacing[4],
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      <div style={{ flex: '1', minWidth: 0 }}>
        {/* Breadcrumb Navigation - Modernized */}
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" style={{ marginBottom: 4 }}>
            <Breadcrumb
              separator={<span style={{ color: '#ccc', margin: '0 4px' }}>/</span>}
              items={breadcrumb.map((b, i) => ({
                title: (
                  <span style={{
                    color: i === breadcrumb.length - 1 ? '#0fb9b1' : '#aaa',
                    fontWeight: 700,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    transition: 'color 0.2s ease'
                  }}>
                    {b.label}
                  </span>
                )
              }))}
            />
          </nav>
        )}

        {/* Page Title - Spacious & Bold */}
        <Title
          level={3}
          style={{
            fontWeight: 800,
            margin: 0,
            color: '#333',
            letterSpacing: '-0.5px'
          }}
        >
          {title}
        </Title>

        {/* Subtitle or Description */}
        {(subtitle || description) && (
          <Text
            style={{
              fontSize: 13,
              color: '#aaa',
              marginTop: 4,
              display: 'block',
              maxWidth: '600px',
              lineHeight: 1.5,
              fontWeight: 500
            }}
          >
            {description || subtitle}
          </Text>
        )}
      </div>

      {/* Action Area */}
      {extra && (
        <div
          className="header-extra-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            flexShrink: 0
          }}
        >
          {extra}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
