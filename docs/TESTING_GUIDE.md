# 🧪 TESTING GUIDE - SISTEM PERCETAKAN NEW RIZQUNA ELFATH

**Tanggal:** 20 Februari 2026  
**Status:** Ready for Testing

---

## 📋 **PRE-REQUISITES**

### **1. Start Laravel Server**
```bash
php artisan serve --port=8000
```

### **2. Generate Test Token**
```bash
php artisan tinker
```

```php
// Create test user
$user = App\Models\User::firstOrCreate(
    ['email' => 'test@newrizqunaelfath.com'],
    ['name' => 'Test User', 'password' => bcrypt('password'), 'username' => 'testuser']
);

// Assign role (optional)
$user->assignRole('Admin');

// Create token
$token = $user->createToken('test-token')->plainTextToken;
echo 'Token: ' . $token . PHP_EOL;
```

**Save token untuk testing!**

---

## 🧪 **TEST SCENARIOS**

### **Scenario 1: Customer Management** ✅

#### **1.1 Create Customer**
```bash
curl -X POST http://localhost:8000/api/v1/percetakan/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "PT New Rizquna Elfath",
    "type": "corporate",
    "email": "info@newrizqunaelfath.com",
    "phone": "021-12345678",
    "company_name": "PT New Rizquna Elfath",
    "npwp": "01.234.567.8-901.000",
    "address": "Jl. Percetakan Negara No. 1",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "10110",
    "credit_limit": 50000000,
    "payment_terms_days": 30,
    "discount_percentage": 5
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Customer berhasil dibuat",
  "data": {
    "id": 1,
    "code": "CUST-20260220-0001",
    "name": "PT New Rizquna Elfath",
    "type": "corporate",
    ...
  }
}
```

#### **1.2 List Customers**
```bash
curl -X GET "http://localhost:8000/api/v1/percetakan/customers" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **1.3 Get Customer Statistics**
```bash
curl -X GET "http://localhost:8000/api/v1/percetakan/customers/statistics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### **Scenario 2: Order Management** ✅

#### **2.1 Create Order**
```bash
curl -X POST http://localhost:8000/api/v1/percetakan/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer_id": 1,
    "product_id": 1,
    "quantity": 1000,
    "unit_price": 5000,
    "deadline": "2026-03-01",
    "priority": "normal",
    "specifications": {
      "size": "A4",
      "paper_type": "Art Paper",
      "paper_weight": "120gsm",
      "colors_inside": "0/0",
      "colors_outside": "4/0",
      "binding_type": "perfect_binding",
      "finishing": ["laminate_glossy"],
      "pages_count": 100,
      "print_run": 1,
      "waste_allowance": 5
    }
  }'
```

**Expected:**
- Order number auto-generated (ORD-20260220-0001)
- Pricing calculated (subtotal, PPN 11%, deposit, balance)

#### **2.2 Get Order Statistics**
```bash
curl -X GET "http://localhost:8000/api/v1/percetakan/orders/statistics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### **Scenario 3: Production Jobs** ✅

#### **3.1 Create Production Job**
```bash
curl -X POST http://localhost:8000/api/v1/percetakan/production-jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "order_id": 1,
    "stage": "pre-press",
    "instructions": "Prepare plates for 4/0 printing"
  }'
```

**Expected:**
- Job number auto-generated (JOB-20260220-0001)

#### **3.2 Start Production Job**
```bash
curl -X POST "http://localhost:8000/api/v1/percetakan/production-jobs/1/start" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **3.3 Complete Production Job**
```bash
curl -X POST "http://localhost:8000/api/v1/percetakan/production-jobs/1/complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "quantity_good": 1000,
    "quantity_waste": 10
  }'
```

**Expected:** Next stage job auto-created

---

### **Scenario 4: Material Management** ✅

#### **4.1 Create Material**
```bash
curl -X POST http://localhost:8000/api/v1/percetakan/materials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "PAPER-AP-120-A4",
    "name": "Art Paper 120gsm A4",
    "category": "paper",
    "type": "Art Paper",
    "specification": "120gsm A4",
    "unit": "ream",
    "current_stock": 100,
    "min_stock": 20,
    "max_stock": 500,
    "unit_cost": 75000
  }'
```

#### **4.2 Adjust Stock**
```bash
curl -X POST "http://localhost:8000/api/v1/percetakan/materials/1/adjust-stock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "adjustment_type": "subtract",
    "quantity": 5,
    "reason": "Used for order ORD-20260220-0001"
  }'
```

#### **4.3 Get Low Stock Alert**
```bash
curl -X GET "http://localhost:8000/api/v1/percetakan/materials/low-stock" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### **Scenario 5: Machine Management** ✅

#### **5.1 Create Machine**
```bash
curl -X POST http://localhost:8000/api/v1/percetakan/machines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "OFFSET-001",
    "name": "Heidelberg Speedmaster XL 75",
    "type": "offset",
    "brand": "Heidelberg",
    "model": "Speedmaster XL 75",
    "capacity_per_hour": 18000,
    "purchase_date": "2024-01-01",
    "purchase_price": 5000000000
  }'
```

#### **5.2 Log Maintenance**
```bash
curl -X POST "http://localhost:8000/api/v1/percetakan/machines/1/log-maintenance" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "maintenance_type": "routine",
    "description": "Regular maintenance - oil change and calibration",
    "cost": 5000000,
    "next_maintenance_date": "2026-03-20"
  }'
```

#### **5.3 Update Operating Hours**
```bash
curl -X POST "http://localhost:8000/api/v1/percetakan/machines/1/update-hours" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "hours": 8.5,
    "job_reference": "JOB-20260220-0001"
  }'
```

---

## 📊 **TESTING CHECKLIST**

### **Customer Management**
- [ ] Create customer with all fields
- [ ] List customers with filters
- [ ] Get customer details
- [ ] Update customer information
- [ ] Get customer statistics
- [ ] Get customer orders
- [ ] Customer autocomplete for dropdown

### **Order Management**
- [ ] Create order with specifications
- [ ] Verify order number generation
- [ ] Verify pricing calculation (subtotal, PPN, deposit)
- [ ] List orders with filters
- [ ] Get order details
- [ ] Update order status
- [ ] Cancel order

### **Production Workflow**
- [ ] Create production job
- [ ] Start job
- [ ] Complete job with quantity tracking
- [ ] Verify auto-create next stage
- [ ] Put job on hold
- [ ] Reject job
- [ ] Get production statistics

### **Material Management**
- [ ] Create material
- [ ] List materials
- [ ] Adjust stock (add/subtract/set)
- [ ] Low stock alert
- [ ] Material usage tracking
- [ ] Get material statistics

### **Machine Management**
- [ ] Create machine
- [ ] Update machine status
- [ ] Log maintenance
- [ ] Update operating hours
- [ ] Get maintenance alerts
- [ ] Get machine statistics

---

## 🐛 **KNOWN ISSUES & TROUBLESHOOTING**

### **Issue: 404 Not Found**
**Solution:** Check route prefix - should be `/api/v1/percetakan/...`

### **Issue: 401 Unauthorized**
**Solution:** Verify token is valid and not expired

### **Issue: 422 Validation Error**
**Solution:** Check required fields and data types

### **Issue: Database Error**
**Solution:** Run migrations: `php artisan migrate`

---

## 📝 **TEST RESULTS TEMPLATE**

```markdown
## Test Session: [DATE]

### Customer Management
- [ ] Create: PASS/FAIL - Notes: ...
- [ ] List: PASS/FAIL - Notes: ...
- [ ] Update: PASS/FAIL - Notes: ...

### Order Management
- [ ] Create: PASS/FAIL - Notes: ...
- [ ] Pricing: PASS/FAIL - Notes: ...
- [ ] Tracking: PASS/FAIL - Notes: ...

### Production
- [ ] Job Creation: PASS/FAIL - Notes: ...
- [ ] Workflow: PASS/FAIL - Notes: ...
- [ ] QC: PASS/FAIL - Notes: ...

### Issues Found:
1. ...
2. ...

### Recommendations:
1. ...
2. ...
```

---

## 🚀 **NEXT STEPS AFTER TESTING**

1. ✅ Fix any bugs found
2. ✅ Optimize slow queries
3. ✅ Add missing validations
4. ✅ Update documentation
5. ✅ Deploy to staging
6. ✅ User Acceptance Testing (UAT)
7. ✅ Production deployment

---

**Happy Testing! 🎉**
