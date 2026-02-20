# 🏭 SISTEM MANAJEMEN PERCETAKAN - ANALISIS KEBUTUHAN

**Tanggal:** 20 Februari 2026  
**Status:** ✅ REQUIREMENT ANALYSIS

---

## 📋 PERBEDAAN MENDASAR

### **POS Kasir Warung (SIMPLE)**
```
- Input: Produk → Qty → Bayar
- Output: Struk pembayaran
- Inventory: Stok berkurang
- Laporan: Penjualan harian
```

### **Sistem Percetakan (COMPLEX - MANUFACTURING)**
```
- Input: Spesifikasi customer → Estimasi → Production order
- Process: Pre-press → Printing → Finishing → QC → Delivery
- Output: Produk jadi + Invoice + Tracking
- Inventory: Raw material (kertas, tinta, plate) → WIP → Finished goods
- Laporan: Production efficiency, Material usage, Job costing
```

---

## 🎯 MODULE UTAMA SISTEM PERCETAKAN

### **1. ORDER MANAGEMENT** 📝
**Entitas:**
- Customer (B2B/B2C)
- Order/Job
- Order Items
- Specifications
- Quotation/Estimate
- Artwork/Design files

**Workflow:**
```
Inquiry → Specification → Quotation → Approval → Deposit → Production Order
```

**Spesifikasi Order:**
- Product type (buku, brosur, kartu nama, banner, dll)
- Size (A4, A3, F4, custom)
- Paper type & weight (HVS 70gsm, Art Paper 120gsm, dll)
- Colors (1/0, 4/0, 4/4)
- Binding (staples, perfect binding, spiral, dll)
- Finishing (laminate, UV spot, emboss, dll)
- Quantity
- Deadline

---

### **2. PRODUCTION WORKFLOW** 🏭
**Stages:**
```
1. Pre-press
   - Design approval
   - Plate making
   - Color proofing

2. Printing
   - Machine assignment
   - Material issuance
   - Print run

3. Finishing
   - Cutting
   - Folding
   - Binding
   - Laminating

4. Quality Control
   - Color check
   - Size check
   - Binding check
   - Final approval

5. Packaging & Delivery
   - Packing
   - Shipping
   - Customer acceptance
```

**Tracking:**
- Job cards
- Stage completion
- Time tracking
- Operator assignment
- Machine usage

---

### **3. MATERIAL & INVENTORY** 📦
**Categories:**
- Raw materials (kertas, tinta, plate, film)
- Consumables (glue, thread, packaging)
- Finished goods (ready for delivery)
- Work in Progress (WIP)

**Tracking:**
- Stock levels
- Reorder points
- Supplier management
- Purchase orders
- Material usage per job
- Waste tracking

---

### **4. MACHINE & EQUIPMENT** ⚙️
**Management:**
- Machine registry (offset, digital, cutting, binding)
- Maintenance schedule
- Downtime tracking
- Efficiency monitoring
- Capacity planning

**Metrics:**
- OEE (Overall Equipment Effectiveness)
- Utilization rate
- MTBF (Mean Time Between Failures)
- MTTR (Mean Time To Repair)

---

### **5. JOB COSTING & PRICING** 💰
**Cost Components:**
```
Direct Costs:
- Material (kertas, tinta, plate)
- Labor (operator time)
- Machine time (depreciation, power)

Indirect Costs:
- Overhead (rent, utilities)
- Setup costs
- Waste allowance

Profit Margin:
- Markup percentage
- Competitive pricing
```

**Pricing Formula:**
```
Base Price = Material + Labor + Machine + Overhead
Final Price = Base Price + Profit Margin
```

---

### **6. CUSTOMER MANAGEMENT** 👥
**CRM Features:**
- Customer database (B2B priority)
- Order history
- Credit terms
- Payment tracking
- Communication log
- Complaints/Returns

**Customer Types:**
- Corporate (contract, credit terms)
- Retail (cash/DP)
- Reseller (discount tiers)
- Regular (loyalty program)

---

### **7. ESTIMATION & QUOTATION** 📊
**Quotation System:**
```
Input:
- Product specifications
- Quantity
- Material selection
- Finishing options

Process:
- Material calculation
- Time estimation
- Cost calculation
- Margin addition

Output:
- Formal quotation
- Validity period
- Terms & conditions
- Deposit requirement
```

**Approval Workflow:**
```
Sales → Manager → Customer → Deposit → Production
```

---

### **8. INVOICING & PAYMENT** 💳
**Billing:**
- Proforma invoice (deposit)
- Final invoice
- Delivery order
- Tax calculation (PPN 11%)

**Payment Terms:**
- Cash (retail)
- DP 50% (custom orders)
- Credit 7/14/30 days (corporate)
- Installment (large orders)

**Tracking:**
- Accounts receivable
- Aging report
- Payment reminders
- Credit limits

---

### **9. QUALITY CONTROL** ✅
**QC Checkpoints:**
```
1. Incoming material inspection
2. Pre-press proof approval
3. First sheet approval (print)
4. In-process quality checks
5. Final inspection
6. Pre-delivery check
```

**QC Metrics:**
- Defect rate
- Rework percentage
- Customer complaints
- Return rate

---

### **10. REPORTING & ANALYTICS** 📈
**Production Reports:**
- Daily production summary
- Machine utilization
- Operator efficiency
- Job completion rate
- WIP status

**Financial Reports:**
- Sales by product/category
- Job profitability
- Material usage variance
- Accounts receivable
- Cash flow

**Management Reports:**
- Order backlog
- Capacity utilization
- Customer analysis
- Trend analysis
- KPI dashboard

---

## 🗂️ DATABASE SCHEMA (CORE TABLES)

### **Orders**
```sql
- id
- order_number (unique)
- customer_id
- status (inquiry, quoted, confirmed, production, completed, delivered, cancelled)
- product_type
- specifications (JSON)
- quantity
- unit_price
- total_amount
- deposit_amount
- deposit_paid
- balance_due
- deadline
- delivery_date
- notes
- created_by (sales)
- approved_by
- created_at
- updated_at
```

### **OrderSpecifications**
```sql
- id
- order_id
- size (A4, A3, F4, custom)
- paper_type (HVS, Art Paper, Ivory, dll)
- paper_weight (70gsm, 80gsm, 120gsm, dll)
- colors_inside (1/0, 4/0, 4/4)
- colors_outside (1/0, 4/0, 4/4)
- binding_type (staples, perfect binding, spiral, hard cover)
- finishing (laminate, UV spot, emboss, die cut)
- pages_count
- print_run
- waste_allowance
```

### **ProductionJobs**
```sql
- id
- order_id
- job_number
- stage (pre-press, printing, finishing, qc, packaging)
- status (pending, in_progress, completed, on_hold, rejected)
- machine_id
- operator_id
- started_at
- completed_at
- actual_quantity
- waste_quantity
- notes
```

### **Materials**
```sql
- id
- code (unique)
- name
- category (paper, ink, plate, consumable)
- type (HVS, Art Paper, Cyan ink, dll)
- specification (70gsm, A4, 1L, dll)
- unit (ream, sheet, liter, kg)
- current_stock
- min_stock
- max_stock
- unit_cost
- supplier_id
- last_purchase_date
```

### **Machines**
```sql
- id
- code (unique)
- name
- type (offset, digital, cutting, binding, laminating)
- brand
- model
- capacity
- status (operational, maintenance, broken)
- last_maintenance
- next_maintenance
- total_operating_hours
```

### **JobCards**
```sql
- id
- production_job_id
- card_number
- instructions (JSON)
- setup_time
- run_time
- actual_start
- actual_end
- operator_id
- quantity_good
- quantity_waste
- material_used (JSON)
- notes
```

---

## 🔄 WORKFLOW LENGKAP

### **Order Flow:**
```
1. Customer Inquiry
   ↓
2. Sales Consultation
   ↓
3. Specification Definition
   ↓
4. Cost Estimation
   ↓
5. Quotation Sent
   ↓
6. Customer Approval
   ↓
7. Deposit Payment (50%)
   ↓
8. Production Order Created
   ↓
9. Pre-press (Design, Plate)
   ↓
10. Printing
    ↓
11. Finishing
    ↓
12. Quality Control
    ↓
13. Packaging
    ↓
14. Final Payment
    ↓
15. Delivery
    ↓
16. Customer Acceptance
    ↓
17. Invoice & Receipt
```

---

## 📱 USER ROLES

### **Admin/Owner:**
- Dashboard (all metrics)
- Approve quotations (> threshold)
- View all reports
- Manage users
- Configure system

### **Sales:**
- Create inquiries
- Generate quotations
- Track order status
- Customer management
- Commission tracking

### **Production Manager:**
- Schedule jobs
- Assign machines/operators
- Monitor production
- QC approval
- Material requisition

### **Operator:**
- View assigned jobs
- Update job status
- Report issues
- Log production time
- Record waste

### **Warehouse:**
- Material receipt
- Stock management
- Material issuance
- Finished goods packing
- Delivery preparation

### **Accounting:**
- Invoice generation
- Payment recording
- Accounts receivable
- Financial reports
- Tax calculation

### **Customer (Portal):**
- Submit inquiry
- View quotations
- Track order status
- Make payments
- Download invoices
- Order history

---

## 🎯 KEY METRICS (KPI)

### **Production:**
- On-time delivery %
- First-pass yield %
- Machine utilization %
- Overall Equipment Effectiveness (OEE)
- Average job completion time

### **Sales:**
- Orders per month
- Average order value
- Conversion rate (inquiry → order)
- Customer retention rate
- Sales per product category

### **Financial:**
- Gross margin %
- Net profit %
- Accounts receivable days
- Cash conversion cycle
- Job profitability

### **Quality:**
- Defect rate %
- Rework rate %
- Customer complaints
- Return rate %
- QC pass rate %

---

## 🚀 IMPLEMENTATION PRIORITY

### **Phase 1 (MVP - 4 weeks):**
- [x] Order management
- [x] Customer database
- [x] Basic estimation
- [x] Production tracking
- [x] Invoice generation

### **Phase 2 (8 weeks):**
- [ ] Material inventory
- [ ] Machine management
- [ ] Advanced costing
- [ ] QC module
- [ ] Reporting dashboard

### **Phase 3 (12 weeks):**
- [ ] Customer portal
- [ ] Mobile app (tracking)
- [ ] Integration (accounting software)
- [ ] Barcode/QR tracking
- [ ] Advanced analytics

---

## 💡 RECOMMENDATIONS

### **Technology Stack:**
- **Backend:** Laravel 11 (current) ✅
- **Frontend:** React + Ant Design (current) ✅
- **Database:** PostgreSQL (for complex queries) ✅
- **Queue:** Redis (for background jobs)
- **Search:** Elasticsearch (order search)
- **File Storage:** S3/MinIO (design files)

### **Architecture:**
- **Monolith** (start) → **Microservices** (scale)
- **Modular design** (Order, Production, Inventory, Finance)
- **API-first** (for mobile/customer portal)
- **Event-driven** (order status updates, notifications)

### **Security:**
- Role-based access control (current) ✅
- Data encryption (customer data)
- Audit trail (all transactions)
- Backup strategy (daily + offsite)

---

## 📊 COMPARISON: CURRENT vs NEEDED

| Feature | Current (Publishing) | Needed (Percetakan) |
|---------|---------------------|---------------------|
| **Order Type** | Book publishing | Custom printing jobs |
| **Pricing** | Royalty-based | Job costing |
| **Production** | Vendor outsourcing | In-house production |
| **Inventory** | Finished books | Raw materials + WIP |
| **Workflow** | Simple approval | Multi-stage production |
| **Customer** | Authors (B2C) | B2B + B2C |
| **Payment** | Royalty payments | Deposit + balance |
| **Tracking** | Sales tracking | Job card tracking |
| **QC** | Not needed | Critical checkpoint |
| **Machines** | Not tracked | Machine management |
| **Materials** | Not tracked | Paper, ink, plate |
| **Reporting** | Sales & royalty | Production efficiency |

---

## ✅ KESIMPULAN

**Sistem percetakan membutuhkan:**
1. ✅ **Order management** yang kompleks (spesifikasi custom)
2. ✅ **Production workflow** multi-stage dengan tracking
3. ✅ **Material inventory** (raw material, WIP, finished)
4. ✅ **Machine management** (maintenance, utilization)
5. ✅ **Job costing** (material + labor + machine + overhead)
6. ✅ **Quality control** di setiap stage
7. ✅ **Customer portal** untuk tracking order
8. ✅ **Estimation system** yang akurat
9. ✅ **Invoice & payment** dengan deposit tracking
10. ✅ **Comprehensive reporting** (production + financial)

**Ini BUKAN POS kasir warung - ini SISTEM ERP MANUFAKTURING untuk percetakan!** 🏭

---

**Next Step:** Implementasi module-module di atas secara bertahap dimulai dari Order Management & Production Workflow.
