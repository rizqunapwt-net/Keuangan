# 🔧 Action Plan & Technical Specifications
## Perbaikan Workflow n8n - Rizquna.id

---

## 📋 Phase 1: Critical Fixes (Week 1-2)

### 1.1 Fix WF11 - Advanced Order Processor

**Current Issue:**
- Response mode set tapi tidak ada response node
- Tidak ada konfirmasi ke customer
- Tidak ada error handling

**Solution:**
```json
{
  "nodes": [
    // ... existing nodes ...
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: true, order_id: $json.order_id, order_code: $node[\"Validate & Transform\"].json.order_code } }}",
        "options": {
          "responseCode": 200
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1050, 300],
      "name": "Respond Success"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: false, error: $json.error } }}",
        "options": {
          "responseCode": 400
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1050, 500],
      "name": "Respond Error"
    },
    {
      "parameters": {
        "resource": "Chatting",
        "operation": "Send Text",
        "chatId": "={{ $node[\"Validate & Transform\"].json.customer_phone }}@c.us",
        "text": "Terima kasih atas pesanan Kakak! ✅\n\nKode Order: *{{ $node[\"Validate & Transform\"].json.order_code }}*\nTotal: Rp {{ $node[\"Validate & Transform\"].json.total_amount }}\n\nPesanan sedang kami proses. Silakan transfer ke:\nBCA 1234567890 a.n Rizquna\n\nKirim bukti transfer ke chat ini ya Kak! 🙏"
      },
      "type": "@devlikeapro/n8n-nodes-waha.WAHA",
      "position": [1050, 400],
      "name": "WA: Order Confirmation"
    }
  ]
}
```

---

### 1.2 Implement WF9 - Smart Reminder System

**Current Issue:**
- Hanya dummy data
- Tidak ada logic

**New Implementation:**
```json
{
  "nodes": [
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT o.order_code, c.name, c.phone, o.total_amount, o.created_at FROM orders o JOIN customers c ON o.customer_id = c.customer_id WHERE o.status = 'pending_payment' AND o.created_at < NOW() - INTERVAL '24 hours' LIMIT 10;"
      },
      "type": "n8n-nodes-base.postgres",
      "name": "Get Pending Payments"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT n.naskah_id, n.title, a.name, a.whatsapp, n.deadline FROM naskah n JOIN authors a ON n.author_id = a.author_id WHERE n.status = 'EDITING' AND n.deadline <= NOW() + INTERVAL '3 days' AND n.last_reminder < NOW() - INTERVAL '24 hours';"
      },
      "type": "n8n-nodes-base.postgres",
      "name": "Get Deadline Naskah"
    },
    {
      "parameters": {
        "jsCode": "const pending = $node[\"Get Pending Payments\"].all();\nconst deadlines = $node[\"Get Deadline Naskah\"].all();\n\nconst reminders = [];\n\n// Payment Reminders\npending.forEach(p => {\n  reminders.push({\n    type: 'payment',\n    phone: p.json.phone,\n    message: `Halo Kak ${p.json.name} 👋\\n\\nKami ingatkan untuk order ${p.json.order_code} senilai Rp ${p.json.total_amount} masih menunggu pembayaran.\\n\\nMohon segera transfer ya Kak! 🙏`\n  });\n});\n\n// Deadline Reminders\ndeadlines.forEach(d => {\n  reminders.push({\n    type: 'deadline',\n    phone: d.json.whatsapp,\n    message: `Assalamualaikum Kak ${d.json.name} 🙏\\n\\nNaskah \"${d.json.title}\" deadline ${d.json.deadline}.\\n\\nMohon segera diselesaikan ya Kak!`\n  });\n});\n\nreturn reminders.map(r => ({ json: r }));"
      },
      "type": "n8n-nodes-base.code",
      "name": "Compile Reminders"
    },
    {
      "parameters": {
        "resource": "Chatting",
        "operation": "Send Text",
        "chatId": "={{ $json.phone }}@c.us",
        "text": "={{ $json.message }}"
      },
      "type": "@devlikeapro/n8n-nodes-waha.WAHA",
      "name": "Send Reminder"
    }
  ]
}
```

---

### 1.3 Consolidate WF0 & WF1

**Decision: Use WF0 as Master, Deprecate WF1**

**Enhancements to WF0:**
```json
{
  "parameters": {
    "options": {
      "systemMessage": "Anda adalah Surti, Senior AI Assistant dari Rizquna.id.\n\n🕐 JAM OPERASIONAL:\nSenin-Sabtu: 07:00-21:00 WIB\nMinggu: Libur\n\nJika di luar jam operasional, sampaikan dengan ramah dan tawarkan untuk meninggalkan pesan.\n\n🛠️ TOOLS ANDA:\n1. Katalog_Buku - cari produk (judul, penulis, harga, stok)\n2. Check_Order_Status - cek status pesanan customer\n3. Create_Support_Ticket - buat ticket untuk masalah kompleks\n\n📋 CARA KERJA:\n- PRODUK/BUKU → Katalog_Buku tool\n- STATUS ORDER → Check_Order_Status tool\n- KOMPLAIN/MASALAH → Create_Support_Ticket tool\n- INFO UMUM → jawab langsung\n\n✅ ETIKA:\n- Sapa 'Kak' atau 'Sahabat Rizquna'\n- Ramah, sopan, Islami (gunakan salam)\n- Akhiri: 'Ada lagi yang bisa Surti bantu, Kak?'\n\n📍 INFO RIZQUNA.ID:\n- Alamat: [ISI LENGKAP]\n- WhatsApp: wa.me/6285119467138\n- Email: cs@rizquna.id\n- Jam: Senin-Sabtu 07:00-21:00 WIB"
    }
  }
}
```

**Add New Tools:**
```json
[
  {
    "parameters": {
      "operation": "executeQuery",
      "query": "SELECT order_code, status, total_amount, created_at FROM orders WHERE customer_id = (SELECT customer_id FROM customers WHERE phone = $1) ORDER BY created_at DESC LIMIT 5;",
      "description": "Check order status by customer phone number"
    },
    "type": "@n8n/n8n-nodes-langchain.toolPostgres",
    "name": "Check_Order_Status"
  }
]
```

---

## 📋 Phase 2: Integration (Week 3-4)

### 2.1 Connect WF2 → WF11 Flow

**Implementation:**

**WF2 Enhancement:**
```json
{
  "nodes": [
    // ... existing nodes ...
    {
      "parameters": {
        "method": "POST",
        "url": "https://[YOUR-N8N-INSTANCE]/webhook/order-adv",
        "sendHeaders": true,
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "customer_name",
              "value": "={{ $json.extracted_name }}"
            },
            {
              "name": "customer_phone",
              "value": "={{ $json.extracted_phone }}"
            },
            {
              "name": "customer_address",
              "value": "={{ $json.extracted_address }}"
            },
            {
              "name": "items",
              "value": "={{ $json.extracted_items }}"
            },
            {
              "name": "total_amount",
              "value": "={{ $json.calculated_total }}"
            },
            {
              "name": "channel",
              "value": "whatsapp"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.httpRequest",
      "name": "Call Order Processor"
    }
  ]
}
```

---

### 2.2 WF3 → Payment Verification Flow

**New Nodes:**
```json
{
  "nodes": [
    {
      "parameters": {
        "operation": "download",
        "binaryProperty": "data",
        "fileName": "={{ $json.messageId }}_bukti_tf.jpg"
      },
      "type": "n8n-nodes-base.httpRequest",
      "name": "Download Bukti Transfer"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO payment_confirmations (order_code, customer_phone, image_url, status, created_at) VALUES ($1, $2, $3, 'pending_verification', NOW()) RETURNING *;",
        "arguments": "={{ [$json.order_code, $json.chatId, $json.image_url] }}"
      },
      "type": "n8n-nodes-base.postgres",
      "name": "Save Payment Proof"
    },
    {
      "parameters": {
        "resource": "Chatting",
        "operation": "Send Text",
        "chatId": "6285119467138@c.us",
        "text": "💰 *KONFIRMASI PEMBAYARAN BARU*\n\nOrder: {{ $json.order_code }}\nCustomer: {{ $json.customer_name }}\nPhone: {{ $json.customer_phone }}\nJumlah: Rp {{ $json.amount }}\n\nBukti transfer sudah diterima. Mohon verifikasi."
      },
      "type": "@devlikeapro/n8n-nodes-waha.WAHA",
      "name": "Notify Admin"
    }
  ]
}
```

---

### 2.3 WF12 Auto-Trigger from Order

**Modification:**
```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "shipping-trigger",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "name": "Webhook: Shipping Trigger"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT o.*, c.name, c.phone, c.address FROM orders o JOIN customers c ON o.customer_id = c.customer_id WHERE o.order_id = $1;",
        "arguments": "={{ $json.order_id }}"
      },
      "type": "n8n-nodes-base.postgres",
      "name": "Get Order Details"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.biteship.com/v1/orders",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "biteshipApi",
        "sendHeaders": true,
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "origin_address",
              "value": "Jl. Example No. 123, Jakarta"
            },
            {
              "name": "destination_address",
              "value": "={{ $json.address }}"
            },
            {
              "name": "items",
              "value": "={{ $json.items }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.httpRequest",
      "name": "Create Biteship Order"
    }
  ]
}
```

---

## 📋 Phase 3: Enhancement (Week 5-6)

### 3.1 Error Handling Template

**Universal Error Handler (untuk semua workflow):**
```json
{
  "nodes": [
    {
      "parameters": {
        "jsCode": "const error = $input.first().json.error || $input.first().json;\nconst workflow = $workflow.name;\nconst timestamp = new Date().toISOString();\n\nreturn [{\n  json: {\n    workflow_name: workflow,\n    error_message: error.message || 'Unknown error',\n    error_stack: error.stack || '',\n    timestamp: timestamp,\n    input_data: JSON.stringify($input.first().json)\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "name": "Format Error"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO error_logs (workflow_name, error_message, error_stack, input_data, created_at) VALUES ($1, $2, $3, $4, $5);",
        "arguments": "={{ [$json.workflow_name, $json.error_message, $json.error_stack, $json.input_data, $json.timestamp] }}"
      },
      "type": "n8n-nodes-base.postgres",
      "name": "Log Error to DB"
    },
    {
      "parameters": {
        "resource": "Chatting",
        "operation": "Send Text",
        "chatId": "6285119467138@c.us",
        "text": "🚨 *ERROR ALERT*\n\nWorkflow: {{ $json.workflow_name }}\nError: {{ $json.error_message }}\nTime: {{ $json.timestamp }}"
      },
      "type": "@devlikeapro/n8n-nodes-waha.WAHA",
      "name": "Alert Admin"
    }
  ]
}
```

---

### 3.2 Activity Logging

**Universal Logger:**
```json
{
  "parameters": {
    "operation": "executeQuery",
    "query": "INSERT INTO activity_logs (workflow_name, activity_type, customer_phone, order_code, description, metadata, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW());",
    "arguments": "={{ [$workflow.name, $json.activity_type, $json.customer_phone, $json.order_code, $json.description, JSON.stringify($json.metadata)] }}"
  },
  "type": "n8n-nodes-base.postgres",
  "name": "Log Activity"
}
```

**Use Cases:**
- Customer conversations
- Order creation
- Payment confirmations
- Shipping updates
- Status changes

---

### 3.3 Enable WF5 Email Marketing

**SMTP Setup:**
```json
{
  "credentials": {
    "smtp": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "user": "cs@rizquna.id",
      "password": "[APP_PASSWORD]"
    }
  }
}
```

**Email Templates:**
```javascript
const templates = {
  welcome: `
    <h2>Assalamualaikum ${name}! 🙏</h2>
    <p>Terima kasih sudah bergabung dengan Rizquna.id!</p>
    <p>Dapatkan diskon 10% untuk pembelian pertama dengan kode: <strong>WELCOME10</strong></p>
  `,
  order_confirmation: `
    <h2>Pesanan Diterima! ✅</h2>
    <p>Order Code: <strong>${orderCode}</strong></p>
    <p>Total: Rp ${totalAmount}</p>
    <p>Silakan transfer ke: BCA 1234567890 a.n Rizquna</p>
  `,
  shipping_notification: `
    <h2>Pesanan Dikirim! 📦</h2>
    <p>Nomor Resi: <strong>${trackingNumber}</strong></p>
    <p>Estimasi tiba: ${estimatedArrival}</p>
  `
};
```

---

## 📋 Phase 4: Advanced Features (Week 7-8)

### 4.1 WF6 Real Tokopedia Integration

**Tokopedia API Implementation:**
```json
{
  "nodes": [
    {
      "parameters": {
        "method": "GET",
        "url": "https://fs.tokopedia.net/inventory/v1/fs/${FS_ID}/product",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "tokopediaApi",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{ $credentials.tokopediaApi.accessToken }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.httpRequest",
      "name": "Get Tokopedia Products"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://fs.tokopedia.net/inventory/v1/fs/${FS_ID}/product/update",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "products",
              "value": "={{ $json.products }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.httpRequest",
      "name": "Update Tokopedia"
    }
  ]
}
```

---

### 4.2 Customer Segmentation

**New Workflow: WF14 - Customer Analytics**
```json
{
  "nodes": [
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT c.customer_id, c.name, c.phone, COUNT(o.order_id) as total_orders, SUM(o.total_amount) as lifetime_value, MAX(o.created_at) as last_order FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id;"
      },
      "type": "n8n-nodes-base.postgres",
      "name": "Get Customer Analytics"
    },
    {
      "parameters": {
        "jsCode": "const customers = $input.all();\n\nconst segments = {\n  vip: [],\n  loyal: [],\n  regular: [],\n  dormant: [],\n  new: []\n};\n\ncustomers.forEach(c => {\n  const ltv = c.json.lifetime_value || 0;\n  const orders = c.json.total_orders || 0;\n  const lastOrder = new Date(c.json.last_order);\n  const daysSinceLastOrder = (new Date() - lastOrder) / (1000 * 60 * 60 * 24);\n  \n  if (ltv > 5000000) segments.vip.push(c.json);\n  else if (orders > 10) segments.loyal.push(c.json);\n  else if (daysSinceLastOrder > 90) segments.dormant.push(c.json);\n  else if (orders <= 1) segments.new.push(c.json);\n  else segments.regular.push(c.json);\n});\n\nreturn Object.entries(segments).map(([segment, customers]) => ({\n  json: { segment, customers, count: customers.length }\n}));"
      },
      "type": "n8n-nodes-base.code",
      "name": "Segment Customers"
    }
  ]
}
```

---

### 4.3 A/B Testing Framework

**New Workflow: WF15 - Message A/B Test**
```json
{
  "nodes": [
    {
      "parameters": {
        "jsCode": "const variants = {\n  A: 'Assalamualaikum Kak! Ada yang bisa Surti bantu? 😊',\n  B: 'Halo Kak! Selamat datang di Rizquna.id 👋',\n  C: 'Assalamualaikum! Surti siap membantu Kakak 🙏'\n};\n\nconst randomVariant = Object.keys(variants)[Math.floor(Math.random() * 3)];\n\nreturn [{\n  json: {\n    variant: randomVariant,\n    message: variants[randomVariant],\n    customer_phone: $json.customer_phone\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "name": "Assign Variant"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO ab_test_logs (test_name, variant, customer_phone, sent_at) VALUES ('greeting_message', $1, $2, NOW());",
        "arguments": "={{ [$json.variant, $json.customer_phone] }}"
      },
      "type": "n8n-nodes-base.postgres",
      "name": "Log Test"
    }
  ]
}
```

---

## 📊 Database Schema Updates

### New Tables Required:
```sql
-- Error Logging
CREATE TABLE error_logs (
  error_id SERIAL PRIMARY KEY,
  workflow_name VARCHAR(100),
  error_message TEXT,
  error_stack TEXT,
  input_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity Logging
CREATE TABLE activity_logs (
  activity_id SERIAL PRIMARY KEY,
  workflow_name VARCHAR(100),
  activity_type VARCHAR(50),
  customer_phone VARCHAR(20),
  order_code VARCHAR(50),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payment Confirmations
CREATE TABLE payment_confirmations (
  confirmation_id SERIAL PRIMARY KEY,
  order_code VARCHAR(50),
  customer_phone VARCHAR(20),
  image_url TEXT,
  status VARCHAR(30),
  verified_by INTEGER,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Naskah (if not exists)
CREATE TABLE naskah (
  naskah_id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author_id INTEGER REFERENCES authors(author_id),
  status VARCHAR(50),
  deadline DATE,
  last_reminder TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- A/B Testing
CREATE TABLE ab_test_logs (
  log_id SERIAL PRIMARY KEY,
  test_name VARCHAR(100),
  variant VARCHAR(10),
  customer_phone VARCHAR(20),
  response_time INTEGER,
  converted BOOLEAN,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Customer Segments
CREATE TABLE customer_segments (
  segment_id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  segment_type VARCHAR(50),
  assigned_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Security Enhancements

### 1. Environment Variables
```bash
# .env file
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=rizquna_db
POSTGRES_USER=rizquna_user
POSTGRES_PASSWORD=[SECURE_PASSWORD]

WAHA_API_KEY=[YOUR_WAHA_KEY]
GEMINI_API_KEY=[YOUR_GEMINI_KEY]
BITESHIP_API_KEY=[YOUR_BITESHIP_KEY]
TOKOPEDIA_CLIENT_ID=[YOUR_CLIENT_ID]
TOKOPEDIA_CLIENT_SECRET=[YOUR_SECRET]

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=cs@rizquna.id
SMTP_PASSWORD=[APP_PASSWORD]

ADMIN_PHONE=6285119467138
```

### 2. Rate Limiting
```json
{
  "parameters": {
    "jsCode": "const phone = $json.customer_phone;\nconst key = `rate_limit_${phone}`;\nconst redis = $node[\"Redis\"];\n\nconst count = await redis.get(key) || 0;\n\nif (count > 10) {\n  throw new Error('Rate limit exceeded');\n}\n\nawait redis.setex(key, 3600, count + 1);\nreturn [$json];"
  },
  "type": "n8n-nodes-base.code",
  "name": "Rate Limiter"
}
```

---

## 📈 Monitoring Dashboard

### Metrics to Track:
1. **Operational Metrics:**
   - Messages processed/day
   - Orders created/day
   - Success rate
   - Error rate
   - Average response time

2. **Business Metrics:**
   - Conversion rate
   - Customer satisfaction
   - Order value
   - Customer lifetime value

3. **Technical Metrics:**
   - Workflow execution time
   - Database query performance
   - API response time
   - Error frequency

### Implementation:
```json
{
  "nodes": [
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT workflow_name, COUNT(*) as executions, AVG(duration) as avg_duration, COUNT(CASE WHEN success = false THEN 1 END) as errors FROM workflow_executions WHERE created_at > NOW() - INTERVAL '24 hours' GROUP BY workflow_name;"
      },
      "type": "n8n-nodes-base.postgres",
      "name": "Get Metrics"
    }
  ]
}
```

---

## ✅ Completion Checklist

### Phase 1: Critical Fixes
- [ ] Fix WF11 response node
- [ ] Implement WF9 reminders
- [ ] Consolidate WF0/WF1
- [ ] Add error handling to all workflows
- [ ] Set up database logging

### Phase 2: Integration
- [ ] Connect WF2 → WF11
- [ ] Connect WF3 → Payment verification
- [ ] Auto-trigger WF12 from orders
- [ ] Enable WF5 email

### Phase 3: Enhancement
- [ ] Implement universal error handler
- [ ] Set up activity logging
- [ ] Configure SMTP
- [ ] Create email templates

### Phase 4: Advanced
- [ ] Real Tokopedia API
- [ ] Customer segmentation
- [ ] A/B testing framework
- [ ] Monitoring dashboard

---

## 🎯 Success Criteria

### Week 2:
- ✅ No critical errors
- ✅ All workflows properly respond
- ✅ Basic logging in place

### Week 4:
- ✅ All workflows integrated
- ✅ End-to-end order flow working
- ✅ Email marketing active

### Week 6:
- ✅ Error rate < 1%
- ✅ Average response time < 3s
- ✅ Customer satisfaction > 90%

### Week 8:
- ✅ Full automation operational
- ✅ Advanced features deployed
- ✅ Monitoring dashboard live

---

**Document Version:** 1.0
**Last Updated:** $(date)
**Status:** Ready for Implementation
