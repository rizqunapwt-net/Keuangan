Kami akan merancang sistem enterprise automation dengan n8n sebagai core automation layer dan AI Agent sebagai pusat kendali. Berikut adalah desain lengkap yang memenuhi semua persyaratan.

1. ARSITEKTUR SISTEM (Logical Diagram)
text
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLIENT FACING LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│  WhatsApp ─── Telegram ─── Website Chat ─── Social Media (FB, IG, TT)   │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────┐
│                     INTEGRATION & GATEWAY LAYER                         │
├─────────────────────────────────────────────────────────────────────────┤
│  Caddy Reverse Proxy (HTTPS, Load Balancing)                            │
│  WAHA (WhatsApp Hub API) ── Telegram Bot API ── Custom Webhook Endpoints│
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────┐
│                        AI AGENT LAYER (AI Brain)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  n8n Workflow (AI Agent Logic)                                          │
│  • Gemini 1.5 Flash API (Free Tier)                                     │
│  • Memory Context (Redis)                                               │
│  • Knowledge Retrieval (PostgreSQL)                                     │
│  • Instruction Following & Role-Based Behavior                          │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────┐
│                     AUTOMATION LAYER (n8n Core)                         │
├─────────────────────────────────────────────────────────────────────────┤
│  n8n Main Instance (Orchestrator)                                       │
│  n8n Worker Instances (Scalable)                                        │
│  Redis Queue (Message Broker)                                           │
│  Workflow Types:                                                        │
│    • Chatbot Processing                                                 │
│    • Content Generation & Publishing                                    │
│    • Product Marketing Automation                                        │
│    • Error Handling & Retry                                             │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────┐
│                        DATA LAYER                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL (SKU Database, Customer Data, Logs)                         │
│  Redis (Cache, Session, AI Memory)                                      │
│  Object Storage (Images, Videos, Generated Content)                     │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────┐
│                        MONITORING & OPS LAYER                           │
├─────────────────────────────────────────────────────────────────────────┤
│  Uptime Kuma (Service Monitoring)                                       │
│  n8n Logging & Audit Trail                                              │
│  Automated Backups (Database & Workflows)                               │
│  Alerting System (Telegram/Email)                                       │
└─────────────────────────────────────────────────────────────────────────┘
2. DAFTAR SEMUA KOMPONEN
A. Core Services (Docker Containers)

n8n Main - Orchestration server

n8n Worker - Background job processing

PostgreSQL 15 - Primary database

Redis 7 - Queue, cache, and session storage

WAHA (WhatsApp Hub API) - WhatsApp integration

Caddy 2 - Reverse proxy and SSL termination

Uptime Kuma - Monitoring dashboard

pgAdmin (optional) - Database management

B. AI Services & APIs

Gemini 1.5 Flash API (Free tier: 1 RPM, 15 requests per minute)

Stable Diffusion API (Free alternative: Stable Diffusion WebUI API)

RunwayML or Pika Labs for video generation (free tier jika tersedia)

Hugging Face Inference API (free tier untuk model alternatif)

C. Third-Party Integrations

Meta Graph API - Facebook & Instagram

TikTok Business API

Telegram Bot API

WhatsApp Business API (via WAHA)

D. Storage

Local Volume Mounts (untuk development)

S3-Compatible Object Storage (untuk production: AWS S3, DigitalOcean Spaces, atau Wasabi)

3. STRUKTUR DATABASE POSTGRESQL
sql
-- Schema: rizquna_automation

-- Table: products (SKU Database)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    images JSONB, -- Array of image URLs
    stock INTEGER DEFAULT 0,
    tags JSONB, -- Array of marketing tags
    attributes JSONB, -- Product specifications
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL, -- 'whatsapp', 'telegram', 'web'
    platform_id VARCHAR(255) NOT NULL, -- Phone number, Telegram ID, etc.
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    metadata JSONB,
    last_interaction TIMESTAMP,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, platform_id)
);

-- Table: chat_sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    context JSONB, -- AI context/memory
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: chat_messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    message_type VARCHAR(20), -- 'user', 'assistant', 'system'
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: content_calendar
CREATE TABLE content_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    content_type VARCHAR(50), -- 'post', 'reel', 'story', 'video'
    theme VARCHAR(255),
    caption TEXT,
    generated_images JSONB, -- Array of image paths/URLs
    generated_videos JSONB, -- Array of video paths/URLs
    scheduled_for TIMESTAMP,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    platform_metadata JSONB, -- Platform-specific response data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: social_media_accounts
CREATE TABLE social_media_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'facebook', 'tiktok'
    account_id VARCHAR(255),
    account_name VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expiry TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: workflow_logs
CREATE TABLE workflow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255),
    status VARCHAR(50), -- 'success', 'error', 'pending'
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_tags ON products USING gin(tags);
CREATE INDEX idx_chat_sessions_customer ON chat_sessions(customer_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_content_calendar_scheduled ON content_calendar(scheduled_for) WHERE published = false;
CREATE INDEX idx_workflow_logs_created ON workflow_logs(created_at);
4. STRUKTUR WORKFLOW N8N
A. Chatbot Workflow Structure

text
Trigger: Webhook (from WAHA/Telegram)
↓
Validate & Parse Message
↓
Identify Customer (Create/Update in DB)
↓
Get or Create Chat Session
↓
Retrieve Chat History (last 10 messages)
↓
AI Agent Processing Node:
   • System Prompt: Role as Customer Service Agent
   • Context: Product Knowledge, Company Info
   • Tools: Query Database for SKU info
   • Memory: Previous conversation
↓
If product query → Query PostgreSQL for SKU
↓
Generate Response (Gemini API)
↓
Save Message to Database
↓
Send Response via WhatsApp/Telegram
↓
Log Workflow Execution
B. Content Generation Workflow

text
Trigger: Scheduler (Daily at 9 AM)
↓
Get Products for Promotion (from DB)
   • Low stock items
   • Best sellers
   • Seasonal products
↓
AI Generate Marketing Caption (Gemini API)
   • Input: Product details, target platform
   • Output: Multiple caption variations
↓
AI Generate Images (Stable Diffusion API)
   • Input: Product image + style prompt
   • Output: 3-5 promotional images
↓
AI Generate Videos (RunwayML/Pika API)
   • Input: Product images + caption
   • Output: 15-30s promotional video
↓
Save Generated Content to Storage
↓
Create Content Calendar Entries
↓
Trigger Publishing Workflow
C. Auto-Publishing Workflow

text
Trigger: Content Calendar (Scheduled posts)
↓
For each platform (Instagram, Facebook, TikTok):
   ↓
   Format Content for Platform
   ↓
   Upload Media to Platform API
   ↓
   Post with Caption & Hashtags
   ↓
   Update Content Calendar Status
   ↓
   Log Publishing Result
D. Error Handling Workflow

text
Trigger: Any workflow error
↓
Capture Error Details
↓
Retry Logic (3 attempts with exponential backoff)
↓
If still failing → Send Alert (Telegram/Email)
↓
Log Error to Database
↓
Create Support Ticket (optional)
5. DESAIN AI AGENT LOGIC
A. System Prompts Structure

yaml
Customer Service Agent:
  role: "Anda adalah customer service Rizquna.id, penerbit dan percetakan profesional."
  instructions: |
    1. Jawab dengan ramah dan profesional
    2. Gunakan bahasa Indonesia yang baik
    3. Jika tidak tahu, jangan mengarang jawaban
    4. Untuk pertanyaan produk, gunakan data dari database
    5. Arahkan pembelian dengan lembut
    6. Simpan preferensi customer untuk personalisasi
  tools:
    - query_product_database: "Query berdasarkan SKU, nama, atau kategori"
    - check_stock: "Cek ketersediaan stok"
    - calculate_price: "Hitung harga termasuk diskon jika ada"
  context_window: 10 pesan terakhir

Marketing Agent:
  role: "Anda adalah ahli marketing Rizquna.id"
  instructions: |
    1. Buat konten marketing yang menarik
    2. Highlight keunggulan produk
    3. Sesuaikan dengan platform target
    4. Gunakan hashtag yang relevan
    5. Buat call-to-action yang jelas
  output_format:
    captions: "5 variasi dengan panjang berbeda"
    hashtags: "10-15 hashtag relevan"
    cta: "3 variasi call-to-action"
B. Memory Management (Redis)

json
{
  "session_id": "abc123",
  "customer_id": "cust_123",
  "context": {
    "last_products_viewed": ["SKU001", "SKU002"],
    "customer_intent": "mencari buku anak",
    "preferences": {"budget": "100k-200k", "genre": "edukasi"},
    "conversation_summary": "Customer sedang mencari buku anak edukatif"
  },
  "last_updated": "2024-01-01T10:00:00Z"
}
C. Knowledge Retrieval System

Vector Embeddings (future enhancement): Convert product descriptions to vectors

Semantic Search: Find relevant products using cosine similarity

Hybrid Search: Combine keyword and vector search

6. INTEGRASI MEDIA SOSIAL
A. Instagram & Facebook

yaml
setup:
  - Buat Facebook Developer App
  - Dapatkan Business Manager Access
  - Request permissions: pages_manage_posts, pages_read_engagement
  - Instagram Account harus terhubung ke Facebook Page

posting_flow:
  - Untuk feed: Graph API `/page/feed`
  - Untuk reels: Graph API `/page/reels`
  - Batch upload untuk multiple images
  - Schedule post menggunakan `scheduled_publish_time`
B. TikTok

yaml
setup:
  - Daftar TikTok for Developers
  - Buat app dengan permissions: video.upload, user.info
  - OAuth 2.0 Authorization Code Flow

upload_flow:
  - Initialize upload: POST /video/upload/
  - Upload chunks: PUT /video/upload/
  - Publish video: POST /video/publish/
  - Handle large files dengan chunking
C. Telegram

yaml
setup:
  - Buat bot via @BotFather
  - Dapatkan API Token
  - Untuk channel: Bot harus admin di channel

posting:
  - Send message: /sendMessage
  - Send photo: /sendPhoto
  - Send video: /sendVideo
  - Schedule menggunakan message queue
7. INTEGRASI WHATSAPP API (WAHA)
WAHA (WhatsApp Hub API) Setup:

docker
version: '3.8'
services:
  waha:
    image: devlikeapro/waha:latest
    ports:
      - "3000:3000"
    volumes:
      - waha-sessions:/sessions
    environment:
      - WAHA_VERSION=latest
      - LOG_LEVEL=info
      - STORE_CONTACTS=true
      - STORE_CHATS=true
n8n Webhook Configuration:

json
{
  "webhookPath": "/webhook/whatsapp",
  "methods": ["POST"],
  "responseMode": "responseNode",
  "authentication": "header",
  "authKey": "X-WAHA-Signature"
}
Message Processing Flow:

WAHA receives WhatsApp message

Sends webhook to n8n

n8n processes through chatbot workflow

Sends response back via WAHA REST API

8. REKOMENDASI AI MODEL GRATIS TERBAIK
A. LLM (Chat & Content Generation)

Gemini 1.5 Flash (Free Tier)

1 RPM, 15 requests per minute

1M tokens context window

Multi-modal capabilities

Claude Haiku (Free via Anthropic)

100 requests/day (via trial)

Fast and capable

OpenAI GPT-3.5 Turbo (Free via trial credit)

$5 free credit untuk new users

B. Image Generation

Stable Diffusion WebUI API

Self-hosted, completely free

Custom models available

Requires GPU for good performance

Leonardo.ai (Free Tier)

150 tokens/day

Good quality images

C. Video Generation

RunwayML (Free Tier)

125 seconds of video generation

Text-to-video capabilities

Pika Labs (Free Tier)

Limited generations per day

Good for short clips

9. BEST PRACTICE PRODUCTION CONFIGURATION
A. n8n Production Configuration

bash
# .env file for n8n
N8N_PROTOCOL=https
N8N_HOST=your-domain.com
N8N_PORT=5678
N8N_ENCRYPTION_KEY=your-encryption-key

# Database
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=strong_password

# Queue
QUEUE_BULL_REDIS_HOST=redis
QUEUE_BULL_REDIS_PORT=6379
QUEUE_BULL_REDIS_PASSWORD=redis_password

# Security
N8N_SECURE_COOKIE=true
WEBHOOK_URL=https://your-domain.com
B. Docker Compose Structure

yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: n8n
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  n8n:
    image: n8nio/n8n:latest
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      N8N_DIAGNOSTICS_ENABLED: false
      N8N_PERSONALIZATION_ENABLED: false
      EXECUTIONS_DATA_PRUNE: true
      EXECUTIONS_DATA_MAX_AGE: 168
    volumes:
      - n8n_data:/home/node/.n8n
      - ./n8n/backups:/backups
    ports:
      - "5678:5678"

  n8n-worker:
    image: n8nio/n8n:latest
    command: n8n worker
    depends_on:
      n8n:
        condition: service_started
    environment:
      N8N_WORKER_TYPE: main
    volumes:
      - n8n_data:/home/node/.n8n

  waha:
    image: devlikeapro/waha:latest
    ports:
      - "3000:3000"
    volumes:
      - waha_sessions:/sessions

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config

  uptime-kuma:
    image: louislam/uptime-kuma:1
    ports:
      - "3001:3001"
    volumes:
      - uptime_kuma_data:/app/data

volumes:
  postgres_data:
  redis_data:
  n8n_data:
  waha_sessions:
  caddy_data:
  caddy_config:
  uptime_kuma_data:
C. Caddyfile Configuration

caddyfile
your-domain.com {
    handle_path /whatsapp-webhook/* {
        reverse_proxy waha:3000
    }

    handle_path /n8n/* {
        reverse_proxy n8n:5678
    }

    handle_path /monitoring/* {
        reverse_proxy uptime-kuma:3001
    }

    handle {
        reverse_proxy n8n:5678
    }
}
10. STRATEGI SCALING DI MASA DEPAN
A. Vertical Scaling (Short-term)

Upgrade VPS specs (CPU, RAM)

Add more n8n worker instances

Implement connection pooling for PostgreSQL

B. Horizontal Scaling (Long-term)

Microservices Architecture:

Decompose monolith into services

Chatbot Service

Content Generation Service

Publishing Service

Load Balancing:

Multiple n8n instances behind load balancer

Redis Cluster for distributed caching

PostgreSQL read replicas

Message Queue:

RabbitMQ or Apache Kafka for event-driven architecture

Decouple services completely

C. Performance Optimization

Caching Strategy:

Redis cache for product data (30 minutes TTL)

CDN for generated images/videos

Browser caching for static assets

Database Optimization:

Implement database indexing

Regular vacuum and analyze

Query optimization

AI Model Optimization:

Model quantization for faster inference

Batch processing for content generation

Implement request queuing for rate limits

D. Cost Optimization

Cold Storage:

Move old generated content to S3 Glacier

Implement data lifecycle policies

Spot Instances:

Use spot instances for non-critical workloads

Implement graceful shutdown handling

AI Cost Management:

Cache AI responses

Use smaller models for simple tasks

Implement usage quotas

E. Monitoring & Observability

Metrics Collection:

Prometheus for metrics

Grafana for dashboards

Custom metrics for business KPIs

Distributed Tracing:

Jaeger or Zipkin for request tracing

Correlation IDs across services

Alerting:

Multi-channel alerts (Telegram, Email, SMS)

Escalation policies

Automated remediation scripts

11. IMPLEMENTASI PRIORITAS (PHASED APPROACH)
Phase 1 (MVP - 2-4 minggu)

Setup Docker environment dengan n8n + PostgreSQL + Redis

Implement WhatsApp chatbot dengan Gemini

Setup product database sederhana

Basic content generation (caption only)

Phase 2 (Enhanced - 4-6 minggu)

Add Telegram integration

Implement image generation

Setup social media posting (1-2 platforms)

Implement monitoring & backups

Phase 3 (Advanced - 6-8 minggu)

Video generation capabilities

All social media platforms

Advanced AI features (memory, context)

Performance optimization

Phase 4 (Enterprise - 8-12 minggu)

Microservices migration

Advanced scaling

Business intelligence integrations

Custom AI model fine-tuning

12. KEAMANAN (SECURITY CONSIDERATIONS)
Network Security:

Firewall configuration (only open necessary ports)

VPN for admin access

Rate limiting on APIs

Data Security:

Encryption at rest (database, storage)

Encryption in transit (TLS everywhere)

Regular security patches

Access Control:

Role-based access in n8n

API key rotation

Audit logging

Compliance:

Data privacy (customer data handling)

Consent management for communications

Data retention policies

KESIMPULAN
Sistem ini dirancang sebagai solusi enterprise-grade yang scalable, secure, dan modular. Dengan arsitektur berbasis Docker dan n8n sebagai orchestration layer, sistem dapat berkembang dari MVP sederhana ke sistem produksi penuh.

Key Success Factors:

Start simple, iterate quickly

Monitor everything from day 1

Implement robust error handling

Document all processes

Regular backup and recovery testing

Sistem ini akan memberikan otomatisasi penuh untuk operasional Rizquna.id dengan AI Agent sebagai pusat kendali, mengurangi beban kerja manual hingga 70-80% untuk tugas-tugas rutin customer service dan marketing.

SISTEM AUTOMATION ENTERPRISE UNTUK RIZQUNA.ID
1. ARSITEKTUR SISTEM LENGKAP
High-Level Architecture Diagram
text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT FACING LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  WhatsApp Business │ Telegram Bot │ Website Chat │ Social Media Platforms   │
└────────────────────┴──────────────┴──────────────┴──────────────────────────┘
                                    │
┌───────────────────────────────────┴───────────────────────────────────────┐
│                         API GATEWAY & PROXY LAYER                         │
│                      Caddy Reverse Proxy (TLS/SSL)                        │
│                 Load Balancing │ Rate Limiting │ Security                  │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴───────────────────────────────────────┐
│                           AI AGENT LAYER (BRAIN)                          │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  n8n AI Agent Workflow                                             │  │
│  │  • Gemini 1.5 Flash/Pro                                            │  │
│  │  • Memory Context (Redis)                                          │  │
│  │  • Knowledge Retrieval (PostgreSQL)                                │  │
│  │  • Role-Based Behavior Management                                  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴───────────────────────────────────────┐
│                        AUTOMATION ORCHESTRATION                           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────────┐  │
│  │ n8n Main     │  │ n8n Workers  │  │ Redis Queue                   │  │
│  │ (Scheduler)  │◄─┤ (Scalable)   │◄─┤ (Bull Queue)                  │  │
│  └──────────────┘  └──────────────┘  └────────────────────────────────┘  │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴───────────────────────────────────────┐
│                            DATA LAYER                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────────┐  │
│  │ PostgreSQL   │  │ Redis Cache  │  │ Object Storage                │  │
│  │ • SKU DB     │  │ • Session    │  │ • Images/Videos               │  │
│  │ • Analytics  │  │ • Cache      │  │ • Generated Content           │  │
│  └──────────────┘  └──────────────┘  └────────────────────────────────┘  │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴───────────────────────────────────────┐
│                         INTEGRATION LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────────┐  │
│  │ WAHA API     │  │ Social Media │  │ Notification Services          │  │
│  │ (WhatsApp)   │  │ APIs         │  │ (Email, Push)                  │  │
│  └──────────────┘  └──────────────┘  └────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
Docker Container Architecture
yaml
version: '3.8'

services:
  # Database Layer
  postgres:
    image: postgres:15-alpine
    container_name: rizquna-postgres
    environment:
      POSTGRES_DB: rizquna_automation
      POSTGRES_USER: rizquna_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups/postgres:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rizquna_user"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Cache & Queue Layer
  redis:
    image: redis:7-alpine
    container_name: rizquna-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # n8n Orchestration
  n8n:
    image: n8nio/n8n:latest
    container_name: rizquna-n8n
    environment:
      - N8N_PROTOCOL=https
      - N8N_HOST=automation.rizquna.id
      - N8N_PORT=5678
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=rizquna_automation
      - DB_POSTGRESDB_USER=rizquna_user
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_PASSWORD=${REDIS_PASSWORD}
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=168
      - N8N_DIAGNOSTICS_ENABLED=false
      - N8N_PERSONALIZATION_ENABLED=false
      - WEBHOOK_URL=https://automation.rizquna.id
    volumes:
      - n8n_data:/home/node/.n8n
      - ./n8n/backups:/backups
    ports:
      - "5678:5678"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  # n8n Worker for Queue Processing
  n8n-worker:
    image: n8nio/n8n:latest
    container_name: rizquna-n8n-worker
    command: n8n worker
    environment:
      - N8N_PROTOCOL=https
      - N8N_HOST=automation.rizquna.id
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=rizquna_automation
      - DB_POSTGRESDB_USER=rizquna_user
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_PASSWORD=${REDIS_PASSWORD}
      - N8N_WORKER_TYPE=main
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      n8n:
        condition: service_started
      redis:
        condition: service_healthy
    restart: unless-stopped
    scale: 2  # Scale workers as needed

  # WhatsApp Integration
  waha:
    image: devlikeapro/waha:latest
    container_name: rizquna-waha
    environment:
      - WAHA_VERSION=latest
      - LOG_LEVEL=info
      - STORE_CONTACTS=true
      - STORE_CHATS=true
      - SESSION_STORAGE_TYPE=file
    volumes:
      - waha_sessions:/sessions
      - ./waha/config:/app/config
    ports:
      - "3000:3000"
    restart: unless-stopped

  # Reverse Proxy
  caddy:
    image: caddy:2-alpine
    container_name: rizquna-caddy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    restart: unless-stopped

  # Monitoring
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: rizquna-uptime-kuma
    environment:
      - DATA_DIR=/app/data
    volumes:
      - uptime_kuma_data:/app/data
    ports:
      - "3001:3001"
    restart: unless-stopped

  # Backup Service
  backup:
    image: prodrigestivill/postgres-backup-local
    container_name: rizquna-backup
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_DB=rizquna_automation
      - POSTGRES_USER=rizquna_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - SCHEDULE=@daily
      - BACKUP_KEEP_DAYS=7
      - BACKUP_KEEP_WEEKS=4
      - BACKUP_KEEP_MONTHS=6
    volumes:
      - ./backups/postgres:/backups
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  n8n_data:
  waha_sessions:
  caddy_data:
  caddy_config:
  uptime_kuma_data:
2. STRUKTUR DATABASE POSTGRESQL
sql
-- Main Database Schema for Rizquna Automation System

-- Products Table (SKU Database)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    category_id UUID REFERENCES product_categories(id),
    subcategory_id UUID REFERENCES product_subcategories(id),
    weight_kg DECIMAL(8,3),
    dimensions JSONB, -- {length, width, height, unit}
    images JSONB, -- Array of image URLs
    thumbnail_url VARCHAR(500),
    stock_quantity INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    tags JSONB, -- Array of marketing tags
    attributes JSONB, -- Product specifications
    metadata JSONB, -- Additional product data
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- Product Categories
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES product_categories(id),
    image_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Product Subcategories
CREATE TABLE product_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category_id UUID REFERENCES product_categories(id) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255), -- Platform specific ID
    platform VARCHAR(50) NOT NULL, -- 'whatsapp', 'telegram', 'website'
    phone_number VARCHAR(20),
    email VARCHAR(255),
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    metadata JSONB, -- Platform-specific metadata
    preferences JSONB, -- Customer preferences
    tags JSONB, -- Customer segmentation tags
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    last_order_at TIMESTAMPTZ,
    last_interaction_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, external_id)
);

-- Chat Sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, completed
    context JSONB, -- AI context/memory for session
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ
);

-- Chat Messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    message_id VARCHAR(255), -- Platform message ID
    direction VARCHAR(10) NOT NULL, -- 'incoming', 'outgoing'
    message_type VARCHAR(20), -- 'text', 'image', 'document', 'button'
    content TEXT,
    media_url VARCHAR(500),
    buttons JSONB, -- Quick reply buttons
    intent VARCHAR(100), -- Detected intent
    entities JSONB, -- Extracted entities
    confidence_score DECIMAL(3,2),
    ai_metadata JSONB, -- AI processing metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_created (session_id, created_at)
);

-- Content Calendar
CREATE TABLE content_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'post', 'reel', 'story', 'video', 'carousel'
    theme VARCHAR(100),
    description TEXT,
    caption TEXT,
    hashtags JSONB, -- Array of hashtags
    target_platforms JSONB NOT NULL, -- ['instagram', 'facebook', 'tiktok']
    generated_images JSONB, -- Array of generated image URLs
    generated_videos JSONB, -- Array of generated video URLs
    product_ids JSONB, -- Array of related product IDs
    scheduled_time TIMESTAMPTZ NOT NULL,
    publish_time TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, published, failed
    platform_metadata JSONB, -- Platform-specific response data
    performance_metrics JSONB, -- Engagement metrics after publishing
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_scheduled_status (scheduled_time, status)
);

-- Social Media Accounts
CREATE TABLE social_media_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'facebook', 'tiktok', 'telegram'
    account_id VARCHAR(255),
    account_name VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    webhook_url VARCHAR(500),
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, account_id)
);

-- Workflow Executions Log
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(100) NOT NULL,
    execution_id VARCHAR(255),
    trigger_type VARCHAR(50), -- 'webhook', 'schedule', 'manual'
    status VARCHAR(20) NOT NULL, -- 'running', 'success', 'error', 'waiting'
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    stack_trace TEXT,
    duration_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    INDEX idx_workflow_status (workflow_id, status, created_at)
);

-- AI Model Configurations
CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'google', 'openai', 'huggingface'
    model_id VARCHAR(100) NOT NULL,
    api_key_encrypted TEXT,
    rate_limit_per_minute INTEGER DEFAULT 60,
    cost_per_token DECIMAL(10,6),
    is_active BOOLEAN DEFAULT true,
    capabilities JSONB, -- ['text', 'image', 'video']
    config JSONB, -- Model-specific configuration
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id, is_active);
CREATE INDEX idx_products_tags ON products USING gin(tags);
CREATE INDEX idx_customers_platform ON customers(platform, external_id);
CREATE INDEX idx_chat_sessions_customer ON chat_sessions(customer_id, status);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at);
CREATE INDEX idx_content_calendar_schedule ON content_calendar(scheduled_time, status);
CREATE INDEX idx_workflow_created ON workflow_executions(created_at DESC);

-- Create Update Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON content_calendar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
3. STRUKTUR WORKFLOW N8N
A. AI Chatbot Workflow Structure
json
{
  "name": "AI Customer Service Chatbot",
  "nodes": [
    {
      "name": "Webhook Receiver",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "chatbot/webhook",
        "responseMode": "responseNode",
        "options": {}
      }
    },
    {
      "name": "Validate and Parse Message",
      "type": "n8n-nodes-base.function",
      "position": [450, 300],
      "parameters": {
        "jsCode": "// Parse incoming message from different platforms\nconst platform = items[0].json.platform;\nconst message = items[0].json.message;\nconst senderId = items[0].json.senderId;\n\nreturn [{\n  json: {\n    platform,\n    message,\n    senderId,\n    timestamp: new Date().toISOString(),\n    messageId: Math.random().toString(36).substr(2, 9)\n  }\n}];"
      }
    },
    {
      "name": "Get or Create Customer",
      "type": "n8n-nodes-base.postgres",
      "position": [650, 300],
      "parameters": {
        "operation": "executeQuery",
        "query": "WITH customer_data AS (\n  INSERT INTO customers (external_id, platform, phone_number, full_name, metadata)\n  VALUES ($1, $2, $3, $4, $5)\n  ON CONFLICT (platform, external_id) \n  DO UPDATE SET \n    last_interaction_at = CURRENT_TIMESTAMP,\n    metadata = EXCLUDED.metadata\n  RETURNING *\n)\nSELECT * FROM customer_data;",
        "additionalFields": {},
        "queryParameters": {
          "parameters": [
            "={{$json.senderId}}",
            "={{$json.platform}}",
            "={{$json.phone || ''}}",
            "={{$json.name || ''}}",
            "={{$json.metadata || {}}}"
          ]
        }
      }
    },
    {
      "name": "Get Chat Session Context",
      "type": "n8n-nodes-base.redis",
      "position": [850, 200],
      "parameters": {
        "operation": "get",
        "key": "={{'chat_session:' + $json.customer_id + ':' + $json.platform}}"
      }
    },
    {
      "name": "Query Product Database",
      "type": "n8n-nodes-base.postgres",
      "position": [850, 400],
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT * FROM products \nWHERE (\n  sku ILIKE $1 OR \n  name ILIKE $1 OR \n  description ILIKE $1 OR\n  tags::text ILIKE $1\n) AND is_active = true\nLIMIT 5;",
        "additionalFields": {},
        "queryParameters": {
          "parameters": [
            "={{'%' + $json.search_query + '%'}}"
          ]
        }
      }
    },
    {
      "name": "AI Agent Processing",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1050, 300],
      "parameters": {
        "method": "POST",
        "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "contents",
              "value": "=[\n  {\n    \"parts\": [\n      {\n        \"text\": `System: Anda adalah customer service profesional Rizquna.id\\n\\nRole: Customer Service Agent\\nTugas: \\n1. Jawab pertanyaan customer dengan ramah dan profesional\\n2. Berikan informasi produk berdasarkan database\\n3. Rekomendasikan produk yang sesuai\\n4. Bantu proses pemesanan\\n5. Update informasi stok dan harga\\n\\nData Produk: ${JSON.stringify($json.products)}\\n\\nContext Percakapan: ${$json.chat_context || 'Tidak ada'}\\n\\nPertanyaan Customer: ${$json.message}\\n\\nJawab dengan format:\\n1. Salam pembuka\\n2. Jawaban inti\\n3. Rekomendasi jika ada\\n4. Call to action\\n5. Salam penutup`\n      }\n    ]\n  }\n]"
            }
          ]
        },
        "options": {
          "response": {
            "response": {
              "fullResponse": true
            }
          }
        }
      }
    },
    {
      "name": "Save Chat History",
      "type": "n8n-nodes-base.postgres",
      "position": [1250, 300],
      "parameters": {
        "operation": "insert",
        "table": "chat_messages",
        "columns": "session_id,direction,message_type,content,intent,entities",
        "additionalFields": {},
        "returnFields": "*"
      }
    },
    {
      "name": "Send Response",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1450, 300],
      "parameters": {
        "method": "POST",
        "url": "={{$json.platform === 'whatsapp' ? 'http://waha:3000/api/sendText' : 'https://api.telegram.org/bot' + $env.TELEGRAM_BOT_TOKEN + '/sendMessage'}}",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "={{$json.platform === 'whatsapp' ? 'chatId' : 'chat_id'}}",
              "value": "={{$json.senderId}}"
            },
            {
              "name": "text",
              "value": "={{$json.ai_response}}"
            }
          ]
        }
      }
    }
  ],
  "connections": {
    "Webhook Receiver": {
      "main": [
        [
          {
            "node": "Validate and Parse Message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Validate and Parse Message": {
      "main": [
        [
          {
            "node": "Get or Create Customer",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
B. Content Generation Workflow
json
{
  "name": "Automated Content Generation",
  "trigger": {
    "type": "schedule",
    "config": {
      "cronExpression": "0 9 * * *", // Daily at 9 AM
      "timezone": "Asia/Jakarta"
    }
  },
  "nodes": [
    {
      "name": "Get Products for Promotion",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT * FROM products \nWHERE is_active = true \nAND (is_featured = true OR stock_quantity > reorder_level)\nORDER BY RANDOM() \nLIMIT 3;"
      }
    },
    {
      "name": "Generate Marketing Caption",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "contents",
              "value": "=[{\n  \"parts\": [{\n    \"text\": `Generate 5 marketing captions for product: ${JSON.stringify($json.product)}\\n\\nRequirements:\\n1. Bahasa Indonesia\\n2. Include relevant hashtags\\n3. Add emoji where appropriate\\n4. Include call-to-action\\n5. Max 2200 characters for Instagram\\n\\nOutput as JSON array of captions`\n  }]\n}]"
            }
          ]
        }
      }
    },
    {
      "name": "Generate Product Images",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "text_prompts",
              "value": "=[\n  {\n    \"text\": `Professional product advertisement for ${$json.product.name}, ${$json.product.description}, clean background, high quality, marketing style`,\n    \"weight\": 1\n  }\n]"
            },
            {
              "name": "cfg_scale",
              "value": "7"
            },
            {
              "name": "height",
              "value": "1024"
            },
            {
              "name": "width",
              "value": "1024"
            },
            {
              "name": "samples",
              "value": "3"
            },
            {
              "name": "steps",
              "value": "30"
            }
          ]
        }
      }
    },
    {
      "name": "Schedule Content",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "content_calendar",
        "columns": "title,content_type,caption,hashtags,target_platforms,generated_images,scheduled_time,status",
        "additionalFields": {}
      }
    }
  ]
}
C. Auto-Publishing Workflow
json
{
  "name": "Social Media Auto-Publisher",
  "trigger": {
    "type": "schedule",
    "config": {
      "cronExpression": "*/15 * * * *", // Every 15 minutes
      "timezone": "Asia/Jakarta"
    }
  },
  "nodes": [
    {
      "name": "Get Scheduled Content",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT * FROM content_calendar \nWHERE scheduled_time <= NOW() \nAND status = 'scheduled'\nORDER BY scheduled_time ASC\nLIMIT 5;"
      }
    },
    {
      "name": "Instagram Publisher",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://graph.facebook.com/v18.0/{{instagram_account_id}}/media",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "image_url",
              "value": "={{$json.generated_images[0]}}"
            },
            {
              "name": "caption",
              "value": "={{$json.caption}}"
            }
          ]
        }
      }
    },
    {
      "name": "Facebook Publisher",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://graph.facebook.com/v18.0/{{page_id}}/feed",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "message",
              "value": "={{$json.caption}}"
            },
            {
              "name": "link",
              "value": "https://rizquna.id/products/{{sku}}"
            }
          ]
        }
      }
    },
    {
      "name": "Update Publishing Status",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "update",
        "table": "content_calendar",
        "updateKey": "id",
        "columns": "status,publish_time,platform_metadata"
      }
    }
  ]
}
4. DESAIN AI AGENT LOGIC
AI Agent Architecture
python
"""
AI Agent System Design for Rizquna.id
Modular AI Agent with Role-Based Behavior
"""

class AIAgent:
    def __init__(self, model="gemini-1.5-flash"):
        self.model = model
        self.roles = {
            "customer_service": self.customer_service_agent,
            "marketing": self.marketing_agent,
            "content_creator": self.content_creator_agent
        }
        self.memory = RedisMemory()
        self.knowledge_base = ProductKnowledgeBase()
        
    async def process_message(self, message, context, role="customer_service"):
        """Process incoming message with role-based behavior"""
        
        # Retrieve relevant context from memory
        chat_history = await self.memory.get_context(context.session_id)
        
        # Retrieve product knowledge if needed
        if self._is_product_query(message):
            products = await self.knowledge_base.search_products(message)
            context["products"] = products
        
        # Get role-specific system prompt
        system_prompt = self._get_system_prompt(role, context)
        
        # Generate response using AI model
        response = await self._call_ai_model(
            system_prompt=system_prompt,
            user_message=message,
            context=chat_history
        )
        
        # Store in memory
        await self.memory.store_interaction(
            session_id=context.session_id,
            user_message=message,
            ai_response=response
        )
        
        return response
    
    def _get_system_prompt(self, role, context):
        """Generate role-specific system prompts"""
        
        prompts = {
            "customer_service": f"""
            Anda adalah customer service profesional Rizquna.id (Penerbit & Percetakan).
            
            INFORMASI PERUSAHAAN:
            - Nama: Rizquna.id
            - Bidang: Penerbitan dan Percetakan
            - Lokasi: Indonesia
            - Jam Operasional: Senin-Jumat 08:00-17:00 WIB
            
            TUGAS ANDA:
            1. JAWAB PERTANYAAN DENGAN RAMAH DAN PROFESIONAL
            2. GUNAKAN DATA PRODUK BERIKUT UNTUK MENJAWAB:
               {json.dumps(context.get('products', []), indent=2)}
            3. REKOMENDASIKAN PRODUK YANG SESUAI
            4. INFORMASIKAN HARGA DAN STOK DENGAN AKURAT
            5. ARAHKAN KE PROSES PEMESANAN JIKA CUSTOMER SIAP BELI
            6. JIKA TIDAK TAHU, KATAKAN "Maaf, saya perlu konsultasi dengan tim teknis"
            
            FORMAT RESPONS:
            1. Salam pembuka
            2. Jawaban inti dengan detail produk jika relevan
            3. Call to action
            4. Salam penutup
            
            CONTOH RESPONS:
            "Halo! Terima kasih telah menghubungi Rizquna.id 😊
            
            Untuk produk Buku Anak Edukatif, kami memiliki stok 50 unit dengan harga Rp 75.000.
            Produk ini cocok untuk anak usia 3-5 tahun dengan materi pembelajaran interaktif.
            
            Apakah Anda ingin memesan produk ini atau butuh rekomendasi lainnya?"
            """,
            
            "marketing": """
            Anda adalah ahli marketing Rizquna.id.
            
            TUGAS:
            1. BUAT KONTEN MARKETING YANG MENARIK
            2. HIGHLIGHT KEUNGGULAN PRODUK
            3. BUAT CALLOUT YANG MENARIK PERHATIAN
            4. GUNAKAN HASHTAG YANG RELEVAN
            5. SESUAIKAN DENGAN PLATFORM TARGET
            
            FORMAT OUTPUT:
            - 5 variasi caption dengan panjang berbeda
            - 10-15 hashtag relevan
            - 3 variasi call-to-action
            - Rekomendasi waktu posting optimal
            """
        }
        
        return prompts.get(role, prompts["customer_service"])
Memory Management System
python
class RedisMemory:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.ttl = 3600 * 24 * 7  # 7 days
        
    async def get_context(self, session_id, limit=10):
        """Get conversation context from memory"""
        key = f"chat_context:{session_id}"
        context = await self.redis.lrange(key, 0, limit-1)
        return [json.loads(msg) for msg in context]
    
    async def store_interaction(self, session_id, user_message, ai_response):
        """Store conversation in memory"""
        key = f"chat_context:{session_id}"
        interaction = {
            "user": user_message,
            "assistant": ai_response,
            "timestamp": datetime.now().isoformat()
        }
        await self.redis.lpush(key, json.dumps(interaction))
        await self.redis.ltrim(key, 0, 49)  # Keep last 50 messages
        await self.redis.expire(key, self.ttl)
    
    async def get_customer_preferences(self, customer_id):
        """Get customer preferences and history"""
        key = f"customer_prefs:{customer_id}"
        return await self.redis.get(key)
5. INTEGRASI MEDIA SOSIAL
A. Instagram API Integration
javascript
// Instagram API Configuration
const instagramConfig = {
  apiVersion: 'v18.0',
  endpoints: {
    uploadImage: 'https://graph.facebook.com/v18.0/{ig-user-id}/media',
    publishImage: 'https://graph.facebook.com/v18.0/{ig-user-id}/media_publish',
    uploadVideo: 'https://graph.facebook.com/v18.0/{ig-user-id}/media',
    getInsights: 'https://graph.facebook.com/v18.0/{ig-user-id}/insights'
  },
  
  async uploadPost(imageUrl, caption) {
    // Step 1: Create media container
    const createResponse = await axios.post(
      this.endpoints.uploadImage.replace('{ig-user-id}', this.userId),
      {
        image_url: imageUrl,
        caption: caption,
        access_token: this.accessToken
      }
    );
    
    // Step 2: Publish the media
    const publishResponse = await axios.post(
      this.endpoints.publishImage.replace('{ig-user-id}', this.userId),
      {
        creation_id: createResponse.data.id,
        access_token: this.accessToken
      }
    );
    
    return publishResponse.data;
  }
};
B. TikTok Integration
python
class TikTokAPI:
    def __init__(self):
        self.base_url = "https://open-api.tiktok.com"
        self.upload_url = "https://open-api.tiktok.com/share/video/upload/"
        
    async def upload_video(self, video_path, description):
        """Upload video to TikTok"""
        
        # Initialize upload
        init_response = await self._post(
            f"{self.base_url}/share/video/upload/",
            data={
                "source_info": {
                    "source": "FILE_UPLOAD",
                    "video_size": os.path.getsize(video_path)
                }
            }
        )
        
        # Upload chunks
        upload_url = init_response["data"]["upload_url"]
        await self._upload_chunks(upload_url, video_path)
        
        # Create post
        post_response = await self._post(
            f"{self.base_url}/share/video/publish/",
            data={
                "upload_id": init_response["data"]["upload_id"],
                "text": description,
                "privacy_level": "PUBLIC_TO_EVERYONE"
            }
        )
        
        return post_response
6. INTEGRASI WHATSAPP API
WAHA (WhatsApp Hub API) Configuration
yaml
# docker-compose.waha.yml
version: '3.8'

services:
  waha:
    image: devlikeapro/waha:latest
    ports:
      - "3000:3000"
    volumes:
      - ./waha/sessions:/sessions
      - ./waha/config:/app/config
    environment:
      - WAHA_VERSION=latest
      - LOG_LEVEL=info
      - TZ=Asia/Jakarta
      - STORE_CONTACTS=true
      - STORE_CHATS=true
      - SESSION_STORAGE_TYPE=file
      - SESSION_STORAGE_PATH=/sessions
      - WEBHOOK_URL=https://automation.rizquna.id/webhook/whatsapp
      - WEBHOOK_ENABLED=true
      - WEBHOOK_EVENTS=message,ack,presence
    restart: unless-stopped
n8n Webhook Configuration
javascript
// WhatsApp Webhook Handler in n8n
const webhookHandler = async (request, response) => {
  try {
    const message = request.body;
    
    // Validate webhook signature
    const signature = request.headers['x-waha-signature'];
    if (!validateSignature(signature, message)) {
      return response.status(401).send('Invalid signature');
    }
    
    // Process different message types
    switch (message.type) {
      case 'message':
        await processIncomingMessage(message);
        break;
      case 'ack':
        await processMessageAck(message);
        break;
      case 'presence':
        await processPresenceUpdate(message);
        break;
    }
    
    response.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    response.status(500).send('Internal server error');
  }
};

// Process incoming WhatsApp message
async function processIncomingMessage(message) {
  const workflowData = {
    platform: 'whatsapp',
    senderId: message.from,
    message: message.body,
    messageType: message.type,
    timestamp: message.timestamp
  };
  
  // Trigger n8n workflow
  await axios.post(
    'http://n8n:5678/webhook/chatbot',
    workflowData,
    {
      headers: {
        'X-API-Key': process.env.N8N_WEBHOOK_KEY
      }
    }
  );
}
7. REKOMENDASI AI MODEL GRATIS TERBAIK
Prioritas Model Gratis:
Google Gemini 1.5 Flash (Free Tier)

Rate Limit: 1 RPM, 15 requests per minute

Context: 1M tokens

Fitur: Multi-modal, good for Indonesian

URL: https://aistudio.google.com

Hugging Face Inference API (Free)

Model: mistralai/Mixtral-8x7B-Instruct-v0.1

Rate Limit: 30k tokens/month free

Baik untuk text generation

Stable Diffusion (Image Generation)

Model: stabilityai/stable-diffusion-xl-base-1.0

Platform: Replicate (free credits) / Hugging Face

Alternatif: Leonardo.ai free tier

Video Generation (Free Options)

RunwayML: 125 seconds free

Pika Labs: Limited free generations

Stable Video Diffusion: Open source

n8n AI Node Configuration:
json
{
  "AI Model Configuration": {
    "gemini": {
      "node": "Google AI",
      "model": "gemini-1.5-flash",
      "apiKey": "${GOOGLE_AI_API_KEY}",
      "temperature": 0.7,
      "maxOutputTokens": 1024
    },
    "huggingface": {
      "node": "Hugging Face",
      "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
      "apiKey": "${HUGGINGFACE_TOKEN}",
      "parameters": {
        "max_new_tokens": 500,
        "temperature": 0.7
      }
    }
  }
}
8. BEST PRACTICE PRODUCTION CONFIGURATION
Security Configuration:
bash
# .env.production
NODE_ENV=production
ENCRYPTION_KEY=your-strong-encryption-key-32-chars

# Database
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)

# API Keys
GOOGLE_AI_API_KEY=your_google_ai_key
HUGGINGFACE_TOKEN=your_hf_token
FACEBOOK_APP_SECRET=your_fb_secret

# Security Headers
SECURE_COOKIES=true
CORS_ORIGIN=https://rizquna.id
RATE_LIMIT_PER_MINUTE=60
Caddyfile Configuration:
caddyfile
automation.rizquna.id {
    # Security headers
    header {
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        Permissions-Policy "geolocation=(), microphone=(), camera=()"
    }
    
    # Rate limiting
    rate_limit {
        zone api {
            key {remote_host}
            events 100
            window 1m
        }
    }
    
    # Reverse proxy to n8n
    reverse_proxy /n8n/* n8n:5678 {
        header_up X-Forwarded-Host {host}
        header_up X-Real-IP {remote_host}
    }
    
    # WAHA API
    reverse_proxy /whatsapp/* waha:3000
    
    # Monitoring
    reverse_proxy /monitoring/* uptime-kuma:3001 {
        basicauth {
            admin ${ADMIN_PASSWORD_HASH}
        }
    }
    
    # SSL auto
    tls admin@rizquna.id
}
Backup Strategy:
bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/$DATE"

# Backup PostgreSQL
pg_dump -h postgres -U rizquna_user rizquna_automation > $BACKUP_DIR/db_backup.sql

# Backup n8n workflows
cp -r /home/node/.n8n $BACKUP_DIR/n8n_data

# Backup Redis
redis-cli --rdb $BACKUP_DIR/redis_backup.rdb

# Upload to S3
aws s3 sync $BACKUP_DIR s3://rizquna-backups/automation/$DATE/

# Cleanup old backups (keep 30 days)
find /backups -type d -mtime +30 -exec rm -rf {} \;
9. STRATEGI SCALING DI MASA DEPAN
Horizontal Scaling Strategy:
yaml
# docker-compose.scale.yml
services:
  n8n-worker:
    image: n8nio/n8n:latest
    deploy:
      mode: replicated
      replicas: 4
      resources:
        limits:
          cpus: '1'
          memory: 2G
    environment:
      - N8N_WORKER_TYPE=main
      - N8N_WORKER_CONCURRENCY=10

  redis-cluster:
    image: bitnami/redis-cluster:7.2
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - REDIS_NODES=6
      - REDIS_REPLICAS=1
    deploy:
      mode: global

  postgres-replica:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=replica_user
      - REPLICATION_MODE=slave
      - REPLICATION_SSLMODE=prefer
      - REPLICATION_HOST=postgres-primary
      - REPLICATION_PORT=5432
      - REPLICATION_USER=replication_user
Microservices Architecture (Future):
text
┌─────────────────────────────────────────────────────────┐
│                    API Gateway (Kong)                   │
└──────────────────────────┬──────────────────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
┌───▼────┐          ┌─────▼─────┐         ┌──────▼─────┐
│Chatbot │          │ Content   │         │ Publishing │
│Service │          │ Generator │         │ Service    │
└────────┘          └───────────┘         └────────────┘
    │                      │                      │
┌───▼──────────────────────▼──────────────────────▼─────┐
│                Message Queue (RabbitMQ)               │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                Shared Database Layer                   │
│          PostgreSQL Cluster + Redis Cache              │
└────────────────────────────────────────────────────────┘
Performance Optimization:
Database Optimization:

sql
-- Create materialized views for frequent queries
CREATE MATERIALIZED VIEW product_search_index AS
SELECT 
  p.id,
  p.sku,
  p.name,
  p.description,
  p.tags,
  to_tsvector('indonesian', 
    coalesce(p.name, '') || ' ' || 
    coalesce(p.description, '') || ' ' || 
    coalesce(array_to_string(p.tags::text[], ' '), '')
  ) AS search_vector
FROM products p
WHERE p.is_active = true;

CREATE INDEX idx_search_vector ON product_search_index USING gin(search_vector);
Caching Strategy:

python
# Redis caching decorator
def cache_response(ttl=300):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            cached = await redis.get(cache_key)
            
            if cached:
                return json.loads(cached)
            
            result = await func(*args, **kwargs)
            await redis.setex(cache_key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator
10. MONITORING & ALERTING
Uptime Kuma Configuration:
yaml
# uptime-kuma monitoring points
monitors:
  - name: "n8n API Health"
    url: "https://automation.rizquna.id/n8n/health"
    interval: 60
    
  - name: "WhatsApp Service"
    url: "http://waha:3000/health"
    interval: 120
    
  - name: "Database Connection"
    type: "postgres"
    host: "postgres"
    port: 5432
    database: "rizquna_automation"
    
  - name: "Redis Service"
    type: "redis"
    host: "redis"
    port: 6379
    
alerts:
  - type: "telegram"
    chat_id: "${TELEGRAM_ADMIN_CHAT_ID}"
    template: "🚨 {monitor_name} is {status_emoji}\nURL: {url}\nTime: {time}"
Logging Strategy:
python
# Structured logging configuration
import structlog

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.WriteLoggerFactory(
        file=open("/var/log/automation.json", "a")
    )
)

logger = structlog.get_logger()

# Usage
logger.info("workflow_started", 
            workflow="content_generation",
            trigger="scheduler",
            timestamp=datetime.utcnow().isoformat())
IMPLEMENTASI ROADMAP
Phase 1: Foundation (Weeks 1-2)
Setup Docker environment di VPS Hostinger

Deploy PostgreSQL + Redis + n8n

Import product database dari Rizquna.id

Setup basic AI Agent dengan Gemini

Phase 2: Core Features (Weeks 3-4)
Implement WhatsApp chatbot integration

Setup content generation workflows

Implement product database queries

Basic social media posting

Phase 3: Advanced Features (Weeks 5-6)
Multi-platform support (Telegram, Website)

Advanced AI features (memory, context)

Image and video generation

Auto-publishing to all platforms

Phase 4: Optimization (Weeks 7-8)
Performance optimization

Monitoring and alerting

Backup and recovery systems

Security hardening

ESTIMASI RESOURCE VPS HOSTINGER
Resource	Minimum	Recommended	Production
CPU Cores	4 cores	6 cores	8 cores
RAM	8GB	16GB	32GB
Storage	100GB SSD	200GB NVMe	500GB NVMe
Bandwidth	Unlimited	Unlimited	Unlimited
Cost/Month	~$50	~$80	~$150
KESIMPULAN
Sistem ini dirancang sebagai solusi enterprise-grade yang:

Scalable: Arsitektur microservices-ready

Secure: Implementasi security best practices

Cost-effective: Menggunakan AI model gratis terlebih dahulu

Maintainable: Dokumentasi lengkap dan modular

Production-ready: Monitoring, backup, error handling

Dengan sistem ini, Rizquna.id dapat mengotomatiskan 80% operasional customer service dan marketing, dengan AI Agent sebagai pusat kendali yang cerdas dan kontekstual.

Key Success Factors:

Start with MVP dan iterate

Monitor everything dari hari pertama

Implement robust error handling

Regular backup dan recovery testing

Documentation dan knowledge transfer

Sistem siap di-deploy dan akan memberikan ROI signifikan dalam 3-6 bulan pertama operasional.

------

Arsitektur Sistem Lengkap (Diagram Logical)
Sistem ini dirancang dengan arsitektur modular berlapis, di mana AI Agent bertindak sebagai pusat kendali (AI Brain) yang mengoordinasikan semua proses. Arsitektur menggunakan Docker untuk containerization, memastikan skalabilitas, keamanan, dan modularitas. Berikut adalah diagram logical dalam format ASCII art untuk kejelasan:
text[User Interfaces / Channels]
  - WhatsApp (via WAHA API)
  - Telegram (via Telegram API)
  - Website Chat (via Webhook/Embed)
  |
  v
[Integration Layer]
  - Webhooks for Incoming Messages
  - APIs: WhatsApp, Telegram, Instagram Graph API, Facebook Graph API, TikTok API, Telegram Channel API
  - Social Media Publishing: Instagram (Feed/Reels), Facebook, TikTok, Telegram Channel
  |
  v
[Automation Layer - n8n (Queue Mode with Redis)]
  - n8n Main: Handles UI, Triggers, Webhooks
  - n8n Workers: Execute Background Jobs (e.g., Content Generation, Publishing)
  - Workflows: Chatbot, Content Generation, Product Marketing
  - Integrations: AI Models (Gemini API), Database Queries, File Storage
  |
  v
[AI Agent Layer - Central AI Brain]
  - AI Model: Gemini 1.5 Flash (Free Tier)
  - Capabilities: Intent Detection, Response Generation, Content Creation
  - Memory: Context Storage in Redis
  - Knowledge Retrieval: Query PostgreSQL for SKU Data
  - Roles: Customer Service, Marketing Agent, Content Creator
  |
  v
[Database Layer]
  - PostgreSQL: Centralized Product Database (SKU, Name, Description, Price, Category, Images, Stock, Tags)
  - Redis: Queue for Jobs, Caching, Session Memory
  |
  v
[Storage Layer]
  - File Storage: Local VPS Volume or Cloud (e.g., S3-Compatible for Images/Videos Generated)
  - Backup: Automated via Cron Jobs or n8n Workflow
  |
  v
[Monitoring & Security Layer]
  - Reverse Proxy: Caddy (HTTPS, Auto TLS)
  - Monitoring: Uptime Kuma (Health Checks)
  - Logging: ELK Stack or Built-in Docker Logs
  - Security: Firewall, Secrets Management (Docker Secrets), Rate Limiting
  - Error Handling: Retry Mechanisms in n8n Workflows
Deskripsi: Lapisan atas menangani input/output pengguna. Automation Layer (n8n) mengorkestrasi alur kerja. AI Agent Layer memproses logika cerdas. Data disimpan di Database dan Storage Layer. Monitoring memastikan reliabilitas. Semua komponen di-containerize dengan Docker di VPS Hostinger.
Daftar Semua Komponen

Core Automation: n8n (Main + Workers) – Untuk workflow automation.
AI Brain: Gemini 1.5 Flash API (atau alternatif gratis seperti Hugging Face models).
Database: PostgreSQL – Untuk data produk SKU.
Caching/Queue: Redis – Untuk queue mode n8n dan memory context AI.
WhatsApp API: WAHA – Untuk integrasi WhatsApp (chatbot dan channel).
Reverse Proxy: Caddy – Untuk HTTPS dan routing.
Monitoring: Uptime Kuma – Untuk health monitoring.
Containerization: Docker – Untuk semua services (n8n, PostgreSQL, Redis, WAHA, Caddy, Uptime Kuma).
Storage: Local VPS storage atau MinIO/S3 untuk files (images/videos).
Logging: Docker logs + optional ELK (Elasticsearch, Logstash, Kibana).
Backup: Cron jobs atau n8n workflow untuk automated backups.
Social Media APIs: Instagram Graph API, Facebook Graph API, TikTok API, Telegram Bot API.
AI Tools Tambahan: Hugging Face Inference API untuk image/video generation (gratis tier).
Security: Firewall (UFW), Docker secrets, TLS via Caddy.

Struktur Database PostgreSQL
Database bernama rizquna_db. Gunakan schema berikut untuk tabel produk terpusat. Ini modular dan scalable, dengan indeks untuk query cepat.
SQLCREATE TABLE products (
    sku VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    stock INTEGER NOT NULL DEFAULT 0,
    tags TEXT[] DEFAULT '{}',  -- Array untuk tag marketing, e.g., {'promo', 'bestseller'}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) REFERENCES products(sku) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE
);

-- Indeks untuk pencarian cepat
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_tags ON products USING GIN(tags);

-- Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
Ini mendukung query AI untuk info produk, rekomendasi, dan konten generation. Akses via n8n PostgreSQL node.
Struktur Workflow n8n
n8n di-queue mode dengan Redis untuk skalabilitas. Berikut struktur workflow utama:
A. Chatbot Workflow:

Trigger: Webhook (dari WAHA untuk WhatsApp, Telegram Bot untuk Telegram, Webhook untuk Website).
Node 1: Get Customer Data (dari message metadata).
Node 2: Send to AI Agent (Gemini API: Detect intent, query PostgreSQL jika produk-related).
Node 3: If (Intent: Produk? Query DB via PostgreSQL node untuk SKU, harga, stok).
Node 4: Generate Response (AI: Natural, profesional, rekomendasi, direct to purchase).
Node 5: Send Reply (via WAHA/Telegram API).
Error Handling: Retry node jika API fail.

B. Content Generation Workflow:

Trigger: Scheduler (cron: harian/mingguan).
Node 1: Fetch Products (PostgreSQL: Select random/promo products).
Node 2: Generate Caption (Gemini API: Berdasarkan tags/deskripsi).
Node 3: Generate Poster (Hugging Face Image API: Text-to-image gratis).
Node 4: Generate Video (HeyGen atau Luma AI free tier: Text-to-video, jika available; fallback to static image).
Node 5: Save Files (to Storage Layer).
Node 6: Publish (Parallel branches: Instagram Graph API, Facebook Graph API, TikTok API, Telegram Channel).

C. Product Marketing Workflow:

Trigger: On New Product (Webhook dari DB atau scheduler).
Node 1: Get Product Data (PostgreSQL).
Node 2: Generate Variations (AI: Captions, posters, videos untuk socmed).
Node 3: Auto Publish (Sama seperti B Node 6).

Semua workflow modular, dengan sub-workflows untuk reusability. Gunakan n8n AI Agent node untuk central AI logic.
Desain AI Agent Logic
AI Agent sebagai "Brain" menggunakan Gemini 1.5 Flash via n8n HTTP node atau AI Agent node.

Memory Context: Simpan session di Redis (key: user_id, value: conversation history).
Context Awareness: Tiap request append history dari Redis.
Knowledge Retrieval: RAG-style – Query PostgreSQL untuk SKU data sebelum generate response.
Instruction-Following: Prompt engineering: "You are [role: CS/Marketing]. Follow these rules: [list]".
Role-Based Behavior:
CS: "Answer professionally, recommend products based on query."
Marketing: "Generate engaging captions with calls-to-action."
Content Creator: "Create variations for Instagram Reels, TikTok."

Logic Flow: Input -> Intent Detection (Gemini) -> Retrieve Data -> Generate Output -> Store Context.

Integrasi dengan Media Sosial
Gunakan n8n nodes atau HTTP untuk auto-publishing:

Instagram (Feed/Reels): Graph API – Dapatkan access token via Facebook Developer. Node: HTTP POST ke /me/media dengan caption dan media_url.
Facebook Page: Graph API – POST ke /page_id/feed atau /page_id/videos.
TikTok: TikTok API – Gunakan OAuth, POST ke /video/upload lalu /video/publish.
Telegram Channel: Telegram Bot API – SendMessage/SendPhoto/SendVideo ke channel.
WhatsApp Channel (Optional): WAHA atau Meta API untuk channel broadcasting.
Otomatis: Workflow simpan files temporarily, upload via API, no manual intervention. Gunakan templates dari n8n community seperti "Upload to Instagram, TikTok from Google Drive".

Integrasi dengan WhatsApp API
Gunakan WAHA (WhatsApp HTTP API) di Docker.

Setup: Deploy WAHA container, scan QR untuk connect number.
n8n Integration: Install @devlikeapro/n8n-nodes-waha community node.
Workflow: Trigger via WAHA Webhook untuk incoming messages. Send replies via WAHA API endpoints (e.g., /messages/text).
Features: Handle text, media; integrate dengan AI untuk responses.
Security: Run WAHA behind Caddy, use API keys.

Rekomendasi AI Model Gratis Terbaik

Text Generation (Prioritas): Gemini 1.5 Flash Free Tier – Multimodal, cepat, integrasi mudah via Google AI Studio API. Limit: 15 RPM, cukup untuk startup.
Alternatif Text: Hugging Face Inference API (gratis untuk models seperti Qwen2, GLM-4) via n8n HTTP.
Image Generation: Hugging Face Stable Diffusion (gratis inference), DeepAI (no signup, unlimited basic), Leonardo AI ($5 free credits).
Video Generation: HeyGen Free Plan (limited videos/month), Adobe Firefly (limited uses), Luma AI (API gratis untuk short clips). Fallback: Gunakan image-to-video jika video gen limited.

Mulai dengan Gemini untuk semua, fallback ke Hugging Face jika exceed limit.
Best Practice Production Configuration

Docker Compose Setup: Gunakan multi-container: n8n-main, n8n-worker, postgres, redis, waha, caddy, uptime-kuma. Enable queue mode: QUEUE_MODE=redis.
Environment Vars: Gunakan secrets untuk DB creds, API keys. Contoh: DB_TYPE=postgresdb, REDIS_HOST=redis.
Security: Caddy untuk auto-TLS, UFW firewall, no root Docker. Rate limit di Caddy.
Monitoring: Uptime Kuma monitor endpoints; tambah Prometheus/Grafana untuk metrics (dari n8n templates).
Backup: n8n workflow untuk daily pg_dump ke external storage.
Error Handling: n8n retry nodes, error workflows to notify via Telegram.
Performance: n8n di queue mode dengan multiple workers. Persistent volumes untuk data.

Strategi Scaling di Masa Depan

Horizontal Scaling: Tambah n8n workers via Docker replicas. Gunakan Kubernetes jika >10 workers.
Vertical Scaling: Upgrade VPS RAM/CPU di Hostinger.
Database Scaling: PostgreSQL replicas untuk read-heavy; sharding jika data besar.
AI Scaling: Switch ke paid Gemini jika exceed free; distribute ke multiple free APIs.
Load Balancing: Caddy atau Nginx untuk distribute traffic.
Cloud Migration: Pindah ke AWS/Kubernetes untuk auto-scaling jika bisnis grow.
Monitoring-Driven: Gunakan Uptime Kuma/Grafana untuk detect bottlenecks, auto-scale workers berdasarkan queue length.

------

Membangun sistem automation kelas enterprise untuk Rizquna.id memerlukan fondasi yang kokoh pada sisi orkestrasi data dan manajemen state. Dengan menggunakan n8n dalam Queue Mode, Anda memastikan sistem tidak akan tumbang saat lonjakan trafik chat atau proses rendering konten yang berat.Berikut adalah desain lengkap sistem automation enterprise untuk Rizquna.id.1. Arsitektur Sistem (Logical Diagram)Arsitektur ini menggunakan pendekatan Decoupled Layer, di mana setiap fungsi berdiri sendiri namun terhubung melalui bus data (Redis) dan API.Komponen Utama:LayerKomponenFungsiOrchestrationn8n (Main + Workers)Otak alur kerja (Workflow engine)Data & StatePostgreSQL & RedisPenyimpanan SKU (Long-term) & Antrean tugas (Short-term)AI IntelligenceGemini 1.5 FlashPemrosesan bahasa alami & pengambilan keputusanCommunicationWAHA (WhatsApp), Telegram APIAntarmuka interaksi dengan pelangganInfrastructureDocker, Caddy, Uptime KumaKontainerisasi, SSL/Proxy, dan Monitoring2. Struktur Database PostgreSQL (SKU & Marketing)Database dirancang untuk mendukung relational lookup oleh AI Agent.SQL-- Tabel Produk/SKU
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2),
    category VARCHAR(100),
    image_url TEXT,
    stock INT DEFAULT 0,
    marketing_tags TEXT[], -- Array untuk pencarian AI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Log Konten (Tracking Publishing)
CREATE TABLE content_logs (
    id SERIAL PRIMARY KEY,
    content_type VARCHAR(50), -- 'poster', 'video', 'caption'
    platform VARCHAR(50), -- 'instagram', 'tiktok'
    status VARCHAR(20),
    media_path TEXT,
    published_at TIMESTAMP
);
3. Desain AI Agent LogicAI Agent tidak hanya menjawab, tapi berfungsi sebagai Router Intent.Logic Flow:Input Analysis: Mendeteksi bahasa dan emosi customer.Intent Classification: Apakah user ingin: Tanya Produk, Cek Ongkir, Komplain, atau Beli?Tool/Skill Retrieval:Jika "Tanya Produk" -> Gunakan SQL Tool untuk query ke PostgreSQL.Jika "Rekomendasi" -> Analisis SKU berdasarkan marketing_tags.Response Synthesis: Mengubah data mentah JSON dari database menjadi bahasa manusia yang persuasif (Copywriting).4. Struktur Workflow n8n (Production-Grade)A. Workflow Chatbot (Real-time)Trigger: Webhook dari WAHA atau Telegram.Security: Verifikasi Token/Header.Memory: Mengambil 5-10 percakapan terakhir dari database (Window Memory) agar AI ingat konteks sebelumnya.Node AI: Menggunakan AI Agent node dengan Postgres Tool untuk akses data stok langsung.B. Workflow Content Generation (Scheduled)Trigger: Cron Map (Misal: Setiap jam 09.00 pagi).Content Logic:Ambil produk dengan stok tertinggi atau "Promo Minggu Ini".Kirim ke Gemini untuk dibuatkan 3 variasi caption (Soft sell, Hard sell, Storytelling).Poster: Menggunakan node HTML Extract/Image Generation (atau integrasi API Canva/BannerBear jika ingin hasil profesional, atau Python Script via Docker untuk manipulasi OpenCV).Approval Gate: (Optional) Kirim ke Telegram Admin untuk tombol "Approve/Reject" sebelum posting otomatis.5. Integrasi Media Sosial & WhatsAppPlatformMetode IntegrasiKeteranganWhatsAppWAHA (WhatsApp HTTP API)Self-hosted, stabil untuk automation tanpa biaya per pesan API resmi.Instagram/FBFacebook Graph APIMenggunakan akses token Page Access untuk upload media otomatis.TikTokTikTok Content Posting APIMemerlukan akun developer TikTok untuk upload otomatis.TelegramTelegram Bot APIPaling mudah dan stabil untuk channel broadcast.6. Rekomendasi AI Model & ToolsMain Brain: Gemini 1.5 Flash (Google AI Studio).Alasan: Free tier sangat murah hati (15 RPM), context window besar (1M tokens), sangat cepat untuk CS.Image Generation: Pollinations.ai atau Stable Diffusion (Local).Pollinations memiliki API gratis yang bisa dipanggil via n8n HTTP Request untuk generate poster sederhana berdasarkan prompt.Video Generation: Kyber API atau HeyGen (Berbayar), untuk gratis bisa menggunakan FFMPEG node di n8n untuk menggabungkan gambar produk dan teks menjadi video slide transisi.7. Best Practice & Konfigurasi ProduksiKeamanan (Security):Environment Variables: Simpan semua API Key di .env Docker, jangan hardcode di n8n.Caddy SSL: Gunakan Caddy untuk otomatisasi HTTPS (Let's Encrypt).Database Access: Gunakan Non-root user untuk n8n mengakses PostgreSQL.Scaling & Reliability:n8n Queue Mode:1 Kontainer n8n-main (Dashboard).1 Kontainer redis (Broker).2-3 Kontainer n8n-worker (Eksekusi tugas berat seperti image processing).Error Handling: Gunakan Error Trigger Workflow di n8n. Jika ada node gagal (misal API WA down), n8n akan mengirim notifikasi ke Telegram Admin.Retry Mechanism: Set "On Fail" ke "Retry" dengan interval 1 menit untuk setiap HTTP Request ke API luar.8. Strategi Implementasi BertahapMinggu 1: Setup Docker Compose (n8n, Redis, Postgres, WAHA) dan amankan dengan Caddy.Minggu 2: Bangun Database SKU dan koneksikan ke n8n Chatbot Agent (Gemini 1.5 Flash).Minggu 3: Implementasi Workflow Content Generation (Poster & Caption) dan integrasi API Instagram/Facebook.Minggu 4: Testing beban, monitoring via Uptime Kuma, dan optimasi prompt AI.

-------

aya akan merancang sistem automation enterprise lengkap untuk Rizquna.id. Ini adalah proyek kompleks yang memerlukan arsitektur production-grade. Mari kita mulai dengan research komponen terkini dan best practices.
Search
n8n queue mode Redis production setup 2024 n8n enterprise architecture Docker Compose Gemini 1.5 Flash free tier API limits WAHA WhatsApp API self-host 2024 Instagram Graph API auto publish content 2024
39 results
Saya akan membuat desain lengkap sistem automation enterprise untuk Rizquna.id. Berdasarkan research, saya memiliki informasi terkini tentang n8n queue mode, Gemini API (dengan limit gratis terbaru), dan WAHA. Mari saya susun arsitektur komprehensif ini.
🏗️ RIZQUNA.AI - Enterprise Automation System Architecture
Executive Summary
Sistem RIZQUNA.AI adalah platform automation enterprise berbasis AI Agent terpusat yang dirancang untuk operasional bisnis penerbit dan percetakan. Arsitektur ini mengadopsi standar SaaS-grade dengan prinsip Twelve-Factor App, microservices-ready, dan cloud-native patterns.
1. LOGICAL ARCHITECTURE DIAGRAM
plain
Copy
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           🌐 EXTERNAL LAYER (Client Interfaces)                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  WhatsApp Business │  Telegram Bot  │  Website Chat  │  Admin Dashboard  │  Mobile App │
│      (WAHA)        │   (Bot API)    │   (WebSocket)  │    (n8n Editor)   │   (Future)  │
└──────────┬─────────┴───────┬────────┴────────┬───────┴─────────┬─────────┴──────┬──────┘
           │                 │                 │                 │                │
           └─────────────────┴─────────────────┴─────────────────┴────────────────┘
                                       │
                              ┌────────▼────────┐
                              │  🔀 REVERSE PROXY │
                              │    (Caddy/Nginx)  │
                              │  SSL/TLS/WAF/Rate │
                              └────────┬────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────────────────┐
│                         🧠 AI AGENT LAYER (The Brain)                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                      AI Agent Orchestrator (n8n + Custom Logic)                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │  │
│  │  │   Customer   │  │   Marketing  │  │   Content    │  │   Product Knowledge  │   │  │
│  │  │    Service   │  │    Agent     │  │   Creator    │  │      Retriever       │   │  │
│  │  │    Agent     │  │    Agent     │  │    Agent     │  │   (RAG + SKU DB)     │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────────┘   │  │
│  │                                                                                   │  │
│  │  🧠 Core AI Models (Free Tier Priority):                                         │  │
│  │  • Gemini 2.5 Flash (Primary - 250 RPD free)                                      │  │
│  │  • Gemini 2.5 Flash-Lite (High volume - 1,000 RPD free)                          │  │
│  │  • Gemini 2.5 Pro (Complex reasoning - 100 RPD free)                           │  │
│  │  • Fallback: Mistral/Groq (if Gemini limits hit)                                 │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────┬────────────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────────────────┐
│                      ⚙️ AUTOMATION LAYER (n8n Queue Mode)                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                    n8n Main Instance (Scheduler + Webhooks)                      │  │
│  │                         ┌─────────────┐                                         │  │
│  │                         │    Redis    │ ◄──── Job Queue (Bull)                   │  │
│  │                         │   Queue     │                                         │  │
│  │                         └──────┬──────┘                                         │  │
│  │                                │                                                 │  │
│  │         ┌──────────────────────┼──────────────────────┐                          │  │
│  │         │                      │                      │                          │  │
│  │  ┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐                       │  │
│  │  │  Worker 1   │      │  Worker 2   │      │  Worker N   │  ◄── Horizontal Scale │  │
│  │  │ (Concurrency│      │ (Concurrency│      │ (Concurrency│                       │  │
│  │  │    = 5)     │      │    = 5)     │      │    = 5)     │                       │  │
│  │  └─────────────┘      └─────────────┘      └─────────────┘                       │  │
│  │                                                                                   │  │
│  │  Workflow Categories:                                                             │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │  │
│  │  │   Chatbot    │ │   Content    │ │   Product    │ │   Analytics  │            │  │
│  │  │   Workflow   │ │  Generation  │ │   Marketing  │ │   & Reports  │            │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘            │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────┬────────────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────────────────┐
│                      🗄️ DATA LAYER (Persistence & Storage)                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   PostgreSQL     │  │      Redis       │  │   File Storage   │  │   Backup     │  │
│  │   (Primary DB)   │  │   (Cache/Queue)  │  │   (MinIO/Local)  │  │   (Restic)   │  │
│  │                  │  │                  │  │                  │  │              │  │
│  │  • SKU Database  │  │  • Session Cache │  │  • Images        │  │  • Daily     │  │
│  │  • Customers     │  │  • Job Queues    │  │  • Videos        │  │  • Weekly    │  │
│  │  • Conversations │  │  • Rate Limiting │  │  • Generated     │  │  • Monthly   │  │
│  │  • Orders        │  │  • AI Context    │  │    Content       │  │              │  │
│  │  • Analytics     │  │    Memory        │  │                  │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────────────────┐
│                    🔌 INTEGRATION LAYER (External APIs)                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ WhatsApp │ │Telegram  │ │Instagram │ │ Facebook │ │  TikTok  │ │  Gemini  │         │
│  │  (WAHA)  │ │  (Bot)   │ │ (Graph)  │ │ (Graph)  │ │  (API)   │ │  (AI)    │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│                                                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                                    │
│  │  Google  │ │  Image   │ │  Video   │ │  Email   │                                    │
│  │  Search  │ │Generation│ │Generation│ │ (SMTP)   │                                    │
│  │  (RAG)   │ │ (Imagen) │ │  (Veo)   │ │          │                                    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
2. COMPONENT SPECIFICATION
2.1 Infrastructure Stack (Hostinger VPS)
Table
Copy
Komponen	Spesifikasi	Fungsi	Image
VPS Hostinger	4 vCPU / 8 GB RAM / 160 GB SSD	Host utama	Ubuntu 22.04 LTS
n8n Main	1 instance	UI, Scheduler, Webhook receiver	n8nio/n8n:latest
n8n Worker	2-3 instances	Task execution	n8nio/n8n:latest
n8n Task Runner	1 instance	JavaScript execution isolation	Built-in
PostgreSQL	1 instance	Primary database	postgres:15-alpine
Redis	1 instance	Queue + Cache + Session	redis:7-alpine
WAHA	1 instance	WhatsApp API gateway	devlikeapro/waha:latest
Caddy	1 instance	Reverse proxy + SSL	caddy:2-alpine
MinIO	1 instance	Object storage (S3-compatible)	minio/minio:latest
Uptime Kuma	1 instance	Monitoring	louislam/uptime-kuma:latest
Prometheus	1 instance	Metrics collection	prom/prometheus:latest
Grafana	1 instance	Visualization	grafana/grafana:latest
3. DOCKER COMPOSE CONFIGURATION (Production-Grade)
3.1 Directory Structure
plain
Copy
/opt/rizquna-ai/
├── docker-compose.yml          # Main orchestration
├── .env                        # Environment variables (secrets)
├── caddy/
│   ├── Caddyfile               # Reverse proxy config
│   └── data/                   # SSL certificates
├── n8n/
│   ├── local-files/            # Shared file storage
│   └── backup/                 # Workflow backups
├── postgres/
│   ├── data/                   # Database files
│   └── init/                   # Initialization scripts
├── redis/
│   └── data/                   # Redis persistence
├── waha/
│   └── sessions/               # WhatsApp sessions
├── minio/
│   └── data/                   # Object storage
└── monitoring/
    ├── prometheus/
    └── grafana/
3.2 Docker Compose File
yaml
Copy
version: '3.8'

x-n8n-common: &n8n-common
  image: docker.n8n.io/n8nio/n8n:${N8N_VERSION:-1.64.0}
  restart: unless-stopped
  environment:
    # Database
    - DB_TYPE=postgresdb
    - DB_POSTGRESDB_HOST=postgres
    - DB_POSTGRESDB_PORT=5432
    - DB_POSTGRESDB_DATABASE=${POSTGRES_DB:-n8n}
    - DB_POSTGRESDB_USER=${POSTGRES_USER:-n8n}
    - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
    # Redis Queue
    - QUEUE_BULL_REDIS_HOST=redis
    - QUEUE_BULL_REDIS_PORT=6379
    - QUEUE_BULL_REDIS_PASSWORD=${REDIS_PASSWORD}
    # Security
    - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
    - N8N_BASIC_AUTH_ACTIVE=true
    - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER:-admin}
    - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
    # URLs
    - N8N_HOST=${N8N_HOST:-n8n.rizquna.id}
    - N8N_PORT=5678
    - N8N_PROTOCOL=https
    - WEBHOOK_URL=https://${N8N_HOST:-n8n.rizquna.id}/
    # Performance
    - EXECUTIONS_MODE=queue
    - EXECUTIONS_TIMEOUT=300
    - EXECUTIONS_TIMEOUT_MAX=3600
    - EXECUTIONS_DATA_SAVE_ON_ERROR=all
    - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
    - EXECUTIONS_DATA_SAVE_ON_PROGRESS=true
    - EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true
    # AI & External
    - N8N_AI_ENABLED=true
    - GENERIC_TIMEZONE=${TZ:-Asia/Jakarta}
    # Offload to workers
    - OFFLOAD_MANUAL_EXECUTIONS_TO_WORKERS=true
    # Health check
    - QUEUE_HEALTH_CHECK_ACTIVE=true
    - N8N_METRICS=true
  volumes:
    - n8n_data:/home/node/.n8n
    - ./n8n/local-files:/files:rw
  networks:
    - rizquna-network
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
  security_opt:
    - no-new-privileges:true

services:
  # ==========================================
  # REVERSE PROXY (Caddy)
  # ==========================================
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"  # HTTP/3
    volumes:
      - ./caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - rizquna-network
    environment:
      - N8N_HOST=${N8N_HOST:-n8n.rizquna.id}
      - WAHA_HOST=${WAHA_HOST:-waha.rizquna.id}
      - MINIO_HOST=${MINIO_HOST:-storage.rizquna.id}
      - KUMA_HOST=${KUMA_HOST:-status.rizquna.id}
    security_opt:
      - no-new-privileges:true

  # ==========================================
  # DATABASE (PostgreSQL)
  # ==========================================
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-n8n}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB:-n8n}
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init:/docker-entrypoint-initdb.d:ro
    networks:
      - rizquna-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-n8n} -d ${POSTGRES_DB:-n8n}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    security_opt:
      - no-new-privileges:true
    command: >
      postgres 
      -c max_connections=200
      -c shared_buffers=256MB
      -c effective_cache_size=768MB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100
      -c random_page_cost=1.1
      -c effective_io_concurrency=200
      -c work_mem=6553kB
      -c min_wal_size=1GB
      -c max_wal_size=4GB
      -c max_worker_processes=4
      -c max_parallel_workers_per_gather=2
      -c max_parallel_workers=4
      -c max_parallel_maintenance_workers=2

  # ==========================================
  # QUEUE & CACHE (Redis)
  # ==========================================
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --appendonly yes
      --appendfsync everysec
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
      --save 900 1
      --save 300 10
      --save 60 10000
    volumes:
      - redis_data:/data
    networks:
      - rizquna-network
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    security_opt:
      - no-new-privileges:true

  # ==========================================
  # N8N MAIN INSTANCE
  # ==========================================
  n8n-main:
    <<: *n8n-common
    container_name: n8n-main
    entrypoint: ["n8n", "start"]
    labels:
      - "traefik.enable=false"  # Using Caddy
    healthcheck:
      test: ["CMD-SHELL", "wget --spider -q http://localhost:5678/healthz || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 60s

  # ==========================================
  # N8N WORKERS (Scalable)
  # ==========================================
  n8n-worker:
    <<: *n8n-common
    container_name: n8n-worker
    entrypoint: ["n8n", "worker"]
    command: ["--concurrency=${N8N_WORKER_CONCURRENCY:-5}"]
    deploy:
      replicas: ${N8N_WORKER_COUNT:-2}
    environment:
      <<: *n8n-common-environment
      - N8N_WORKER_ID=worker-${HOSTNAME}
    healthcheck:
      test: ["CMD-SHELL", "wget --spider -q http://localhost:5678/healthz || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ==========================================
  # N8N TASK RUNNER (JavaScript isolation)
  # ==========================================
  n8n-task-runner:
    <<: *n8n-common
    container_name: n8n-task-runner
    entrypoint: ["/usr/local/bin/task-runner-launcher"]
    command: ["javascript"]
    depends_on:
      - n8n-main

  # ==========================================
  # WHATSAPP API (WAHA)
  # ==========================================
  waha:
    image: devlikeapro/waha:latest
    restart: unless-stopped
    container_name: waha
    environment:
      - WAHA_HOST=0.0.0.0
      - WAHA_PORT=3000
      - WHATSAPP_DEFAULT_ENGINE=NOWEB
      - WHATSAPP_SESSIONS_FOLDER=/sessions
      - WHATSAPP_LOG_LEVEL=info
      - WHATSHA_WEBHOOK_URL=https://${N8N_HOST:-n8n.rizquna.id}/webhook/waha
      - WHATSAPP_WEBHOOK_EVENTS=message,message.any,state.change
    volumes:
      - waha_sessions:/sessions
    networks:
      - rizquna-network
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api/ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    security_opt:
      - no-new-privileges:true

  # ==========================================
  # OBJECT STORAGE (MinIO)
  # ==========================================
  minio:
    image: minio/minio:latest
    restart: unless-stopped
    container_name: minio
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER:-minioadmin}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
      - MINIO_BROWSER_REDIRECT_URL=https://${MINIO_HOST:-storage.rizquna.id}/minio/ui
    volumes:
      - minio_data:/data
    networks:
      - rizquna-network
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 30s
      timeout: 20s
      retries: 3

  # ==========================================
  # MONITORING (Uptime Kuma)
  # ==========================================
  uptime-kuma:
    image: louislam/uptime-kuma:1
    restart: unless-stopped
    container_name: uptime-kuma
    volumes:
      - uptime_kuma_data:/app/data
    networks:
      - rizquna-network
    environment:
      - UPTIME_KUMA_PORT=3001
    healthcheck:
      test: ["CMD", "node", "extra/healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ==========================================
  # PROMETHEUS (Metrics)
  # ==========================================
  prometheus:
    image: prom/prometheus:latest
    restart: unless-stopped
    container_name: prometheus
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    networks:
      - rizquna-network
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'

  # ==========================================
  # GRAFANA (Visualization)
  # ==========================================
  grafana:
    image: grafana/grafana:latest
    restart: unless-stopped
    container_name: grafana
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    networks:
      - rizquna-network
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false

networks:
  rizquna-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  n8n_data:
    driver: local
  postgres_data:
    driver: local
  redis_data:
    driver: local
  waha_sessions:
    driver: local
  minio_data:
    driver: local
  caddy_data:
    driver: local
  caddy_config:
    driver: local
  uptime_kuma_data:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local
3.3 Caddyfile Configuration
caddyfile
Copy
# RIZQUNA.AI - Caddy Configuration
{
    auto_https off
    admin off
    log {
        output file /data/caddy.log {
            roll_size 10MB
            roll_keep 10
        }
        level INFO
    }
}

# n8n Main Instance
n8n.rizquna.id {
    reverse_proxy n8n-main:5678 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
        
        # Health check
        health_uri /healthz
        health_interval 30s
        health_timeout 5s
    }
    
    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    }
    
    # Rate limiting
    rate_limit {
        zone static_example {
            key static
            events 100
            window 1m
        }
    }
    
    # Compression
    encode zstd gzip
}

# WAHA WhatsApp API
waha.rizquna.id {
    reverse_proxy waha:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote}
    }
    
    basicauth {
        # Hashed password: caddy hash-password
        {$WAHA_AUTH_USER} {$WAHA_AUTH_HASH}
    }
}

# MinIO Storage API
storage.rizquna.id {
    reverse_proxy minio:9000 {
        header_up Host {host}
    }
}

# MinIO Console
storage.rizquna.id/minio/* {
    reverse_proxy minio:9001
}

# Uptime Kuma
status.rizquna.id {
    reverse_proxy uptime-kuma:3001
    basicauth {
        {$KUMA_AUTH_USER} {$KUMA_AUTH_HASH}
    }
}

# Grafana
grafana.rizquna.id {
    reverse_proxy grafana:3000
}
3.4 Environment Variables (.env)
bash
Copy
# ==========================================
# RIZQUNA.AI - Environment Configuration
# ==========================================

# System
TZ=Asia/Jakarta
COMPOSE_PROJECT_NAME=rizquna-ai

# Domain Configuration
N8N_HOST=n8n.rizquna.id
WAHA_HOST=waha.rizquna.id
MINIO_HOST=storage.rizquna.id
KUMA_HOST=status.rizquna.id

# n8n Version
N8N_VERSION=1.64.0

# n8n Worker Configuration
N8N_WORKER_COUNT=2
N8N_WORKER_CONCURRENCY=5

# Database (PostgreSQL)
POSTGRES_USER=rizquna_admin
POSTGRES_DB=rizquna_db
POSTGRES_PASSWORD=your_secure_password_here_32chars

# Redis
REDIS_PASSWORD=your_redis_secure_password_here

# n8n Security
N8N_ENCRYPTION_KEY=your_encryption_key_32chars_minimum
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_admin_password_here

# MinIO
MINIO_ROOT_USER=rizquna-storage
MINIO_ROOT_PASSWORD=your_minio_secure_password_here_16chars

# WAHA Auth (generate with: caddy hash-password)
WAHA_AUTH_USER=waha
WAHA_AUTH_HASH=JDJ5JDEwJDIyY2Jh...

# Uptime Kuma Auth
KUMA_AUTH_USER=admin
KUMA_AUTH_HASH=JDJ5JDEwJDIyY2Jh...

# Grafana
GRAFANA_USER=admin
GRAFANA_PASSWORD=your_grafana_password_here

# AI API Keys (Free Tier)
GEMINI_API_KEY=your_gemini_api_key_here
# Fallback AI
GROQ_API_KEY=your_groq_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here

# Social Media API Keys
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
FACEBOOK_ACCESS_TOKEN=your_facebook_token
TIKTOK_ACCESS_TOKEN=your_tiktok_token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Backup Configuration
BACKUP_S3_ENDPOINT=https://storage.rizquna.id
BACKUP_S3_BUCKET=rizquna-backups
BACKUP_S3_ACCESS_KEY=your_access_key
BACKUP_S3_SECRET_KEY=your_secret_key
BACKUP_ENCRYPTION_KEY=your_backup_encryption_key
4. DATABASE SCHEMA (PostgreSQL)
4.1 Initialization Script
sql
Copy
-- ==========================================
-- RIZQUNA.AI - Database Schema
-- Enterprise-grade PostgreSQL schema for publishing/printing business
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For indexing

-- ==========================================
-- 1. PRODUCT MANAGEMENT (SKU Database)
-- ==========================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    image_url TEXT,
    meta_title VARCHAR(200),
    meta_description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,  -- Stock Keeping Unit
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    category_id UUID REFERENCES categories(id),
    
    -- Pricing
    base_price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    stock_status VARCHAR(20) DEFAULT 'in_stock', -- in_stock, out_of_stock, pre_order
    low_stock_threshold INTEGER DEFAULT 10,
    
    -- Product details for printing/publishing
    specifications JSONB,  -- {paper_type, size, binding, pages, color, etc}
    dimensions JSONB,      -- {width, height, weight, unit}
    
    -- Media
    primary_image TEXT,
    gallery_images TEXT[],  -- Array of image URLs
    
    -- Marketing
    tags TEXT[],           -- Array of marketing tags
    seo_keywords TEXT[],
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, draft, archived
    visibility VARCHAR(20) DEFAULT 'visible', -- visible, hidden, search_only
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Full-text search
    search_vector tsvector
);

-- Create indexes for products
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(base_price);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_products_tags ON products USING GIN(tags);

-- Trigger for updating search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('indonesian', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('indonesian', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('indonesian', COALESCE(NEW.sku, '')), 'A') ||
        setweight(to_tsvector('indonesian', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_search_update
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- ==========================================
-- 2. CUSTOMER MANAGEMENT
-- ==========================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wa_id VARCHAR(50),           -- WhatsApp ID
    telegram_id VARCHAR(50),     -- Telegram ID
    email VARCHAR(100),
    phone VARCHAR(20),
    full_name VARCHAR(100),
    display_name VARCHAR(50),
    
    -- Profile
    avatar_url TEXT,
    preferences JSONB,           -- {language, notifications, interests}
    
    -- Segmentation
    customer_type VARCHAR(20) DEFAULT 'retail', -- retail, wholesale, corporate
    tags TEXT[],
    lifetime_value DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    last_interaction_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(wa_id),
    UNIQUE(telegram_id)
);

CREATE INDEX idx_customers_wa ON customers(wa_id) WHERE wa_id IS NOT NULL;
CREATE INDEX idx_customers_telegram ON customers(telegram_id) WHERE telegram_id IS NOT NULL;
CREATE INDEX idx_customers_email ON customers(email) WHERE email IS NOT NULL;

-- ==========================================
-- 3. CONVERSATION & CHAT HISTORY (AI Memory)
-- ==========================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    channel VARCHAR(20) NOT NULL, -- whatsapp, telegram, web
    channel_id VARCHAR(100) NOT NULL, -- specific chat ID
    session_id VARCHAR(100),          -- for grouping sessions
    
    -- Context
    context JSONB,                    -- {intent, topic, product_ids, cart_items}
    ai_agent_type VARCHAR(20) DEFAULT 'customer_service', -- customer_service, marketing, sales
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, closed, waiting
    priority INTEGER DEFAULT 1,          -- 1-5 priority level
    assigned_to UUID,                    -- For human handoff
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(channel, channel_id)
);

CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_channel ON conversations(channel, channel_id);
CREATE INDEX idx_conversations_status ON conversations(status);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message_id VARCHAR(100),           -- External message ID (WA, Telegram)
    
    -- Sender
    sender_type VARCHAR(20) NOT NULL, -- customer, ai_agent, human_agent, system
    sender_id UUID,
    sender_name VARCHAR(100),
    
    -- Content
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, video, file, location, template
    content TEXT,
    media_url TEXT,
    media_caption TEXT,
    metadata JSONB,                    -- {file_size, mime_type, duration, etc}
    
    -- AI Processing
    ai_intent VARCHAR(50),             -- detected intent
    ai_confidence DECIMAL(3,2),          -- confidence score
    ai_model VARCHAR(50),               -- which AI model processed this
    ai_tokens_used INTEGER,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_messages_sender ON messages(sender_type, sender_id);

-- ==========================================
-- 4. CONTENT GENERATION (Marketing Assets)
-- ==========================================

CREATE TABLE content_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50), -- product_launch, promo, seasonal, evergreen
    
    -- Schedule
    start_date DATE,
    end_date DATE,
    posting_schedule JSONB,    -- {frequency, best_times, timezone}
    
    -- Targeting
    target_products UUID[],    -- Array of product IDs
    target_audience VARCHAR(50), -- all, new_customers, loyal, etc
    target_channels TEXT[],    -- [instagram, facebook, tiktok, telegram]
    
    -- AI Configuration
    ai_prompt_template TEXT,
    ai_tone VARCHAR(20) DEFAULT 'professional', -- professional, casual, fun, persuasive
    ai_hashtag_strategy TEXT,
    
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, completed
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE generated_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES content_campaigns(id),
    product_id UUID REFERENCES products(id),
    
    -- Content
    content_type VARCHAR(20), -- caption, image, video, story
    platform VARCHAR(20),     -- instagram, facebook, tiktok, telegram
    
    -- AI Generated Data
    raw_content TEXT,         -- Generated text
    final_content TEXT,       -- Edited/approved version
    ai_model_used VARCHAR(50),
    generation_prompt TEXT,
    generation_params JSONB,
    
    -- Media
    media_urls TEXT[],        -- Generated images/videos
    thumbnail_url TEXT,
    
    -- Publishing
    status VARCHAR(20) DEFAULT 'generated', -- generated, approved, scheduled, published, failed
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    published_url TEXT,       -- URL to published post
    
    -- Performance (sync from APIs)
    performance_metrics JSONB, -- {views, likes, shares, comments, ctr}
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contents_campaign ON generated_contents(campaign_id);
CREATE INDEX idx_contents_status ON generated_contents(status);
CREATE INDEX idx_contents_scheduled ON generated_contents(scheduled_at) WHERE status = 'scheduled';

-- ==========================================
-- 5. ORDERS & TRANSACTIONS
-- ==========================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    conversation_id UUID REFERENCES conversations(id),
    
    -- Financial
    subtotal DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
    
    -- Fulfillment
    shipping_address JSONB,
    tracking_number VARCHAR(100),
    notes TEXT,
    
    -- AI Attribution
    ai_assisted BOOLEAN DEFAULT false,  -- Whether AI helped close this sale
    ai_commission_eligible BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    
    customization JSONB,  -- For printing: {custom_text, design_file, paper_type}
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- ==========================================
-- 6. AI KNOWLEDGE BASE (RAG)
-- ==========================================

CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    document_type VARCHAR(50), -- faq, product_guide, policy, tutorial
    
    -- Categorization
    category VARCHAR(50),
    tags TEXT[],
    product_ids UUID[],  -- Related products
    
    -- Embedding (for vector search - using pgvector if available, else manual)
    embedding_vector VECTOR(768),  -- Requires pgvector extension
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If pgvector not available, use text search instead
CREATE INDEX idx_knowledge_search ON knowledge_documents USING GIN(to_tsvector('indonesian', content));

-- ==========================================
-- 7. SYSTEM LOGS & AUDIT
-- ==========================================

CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL, -- error, warn, info, debug
    service VARCHAR(50) NOT NULL, -- n8n, waha, ai_agent, etc
    workflow_id VARCHAR(100),
    execution_id VARCHAR(100),
    
    message TEXT NOT NULL,
    metadata JSONB,
    stack_trace TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_level ON system_logs(level);
CREATE INDEX idx_logs_service ON system_logs(service);
CREATE INDEX idx_logs_created ON system_logs(created_at);

-- Partition logs by month for performance
CREATE TABLE system_logs_partitioned (
    LIKE system_logs INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- ==========================================
-- 8. UPDATE TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON content_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON generated_contents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_updated_at BEFORE UPDATE ON knowledge_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 9. SEED DATA (Initial Setup)
-- ==========================================

INSERT INTO categories (name, slug, description) VALUES
('Al-Quran', 'al-quran', 'Berbagai jenis mushaf Al-Quran'),
('Buku Islam', 'buku-islam', 'Buku-buku Islami umum'),
('Buku Anak', 'buku-anak', 'Buku Islami untuk anak-anak'),
('Perlengkapan Haji', 'perlengkapan-haji', 'Kebutuhan perjalanan haji dan umroh'),
('Songkok & Peci', 'songkok-peci', 'Kopiah, peci, dan songkok'),
('Sajadah', 'sajadah', 'Sajadah sholat berbagai ukuran');

-- Insert sample product
INSERT INTO products (sku, name, slug, description, base_price, stock_quantity, specifications, tags) VALUES
('RQ-QURAN-001', 'Al-Quran Madinah A4', 'al-quran-madinah-a4', 'Mushaf Al-Quran cetakan Madinah ukuran A4 dengan kualitas terbaik', 150000, 50, 
'{"size": "A4", "paper": "HVS Premium", "binding": "Hardcover", "color": "Full Color", "pages": 604}', 
ARRAY['bestseller', 'quran', 'madinah', 'premium']);

-- Insert AI Agent system prompt template
INSERT INTO knowledge_documents (title, content, document_type, category, tags) VALUES
('AI Agent System Prompt', 
'Kamu adalah Rizquna AI, asisten virtual untuk Rizquna.id - toko penerbit dan percetakan Islami terpercaya. 
Tugas utama kamu:
1. Melayani pelanggan dengan sopan dan profesional
2. Menjawab pertanyaan tentang produk berdasarkan database SKU
3. Memberikan rekomendasi produk yang sesuai
4. Membantu proses order dan checkout
5. Menjaga tone komunikasi yang ramah dan Islami

Jika tidak tahu jawaban, arahkan ke customer service manusia. 
Selalu sapa dengan "Assalamualaikum" dan tutup dengan "Wassalamualaikum" jika sesuai konteks.',
'system_prompt', 'ai_configuration', ARRAY['ai', 'system', 'prompt']);

COMMIT;
5. N8N WORKFLOW ARCHITECTURE
5.1 Workflow Categories & Structure
plain
Copy
📁 RIZQUNA.AI WORKFLOWS (n8n)
│
├── 🟢 01-CHATBOT-CORE/
│   ├── 01-Webhook-Receiver (WhatsApp/Telegram)
│   ├── 02-Customer-Identification
│   ├── 03-Intent-Classifier (AI Agent)
│   ├── 04-Product-Query-Handler
│   ├── 05-Order-Status-Checker
│   ├── 06-Response-Generator (AI)
│   ├── 07-Message-Sender
│   └── 08-Conversation-Logger
│
├── 🔵 02-AI-AGENTS/
│   ├── 01-Master-Agent-Router
│   ├── 02-Customer-Service-Agent
│   ├── 03-Marketing-Agent
│   ├── 04-Content-Creator-Agent
│   ├── 05-Sales-Agent
│   └── 06-Knowledge-Retriever (RAG)
│
├── 🟡 03-CONTENT-GENERATION/
│   ├── 01-Campaign-Scheduler (Cron)
│   ├── 02-Product-Selector
│   ├── 03-Caption-Generator (AI)
│   ├── 04-Image-Generator (AI/Imagen)
│   ├── 05-Video-Generator (AI/Veo)
│   ├── 06-Content-Approver (Optional Human)
│   └── 07-Content-Publisher
│
├── 🟠 04-SOCIAL-PUBLISHING/
│   ├── 01-Instagram-Publisher
│   ├── 02-Facebook-Publisher
│   ├── 03-TikTok-Publisher
│   ├── 04-Telegram-Channel-Publisher
│   ├── 05-WhatsApp-Broadcast (Optional)
│   └── 06-Cross-Platform-Coordinator
│
├── 🟣 05-PRODUCT-MARKETING/
│   ├── 01-New-Product-Detector
│   ├── 02-Auto-Generate-Catalog
│   ├── 03-Promo-Alert-Workflow
│   ├── 04-Restock-Notification
│   └── 05-Price-Drop-Alert
│
├── 🔴 06-MONITORING-OPS/
│   ├── 01-Error-Handler (Global)
│   ├── 02-Retry-Mechanism
│   ├── 03-Health-Check-Reporter
│   ├── 04-Backup-Trigger
│   ├── 05-Alert-Notification (Discord/Email)
│   └── 06-Usage-Analytics
│
└── ⚫ 07-INTEGRATIONS/
    ├── 01-WAHA-Connector
    ├── 02-Telegram-Bot-Connector
    ├── 03-Instagram-Graph-API
    ├── 04-Facebook-Graph-API
    ├── 05-Gemini-AI-Connector
    ├── 06-MinIO-Storage
    └── 07-PostgreSQL-DB
5.2 Detailed Workflow: Chatbot Core (Visual Structure)
JSON
Copy
{
  "name": "RIZQUNA-Chatbot-Master",
  "nodes": [
    {
      "id": "webhook-receiver",
      "type": "n8n-nodes-base.webhook",
      "name": "📥 Webhook Receiver",
      "webhookId": "rizquna-chat",
      "path": "webhook/chat",
      "responseMode": "responseNode"
    },
    {
      "id": "parse-input",
      "type": "n8n-nodes-base.function",
      "name": "🔍 Parse Input",
      "function": "// Parse WhatsApp/Telegram payload\nconst body = $input.first().json.body;\n\nreturn {\n  channel: body.channel, // whatsapp/telegram\n  from: body.from,\n  message: body.message,\n  messageId: body.messageId,\n  timestamp: body.timestamp,\n  mediaUrl: body.mediaUrl || null\n};"
    },
    {
      "id": "get-or-create-customer",
      "type": "n8n-nodes-base.postgres",
      "name": "👤 Get/Create Customer",
      "operation": "executeQuery",
      "query": "INSERT INTO customers (wa_id, phone, display_name, last_interaction_at) \nVALUES ($1, $2, $3, NOW()) \nON CONFLICT (wa_id) \nDO UPDATE SET last_interaction_at = NOW(), display_name = EXCLUDED.display_name \nRETURNING id, wa_id, display_name, preferences;"
    },
    {
      "id": "get-conversation-context",
      "type": "n8n-nodes-base.postgres",
      "name": "💬 Get Conversation Context",
      "operation": "executeQuery",
      "query": "SELECT * FROM conversations \nWHERE customer_id = $1 AND status = 'active' \nORDER BY updated_at DESC LIMIT 1;"
    },
    {
      "id": "intent-classifier",
      "type": "n8n-nodes-base.httpRequest",
      "name": "🧠 AI Intent Classifier (Gemini)",
      "method": "POST",
      "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      "headers": {
        "Content-Type": "application/json",
        "x-goog-api-key": "={{ $env.GEMINI_API_KEY }}"
      },
      "body": {
        "contents": [{
          "role": "user",
          "parts": [{
            "text": "Classify intent: {{ $json.message }}. Options: product_query, price_check, stock_check, order_status, general_chat, complaint. Return JSON: {intent, confidence, entities}"
          }]
        }],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 150}
      }
    },
    {
      "id": "router-by-intent",
      "type": "n8n-nodes-base.switch",
      "name": "🚦 Route by Intent",
      "rules": {
        "product_query": "intent == 'product_query'",
        "price_check": "intent == 'price_check'",
        "stock_check": "intent == 'stock_check'",
        "order_status": "intent == 'order_status'",
        "general_chat": "intent == 'general_chat'"
      }
    },
    {
      "id": "query-product-db",
      "type": "n8n-nodes-base.postgres",
      "name": "🔎 Query Product Database",
      "operation": "executeQuery",
      "query": "SELECT * FROM products \nWHERE search_vector @@ plainto_tsquery('indonesian', $1) \n   OR sku ILIKE $2 \n   OR name ILIKE $2 \nORDER BY is_featured DESC, base_price ASC \nLIMIT 5;"
    },
    {
      "id": "generate-ai-response",
      "type": "n8n-nodes-base.httpRequest",
      "name": "✨ Generate AI Response (Gemini)",
      "method": "POST",
      "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      "body": {
        "contents": [{
          "role": "user",
          "parts": [{
            "text": "Context: {{ $json.context }}\nProducts: {{ $json.products }}\nCustomer: {{ $json.customer }}\nMessage: {{ $json.message }}\n\nGenerate professional, helpful response in Indonesian. Include product recommendations if relevant."
          }]
        }],
        "systemInstruction": {
          "parts": [{"text": "You are Rizquna AI, helpful assistant for Islamic bookstore. Be polite, professional, and use Islamic greetings when appropriate."}]
        }
      }
    },
    {
      "id": "send-whatsapp",
      "type": "n8n-nodes-base.httpRequest",
      "name": "📤 Send to WhatsApp (WAHA)",
      "method": "POST",
      "url": "http://waha:3000/api/sendText",
      "body": {
        "chatId": "={{ $json.from }}",
        "text": "={{ $json.ai_response }}",
        "reply_to": "={{ $json.messageId }}"
      }
    },
    {
      "id": "log-conversation",
      "type": "n8n-nodes-base.postgres",
      "name": "📝 Log to Database",
      "operation": "insert",
      "table": "messages",
      "columns": {
        "conversation_id": "={{ $json.conversation_id }}",
        "sender_type": "ai_agent",
        "content": "={{ $json.ai_response }}",
        "ai_intent": "={{ $json.intent }}",
        "ai_model": "gemini-2.5-flash"
      }
    },
    {
      "id": "return-response",
      "type": "n8n-nodes-base.respondToWebhook",
      "name": "✅ Return 200 OK",
      "statusCode": 200,
      "body": {"status": "processed"}
    }
  ],
  "connections": {
    "webhook-receiver": ["parse-input"],
    "parse-input": ["get-or-create-customer"],
    "get-or-create-customer": ["get-conversation-context"],
    "get-conversation-context": ["intent-classifier"],
    "intent-classifier": ["router-by-intent"],
    "router-by-intent": {
      "product_query": ["query-product-db"],
      "general_chat": ["generate-ai-response"]
    },
    "query-product-db": ["generate-ai-response"],
    "generate-ai-response": ["send-whatsapp", "log-conversation"],
    "send-whatsapp": ["return-response"],
    "log-conversation": []
  },
  "settings": {
    "executionOrder": "v1",
    "errorWorkflow": "RIZQUNA-Error-Handler"
  }
}
5.3 Content Generation Workflow
JSON
Copy
{
  "name": "RIZQUNA-Content-Generator",
  "trigger": {
    "type": "schedule",
    "cron": "0 9,15 * * *"  // 9 AM and 3 PM daily
  },
  "nodes": [
    {
      "id": "fetch-campaigns",
      "type": "postgres",
      "query": "SELECT * FROM content_campaigns WHERE status = 'active' AND (last_run_at IS NULL OR last_run_at < NOW() - INTERVAL '6 hours');"
    },
    {
      "id": "select-products",
      "type": "postgres",
      "query": "SELECT * FROM products WHERE is_featured = true AND stock_status = 'in_stock' ORDER BY RANDOM() LIMIT 3;"
    },
    {
      "id": "generate-caption",
      "type": "httpRequest",
      "name": "AI Caption Generator",
      "ai_prompt": "Create Instagram caption for Islamic products: {{product.name}} - {{product.description}}. Include relevant hashtags. Tone: {{campaign.ai_tone}}. Max 150 words."
    },
    {
      "id": "generate-image-prompt",
      "type": "httpRequest",
      "name": "AI Image Prompt Generator",
      "ai_prompt": "Create detailed image generation prompt for product: {{product.name}}. Style: professional product photography, Islamic aesthetic, clean background."
    },
    {
      "id": "generate-image",
      "type": "httpRequest",
      "name": "Generate Image (Imagen)",
      "url": "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict",
      "body": {
        "instances": [{"prompt": "{{ $json.image_prompt }}"}],
        "parameters": {"sampleCount": 1, "aspectRatio": "1:1"}
      }
    },
    {
      "id": "upload-to-minio",
      "type": "minio",
      "operation": "upload",
      "bucket": "rizquna-content",
      "path": "generated/{{ $now.format('YYYY/MM/DD') }}/{{ $json.product_sku }}_{{ $random }}.jpg"
    },
    {
      "id": "save-to-db",
      "type": "postgres",
      "table": "generated_contents",
      "data": {
        "campaign_id": "{{ $json.campaign_id }}",
        "product_id": "{{ $json.product_id }}",
        "content_type": "image_post",
        "platform": "instagram",
        "raw_content": "{{ $json.caption }}",
        "media_urls": ["{{ $json.minio_url }}"],
        "status": "generated",
        "ai_model_used": "gemini-2.5-flash,imagen-3"
      }
    },
    {
      "id": "queue-for-publishing",
      "type": "redis",
      "operation": "publish",
      "channel": "content:ready",
      "message": "{{ $json.content_id }}"
    }
  ]
}
6. AI AGENT LOGIC DESIGN
6.1 Agent Architecture (Multi-Agent System)
TypeScript
Copy
// RIZQUNA.AI - Agent System Architecture
// Conceptual TypeScript definitions for n8n Function nodes

interface AgentContext {
  customer: CustomerProfile;
  conversation: ConversationHistory;
  intent: IntentClassification;
  memory: WorkingMemory;
  tools: AvailableTools[];
}

interface BaseAgent {
  id: string;
  role: string;
  systemPrompt: string;
  model: AIModel;
  maxTokens: number;
  temperature: number;
  
  execute(context: AgentContext): Promise<AgentResponse>;
  handoff(reason: string, targetAgent: string): void;
}

// Specialized Agents
class CustomerServiceAgent implements BaseAgent {
  role = "customer_service";
  systemPrompt = `
    Kamu adalah Customer Service Rizquna.id. 
    Tugas: Jawab pertanyaan produk, cek stok, bantu order.
    Aturan:
    1. Selalu cek database SKU sebelum jawab
    2. Jika stok habis, tawarkan pre-order atau alternatif
    3. Gunakan bahasa Indonesia sopan
    4. Sapa dengan "Assalamualaikum" jika chat baru
    5. Prioritaskan produk featured/bestseller untuk rekomendasi
  `;
  
  async execute(context: AgentContext) {
    if (context.intent.type === 'product_query') {
      const products = await this.queryProducts(context.intent.entities.product_name);
      return this.generateProductResponse(products, context.customer);
    }
    // ... other intents
  }
}

class MarketingAgent implements BaseAgent {
  role = "marketing";
  systemPrompt = `
    Kamu adalah Marketing Specialist Rizquna.id.
    Tugas: Buat campaign, promo alert, cross-selling.
    Aturan:
    1. Analisis purchase history customer
    2. Personalisasi offer berdasarkan segment
    3. Highlight promo aktif
    4. Create urgency (stok terbatas, diskon berakhir)
  `;
}

class ContentCreatorAgent implements BaseAgent {
  role = "content_creator";
  systemPrompt = `
    Kamu adalah Content Creator Rizquna.id.
    Tugas: Generate caption, deskripsi produk, hashtag.
    Aturan:
    1. Gunakan bahasa yang engaging tapi tetap sopan
    2. Include Islamic values dalam messaging
    3. SEO-friendly untuk produk
    4. Hashtag strategis: mix popular + niche Islamic
  `;
}

// Agent Router (Master Controller)
class AgentRouter {
  async route(context: AgentContext): Promise<BaseAgent> {
    const intent = context.intent;
    
    // Routing logic
    if (intent.confidence < 0.7) return new CustomerServiceAgent(); // Default
    
    switch(intent.primary) {
      case 'purchase_intent':
      case 'product_query':
      case 'complaint':
        return new CustomerServiceAgent();
        
      case 'promo_inquiry':
      case 'recommendation_request':
        return new MarketingAgent();
        
      case 'content_request':
        return new ContentCreatorAgent();
        
      default:
        return new CustomerServiceAgent();
    }
  }
}
6.2 AI Model Strategy (Free Tier Optimization)
Table
Copy
Use Case	Primary Model	Fallback	Rate Limit Strategy
Intent Classification	Gemini 2.5 Flash-Lite	Gemini 2.5 Flash	1,000 RPD - batch if possible
Customer Chat Response	Gemini 2.5 Flash	Flash-Lite	250 RPD - queue non-urgent
Complex Reasoning	Gemini 2.5 Pro	Flash	100 RPD - reserve for complex queries
Content Generation	Gemini 2.5 Flash	Flash-Lite	Schedule during off-peak
Image Generation	Imagen 3 (if free)	DALL-E via Groq	Check availability
Embedding/RAG	Text Embedding 004	Manual TF-IDF	Free, no limits
6.3 Rate Limit Management
JavaScript
Copy
// n8n Function Node: Rate Limit Manager
const GEMINI_LIMITS = {
  'gemini-2.5-pro': { rpd: 100, rpm: 5 },
  'gemini-2.5-flash': { rpd: 250, rpm: 10 },
  'gemini-2.5-flash-lite': { rpd: 1000, rpm: 15 }
};

async function selectModel(intensity, complexity) {
  const redis = $getWorkflowStaticData('global');
  const today = new Date().toISOString().split('T')[0];
  
  // Check current usage
  const usage = {
    pro: parseInt(await redis.get(`gemini:pro:${today}`) || 0),
    flash: parseInt(await redis.get(`gemini:flash:${today}`) || 0),
    flashLite: parseInt(await redis.get(`gemini:flash-lite:${today}`) || 0)
  };
  
  // Selection logic with fallback
  if (complexity === 'high' && usage.pro < 80) {
    await redis.incr(`gemini:pro:${today}`);
    return 'gemini-2.5-pro';
  }
  
  if (usage.flash < 200) {
    await redis.incr(`gemini:flash:${today}`);
    return 'gemini-2.5-flash';
  }
  
  if (usage.flashLite < 900) {
    await redis.incr(`gemini:flash-lite:${today}`);
    return 'gemini-2.5-flash-lite';
  }
  
  // Emergency fallback
  return 'groq-llama3-70b'; // Fallback to Groq free tier
}
7. SOCIAL MEDIA INTEGRATION
7.1 Instagram Graph API Integration
JavaScript
Copy
// n8n HTTP Request Node for Instagram Publishing
const INSTAGRAM_API = {
  baseUrl: 'https://graph.facebook.com/v18.0',
  
  // Step 1: Create media container
  async createContainer(pageId, accessToken, imageUrl, caption) {
    return {
      method: 'POST',
      url: `${this.baseUrl}/${pageId}/media`,
      body: {
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken
      }
    };
  },
  
  // Step 2: Publish container
  async publishContainer(pageId, creationId, accessToken) {
    return {
      method: 'POST',
      url: `${this.baseUrl}/${pageId}/media_publish`,
      body: {
        creation_id: creationId,
        access_token: accessToken
      }
    };
  },
  
  // Check status
  async checkStatus(creationId, accessToken) {
    return {
      method: 'GET',
      url: `${this.baseUrl}/${creationId}`,
      qs: {
        fields: 'status_code',
        access_token: accessToken
      }
    };
  }
};

// n8n Workflow Implementation
const pageId = $env.INSTAGRAM_PAGE_ID;
const accessToken = $env.INSTAGRAM_ACCESS_TOKEN;
const imageUrl = $input.first().json.media_url;
const caption = $input.first().json.caption;

// 1. Create container
const container = await $httpRequest({
  ...INSTAGRAM_API.createContainer(pageId, accessToken, imageUrl, caption)
});

// 2. Wait for processing (loop with delay)
let status = 'IN_PROGRESS';
while (status === 'IN_PROGRESS') {
  await new Promise(r => setTimeout(r, 5000));
  const check = await $httpRequest({
    ...INSTAGRAM_API.checkStatus(container.id, accessToken)
  });
  status = check.status_code;
}

// 3. Publish if ready
if (status === 'FINISHED') {
  const publish = await $httpRequest({
    ...INSTAGRAM_API.publishContainer(pageId, container.id, accessToken)
  });
  return { success: true, post_id: publish.id, url: `https://instagram.com/p/${publish.shortcode}` };
}
7.2 TikTok API Integration
JavaScript
Copy
// TikTok API v2 for Business
const TIKTOK_API = {
  baseUrl: 'https://business-api.tiktok.com/open_api/v1.3',
  
  async uploadVideo(accessToken, advertiserId, videoFile, description) {
    // Step 1: Init upload
    const init = await $httpRequest({
      method: 'POST',
      url: `${this.baseUrl}/file/video/ad/upload/`,
      headers: { 'Access-Token': accessToken },
      body: {
        advertiser_id: advertiserId,
        file_name: videoFile.name,
        file_size: videoFile.size
      }
    });
    
    // Step 2: Upload chunks (if large)
    // Step 3: Create post
    return await $httpRequest({
      method: 'POST',
      url: `${this.baseUrl}/tt_video/create/`,
      headers: { 'Access-Token': accessToken },
      body: {
        advertiser_id: advertiserId,
        video_id: init.video_id,
        description: description,
        privacy_level: 'PUBLIC'
      }
    });
  }
};
7.3 Telegram Channel Integration
JavaScript
Copy
// Telegram Bot API for Channel Publishing
const TELEGRAM_API = {
  baseUrl: `https://api.telegram.org/bot${$env.TELEGRAM_BOT_TOKEN}`,
  
  async sendPhoto(channelId, photoUrl, caption, options = {}) {
    return await $httpRequest({
      method: 'POST',
      url: `${this.baseUrl}/sendPhoto`,
      body: {
        chat_id: channelId,
        photo: photoUrl,
        caption: caption,
        parse_mode: 'HTML',
        disable_notification: options.silent || false,
        protect_content: options.protect || false
      }
    });
  },
  
  async sendVideo(channelId, videoUrl, caption) {
    return await $httpRequest({
      method: 'POST',
      url: `${this.baseUrl}/sendVideo`,
      body: {
        chat_id: channelId,
        video: videoUrl,
        caption: caption,
        supports_streaming: true
      }
    });
  }
};
8. SECURITY & PRODUCTION CONFIGURATION
8.1 Security Checklist
yaml
Copy
Security Layers:
  Network:
    - UFW Firewall (deny all, allow 22, 80, 443)
    - Fail2ban (brute force protection)
    - Cloudflare DNS (DDoS protection, optional)
    
  Application:
    - Caddy auto-HTTPS (Let's Encrypt)
    - Basic Auth on sensitive endpoints
    - API Key rotation every 90 days
    - Rate limiting per IP (100 req/min)
    
  Data:
    - PostgreSQL SSL connection
    - Redis password protected
    - Encrypted backups (Restic)
    - No secrets in Git (use .env only)
    
  Container:
    - Read-only root filesystem where possible
    - No new privileges
    - User namespace remapping
    - Resource limits (CPU/Memory)
8.2 Backup Strategy
bash
Copy
#!/bin/bash
# /opt/rizquna-ai/scripts/backup.sh

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/${BACKUP_DATE}"
S3_BUCKET="s3:rizquna-backups"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# 1. Database backup
docker exec rizquna-ai-postgres-1 pg_dump -U rizquna_admin rizquna_db | gzip > ${BACKUP_DIR}/database.sql.gz

# 2. n8n workflows & credentials
tar czf ${BACKUP_DIR}/n8n-data.tar.gz /opt/rizquna-ai/n8n/

# 3. WAHA sessions
tar czf ${BACKUP_DIR}/waha-sessions.tar.gz /opt/rizquna-ai/waha/sessions/

# 4. MinIO data (if not using external S3)
mc mirror local/rizquna-content ${BACKUP_DIR}/minio/

# 5. Encrypt and upload to S3
restic -r ${S3_BUCKET} backup ${BACKUP_DIR} --password-file /opt/rizquna-ai/.backup-key

# Cleanup local backup
rm -rf ${BACKUP_DIR}

# Keep only last 30 days in S3
restic -r ${S3_BUCKET} forget --keep-daily 7 --keep-weekly 4 --keep-monthly 3 --prune
8.3 Monitoring Setup
yaml
Copy
# Uptime Kuma Monitors
Monitors:
  - name: "n8n-main"
    type: http
    url: "https://n8n.rizquna.id/healthz"
    interval: 60
    retry: 3
    
  - name: "waha-whatsapp"
    type: http
    url: "https://waha.rizquna.id/api/ping"
    interval: 30
    
  - name: "postgres"
    type: port
    host: "localhost"
    port: 5432
    interval: 60
    
  - name: "redis"
    type: port
    host: "localhost"
    port: 6379
    interval: 60

# Alert Channels
Notifications:
  - type: telegram
    bot_token: "${TELEGRAM_BOT_TOKEN}"
    chat_id: "${ADMIN_CHAT_ID}"
    
  - type: discord
    webhook_url: "${DISCORD_WEBHOOK_URL}"
9. DEPLOYMENT GUIDE
9.1 Initial Setup (Hostinger VPS)
bash
Copy
# 1. Server Preparation
ssh root@your-vps-ip
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin git curl jq openssl

# 2. Create directory structure
mkdir -p /opt/rizquna-ai && cd /opt/rizquna-ai

# 3. Clone configuration (or create manually)
git clone https://github.com/your-repo/rizquna-ai.git . || mkdir -p {caddy,n8n,postgres,redis,waha,minio,monitoring}

# 4. Generate secrets
cat > .env << 'EOF'
# Run this to generate:
# openssl rand -base64 32 | tr -d '\n' > .postgres-password
# openssl rand -base64 32 | tr -d '\n' > .redis-password
# ... etc

POSTGRES_PASSWORD=$(cat .postgres-password)
REDIS_PASSWORD=$(cat .redis-password)
N8N_ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d '\n')
EOF

# 5. Start infrastructure
docker compose up -d postgres redis caddy

# Wait for DB ready
sleep 30

# 6. Initialize database
docker exec -i rizquna-ai-postgres-1 psql -U rizquna_admin -d rizquna_db < postgres/init/01-schema.sql

# 7. Start n8n and workers
docker compose up -d n8n-main n8n-worker n8n-task-runner

# 8. Start remaining services
docker compose up -d waha minio uptime-kuma prometheus grafana

# 9. Verify
docker ps
docker compose logs -f n8n-main
9.2 Scaling Strategy
yaml
Copy
Phase 1 (Current - MVP):
  VPS: 4 vCPU / 8 GB RAM
  Workers: 2 instances
  Concurrency: 5 per worker
  
Phase 2 (Growth):
  VPS: 8 vCPU / 16 GB RAM
  Workers: 4 instances
  Concurrency: 10 per worker
  Add: Dedicated Redis cluster
  
Phase 3 (Enterprise):
  Migration to: Kubernetes (K3s/RKE2)
  Workers: Auto-scaling (HPA)
  Database: Managed PostgreSQL (RDS/Cloud SQL)
  Storage: Cloud S3 (AWS/GCS)
  AI: Vertex AI / OpenAI Enterprise
10. COST OPTIMIZATION (Free Tier Strategy)
Table
Copy
Komponen	Biaya	Alternatif Gratis
AI Models	$0	Gemini 2.5 Flash (250 RPD) + Flash-Lite (1,000 RPD)
WhatsApp API	$0	WAHA (self-host) - no Meta fees for on-premise
Image Gen	$0	Imagen 3 (if free tier available) atau Canva API
Video Gen	$0	Veo (limited free) atau manual editing
Hosting	~$10/bulan	Hostinger VPS (4GB) - entry level
Database	$0	Self-host PostgreSQL
Storage	$0	MinIO local (scale to S3 later)
Monitoring	$0	Uptime Kuma + Prometheus (self-host)
Estimasi Total Biaya Bulanan: $10-15 USD (hanya VPS + domain)
11. MAINTENANCE & TROUBLESHOOTING
11.1 Common Issues & Solutions
bash
Copy
# Issue: n8n workers not processing
# Solution: Check Redis connection
docker exec -it rizquna-ai-redis-1 redis-cli -a $REDIS_PASSWORD ping
docker compose logs n8n-worker | grep -i error

# Issue: WAHA disconnected
# Solution: Restart WAHA and re-scan QR
docker compose restart waha
docker logs -f rizquna-ai-waha-1

# Issue: Database slow
# Solution: Check indexes and vacuum
docker exec -it rizquna-ai-postgres-1 psql -U rizquna_admin -c "SELECT * FROM pg_stat_user_indexes;"
docker exec -it rizquna-ai-postgres-1 psql -U rizquna_admin -c "VACUUM ANALYZE;"

# Issue: Rate limit Gemini
# Solution: Check usage and switch model
curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"
11.2 Health Check Commands
bash
Copy
# Full system health check
#!/bin/bash
echo "=== RIZQUNA.AI Health Check ==="
echo "Docker Services:"
docker compose ps

echo -e "\nDatabase Connection:"
docker exec rizquna-ai-postgres-1 pg_isready -U rizquna_admin

echo -e "\nRedis Connection:"
docker exec rizquna-ai-redis-1 redis-cli -a $REDIS_PASSWORD ping

echo -e "\nn8n API:"
curl -s https://n8n.rizquna.id/healthz | jq .

echo -e "\nWAHA API:"
curl -s https://waha.rizquna.id/api/ping | jq .

echo -e "\nDisk Usage:"
df -h /opt/rizquna-ai

echo -e "\nMemory Usage:"
free -h
12. NEXT STEPS & ROADMAP
Immediate (Week 1-2):
[ ] Setup VPS Hostinger dan install Docker
[ ] Deploy PostgreSQL + Redis + n8n (basic)
[ ] Konfigurasi domain dan SSL (Caddy)
[ ] Import schema database dan seed data
[ ] Setup WAHA dan scan QR WhatsApp
[ ] Import workflow chatbot dasar
Short-term (Week 3-4):
[ ] Training AI Agent dengan data produk Rizquna
[ ] Setup Gemini API dan test integrasi
[ ] Deploy workflow content generation
[ ] Integrasi Instagram Graph API
[ ] Setup monitoring (Uptime Kuma)
Medium-term (Month 2):
[ ] TikTok dan Facebook publishing
[ ] Advanced RAG dengan knowledge base
[ ] Auto-scaling workers
[ ] Backup automation
Long-term (Month 3+):
[ ] Voice message support (WhatsApp)
[ ] AI Image generation integration
[ ] Mobile app untuk admin
[ ] Analytics dashboard (Grafana)
[ ] Machine learning untuk rekomendasi produk
APPENDIX: USEFUL COMMANDS
bash
Copy
# View logs
docker compose logs -f --tail 100 n8n-main

# Scale workers
docker compose up -d --scale n8n-worker=4

# Database backup manual
docker exec rizquna-ai-postgres-1 pg_dump -U rizquna_admin rizquna_db > backup_$(date +%Y%m%d).sql

# Redis CLI
docker exec -it rizquna-ai-redis-1 redis-cli -a $REDIS_PASSWORD

# Update n8n
docker compose pull n8n-main n8n-worker
docker compose up -d n8n-main n8n-worker
Dokumen ini merupakan blueprint lengkap untuk sistem RIZQUNA.AI. Implementasi dapat dilakukan secara bertahap sesuai prioritas bisnis dan resource yang tersedia.