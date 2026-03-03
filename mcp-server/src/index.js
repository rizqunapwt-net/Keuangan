#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MCP_DATA_DIR = path.resolve(__dirname, "../../.agents_mcp");

/**
 * MCP Server untuk Koordinasi Agent Rizquna
 */
const server = new Server(
    {
        name: "rizquna-agent-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            resources: {},
            tools: {},
        },
    }
);

/**
 * DAFTAR SUMBER DAYA (Resources)
 * Ini adalah data statis yang bisa dibaca agent (Source of Truth)
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "project://state",
                name: "Project Progress State",
                mimeType: "text/markdown",
                description: "Status terkini progres fitur dan tugas agent."
            },
            {
                uri: "project://map",
                name: "Project Architecture Map",
                mimeType: "text/markdown",
                description: "Peta struktur folder dan database proyek yang nyata."
            },
            {
                uri: "project://protocol",
                name: "Agent Communication Protocol",
                mimeType: "text/markdown",
                description: "Aturan main antar agent agar tidak bentrok."
            },
            {
                uri: "db://debts",
                name: "Database Schema - Debts & Debt Payments",
                mimeType: "application/json",
                description: "Struktur tabel debts dan debt_payments untuk manajemen utang-piutang."
            },
            {
                uri: "db://percetakan",
                name: "Database Schema - Percetakan Orders",
                mimeType: "application/json",
                description: "Struktur tabel percetakan_orders untuk invoice dari modul cetak."
            },
            {
                uri: "api://finance",
                name: "API Endpoints - Finance",
                mimeType: "application/json",
                description: "Daftar endpoint API untuk finance: debts, banks, cash-transactions, expenses."
            }
        ]
    };
});

/**
 * BACA ISI SUMBER DAYA
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    let filePath;
    let mimeType = "text/markdown";

    switch (uri) {
        case "project://state":
            filePath = path.join(MCP_DATA_DIR, "PROJECT_STATE.md");
            break;
        case "project://map":
            filePath = path.join(MCP_DATA_DIR, "ARCHITECTURE_MAP.md");
            break;
        case "project://protocol":
            filePath = path.join(MCP_DATA_DIR, "PROTOCOL.md");
            break;
        case "db://debts":
            return {
                contents: [{
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify({
                        tables: {
                            debts: {
                                description: "Manajemen Utang/Piutang - Sudah include audit logging",
                                columns: {
                                    id: "Primary Key",
                                    type: "enum['payable','receivable'] - utang/piutang",
                                    status: "enum['unpaid','partial','paid'] - auto-update via updateStatus()",
                                    date: "Tanggal transaksi",
                                    due_date: "Tanggal jatuh tempo",
                                    client_name: "Nama klien/supplier",
                                    client_phone: "No telepon (nullable)",
                                    description: "Keterangan (nullable)",
                                    amount: "Jumlah total",
                                    paid_amount: "Jumlah sudah dibayar (auto-calculated)",
                                    bank_id: "Foreign key ke banks untuk kas flow (nullable)",
                                    created_at: "Timestamp",
                                    updated_at: "Timestamp"
                                },
                                methods: {
                                    updateStatus: "Auto hitung paid_amount dari payments & update status",
                                    payments: "Relation ke DebtPayment"
                                }
                            },
                            debt_payments: {
                                description: "Pembayaran cicilan utang/piutang",
                                columns: {
                                    id: "Primary Key",
                                    debt_id: "Foreign key ke debts",
                                    date: "Tanggal pembayaran",
                                    amount: "Jumlah pembayaran",
                                    note: "Catatan (nullable)",
                                    bank_id: "Foreign key ke banks",
                                    created_at: "Timestamp",
                                    updated_at: "Timestamp"
                                }
                            }
                        },
                        api: {
                            create: "POST /api/v1/finance/debts",
                            list: "GET /api/v1/finance/debts?type=receivable&status=unpaid",
                            pay: "POST /api/v1/finance/debts/{id}/payments",
                            delete: "DELETE /api/v1/finance/debts/{id} (with audit log)"
                        },
                        notes: "Setiap pembayaran wajib menggunakan DB::transaction() - sudah diimplementasi di DebtController"
                    }, null, 2)
                }]
            };
        case "db://percetakan":
            return {
                contents: [{
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify({
                        tables: {
                            percetakan_orders: {
                                description: "Pesanan dari Modul Percetakan - Sumber Invoice",
                                columns: {
                                    id: "Primary Key",
                                    order_number: "Nomor pesanan unik",
                                    customer_id: "Foreign key ke percetakan_customers",
                                    sales_id: "Foreign key ke users (sales)",
                                    status: "enum['inquiry','quoted','confirmed','in_production','completed','delivered','cancelled']",
                                    specifications: "JSON - spesifikasi cetak",
                                    quantity: "Jumlah",
                                    unit_price: "Harga satuan",
                                    subtotal: "Subtotal",
                                    discount_amount: "Diskon",
                                    tax_amount: "Pajak",
                                    total_amount: "Total tagihan",
                                    deposit_percentage: "% DP",
                                    deposit_amount: "Jumlah DP",
                                    deposit_paid: "DP yang sudah dibayar",
                                    balance_due: "Sisa tagihan",
                                    order_date: "Tanggal pesan",
                                    deadline: "Tenggat selesai",
                                    priority: "Prioritas",
                                    is_rush_order: "Order kilat"
                                },
                                invoice_flow: "Ketika status = 'completed' atau 'delivered', buat debt(receivable) dengan client_name dari customer"
                            },
                            percetakan_customers: {
                                description: "Customer modul percetakan",
                                columns: {
                                    id: "Primary Key",
                                    name: "Nama customer",
                                    company_name: "Nama perusahaan",
                                    email: "Email",
                                    phone: "Telepon"
                                }
                            }
                        }
                    }, null, 2)
                }]
            };
        case "api://finance":
            return {
                contents: [{
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify({
                        base: "/api/v1/finance",
                        endpoints: {
                            debts: {
                                "GET /debts": "List semua utang/piutang (filter: type, status, contact_id, search)",
                                "POST /debts": "Buat utang/piutang baru",
                                "GET /debts/{debt}": "Detail utang/piutang",
                                "PUT /debts/{debt}": "Update utang/piutang",
                                "DELETE /debts/{debt}": "Hapus utang/piutang",
                                "POST /debts/{debt}/payments": "Tambah pembayaran cicilan",
                                "DELETE /debts/payments/{payment}": "Hapus pembayaran"
                            },
                            banks: {
                                "GET /banks": "List semua kas/bank",
                                "POST /banks": "Buat kas/bank baru",
                                "GET /banks/{bank}": "Detail kas/bank"
                            },
                            "cash-transactions": {
                                "GET /cash-transactions": "List transaksi buku kas",
                                "GET /cash-summary": "Ringkasan saldo kas",
                                "POST /cash-transactions": "Buat transaksi kas"
                            },
                            expenses: {
                                "GET /expenses": "List pengeluaran",
                                "POST /expenses": "Buat pengeluaran"
                            }
                        },
                        authentication: "Bearer token via Laravel Sanctum"
                    }, null, 2)
                }]
            };
        default:
            throw new Error(`Resource not found: ${uri}`);
    }

    try {
        const content = await fs.readFile(filePath, "utf-8");
        return {
            contents: [
                {
                    uri,
                    mimeType,
                    text: content
                }
            ]
        };
    } catch (error) {
        return {
            contents: [
                {
                    uri,
                    mimeType: "text/plain",
                    text: `Error reading file: ${error.message}`
                }
            ]
        };
    }
});

/**
 * DAFTAR ALAT (Tools)
 * Ini adalah fungsi yang bisa dipanggil agent untuk mengubah STATE
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "report_progress",
                description: "Melaporkan kemajuan tugas ke PROJECT_STATE.md agar agent lain tahu.",
                inputSchema: {
                    type: "object",
                    properties: {
                        task_name: { type: "string" },
                        status: { type: "string", enum: ["completed", "in_progress", "blocked"] },
                        notes: { type: "string" }
                    },
                    required: ["task_name", "status"]
                }
            }
        ]
    };
});

/**
 * EKSEKUSI ALAT (Tool Execution)
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "report_progress") {
        const { task_name, status, notes } = request.params.arguments;
        const logEntry = `\n- [${status.toUpperCase()}] ${task_name}: ${notes || ""} (at ${new Date().toLocaleString()})`;

        // Simpan ke log terpisah
        await fs.appendFile(path.join(MCP_DATA_DIR, "logs/activity.log"), logEntry);

        return {
            content: [{ type: "text", text: `Progress reported successfully for: ${task_name}` }]
        };
    }

    throw new Error("Tool not found");
});

/**
 * JALANKAN SERVER
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Rizquna MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
