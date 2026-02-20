# 📮 POSTMAN COLLECTION - Sistem Percetakan New Rizquna Elfath

**Collection Name:** `New Rizquna Elfath - Percetakan API`  
**Base URL:** `http://localhost:8000/api/v1`  
**Total Endpoints:** 57

---

## 🔑 **AUTHENTICATION SETUP**

### **Get Token:**
```bash
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "login": "admin@rizquna.id",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "YOUR_TOKEN_HERE",
    "token_type": "Bearer",
    "user": { ... }
  }
}
```

### **Setup Authorization:**
- Type: `Bearer Token`
- Token: `{{access_token}}`

---

## 📋 **VARIABLES**

**Collection Variables:**
```
base_url = http://localhost:8000/api/v1
access_token = YOUR_TOKEN_HERE
customer_id = 1
order_id = 1
product_id = 1
material_id = 1
machine_id = 1
production_job_id = 1
job_card_id = 1
```

---

## 👥 **1. CUSTOMER MANAGEMENT (10 Endpoints)**

### **1.1 List Customers**
```http
GET {{base_url}}/percetakan/customers
Authorization: Bearer {{access_token}}
```

**Query Params:**
- `type` (retail|corporate|reseller)
- `status` (active|inactive|blacklisted)
- `city`
- `search`
- `per_page` (default: 15)
- `page`

---

### **1.2 Create Customer**
```http
POST {{base_url}}/percetakan/customers
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
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
}
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
    ...
  }
}
```

---

### **1.3 Get Customer Details**
```http
GET {{base_url}}/percetakan/customers/{{customer_id}}
Authorization: Bearer {{access_token}}
```

---

### **1.4 Update Customer**
```http
PUT {{base_url}}/percetakan/customers/{{customer_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "021-87654321",
  "credit_limit": 100000000
}
```

---

### **1.5 Delete Customer**
```http
DELETE {{base_url}}/percetakan/customers/{{customer_id}}
Authorization: Bearer {{access_token}}
```

---

### **1.6 Get Customer Orders**
```http
GET {{base_url}}/percetakan/customers/{{customer_id}}/orders
Authorization: Bearer {{access_token}}
```

**Query Params:**
- `status`
- `per_page`
- `page`

---

### **1.7 Get Customer Statistics**
```http
GET {{base_url}}/percetakan/customers/{{customer_id}}/statistics
Authorization: Bearer {{access_token}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_orders": 10,
    "orders_by_status": { ... },
    "total_revenue": 500000000,
    "outstanding_balance": 50000000,
    ...
  }
}
```

---

### **1.8 Get All Customers Statistics**
```http
GET {{base_url}}/percetakan/customers/statistics
Authorization: Bearer {{access_token}}
```

---

### **1.9 Customer List for Dropdown**
```http
GET {{base_url}}/percetakan/customers/list
Authorization: Bearer {{access_token}}
```

**Query Params:**
- `search`
- `type`

---

## 📝 **2. ORDER MANAGEMENT (6 Endpoints)**

### **2.1 List Orders**
```http
GET {{base_url}}/percetakan/orders
Authorization: Bearer {{access_token}}
```

**Query Params:**
- `status` (inquiry|quoted|confirmed|in_production|completed|delivered|cancelled)
- `customer_id`
- `priority` (low|normal|high|urgent)
- `from_date`
- `to_date`
- `search`
- `per_page`
- `page`
- `sort_by`
- `sort_order`

---

### **2.2 Create Order**
```http
POST {{base_url}}/percetakan/orders
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "customer_id": 1,
  "product_id": 1,
  "quantity": 1000,
  "unit_price": 5000,
  "deadline": "2026-03-01",
  "priority": "normal",
  "is_rush_order": false,
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
  },
  "discount_amount": 0,
  "deposit_percentage": 50,
  "production_notes": "Handle with care",
  "customer_notes": "Rush order"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order berhasil dibuat",
  "data": {
    "id": 1,
    "order_number": "ORD-20260220-0001",
    "status": "inquiry",
    "pricing": {
      "subtotal": 5000000,
      "tax": 550000,
      "total": 5550000,
      "deposit": 2775000,
      "balance": 2775000
    },
    ...
  }
}
```

---

### **2.3 Get Order Details**
```http
GET {{base_url}}/percetakan/orders/{{order_id}}
Authorization: Bearer {{access_token}}
```

---

### **2.4 Update Order**
```http
PUT {{base_url}}/percetakan/orders/{{order_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "status": "confirmed",
  "priority": "high",
  "deadline": "2026-02-28",
  "production_notes": "Updated notes"
}
```

---

### **2.5 Cancel Order**
```http
DELETE {{base_url}}/percetakan/orders/{{order_id}}
Authorization: Bearer {{access_token}}
```

---

### **2.6 Get Order Statistics**
```http
GET {{base_url}}/percetakan/orders/statistics
Authorization: Bearer {{access_token}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_orders": 50,
    "by_status": {
      "inquiry": 5,
      "confirmed": 10,
      "in_production": 15,
      ...
    },
    "this_month": {
      "orders": 20,
      "revenue": 1000000000
    },
    "pending_approval": 5,
    "urgent_orders": 3
  }
}
```

---

## 🏭 **3. PRODUCTION JOBS (17 Endpoints)**

### **3.1 List Production Jobs**
```http
GET {{base_url}}/percetakan/production-jobs
Authorization: Bearer {{access_token}}
```

**Query Params:**
- `stage` (pre-press|printing|finishing|qc|packaging)
- `status` (pending|in_progress|completed|on_hold|rejected)
- `order_id`
- `machine_id`
- `operator_id`
- `search`

---

### **3.2 Create Production Job**
```http
POST {{base_url}}/percetakan/production-jobs
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "order_id": 1,
  "stage": "pre-press",
  "machine_id": 1,
  "operator_id": 1,
  "supervisor_id": 1,
  "instructions": "Prepare plates for 4/0 printing"
}
```

---

### **3.3 Get Production Job Details**
```http
GET {{base_url}}/percetakan/production-jobs/{{production_job_id}}
Authorization: Bearer {{access_token}}
```

---

### **3.4 Update Production Job**
```http
PUT {{base_url}}/percetakan/production-jobs/{{production_job_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "status": "in_progress",
  "machine_id": 2,
  "notes": "Started printing"
}
```

---

### **3.5 Start Production Job**
```http
POST {{base_url}}/percetakan/production-jobs/{{production_job_id}}/start
Authorization: Bearer {{access_token}}
```

---

### **3.6 Complete Production Job**
```http
POST {{base_url}}/percetakan/production-jobs/{{production_job_id}}/complete
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "quantity_good": 1000,
  "quantity_waste": 10,
  "notes": "Completed successfully"
}
```

---

### **3.7 Put Job on Hold**
```http
POST {{base_url}}/percetakan/production-jobs/{{production_job_id}}/hold
Authorization: Bearer {{access_token}}
```

---

### **3.8 Reject Job**
```http
POST {{base_url}}/percetakan/production-jobs/{{production_job_id}}/reject
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "rejection_reason": "Quality issues - color mismatch"
}
```

---

### **3.9 Get Production Statistics**
```http
GET {{base_url}}/percetakan/production-jobs/statistics
Authorization: Bearer {{access_token}}
```

---

## 📦 **4. JOB CARDS (7 Endpoints)**

### **4.1 List Job Cards**
```http
GET {{base_url}}/percetakan/job-cards
Authorization: Bearer {{access_token}}
```

**Query Params:**
- `production_job_id`
- `qc_passed` (true|false)

---

### **4.2 Create Job Card**
```http
POST {{base_url}}/percetakan/job-cards
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "production_job_id": 1,
  "instructions": {
    "steps": ["Step 1", "Step 2"],
    "notes": "Special handling required"
  },
  "setup_time_minutes": 30,
  "run_time_minutes": 120
}
```

---

### **4.3 Get Job Card Details**
```http
GET {{base_url}}/percetakan/job-cards/{{job_card_id}}
Authorization: Bearer {{access_token}}
```

---

### **4.4 Update Job Card**
```http
PUT {{base_url}}/percetakan/job-cards/{{job_card_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "actual_start": "2026-02-20T10:00:00",
  "actual_end": "2026-02-20T12:00:00",
  "actual_quantity": 1000,
  "waste_quantity": 10,
  "operator_notes": "Completed without issues"
}
```

---

### **4.5 Start Job Card**
```http
POST {{base_url}}/percetakan/job-cards/{{job_card_id}}/start
Authorization: Bearer {{access_token}}
```

---

### **4.6 Complete Job Card**
```http
POST {{base_url}}/percetakan/job-cards/{{job_card_id}}/complete
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "actual_quantity": 1000,
  "waste_quantity": 10,
  "material_used": {
    "paper": "5 reams",
    "ink": "2 liters"
  },
  "operator_notes": "All good"
}
```

---

### **4.7 QC Check**
```http
POST {{base_url}}/percetakan/job-cards/{{job_card_id}}/qc
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "qc_passed": true,
  "qc_notes": "Quality check passed - colors match"
}
```

---

## 📦 **5. MATERIAL MANAGEMENT (8 Endpoints)**

### **5.1 List Materials**
```http
GET {{base_url}}/percetakan/materials
Authorization: Bearer {{access_token}}
```

**Query Params:**
- `category` (paper|ink|plate|consumable|packaging)
- `type`
- `low_stock` (true)
- `search`

---

### **5.2 Create Material**
```http
POST {{base_url}}/percetakan/materials
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
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
}
```

---

### **5.3 Get Material Details**
```http
GET {{base_url}}/percetakan/materials/{{material_id}}
Authorization: Bearer {{access_token}}
```

---

### **5.4 Update Material**
```http
PUT {{base_url}}/percetakan/materials/{{material_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "min_stock": 30,
  "max_stock": 600,
  "unit_cost": 80000
}
```

---

### **5.5 Delete Material**
```http
DELETE {{base_url}}/percetakan/materials/{{material_id}}
Authorization: Bearer {{access_token}}
```

---

### **5.6 Adjust Stock**
```http
POST {{base_url}}/percetakan/materials/{{material_id}}/adjust-stock
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "adjustment_type": "subtract",
  "quantity": 5,
  "reason": "Used for order ORD-20260220-0001",
  "reference": "JOB-20260220-0001"
}
```

**adjustment_type:** `add` | `subtract` | `set`

---

### **5.7 Get Low Stock Materials**
```http
GET {{base_url}}/percetakan/materials/low-stock
Authorization: Bearer {{access_token}}
```

---

### **5.8 Get Material Statistics**
```http
GET {{base_url}}/percetakan/materials/statistics
Authorization: Bearer {{access_token}}
```

---

## ⚙️ **6. MACHINE MANAGEMENT (9 Endpoints)**

### **6.1 List Machines**
```http
GET {{base_url}}/percetakan/machines
Authorization: Bearer {{access_token}}
```

**Query Params:**
- `type` (offset|digital|cutting|binding|laminating)
- `status` (operational|maintenance|broken|decommissioned)
- `operational` (true|false)
- `search`

---

### **6.2 Create Machine**
```http
POST {{base_url}}/percetakan/machines
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "code": "OFFSET-001",
  "name": "Heidelberg Speedmaster XL 75",
  "type": "offset",
  "brand": "Heidelberg",
  "model": "Speedmaster XL 75",
  "capacity_per_hour": 18000,
  "purchase_date": "2024-01-01",
  "purchase_price": 5000000000
}
```

---

### **6.3 Get Machine Details**
```http
GET {{base_url}}/percetakan/machines/{{machine_id}}
Authorization: Bearer {{access_token}}
```

---

### **6.4 Update Machine**
```http
PUT {{base_url}}/percetakan/machines/{{machine_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "status": "maintenance",
  "notes": "Scheduled maintenance"
}
```

---

### **6.5 Delete Machine**
```http
DELETE {{base_url}}/percetakan/machines/{{machine_id}}
Authorization: Bearer {{access_token}}
```

---

### **6.6 Update Machine Status**
```http
POST {{base_url}}/percetakan/machines/{{machine_id}}/update-status
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "status": "operational",
  "notes": "Back in service after maintenance"
}
```

---

### **6.7 Log Maintenance**
```http
POST {{base_url}}/percetakan/machines/{{machine_id}}/log-maintenance
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "maintenance_type": "routine",
  "description": "Regular maintenance - oil change and calibration",
  "cost": 5000000,
  "technician": "John Doe",
  "next_maintenance_date": "2026-03-20"
}
```

---

### **6.8 Update Operating Hours**
```http
POST {{base_url}}/percetakan/machines/{{machine_id}}/update-hours
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "hours": 8.5,
  "job_reference": "JOB-20260220-0001"
}
```

---

### **6.9 Get Machines Needing Maintenance**
```http
GET {{base_url}}/percetakan/machines/needs-maintenance
Authorization: Bearer {{access_token}}
```

---

## 📊 **7. MATERIAL USAGE (7 Endpoints)**

### **7.1 List Material Usage**
```http
GET {{base_url}}/percetakan/material-usage
Authorization: Bearer {{access_token}}
```

**Query Params:**
- `job_card_id`
- `material_id`
- `from_date`
- `to_date`

---

### **7.2 Create Material Usage**
```http
POST {{base_url}}/percetakan/material-usage
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "job_card_id": 1,
  "material_id": 1,
  "quantity_planned": 10,
  "quantity_actual": 9.5,
  "quantity_waste": 0.5,
  "unit_cost": 75000,
  "notes": "Used for printing job"
}
```

---

### **7.3 Get Material Usage Details**
```http
GET {{base_url}}/percetakan/material-usage/{{usage_id}}
Authorization: Bearer {{access_token}}
```

---

### **7.4 Update Material Usage**
```http
PUT {{base_url}}/percetakan/material-usage/{{usage_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "quantity_actual": 10,
  "quantity_waste": 0.3,
  "notes": "Updated usage"
}
```

---

### **7.5 Delete Material Usage**
```http
DELETE {{base_url}}/percetakan/material-usage/{{usage_id}}
Authorization: Bearer {{access_token}}
```

---

### **7.6 Get Material Usage Statistics**
```http
GET {{base_url}}/percetakan/material-usage/statistics
Authorization: Bearer {{access_token}}
```

---

## 🧪 **TESTING WORKFLOW**

### **Recommended Test Sequence:**

1. **Authentication** - Get token
2. **Customer** - Create customer → Get list → Get details
3. **Order** - Create order → Get details → Update status
4. **Production** - Create job → Start → Complete
5. **Job Cards** - Create card → Start → Complete → QC
6. **Materials** - Create material → Adjust stock
7. **Machines** - Create machine → Log maintenance
8. **Material Usage** - Record usage → Get statistics

---

## ✅ **EXPECTED RESULTS**

**All endpoints should return:**
- Status code: 200/201 for success
- Status code: 401 for unauthorized
- Status code: 404 for not found
- Status code: 422 for validation errors
- JSON response with `success` field
- Proper error messages

---

## 📥 **IMPORT TO POSTMAN**

1. Open Postman
2. Click **Import**
3. Copy-paste this documentation
4. Or create collection manually
5. Add environment variables
6. Start testing!

---

**Happy Testing! 🚀**
