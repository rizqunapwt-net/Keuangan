-- RIZQUNA ADVANCED DATABASE SCHEMA
-- Purpose: Support high-scale publishing, royalty tracking, and automated fulfillment.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 👤 AUTHORS & USERS
CREATE TABLE authors (
    author_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    bank_account VARCHAR(50),
    bank_name VARCHAR(50),
    tax_id VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 📚 BOOKS & METADATA
CREATE TABLE books (
    book_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    isbn VARCHAR(13) UNIQUE,
    sku VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author_id UUID REFERENCES authors(author_id),
    base_price DECIMAL(12,2) NOT NULL,
    print_cost DECIMAL(12,2) NOT NULL,
    weight_gram INTEGER DEFAULT 300,
    royalty_type VARCHAR(20) DEFAULT 'flat' CHECK (royalty_type IN ('flat', 'tiered', 'advance')),
    royalty_rate DECIMAL(5,4) DEFAULT 0.10,
    advance_amount DECIMAL(12,2) DEFAULT 0,
    advance_recovered_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 📦 INVENTORY
CREATE TABLE inventory (
    inventory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(book_id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 10,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 🛒 CUSTOMERS & ORDERS
CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(customer_id),
    channel VARCHAR(50) NOT NULL, -- tokopedia, shopee, website, WA
    subtotal DECIMAL(12,2) NOT NULL,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status VARCHAR(50) DEFAULT 'pending',
    tracking_number VARCHAR(100),
    courier VARCHAR(50),
    shipping_label_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(book_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    royalty_amount DECIMAL(12,2) DEFAULT 0
);

-- 💰 ROYALTY CALCULATIONS
CREATE TABLE royalty_calculations (
    calculation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(book_id),
    author_id UUID REFERENCES authors(author_id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_copies_sold INTEGER DEFAULT 0,
    gross_revenue DECIMAL(12,2) DEFAULT 0,
    royalty_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- draft, paid
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 🤖 AUTOMATION LOGS
CREATE TABLE automation_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name VARCHAR(100) NOT NULL,
    status VARCHAR(20),
    message TEXT,
    payload JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 🔍 INDEXES
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_inventory_book ON inventory(book_id);
