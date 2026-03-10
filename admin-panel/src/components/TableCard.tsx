import React from 'react';
import { colors, spacing, fontSize, fontWeight } from '../theme/tokens';

interface TableCardProps {
  title?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const TableCard: React.FC<TableCardProps> = ({ title, toolbar, children, footer, loading, className }) => {
  return (
    <div
      className={`table-card ${className || ''}`}
      style={{
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        opacity: loading ? 0.6 : 1,
        pointerEvents: loading ? 'none' : 'auto',
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLDivElement;
        target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLDivElement;
        target.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
      }}
    >
      {/* Header Section */}
      {(title || toolbar) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: spacing[5],
            borderBottom: `1px solid ${colors.secondary[100]}`,
            backgroundColor: colors.secondary[50],
          }}
        >
          {title && (
            <h3
              style={{
                margin: 0,
                fontSize: fontSize.lg,
                fontWeight: fontWeight.semibold,
                color: colors.secondary[900],
              }}
            >
              {title}
            </h3>
          )}
          {toolbar && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                marginLeft: title ? 'auto' : 0,
              }}
            >
              {toolbar}
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div style={{ position: 'relative' }}>
        {children}
      </div>

      {/* Footer Section */}
      {footer && (
        <div
          style={{
            padding: spacing[4],
            borderTop: `1px solid ${colors.secondary[100]}`,
            backgroundColor: colors.secondary[50],
          }}
        >
          {footer}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ color: colors.secondary[600], fontWeight: fontWeight.medium }}>
            Loading...
          </div>
        </div>
      )}
    </div>
  );
};

export default TableCard;
