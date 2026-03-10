# Visual Component Reference

Berikut adalah referensi visual lengkap dari design system yang baru.

---

## 🎨 Color Palette Reference

### Primary Color - Trust & Stability (Teal)
```
Primary 50    : #f0fdfa ▪ Light backgrounds, subtle highlights
Primary 100   : #ccfbf1 ▪ Hover backgrounds
Primary 200   : #99f6e4 ▪ Borders, accents
Primary 300   : #5eead4 ▪ Medium accents
Primary 400   : #2dd4bf ▪ Strong accents
Primary 500   : #14b8a6 ▪ Primary color (lighter variant)
Primary 600   : #0d9488 ▪ MAIN PRIMARY COLOR ★★★ (buttons, active states)
Primary 700   : #0f766e ▪ Darker variant
Primary 800   : #115e59 ▪ Very dark variant
Primary 900   : #134e4a ▪ Darkest variant
```

### Secondary Colors - Professional Neutrals
```
Color 0       : #ffffff ▪ Pure white (cards, containers)
Secondary 50  : #f9fafb ▪ Page background (main)
Secondary 100 : #f3f4f6 ▪ Light backgrounds, header bg
Secondary 200 : #e5e7eb ▪ Borders, dividers
Secondary 300 : #d1d5db ▪ Subtle borders
Secondary 400 : #9ca3af ▪ Placeholder text, disabled
Secondary 500 : #6b7280 ▪ Muted text, soft labels
Secondary 600 : #4b5563 ▪ Secondary text
Secondary 700 : #374151 ▪ Strong text
Secondary 800 : #1f2937 ▪ Dark text (headings)
Secondary 900 : #111827 ▪ DARKEST (primary text) ★★★
```

### Status Colors

#### Success (Green) - Approved, Positive
```
Background: #f0fdf4
Border:     #bbf7d0
Text:       #15803d
Main:       #16a34a ★
```

#### Warning (Amber) - Pending, Caution
```
Background: #fffbeb
Border:     #fde68a
Text:       #b45309
Main:       #f59e0b ★
```

#### Danger/Error (Red) - Rejected, Critical
```
Background: #fef2f2
Border:     #fecaca
Text:       #991b1b
Main:       #dc2626 ★
```

#### Info (Blue) - Information, Secondary
```
Background: #eff6ff
Border:     #bfdbfe
Text:       #1e40af
Main:       #2563eb ★
```

---

## 📏 Spacing Reference (8px Grid)

```
spacing[1]  = 4px    ▪ xs - Tight spacing (rare)
spacing[2]  = 8px    ▪ sm - Minimal gaps between elements
spacing[3]  = 12px   ▪ md - Small spacing
spacing[4]  = 16px   ▪ lg - DEFAULT spacing (most common) ★★★
spacing[5]  = 20px   ▪ xl - Form layouts
spacing[6]  = 24px   ▪ 2xl - Card padding, section spacing ★
spacing[8]  = 32px   ▪ Large - Page section gaps
spacing[10] = 40px   ▪ Extra large gaps
```

### Common Spacing Combinations:

```
Card Padding:        spacing[6] (24px)
Form Input Gap:      spacing[3] (12px)
Button Group Gap:    spacing[2] (8px)
Section Gap:         spacing[8] (32px)
Page Padding:        spacing[6] (24px)
Intra-content Gap:   spacing[4] (16px)
```

---

## 🔤 Typography Reference

### Font Family
```
Primary: Inter (optimized for screen)
Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
```

### Text Sizes & Usage

```
fontSize.xs   = 12px   ▪ Labels, captions, helper text
fontSize.sm   = 13px   ▪ Body text (default for this app)
fontSize.base = 14px   ▪ Regular text, smaller headings
fontSize.lg   = 16px   ▪ Subheadings, input labels ★
fontSize.xl   = 18px   ▪ Section titles
fontSize.2xl  = 22px   ▪ Page subheadings
fontSize.3xl  = 28px   ▪ PAGE TITLE ★★★
fontSize.4xl  = 30px   ▪ Large hero title
fontSize.5xl  = 36px   ▪ Extra large hero title
```

### Font Weights & Emphasis

```
fontWeight.light    = 300 ▪ (rarely used)
fontWeight.normal   = 400 ▪ Body text, default
fontWeight.medium   = 500 ▪ Labels, slight emphasis ★
fontWeight.semibold = 600 ▪ Subheadings, important labels ★
fontWeight.bold     = 700 ▪ Headings, page titles ★★
fontWeight.extrabold= 800 ▪ (rarely used)
```

### Heading Examples:

```
┌─ Page Title ────────────────────────┐
│ Financial Dashboard                 │
│ fontSize.3xl (28px), bold (700)     │
│ color: secondary[900]               │
│ lineHeight: 1.2                     │
└─────────────────────────────────────┘

┌─ Section Heading ───────────────────┐
│ Revenue Analysis                    │
│ fontSize.2xl (22px), semibold (600) │
│ color: secondary[900]               │
│ marginTop: spacing[8], marginBot... │
└─────────────────────────────────────┘

┌─ Body Text ─────────────────────────┐
│ This is regular body text explaining│
│ the content in detail.              │
│ fontSize.base (14px), normal (400)  │
│ color: secondary[600]               │
│ lineHeight: 1.5                     │
└─────────────────────────────────────┘

┌─ Label ──────────────────────────────┐
│ Email Address                        │
│ fontSize.sm (13px), medium (500)     │
│ color: secondary[700]                │
└──────────────────────────────────────┘
```

---

## 🎬 Shadow System (Depth)

```
shadow.none     ▪ No shadow (default)

shadow.xs       ▪ Minimal               0 1px 2px rgba(0,0,0,0.03)
                  (barely noticeable)

shadow.sm       ▪ Subtle shadow        0 1px 3px rgba(0,0,0,0.06)
                  (borders, lines)

shadow.base     ▪ Standard             0 4px 6px -1px rgba(0,0,0,0.07)
                  (cards at rest) ★

shadow.md       ▪ Medium               0 4px 6px -1px rgba(0,0,0,0.1)
                  (card hover) ★

shadow.lg       ▪ Large                0 10px 15px -3px rgba(0,0,0,0.08)
                  (dropdowns, popovers)

shadow.xl       ▪ Extra large          0 20px 25px -5px rgba(0,0,0,0.08)
                  (modals)

shadow.elevated ▪ Floating             0 10px 30px rgba(0,0,0,0.12)
                  (floating buttons)

shadow.hover    ▪ Hover lift           0 15px 40px rgba(0,0,0,0.15)
                  (elevated state)
```

### Shadow Usage Pattern:

```
At Rest:    box-shadow: shadow.sm       (cards, default)
On Hover:   box-shadow: shadow.md       (lift effect)
Focus:      box-shadow: shadow.md       (highlight)
Elevated:   box-shadow: shadow.elevated (floating UI)
```

---

## 🔀 Border Radius Reference

```
borderRadius.none   = 0px     ▪ Sharp corners (rare)
borderRadius.sm     = 4px     ▪ Small items, badges
borderRadius.base   = 6px     ▪ STANDARD (buttons, inputs) ★★★
borderRadius.md     = 8px     ▪ Medium elements
borderRadius.lg     = 12px    ▪ Cards, modals, tables ★★
borderRadius.xl     = 16px    ▪ Large cards, banners
borderRadius.2xl    = 20px    ▪ Extra large elements
borderRadius.full   = 9999px  ▪ Circular (avatars)
```

### Usage:
```
Buttons:        borderRadius.base (6px)
Inputs:         borderRadius.base (6px)
Cards:          borderRadius.lg (12px) ★
Modals:         borderRadius.lg (12px) ★
Tables:         borderRadius.lg (12px) ★
Badges:         borderRadius.lg (12px)
Avatars:        borderRadius.full (circular)
```

---

## ⏱️ Animation Speeds

```
transition.fast = 0.1s  (100ms)  ▪ Quick feedback, color changes
transition.base = 0.15s (150ms)  ▪ DEFAULT for most interactions ★★★
transition.slow = 0.25s (250ms)  ▪ Considered movement, page transitions
```

### Animation Easing:
All use `cubic-bezier(0.4,0,0.2,1)` (ease-out-style)
- Feels natural and responsive
- Not too fast, not too slow
- Professional feel

---

## 🧩 Component Examples

### StatCard Variations

#### Type: Success (Green)
```
┌──────────────────────────────┐
│ Total Revenue        [💵]    │
│ Rp 5.4 Juta                 │
│ +12.5% vs bulan lalu        │
└──────────────────────────────┘
Colors: success[50] bg, success[600] icon
```

#### Type: Warning (Amber)
```
┌──────────────────────────────┐
│ Pending Items        [⏳]    │
│ 12 items                    │
│ Needs review                │
└──────────────────────────────┘
Colors: warning[50] bg, warning[600] icon
```

#### Type: Danger (Red)
```
┌──────────────────────────────┐
│ Overdue Debts        [🔴]    │
│ Rp 2.1 Juta                 │
│ -5.2% vs bulan lalu        │
└──────────────────────────────┘
Colors: danger[50] bg, danger[600] icon
```

---

### Page Header Example

```
┌────────────────────────────────────────────────────┐
│ Dashboard > Finance > Reports                      │
│                                                    │
│ Financial Dashboard              [NEW REPORT BTN] │
│ Overview of your financial metrics & trends       │
│                                                    │
├────────────────────────────────────────────────────┤
```

---

### Table Card Example

```
┌─────────────────────────────────────────────────────┐
│ Recent Transactions        [SEARCH] [+ EXPORT]     │
├─────────────────────────────────────────────────────┤
│ ID    │ Date       │ Amount    │ Status            │
├──────────────────────────────────────────────────────┤
│ #001  │ Mar 9, 26  │ Rp 500K   │ ✓ Approved       │
│ #002  │ Mar 9, 26  │ Rp 750K   │ ⏳ Pending       │
│ #003  │ Mar 8, 26  │ Rp 250K   │ ✓ Approved       │
├─────────────────────────────────────────────────────┤
│ Page 1 of 5 | Showing 1-10 of 45 records            │
└─────────────────────────────────────────────────────┘
```

---

### Button Styles

```
PRIMARY ACTION:
┌──────────────────────┐
│  + New Transaction   │ Background: primary[600]
│                      │ Text: white
└──────────────────────┘ Height: 38px
                         Padding: spacing[4]

SECONDARY ACTION:
┌──────────────────────┐
│  Edit                │ Background: transparent
│                      │ Border: secondary[300]
└──────────────────────┘ Text: secondary[900]

DANGER ACTION:
┌──────────────────────┐
│  Delete              │ Background: danger[600]
│                      │ Text: white
└──────────────────────┘ Height: 38px (slightly smaller optional)
```

---

### Form Styling

```
Label: "Email Address"
  fontSize.sm (13px)
  fontWeight.medium (500)
  color: secondary[700]
  marginBottom: spacing[2] (8px)

Input Field:
  height: 38px
  padding: spacing[3] (12px)
  borderRadius: borderRadius.base (6px)
  border: 1px secondary[200]

  Focus State:
    border: 1px primary[600]
    boxShadow: 0 0 0 2px rgba(13,148,136,0.1)

  Error State:
    border: 1px danger[300]
    background: danger[50]

Helper Text:
  fontSize.xs (12px)
  color: secondary[500]
  marginTop: spacing[1] (4px)
```

---

## 🎯 Quick Reference Checklist

When building components, verify:

- [ ] All colors from `colors.*` (no hardcoded hex)
- [ ] Spacing uses `spacing[n]` (multiples of 8px)
- [ ] Font size from `fontSize.*`
- [ ] Font weight from `fontWeight.*`
- [ ] Shadows from `shadow.*`
- [ ] Border radius from `borderRadius.*`
- [ ] Animations use `transition.*`
- [ ] Primary text: `colors.secondary[900]` (99% of cases)
- [ ] Secondary text: `colors.secondary[600]`
- [ ] Card padding: `spacing[6]` (24px)
- [ ] Button height: 38px (controlHeight)
- [ ] Input height: 38px (controlHeight)
- [ ] Page padding: `spacing[6]` (24px)
- [ ] Section gap: `spacing[8]` (32px)

---

**Reference Guide v1.0**
Design System: Modern & Minimalist
Personality: Trustworthy & Secure
Last Updated: March 9, 2026
