import React from 'react';
import { colors, fontSize, fontWeight, spacing, transition, semanticColors } from '../theme/tokens';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  borderColor?: string;
  trend?: string;
  prefix?: string;
  subtitle?: string;
  onClick?: () => void;
}

const formatCompact = (v: number): string => {
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}rb`;
  return v.toLocaleString('id-ID');
};

const getTypeColors = (type?: string) => {
  switch (type) {
    case 'success':
      return semanticColors.success;
    case 'warning':
      return semanticColors.warning;
    case 'danger':
      return semanticColors.danger;
    case 'info':
      return semanticColors.info;
    case 'primary':
    default:
      return semanticColors.primary;
  }
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  type = 'primary',
  borderColor,
  trend,
  prefix = '',
  subtitle,
  onClick
}) => {
  const isPositive = trend?.startsWith('+');
  const typeColors = getTypeColors(type);
  const iconBgColor = borderColor || typeColors.bg;
  const iconColor = borderColor || typeColors.icon;

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: 20,
        padding: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header: Label & Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing[3]
        }}
      >
        <div style={{ flex: 1 }}>
          <span
            style={{
              fontSize: fontSize.sm,
              color: colors.secondary[600],
              fontWeight: fontWeight.medium,
              display: 'block',
              marginBottom: spacing[1]
            }}
          >
            {label}
          </span>
          {subtitle && (
            <span
              style={{
                fontSize: fontSize.xs,
                color: colors.secondary[400],
                fontWeight: fontWeight.normal
              }}
            >
              {subtitle}
            </span>
          )}
        </div>

        {icon && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 8,
              background: iconBgColor,
              fontSize: 18,
              color: iconColor,
              flexShrink: 0,
              transition: `transform ${transition.fast}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: fontSize['2xl'],
          fontWeight: fontWeight.bold,
          color: colors.secondary[900],
          letterSpacing: -0.5,
          lineHeight: 1.2,
          marginBottom: trend ? spacing[2] : 0
        }}
      >
        {prefix}
        {typeof value === 'number' ? formatCompact(value) : value}
      </div>

      {/* Trend Indicator */}
      {trend && (
        <div
          style={{
            fontSize: fontSize.xs,
            fontWeight: fontWeight.medium,
            color: isPositive ? colors.success : colors.danger,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
            marginTop: spacing[2]
          }}
        >
          <span style={{ fontWeight: fontWeight.bold }}>{trend}</span>
          <span style={{ color: colors.secondary[400], fontWeight: fontWeight.normal }}>
            vs bulan lalu
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
