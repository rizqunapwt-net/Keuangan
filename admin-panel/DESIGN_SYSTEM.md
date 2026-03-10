# Rizquna Kasir Admin Panel - Design System Guide

## 🎨 Design Philosophy

**Modern & Minimalist** design with **Trustworthy & Secure** personality, optimized for financial/accounting applications.

### Core Principles

1. **Clarity First** - Information hierarchy is paramount
2. **Less is More** - Minimal visual noise, maximum signal
3. **Trust Through Design** - Professional, reliable appearance
4. **Consistency** - Unified design language across all screens
5. **Accessibility** - WCAG AA+ compliance for all components
6. **Performance** - Fast, responsive interactions

---

## 🎯 Color System

### Primary Colors (Trust & Stability)

- **Primary 600**: `#0d9488` - Main action color, primary buttons, active states
- **Primary 500-700**: Hover and focus states
- **Primary 50**: `#f0fdfa` - Backgrounds, subtle highlights

**Usage:**
```typescript
import { colors } from '@/theme/tokens';

// Primary action
<Button style={{ background: colors.primary[600] }} />

// Background
<Card style={{ background: colors.primary[50] }} />
```

### Secondary Colors (Professional Neutrals)

Used for text, borders, and neutral UI elements:
- **Secondary 900**: `#111827` - Primary text (99% of text)
- **Secondary 600**: `#4b5563` - Secondary text, soft UI elements
- **Secondary 200**: `#e5e7eb` - Borders, dividers
- **Secondary 50**: `#f9fafb` - Light backgrounds, page background

### Status Colors

#### Success (Green)
- Main: `#16a34a`
- Background: `#f0fdf4`
- Border: `#bbf7d0`

#### Warning (Amber)
- Main: `#f59e0b`
- Background: `#fffbeb`
- Border: `#fde68a`

#### Danger/Error (Red)
- Main: `#dc2626`
- Background: `#fef2f2`
- Border: `#fecaca`

#### Info (Blue)
- Main: `#2563eb`
- Background: `#eff6ff`
- Border: `#bfdbfe`

**Usage in Components:**
```typescript
// Status badge
<Tag style={{
  background: colors.success[50],
  borderColor: colors.success[200],
  color: colors.success[700]
}}>
  ✓ Approved
</Tag>

// Alert message
<Alert
  type="warning"
  message="Confirm action"
  style={{
    background: colors.warning[50],
    borderColor: colors.warning[200],
    color: colors.warning[700]
  }}
/>
```

---

## 📐 Spacing System

Based on 8px unit (ensures consistent vertical and horizontal rhythm):

```typescript
import { spacing } from '@/theme/tokens';

spacing[1]  = 4px   // xs - tight spacing
spacing[2]  = 8px   // sm - minimal spacing
spacing[3]  = 12px  // md - small spacing
spacing[4]  = 16px  // lg - standard spacing (most used)
spacing[5]  = 20px  // xl - comfortable spacing
spacing[6]  = 24px  // 2xl - loose spacing
spacing[8]  = 32px  // larger gaps between sections
```

**Best Practices:**
- Use `spacing[4]` (16px) for most padding/margins
- Use `spacing[3]` (12px) for form labels and input spacing
- Use `spacing[6]` (24px) for card padding
- Use `spacing[8]` (32px) for page sections

---

## 🔤 Typography System

### Font: Inter (Google Fonts)
Modern, readable typeface optimized for screen reading.

### Scale
```typescript
import { fontSize, fontWeight } from '@/theme/tokens';

fontSize.xs      = 12px   // Labels, captions
fontSize.sm      = 13px   // Body text (default)
fontSize.base    = 14px   // Regular text
fontSize.lg      = 16px   // Larger text, subheadings
fontSize.xl      = 18px   // Small headings
fontSize['2xl']  = 22px   // Section headings
fontSize['3xl']  = 28px   // Page title
fontSize['4xl']  = 30px   // Hero title
fontSize['5xl']  = 36px   // Large hero title
```

### Font Weights
```typescript
fontWeight.light      = 300  // Not commonly used
fontWeight.normal     = 400  // Body text
fontWeight.medium     = 500  // Labels, emphasis
fontWeight.semibold   = 600  // Subheadings
fontWeight.bold       = 700  // Headings, important text
fontWeight.extrabold  = 800  // Page titles (rare)
```

### Heading Hierarchy
```typescript
// Page Title
<h1 style={{
  fontSize: fontSize['3xl'],      // 28px
  fontWeight: fontWeight.bold,    // 700
  color: colors.secondary[900],
  lineHeight: 1.2
}}>
  Financial Overview
</h1>

// Section Heading
<h2 style={{
  fontSize: fontSize['2xl'],      // 22px
  fontWeight: fontWeight.semibold,// 600
  color: colors.secondary[900],
  marginTop: spacing[8],
  marginBottom: spacing[4]
}}>
  Revenue by Department
</h2>

// Subsection
<h3 style={{
  fontSize: fontSize.lg,          // 16px
  fontWeight: fontWeight.semibold,// 600
  color: colors.secondary[800],
  marginTop: spacing[6],
  marginBottom: spacing[3]
}}>
  Monthly Breakdown
</h3>

// Body Text
<p style={{
  fontSize: fontSize.base,        // 14px
  fontWeight: fontWeight.normal,  // 400
  color: colors.secondary[600],
  lineHeight: 1.5
}}>
  This is regular body text for descriptions and content.
</p>

// Label
<label style={{
  fontSize: fontSize.sm,          // 13px
  fontWeight: fontWeight.medium,  // 500
  color: colors.secondary[700]
}}>
  Email Address
</label>
```

---

## 🎬 Shadows & Depth

```typescript
import { shadow } from '@/theme/tokens';

shadow.none       = 'none'
shadow.xs         = '0 1px 2px rgba(0,0,0,0.03)'          // Minimal
shadow.sm         = '0 1px 3px rgba(0,0,0,0.06), ...'     // Subtle
shadow.base       = '0 4px 6px -1px rgba(0,0,0,0.07), ...'// Standard (cards)
shadow.md         = '0 4px 6px -1px rgba(0,0,0,0.1), ...' // Medium (hover)
shadow.lg         = '0 10px 15px -3px rgba(0,0,0,0.08),..'// Large (modals)
shadow.xl         = '0 20px 25px -5px rgba(0,0,0,0.08),..'// Extra large
shadow.elevated   = '0 10px 30px rgba(0,0,0,0.12)'        // Floating elements
shadow.hover      = '0 15px 40px rgba(0,0,0,0.15)'        // Hover state
```

**When to Use:**
- `shadow.xs`: Subtle UI elements (dividers, separators)
- `shadow.sm`: Cards at rest
- `shadow.base`: Cards, input fields, default state
- `shadow.md`: Cards on hover, lifted state
- `shadow.lg`: Dropdowns, popovers, modals
- `shadow.xl`: Large modals, critical modals
- `shadow.elevated`: Floating buttons, tooltips
- `shadow.hover`: Hover states on interactive elements

---

## 🔀 Border Radius

```typescript
import { borderRadius } from '@/theme/tokens';

borderRadius.none  = 0px      // Sharp corners (rare)
borderRadius.sm    = 4px      // Small buttons, badges
borderRadius.base  = 6px      // Standard (buttons, inputs) ✓ Most used
borderRadius.md    = 8px      // Medium components
borderRadius.lg    = 12px     // Cards, modals, drawers
borderRadius.xl    = 16px     // Large cards, banners
borderRadius['2xl']= 20px     // Extra large elements
borderRadius.full  = 9999px   // Circular (avatars, badges)
```

---

## ⏱️ Animations & Transitions

```typescript
import { transition } from '@/theme/tokens';

transition.fast   = '0.1s ease'       // 100ms - Quick feedback
transition.base   = '0.15s ease'      // 150ms - Standard (most used)
transition.slow   = '0.25s ease'      // 250ms - Considered movement
```

**Usage:**
```typescript
// Hover state with smooth transition
<div style={{
  transition: `background-color ${transition.base}, box-shadow ${transition.base}`
}} />

// Slow fade for modals
<Modal style={{ transition: `opacity ${transition.slow}` }} />
```

---

## 🛠️ Component Patterns

### 1. Page Header Pattern
```typescript
<PageHeader
  title="Financial Dashboard"
  description="Overview of your financial metrics and reports"
  breadcrumbs={[
    { label: 'Dashboard', path: '/' },
    { label: 'Finance' },
  ]}
  actionButton={{
    label: 'New Report',
    onClick: handleNewReport,
    type: 'primary'
  }}
/>
```

### 2. Stat Card Pattern
```typescript
<StatCard
  label="Total Revenue"
  value={5420000}
  type="success"
  icon={<DollarIcon />}
  prefix="Rp "
  trend="+12.5%"
  subtitle="March 2026"
/>
```

**Types:**
- `primary` - General metrics (default)
- `success` - Positive metrics (revenue, traffic)
- `warning` - Caution metrics (pending actions)
- `danger` - Critical metrics (errors, debts)
- `info` - Informational metrics

### 3. Table Card Pattern
```typescript
<TableCard
  title="Recent Transactions"
  toolbar={
    <Space>
      <Search placeholder="Search..." />
      <Button type="primary">Export</Button>
    </Space>
  }
  footer={<Pagination total={100} pageSize={10} />}
>
  <Table columns={columns} dataSource={data} />
</TableCard>
```

### 4. Form Pattern
```typescript
<Form layout="vertical">
  <Form.Item
    label="Email Address"
    required
    tooltip="We'll never share your email"
  >
    <Input placeholder="your@email.com" />
  </Form.Item>

  <Form.Item>
    <Button type="primary" block>
      Submit
    </Button>
  </Form.Item>
</Form>
```

---

## ✅ Do's & Don'ts

### DO ✅
- Use `colors.secondary[900]` for primary text (99% of cases)
- Use `spacing[4]` (16px) as your default spacing
- Use `fontSize.base` (14px) for body text
- Use `fontWeight.medium` (500) for labels and emphasis
- Use `transition.base` (150ms) for smooth interactions
- Maintain consistent border radius throughout component
- Use semantic color system for status indicators
- Keep shadows subtle (use `shadow.xs` or `shadow.sm` by default)

### DON'T ❌
- Don't use hardcoded colors (use tokens)
- Don't use hardcoded font sizes (use tokens)
- Don't mix spacing units (always use spacing[n])
- Don't use colors.neutral[*] for new colors (use colors.secondary[*])
- Don't create new colors outside the design system
- Don't use `fontWeight.extrabold` (800) for body text
- Don't use `shadow.xl` for casual elements (too aggressive)
- Don't skip `transition` property (important for feel)

---

## 🎨 Example Component

```typescript
import React from 'react';
import { Button, Card, Space } from 'antd';
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  shadow,
  transition,
  borderRadius,
} from '@/theme/tokens';

const ExampleCard: React.FC<{ title: string; value: number }> = ({
  title,
  value,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Card
      style={{
        borderRadius: borderRadius.lg,
        boxShadow: isHovered ? shadow.md : shadow.sm,
        transition: `box-shadow ${transition.base}, transform ${transition.base}`,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3
        style={{
          fontSize: fontSize.lg,
          fontWeight: fontWeight.semibold,
          color: colors.secondary[900],
          margin: 0,
          marginBottom: spacing[3],
        }}
      >
        {title}
      </h3>

      <div
        style={{
          fontSize: fontSize['2xl'],
          fontWeight: fontWeight.bold,
          color: colors.primary[600],
          marginBottom: spacing[4],
        }}
      >
        Rp {value.toLocaleString('id-ID')}
      </div>

      <Button type="primary" block>
        View Details
      </Button>
    </Card>
  );
};

export default ExampleCard;
```

---

## 📱 Responsive Design

Breakpoints (from `tokens.breakpoints`):
- `xs`: 320px - Mobile
- `sm`: 640px - Small tablet
- `md`: 768px - Medium tablet
- `lg`: 1024px - Desktop
- `xl`: 1280px - Large desktop
- `2xl`: 1536px - Extra large

**Pattern:**
```typescript
import { breakpoints } from '@/theme/tokens';

<Grid
  columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
  gutter={[spacing[4], spacing[4]]}
>
  {items.map(item => (
    <Card key={item.id}>{item.title}</Card>
  ))}
</Grid>
```

---

## 🧪 Testing & Validation

### Checklist Before Shipping

- [ ] All colors from design tokens (no hardcoded hex)
- [ ] Typography follows scale hierarchy
- [ ] Spacing uses 8px grid system
- [ ] Shadows are consistent (not custom)
- [ ] Transitions/animations are smooth (150-300ms)
- [ ] Border radius is consistent (6px or 12px)
- [ ] WCAG AA color contrast ✓
- [ ] Responsive at all breakpoints
- [ ] Mobile-first approach
- [ ] No inline styles in production (CSS modules preferred)

---

**Last Updated:** March 9, 2026
**Version:** 1.0.0 - Modern & Minimalist System
