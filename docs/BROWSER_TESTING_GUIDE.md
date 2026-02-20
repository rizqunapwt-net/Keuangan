# 🧪 BROWSER TESTING GUIDE - Sistem Percetakan

**Tanggal:** 20 Februari 2026  
**Status:** Ready for Testing

---

## 🚀 **PRE-REQUISITES**

### **1. Start Laravel Server**
```bash
php artisan serve --port=8000
```

**Server should be running at:** `http://localhost:8000`

### **2. Access Admin Panel**
**URL:** `http://localhost:8000/admin`

**Test Credentials:**
- Email: `admin@rizquna.id`
- Password: `password`

**OR use author account:**
- Email: `author@example.com`
- Password: `password`

---

## 📋 **TESTING CHECKLIST**

### **Step 1: Login** ✅

**URL:** `http://localhost:8000/admin/login`

**Test:**
- [ ] Login page loads correctly
- [ ] New Rizquna Elfath branding visible
- [ ] NRE logo displayed
- [ ] Can login with credentials
- [ ] Redirect to dashboard after login
- [ ] User menu shows in header

**Expected Result:**
- ✅ Login successful
- ✅ Dashboard loads
- ✅ Sidebar menu visible

---

### **Step 2: Percetakan Menu** ✅

**Test:**
- [ ] Sidebar has "🏭 Percetakan" menu
- [ ] Menu has 5 sub-menus:
  - [ ] Orders
  - [ ] Production
  - [ ] Materials
  - [ ] Machines
  - [ ] Customers
- [ ] Can click and expand menu
- [ ] Sub-menu items clickable

**Expected Result:**
- ✅ Menu displays correctly
- ✅ All sub-menus accessible

---

### **Step 3: Order List Page** ✅

**URL:** `http://localhost:8000/admin/percetakan/orders`

**Test:**
- [ ] Page loads without errors
- [ ] "Buat Order Baru" button visible
- [ ] Statistics cards displayed:
  - [ ] Total Order
  - [ ] Bulan Ini
  - [ ] Pending Approval
  - [ ] Urgent
- [ ] Filter section visible:
  - [ ] Search box
  - [ ] Status filter
  - [ ] Priority filter
  - [ ] Refresh button
- [ ] Orders table displays (may be empty)
- [ ] Table columns:
  - [ ] Order Number
  - [ ] Customer
  - [ ] Product
  - [ ] Quantity
  - [ ] Total
  - [ ] Status
  - [ ] Priority
  - [ ] Deadline
  - [ ] Actions

**Expected Result:**
- ✅ Page renders correctly
- ✅ All UI elements visible
- ✅ No console errors

---

### **Step 4: Create New Order** ✅

**URL:** `http://localhost:8000/admin/percetakan/orders/new`

**Test:**
- [ ] Page loads without errors
- [ ] Form sections visible:
  - [ ] Customer & Product card
  - [ ] Specifications card
  - [ ] Pricing card
  - [ ] Notes & Priority card
- [ ] Customer dropdown with search
- [ ] Product dropdown
- [ ] Deadline date picker
- [ ] Specification fields:
  - [ ] Size (A4, A3, F4, etc)
  - [ ] Paper type (HVS, Art Paper, etc)
  - [ ] Paper weight (70gsm - 310gsm)
  - [ ] Colors outside (1/0, 4/0, 4/4)
  - [ ] Colors inside (0/0, 1/0, 4/0, 4/4)
  - [ ] Binding type
  - [ ] Finishing options
  - [ ] Pages count
  - [ ] Quantity
- [ ] Pricing fields:
  - [ ] Unit price (with Rp formatter)
  - [ ] Discount
  - [ ] DP percentage
- [ ] Pricing calculation updates in real-time:
  - [ ] Subtotal
  - [ ] PPN (11%)
  - [ ] DP Required
  - [ ] Total
- [ ] Priority dropdown
- [ ] Rush order toggle
- [ ] Production notes textarea
- [ ] Customer notes textarea
- [ ] "Simpan Order" button
- [ ] "Batal" button

**Fill Form Test:**
- [ ] Select customer from dropdown
- [ ] Select product
- [ ] Set deadline
- [ ] Fill specifications
- [ ] Enter quantity (e.g., 1000)
- [ ] Enter unit price (e.g., 5000)
- [ ] Verify pricing auto-calculates
- [ ] Click "Simpan Order"
- [ ] Success message appears
- [ ] Redirect to order list

**Expected Result:**
- ✅ Form submits successfully
- ✅ Order created
- ✅ Success notification
- ✅ Redirects to order list

---

### **Step 5: Order Detail Page** ✅

**URL:** `http://localhost:8000/admin/percetakan/orders/{id}`

**Test:**
- [ ] Page loads without errors
- [ ] Back button visible
- [ ] Order number displayed
- [ ] Status badge visible
- [ ] Priority badge visible
- [ ] Progress bar shows percentage
- [ ] Order information card:
  - [ ] Customer name
  - [ ] Sales
  - [ ] Product
  - [ ] Quantity
  - [ ] Order date
  - [ ] Deadline
- [ ] Specifications card:
  - [ ] Size
  - [ ] Paper type & weight
  - [ ] Colors inside/outside
  - [ ] Binding type
  - [ ] Finishing
  - [ ] Pages count
  - [ ] Print run
- [ ] Pricing card:
  - [ ] Subtotal
  - [ ] Discount
  - [ ] PPN (11%)
  - [ ] Total (highlighted in green)
- [ ] Payment card:
  - [ ] DP Required
  - [ ] DP Paid
  - [ ] DP percentage progress
  - [ ] Balance Due (in red)
- [ ] Notes section:
  - [ ] Production notes
  - [ ] Customer notes
- [ ] Production timeline (may be empty initially)

**Expected Result:**
- ✅ All order details visible
- ✅ Pricing formatted correctly (Rp format)
- ✅ Progress bar shows correct percentage
- ✅ No console errors

---

### **Step 6: Production Dashboard** ✅

**URL:** `http://localhost:8000/admin/percetakan/production`

**Test:**
- [ ] Page loads without errors
- [ ] Statistics cards:
  - [ ] Total Jobs
  - [ ] In Progress
  - [ ] Completed Today
  - [ ] Avg Completion (hours)
- [ ] Active Production Jobs table:
  - [ ] Job Number
  - [ ] Order
  - [ ] Stage
  - [ ] Machine
  - [ ] Operator
  - [ ] Progress
  - [ ] Started
- [ ] Production by Stage section:
  - [ ] Pre-press count
  - [ ] Printing count
  - [ ] Finishing count
  - [ ] QC count
  - [ ] Packaging count
  - [ ] Progress bars for each
- [ ] Urgent Orders timeline (right sidebar)
- [ ] Alerts section:
  - [ ] Low Stock Materials
  - [ ] Maintenance Due
- [ ] Stage Distribution chart

**Expected Result:**
- ✅ Dashboard displays correctly
- ✅ Statistics show (may be 0 if no data)
- ✅ All sections visible
- ✅ No console errors

---

## 🐛 **KNOWN ISSUES & WORKAROUNDS**

### **Issue 1: Pages show 404**
**Solution:** Make sure routes are registered in App.tsx

### **Issue 2: Menu not showing**
**Solution:** Clear browser cache and reload

### **Issue 3: API errors in console**
**Solution:** 
- Check if Laravel server is running
- Verify token is valid
- Check API endpoints exist

### **Issue 4: Blank page**
**Solution:**
- Check browser console for errors
- Verify build completed successfully
- Check `public/admin/index.html` exists

---

## 📊 **TEST RESULTS TEMPLATE**

```markdown
## Browser Test Session: [DATE/TIME]

### Environment:
- Browser: Chrome/Firefox/Safari [Version]
- Server: Laravel [Version]
- Build: [Date/Time]

### Test Results:

#### Login
- [ ] PASS/FAIL
- Notes: ...

#### Percetakan Menu
- [ ] PASS/FAIL
- Notes: ...

#### Order List Page
- [ ] PASS/FAIL
- Notes: ...

#### Create Order
- [ ] PASS/FAIL
- Notes: ...

#### Order Detail
- [ ] PASS/FAIL
- Notes: ...

#### Production Dashboard
- [ ] PASS/FAIL
- Notes: ...

### Screenshots:
1. Login page
2. Dashboard with menu
3. Order list
4. Create order form
5. Order detail
6. Production dashboard

### Issues Found:
1. ...
2. ...

### Recommendations:
1. ...
2. ...

### Overall Status:
✅ PASS / ❌ FAIL
```

---

## 📸 **SCREENSHOT CHECKLIST**

Capture screenshots of:
1. [ ] Login page (with New Rizquna Elfath branding)
2. [ ] Dashboard with Percetakan menu expanded
3. [ ] Order List page (empty state)
4. [ ] Create Order form (filled)
5. [ ] Order Detail page
6. [ ] Production Dashboard

---

## ✅ **SUCCESS CRITERIA**

**Test is considered PASSED if:**
- ✅ All pages load without errors
- ✅ No JavaScript console errors
- ✅ Navigation works correctly
- ✅ Forms can be filled and submitted
- ✅ Data displays correctly
- ✅ Branding is consistent (NRE, New Rizquna Elfath)
- ✅ Responsive design works (mobile/tablet/desktop)

---

## 🚀 **NEXT STEPS AFTER BROWSER TEST**

1. ✅ Fix any UI bugs found
2. ✅ Test API endpoints with Postman
3. ✅ Seed sample data for better testing
4. ✅ Deploy to staging server
5. ✅ User Acceptance Testing (UAT)

---

**Happy Testing! 🎉**

**Support:**
- Check `docs/TESTING_GUIDE.md` for API testing
- Check `docs/BUILD_FIXES_NEEDED.md` for build issues
- Check browser console for errors
