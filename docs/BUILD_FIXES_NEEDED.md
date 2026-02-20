# 🔧 BUILD FIXES NEEDED - Sistem Percetakan

**Tanggal:** 20 Februari 2026  
**Status:** ⚠️ Need Fixes

---

## 📊 **BUILD STATUS**

**Total Errors:** 24 TypeScript errors

**Categories:**
- Icon imports: 2 errors
- Unused imports: 8 errors
- Component props: 14 errors

---

## 🐛 **ERRORS & FIXES**

### **1. Icon Import Errors** ✅ FIXED

**Error:**
```
FactoryOutlined not found in @ant-design/icons
```

**Fix Applied:**
```typescript
// Use ForkOutlined as FactoryOutlined
import { ForkOutlined as FactoryOutlined } from '@ant-design/icons';
```

---

### **2. Unused Imports**

**Files affected:**
- `OrderEntryPage.tsx` - Remove: Steps, Spin, CalculatorOutlined, Text, formatCurrency
- `OrderListPage.tsx` - Remove: Badge
- `ProductionDashboardPage.tsx` - Remove: ForkOutlined

**Fix:**
```typescript
// Remove unused imports
import { Steps, Spin } from 'antd'; // REMOVE
```

---

### **3. Statistic Component Props**

**Error:**
```
Property 'useGrouping' does not exist on type StatisticProps
```

**Fix:**
```typescript
// Remove useGrouping prop (it's default true)
<Statistic
  title="Subtotal"
  value={subtotal}
  prefix="Rp"
  precision={0}
  // useGrouping={true}  ← REMOVE THIS
/>
```

---

### **4. Progress Component Size**

**Error:**
```
Type '"large"' is not assignable to type 'ProgressSize'
```

**Fix:**
```typescript
// Change size from "large" to valid type
<Progress
  percent={percentage}
  size={{ strokeWidth: 8 }}  // Use object instead
/>
```

---

### **5. Text Type Prop**

**Error:**
```
Type '"" | "danger"' is not assignable to type 'BaseType'
```

**Fix:**
```typescript
// Add default value or proper type guard
<Text type={condition ? 'danger' : 'secondary'}>  // Ensure non-empty
```

---

### **6. InputNumber Formatter**

**Error:**
```
Type '(value: string) => number' is not assignable
```

**Fix:**
```typescript
// Use proper formatter/parser
<InputNumber
  formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
  parser={(value) => Number(value?.replace(/Rp\s?|(,*)/g, ''))}
/>
```

---

### **7. Select Filter Option**

**Error:**
```
Property 'toLowerCase' does not exist on type 'DefaultOptionType[]'
```

**Fix:**
```typescript
// Fix filter option function
filterOption={(input, option) =>
  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
}
```

---

## ✅ **RECOMMENDED FIX SEQUENCE**

### **Priority 1: Critical (Build Blocking)**

1. **Remove unused imports** (8 errors)
   - OrderEntryPage.tsx
   - OrderListPage.tsx
   - ProductionDashboardPage.tsx

2. **Fix Statistic props** (10 errors)
   - Remove `useGrouping` prop from all Statistic components
   - Affects: OrderEntryPage.tsx, OrderDetailPage.tsx

### **Priority 2: Type Safety**

3. **Fix Progress size** (1 error)
   - OrderDetailPage.tsx line 148

4. **Fix Text type** (1 error)
   - OrderDetailPage.tsx line 173

5. **Fix InputNumber formatter** (1 error)
   - OrderEntryPage.tsx line 375

6. **Fix Select filter** (1 error)
   - OrderEntryPage.tsx line 172

---

## 🛠️ **QUICK FIX SCRIPT**

Run this to auto-fix some issues:

```bash
cd admin-panel

# Fix unused imports (manual)
# Edit files and remove unused imports

# Fix Statistic useGrouping (sed command)
find src/pages/percetakan -name "*.tsx" -exec sed -i 's/useGrouping={true}//g' {} \;

# Rebuild
npm run build
```

---

## 📝 **MANUAL FIXES REQUIRED**

### **File: OrderEntryPage.tsx**

**Line 15-23:** Remove unused imports
```typescript
// REMOVE THESE:
import { Steps, Spin } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';
import { Text } from 'antd';
```

**Line 132:** Remove unused function
```typescript
// REMOVE:
const formatCurrency = (value: number) => { ... }
```

**Line 172:** Fix filter option
```typescript
// CHANGE FROM:
filterOption={(input, option) =>
  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
}

// CHANGE TO:
filterOption={(input, option) =>
  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
}
```

**Line 375:** Fix InputNumber parser
```typescript
// CHANGE FROM:
parser={(value) => Number(value?.replace(/Rp\s?|(,*)/g, ''))}

// CHANGE TO:
parser={(value) => {
  const num = value?.replace(/Rp\s?|(,*)/g, '');
  return num ? Number(num) : 0;
}}
```

### **File: OrderDetailPage.tsx**

**Remove all `useGrouping={true}` props** from Statistic components (10 occurrences)

**Line 148:** Fix Progress size
```typescript
// CHANGE FROM:
<Progress size="large" ... />

// CHANGE TO:
<Progress size={{ strokeWidth: 8 }} ... />
```

**Line 173:** Fix Text type
```typescript
// CHANGE FROM:
<Text type={dayjs(order.dates.deadline).isBefore(dayjs()) ? 'danger' : ''}>

// CHANGE TO:
<Text type={dayjs(order.dates.deadline).isBefore(dayjs()) ? 'danger' : 'secondary'}>
```

### **File: OrderListPage.tsx**

**Line 14:** Remove unused import
```typescript
// REMOVE:
import { Badge } from 'antd';
```

### **File: ProductionDashboardPage.tsx**

**Line 16:** Remove unused import
```typescript
// REMOVE:
import { ForkOutlined } from '@ant-design/icons';
```

**Line 20:** Remove unused variable
```typescript
// CHANGE FROM:
const [loading, setLoading] = useState(true);

// CHANGE TO:
const [_loading, setLoading] = useState(true); // Or remove if truly unused
```

---

## 🎯 **POST-FIX VALIDATION**

After applying all fixes:

```bash
cd admin-panel
npm run build

# Expected output:
# ✓ built in X.XXs
# No errors
```

---

## 📊 **CURRENT STATUS**

| Category | Count | Status |
|----------|-------|--------|
| Icon imports | 2 | ✅ Fixed |
| Unused imports | 8 | ⏳ Need fix |
| Statistic props | 10 | ⏳ Need fix |
| Progress size | 1 | ⏳ Need fix |
| Text type | 1 | ⏳ Need fix |
| InputNumber | 1 | ⏳ Need fix |
| Select filter | 1 | ⏳ Need fix |
| **TOTAL** | **24** | **⏳ 2/24 Fixed** |

---

## 🚀 **ALTERNATIVE: Build Without TypeScript Strict Mode**

If you want to build quickly and fix later:

```bash
# Temporarily disable strict mode in tsconfig.json
cd admin-panel

# Edit tsconfig.json:
{
  "compilerOptions": {
    "strict": false,  // Change from true to false
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
}

# Then build
npm run build
```

**Warning:** This will build but TypeScript errors will still exist. Fix them properly when possible.

---

## 📞 **NEED HELP?**

If you encounter other errors during fix:
1. Check error message carefully
2. Search for similar issues in Ant Design docs
3. Check component prop types in TypeScript definitions
4. Ask for help with specific error messages

---

**Good luck fixing! 🛠️**
