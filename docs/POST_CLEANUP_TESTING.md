# 🧪 COMPREHENSIVE TESTING GUIDE - Post Cleanup

**Tanggal:** 20 Februari 2026  
**Status:** ✅ READY FOR TESTING  
**API Endpoints:** 27 (down from 57)

---

## 📋 **TESTING CHECKLIST**

### **Phase 1: Authentication (3 endpoints)**

#### **1.1 Register Author**
```bash
POST http://localhost:8000/api/v1/authors/register
Content-Type: application/json

{
  "name": "Test Author",
  "email": "test@author.com",
  "username": "testauthor",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Expected:**
- ✅ Status 201 Created
- ✅ User created
- ✅ Author role assigned
- ✅ Token returned
- ✅ No email verification required

---

#### **1.2 Forgot Password**
```bash
POST http://localhost:8000/api/v1/authors/forgot-password
Content-Type: application/json

{
  "email": "test@author.com"
}
```

**Expected:**
- ✅ Status 200 OK
- ✅ Reset link sent (if email configured)
- ✅ Or success message

---

#### **1.3 Reset Password**
```bash
POST http://localhost:8000/api/v1/authors/reset-password
Content-Type: application/json

{
  "token": "RESET_TOKEN",
  "email": "test@author.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Expected:**
- ✅ Status 200 OK
- ✅ Password updated
- ✅ Can login with new password

---

### **Phase 2: Customer Management (10 endpoints)**

#### **2.1 List Customers**
```bash
GET http://localhost:8000/api/v1/percetakan/customers
Authorization: Bearer YOUR_TOKEN
```

**Expected:**
- ✅ Status 200 OK
- ✅ Customers list returned
- ✅ Pagination working

---

#### **2.2 Create Customer**
```bash
POST http://localhost:8000/api/v1/percetakan/customers
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "PT Test Customer",
  "type": "corporate",
  "email": "test@customer.com",
  "phone": "08123456789",
  "company_name": "PT Test Customer",
  "credit_limit": 50000000,
  "payment_terms_days": 30
}
```

**Expected:**
- ✅ Status 201 Created
- ✅ Customer created
- ✅ Auto-generated code (CUST-YYYYMMDD-0001)

---

#### **2.3 Get Customer Details**
```bash
GET http://localhost:8000/api/v1/percetakan/customers/1
Authorization: Bearer YOUR_TOKEN
```

**Expected:**
- ✅ Status 200 OK
- ✅ Customer details returned

---

#### **2.4 Update Customer**
```bash
PUT http://localhost:8000/api/v1/percetakan/customers/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "credit_limit": 100000000
}
```

**Expected:**
- ✅ Status 200 OK
- ✅ Customer updated

---

#### **2.5 Delete Customer**
```bash
DELETE http://localhost:8000/api/v1/percetakan/customers/1
Authorization: Bearer YOUR_TOKEN
```

**Expected:**
- ✅ Status 200 OK
- ✅ Customer soft-deleted (status=inactive)

---

#### **2.6-2.10 Additional Customer Endpoints**
```bash
# Customer List for Dropdown
GET /percetakan/customers/list

# Customer Statistics
GET /percetakan/customers/statistics

# Customer Orders
GET /percetakan/customers/{id}/orders

# Customer Statistics Detail
GET /percetakan/customers/{id}/statistics
```

**Expected:**
- ✅ All endpoints return correct data
- ✅ No 404 errors
- ✅ Proper authentication

---

### **Phase 3: Order Management (6 endpoints)**

#### **3.1 List Orders**
```bash
GET http://localhost:8000/api/v1/percetakan/orders
Authorization: Bearer YOUR_TOKEN
```

**Expected:**
- ✅ Status 200 OK
- ✅ Orders list returned

---

#### **3.2 Create Order**
```bash
POST http://localhost:8000/api/v1/percetakan/orders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "customer_id": 1,
  "product_id": 1,
  "quantity": 1000,
  "unit_price": 5000,
  "deadline": "2026-03-01",
  "specifications": {
    "size": "A4",
    "paper_type": "Art Paper",
    "paper_weight": "120gsm",
    "colors_inside": "0/0",
    "colors_outside": "4/0"
  }
}
```

**Expected:**
- ✅ Status 201 Created
- ✅ Order created
- ✅ Auto-generated order number
- ✅ Pricing calculated correctly

---

#### **3.3-3.6 Additional Order Endpoints**
```bash
# Get Order Details
GET /percetakan/orders/{id}

# Update Order
PUT /percetakan/orders/{id}

# Delete Order
DELETE /percetakan/orders/{id}

# Order Statistics
GET /percetakan/orders/statistics
```

**Expected:**
- ✅ All endpoints working
- ✅ Statistics calculated correctly

---

### **Phase 4: Production Jobs (5 endpoints)**

#### **4.1 List Production Jobs**
```bash
GET http://localhost:8000/api/v1/percetakan/production-jobs
Authorization: Bearer YOUR_TOKEN
```

**Expected:**
- ✅ Status 200 OK
- ✅ Production jobs list returned

---

#### **4.2 Create Production Job**
```bash
POST http://localhost:8000/api/v1/percetakan/production-jobs
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "order_id": 1,
  "stage": "pre-press",
  "instructions": "Test production job"
}
```

**Expected:**
- ✅ Status 201 Created
- ✅ Production job created
- ✅ Manual status management (no auto-advance)

---

#### **4.3-4.5 Additional Production Endpoints**
```bash
# Get Production Job Details
GET /percetakan/production-jobs/{id}

# Update Production Job (manual status change)
PUT /percetakan/production-jobs/{id}
{
  "status": "in_progress"
}

# Delete Production Job
DELETE /percetakan/production-jobs/{id}

# Production Statistics
GET /percetakan/production-jobs/statistics
```

**Expected:**
- ✅ Manual status updates work
- ✅ No auto-advance workflow
- ✅ Statistics accurate

---

### **Phase 5: Materials (8 endpoints)**

#### **5.1-5.8 Material Endpoints**
```bash
# List Materials
GET /percetakan/materials

# Create Material
POST /percetakan/materials

# Get Material Details
GET /percetakan/materials/{id}

# Update Material
PUT /percetakan/materials/{id}

# Delete Material
DELETE /percetakan/materials/{id}

# Material Statistics
GET /percetakan/materials/statistics

# Low Stock Alert
GET /percetakan/materials/low-stock

# Adjust Stock
POST /percetakan/materials/{id}/adjust-stock
{
  "adjustment_type": "add",
  "quantity": 100,
  "reason": "New purchase"
}
```

**Expected:**
- ✅ All CRUD operations work
- ✅ Low stock detection works
- ✅ Stock adjustment works
- ✅ No material usage tracking (removed)

---

## ✅ **TEST RESULTS TEMPLATE**

```markdown
## Test Session: [DATE/TIME]

### Authentication (3/3)
- [ ] Register: PASS/FAIL
- [ ] Forgot Password: PASS/FAIL
- [ ] Reset Password: PASS/FAIL

### Customers (10/10)
- [ ] List: PASS/FAIL
- [ ] Create: PASS/FAIL
- [ ] Get: PASS/FAIL
- [ ] Update: PASS/FAIL
- [ ] Delete: PASS/FAIL
- [ ] List Dropdown: PASS/FAIL
- [ ] Statistics: PASS/FAIL
- [ ] Orders: PASS/FAIL
- [ ] Statistics Detail: PASS/FAIL

### Orders (6/6)
- [ ] List: PASS/FAIL
- [ ] Create: PASS/FAIL
- [ ] Get: PASS/FAIL
- [ ] Update: PASS/FAIL
- [ ] Delete: PASS/FAIL
- [ ] Statistics: PASS/FAIL

### Production Jobs (5/5)
- [ ] List: PASS/FAIL
- [ ] Create: PASS/FAIL
- [ ] Get: PASS/FAIL
- [ ] Update: PASS/FAIL
- [ ] Delete: PASS/FAIL
- [ ] Statistics: PASS/FAIL

### Materials (8/8)
- [ ] List: PASS/FAIL
- [ ] Create: PASS/FAIL
- [ ] Get: PASS/FAIL
- [ ] Update: PASS/FAIL
- [ ] Delete: PASS/FAIL
- [ ] Statistics: PASS/FAIL
- [ ] Low Stock: PASS/FAIL
- [ ] Adjust Stock: PASS/FAIL

## Summary
Total: 32 endpoints
Passed: XX/32
Failed: XX/32
Issues: [List any issues found]
```

---

## 🐛 **KNOWN ISSUES TO WATCH**

### **Issue 1: Missing Dependencies**
**Symptom:** Class not found errors  
**Solution:** Run `composer install` and `npm install`

### **Issue 2: Route Not Found**
**Symptom:** 404 errors  
**Solution:** Clear cache: `php artisan route:clear && php artisan cache:clear`

### **Issue 3: Authentication Failed**
**Symptom:** 401 errors  
**Solution:** Check token is valid and not expired

### **Issue 4: Permission Denied**
**Symptom:** 403 errors  
**Solution:** Check user has correct role assigned

---

## 📊 **EXPECTED PERFORMANCE**

```
Response Times:
- Simple GET: < 100ms
- CRUD Operations: < 200ms
- Statistics: < 500ms
- Complex Queries: < 1000ms

Database Queries:
- List endpoints: 1-5 queries
- Detail endpoints: 3-10 queries
- Statistics: 5-15 queries
```

---

## 🚀 **POST-TEST ACTIONS**

### **If All Tests Pass:**
1. ✅ Update production documentation
2. ✅ Deploy to staging
3. ✅ User Acceptance Testing
4. ✅ Deploy to production

### **If Tests Fail:**
1. ❌ Document failures
2. ❌ Fix issues
3. ❌ Re-test
4. ❌ Repeat until all pass

---

## 📝 **FINAL CHECKLIST**

- [ ] All 27 endpoints tested
- [ ] No 500 errors
- [ ] Authentication working
- [ ] Authorization working
- [ ] CRUD operations working
- [ ] Statistics accurate
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Backup files verified

---

**Ready for testing! 🧪**

**Estimated Testing Time:** 1-2 hours  
**Priority:** HIGH  
**Status:** READY
