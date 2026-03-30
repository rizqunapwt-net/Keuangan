#!/usr/bin/env node

/**
 * Rizquna Unified MCP Server
 * 
 * Provides project-aware tools for the Rizquna ERP (Kasir) system:
 *  - Database introspection & queries
 *  - Laravel artisan commands
 *  - Project structure navigation
 *  - Log tailing
 *  - API route listing
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execSync, exec } from "child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, resolve, relative } from "path";
import pg from "pg";

// ─── Configuration ──────────────────────────────────────────────────────────
const PROJECT_ROOT = resolve(process.env.PROJECT_ROOT || join(process.cwd(), ".."));
const ENV_PATH = join(PROJECT_ROOT, ".env");

function loadEnv() {
  const env = {};
  if (!existsSync(ENV_PATH)) return env;
  const content = readFileSync(ENV_PATH, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let val = trimmed.slice(eqIndex + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const envVars = loadEnv();

function getDbConfig() {
  return {
    host: envVars.DB_HOST || "127.0.0.1",
    port: parseInt(envVars.DB_PORT || "5432"),
    database: envVars.DB_DATABASE || "rizquna_kasir",
    user: envVars.DB_USERNAME || "postgres",
    password: envVars.DB_PASSWORD || "",
  };
}

let dbPool = null;
function getPool() {
  if (!dbPool) {
    dbPool = new pg.Pool({ ...getDbConfig(), max: 3, idleTimeoutMillis: 30000 });
  }
  return dbPool;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function runShell(cmd, cwd = PROJECT_ROOT, timeoutMs = 30000) {
  try {
    const result = execSync(cmd, {
      cwd,
      timeout: timeoutMs,
      encoding: "utf-8",
      maxBuffer: 1024 * 1024 * 5, // 5MB
      env: { ...process.env, PAGER: "cat" },
    });
    return result;
  } catch (err) {
    return `Error: ${err.message}\n${err.stderr || ""}`.trim();
  }
}

function truncate(str, maxLen = 50000) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + `\n\n... [truncated, showing ${maxLen}/${str.length} chars]`;
}

function walkDir(dir, depth = 0, maxDepth = 3, prefix = "") {
  if (depth > maxDepth) return [];
  let results = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (entry.startsWith(".") || entry === "node_modules" || entry === "vendor" || entry === "dist") continue;
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      const rel = relative(PROJECT_ROOT, fullPath);
      if (stat.isDirectory()) {
        results.push(`${prefix}📁 ${entry}/`);
        results = results.concat(walkDir(fullPath, depth + 1, maxDepth, prefix + "  "));
      } else {
        const size = stat.size > 1024 ? `${(stat.size / 1024).toFixed(1)}KB` : `${stat.size}B`;
        results.push(`${prefix}📄 ${entry} (${size})`);
      }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return results;
}


// ═══════════════════════════════════════════════════════════════════════════
// MCP Server Setup
// ═══════════════════════════════════════════════════════════════════════════

const server = new McpServer({
  name: "rizquna-unified-mcp",
  version: "1.0.0",
});

// ─── Resources ──────────────────────────────────────────────────────────────

server.resource("project-overview", "rizquna://project/overview", async (uri) => {
  const tree = walkDir(PROJECT_ROOT, 0, 2).join("\n");
  const envInfo = [
    `APP_NAME: ${envVars.APP_NAME || "N/A"}`,
    `APP_ENV: ${envVars.APP_ENV || "N/A"}`,
    `APP_URL: ${envVars.APP_URL || "N/A"}`,
    `DB_CONNECTION: ${envVars.DB_CONNECTION || "N/A"}`,
    `DB_DATABASE: ${envVars.DB_DATABASE || "N/A"}`,
    `FRONTEND_URL: ${envVars.FRONTEND_URL || "N/A"}`,
  ].join("\n");

  return {
    contents: [{
      uri: uri.href,
      mimeType: "text/plain",
      text: `# Rizquna ERP — Project Overview\n\n## Environment\n${envInfo}\n\n## Project Structure\n${tree}`,
    }],
  };
});

server.resource("api-routes", "rizquna://routes/api", async (uri) => {
  const routes = runShell("php artisan route:list --path=api --columns=method,uri,name,action --json 2>/dev/null || php artisan route:list --path=api 2>/dev/null");
  return {
    contents: [{
      uri: uri.href,
      mimeType: "text/plain",
      text: `# API Routes\n\n${routes}`,
    }],
  };
});

server.resource("db-schema", "rizquna://database/schema", async (uri) => {
  try {
    const pool = getPool();
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    let schema = "# Database Schema\n\n";
    for (const row of tables.rows) {
      const cols = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1 
        ORDER BY ordinal_position
      `, [row.table_name]);
      
      schema += `## ${row.table_name}\n`;
      schema += cols.rows.map(c => 
        `  - ${c.column_name}: ${c.data_type}${c.is_nullable === 'NO' ? ' NOT NULL' : ''}${c.column_default ? ` DEFAULT ${c.column_default}` : ''}`
      ).join("\n") + "\n\n";
    }
    return { contents: [{ uri: uri.href, mimeType: "text/plain", text: schema }] };
  } catch (err) {
    return { contents: [{ uri: uri.href, mimeType: "text/plain", text: `Error fetching schema: ${err.message}` }] };
  }
});


// ─── Tools ──────────────────────────────────────────────────────────────────

// 1. Database Query (read-only)
server.tool(
  "db_query",
  "Execute a read-only SQL query against the Rizquna PostgreSQL database. Only SELECT statements are allowed.",
  { query: z.string().describe("SQL SELECT query to execute"), limit: z.number().optional().default(100).describe("Max rows to return") },
  async ({ query, limit }) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized.startsWith("select") && !normalized.startsWith("with") && !normalized.startsWith("explain")) {
      return { content: [{ type: "text", text: "❌ Only SELECT / WITH / EXPLAIN queries are allowed for safety." }] };
    }
    try {
      const pool = getPool();
      const finalQuery = normalized.includes("limit") ? query : `${query.replace(/;$/, "")} LIMIT ${limit}`;
      const result = await pool.query(finalQuery);
      const text = JSON.stringify(result.rows, null, 2);
      return { content: [{ type: "text", text: `✅ ${result.rows.length} rows returned:\n\n${truncate(text)}` }] };
    } catch (err) {
      return { content: [{ type: "text", text: `❌ Query error: ${err.message}` }] };
    }
  }
);

// 2. List Database Tables
server.tool(
  "db_tables",
  "List all tables in the Rizquna database with row counts",
  {},
  async () => {
    try {
      const pool = getPool();
      const result = await pool.query(`
        SELECT 
          schemaname, tablename,
          pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as size,
          (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
        FROM pg_tables,
        LATERAL (SELECT query_to_xml('SELECT count(*) AS cnt FROM ' || schemaname || '.' || tablename, false, true, '') as xml_count) x
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);
      const lines = result.rows.map(r => `📊 ${r.tablename}: ${r.row_count} rows (${r.size})`);
      return { content: [{ type: "text", text: `# Database Tables\n\n${lines.join("\n")}` }] };
    } catch (err) {
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);

// 3. Describe Table
server.tool(
  "db_describe",
  "Show detailed column info, indexes, and foreign keys for a specific table",
  { table: z.string().describe("Table name to describe") },
  async ({ table }) => {
    try {
      const pool = getPool();
      
      // Columns
      const cols = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1 
        ORDER BY ordinal_position
      `, [table]);
      
      // Indexes
      const indexes = await pool.query(`
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = $1
      `, [table]);
      
      // Foreign keys
      const fks = await pool.query(`
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table,
          ccu.column_name AS foreign_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1
      `, [table]);
      
      let text = `# Table: ${table}\n\n## Columns\n`;
      text += cols.rows.map(c => {
        let info = `  - **${c.column_name}**: ${c.data_type}`;
        if (c.character_maximum_length) info += `(${c.character_maximum_length})`;
        if (c.is_nullable === "NO") info += " NOT NULL";
        if (c.column_default) info += ` DEFAULT ${c.column_default}`;
        return info;
      }).join("\n");
      
      if (indexes.rows.length) {
        text += `\n\n## Indexes\n`;
        text += indexes.rows.map(i => `  - ${i.indexname}: ${i.indexdef}`).join("\n");
      }
      
      if (fks.rows.length) {
        text += `\n\n## Foreign Keys\n`;
        text += fks.rows.map(f => `  - ${f.column_name} → ${f.foreign_table}.${f.foreign_column}`).join("\n");
      }
      
      return { content: [{ type: "text", text }] };
    } catch (err) {
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);

// 4. Artisan Command
server.tool(
  "artisan",
  "Run a Laravel artisan command (safe commands only: route:list, migrate:status, tinker --execute, config:show, etc.)",
  { command: z.string().describe("Artisan command, e.g. 'route:list', 'migrate:status'") },
  async ({ command }) => {
    // Block dangerous commands
    const dangerous = ["migrate", "db:wipe", "db:seed", "cache:clear", "config:clear", "key:generate", "storage:link", "serve", "queue:work", "horizon"];
    const baseCmd = command.split(" ")[0].split(":").slice(0, 2).join(":");
    if (dangerous.some(d => baseCmd === d || command.startsWith(`${d} `)) && !command.includes("status") && !command.includes("--pretend")) {
      return { content: [{ type: "text", text: `⚠️ Command '${baseCmd}' is blocked for safety. Use --pretend for migrations or run manually.` }] };
    }
    
    const output = runShell(`php artisan ${command} 2>&1`);
    return { content: [{ type: "text", text: truncate(output) }] };
  }
);

// 5. Laravel Logs
server.tool(
  "laravel_logs",
  "Read recent Laravel log entries",
  { lines: z.number().optional().default(80).describe("Number of lines to read from the end of the log") },
  async ({ lines }) => {
    const logPath = join(PROJECT_ROOT, "storage", "logs", "laravel.log");
    if (!existsSync(logPath)) {
      return { content: [{ type: "text", text: "No laravel.log found." }] };
    }
    const output = runShell(`tail -n ${lines} "${logPath}"`);
    return { content: [{ type: "text", text: `# Laravel Logs (last ${lines} lines)\n\n\`\`\`\n${truncate(output)}\n\`\`\`` }] };
  }
);

// 6. Project Structure
server.tool(
  "project_tree",
  "Show the Rizquna project directory tree",
  { 
    path: z.string().optional().default(".").describe("Relative path from project root"),
    depth: z.number().optional().default(3).describe("Max depth to scan (1-5)")
  },
  async ({ path, depth }) => {
    const targetPath = resolve(PROJECT_ROOT, path);
    const tree = walkDir(targetPath, 0, Math.min(depth, 5)).join("\n");
    return { content: [{ type: "text", text: `# Project Tree: ${path}\n\n${tree}` }] };
  }
);

// 7. Read File
server.tool(
  "read_project_file",
  "Read contents of a file in the Rizquna project",
  { path: z.string().describe("Relative path from project root, e.g. 'app/Models/User.php'") },
  async ({ path }) => {
    const fullPath = resolve(PROJECT_ROOT, path);
    if (!fullPath.startsWith(PROJECT_ROOT)) {
      return { content: [{ type: "text", text: "❌ Path traversal not allowed." }] };
    }
    if (!existsSync(fullPath)) {
      return { content: [{ type: "text", text: `❌ File not found: ${path}` }] };
    }
    try {
      const content = readFileSync(fullPath, "utf-8");
      const ext = path.split(".").pop();
      return { content: [{ type: "text", text: `# ${path}\n\n\`\`\`${ext}\n${truncate(content)}\n\`\`\`` }] };
    } catch (err) {
      return { content: [{ type: "text", text: `❌ Error reading file: ${err.message}` }] };
    }
  }
);

// 8. Search Project
server.tool(
  "search_project",
  "Search for text patterns across the Rizquna codebase using grep",
  { 
    pattern: z.string().describe("Search pattern (supports regex)"),
    path: z.string().optional().default(".").describe("Relative path to search in"),
    fileType: z.string().optional().describe("File extension filter, e.g. 'php', 'ts', 'js'")
  },
  async ({ pattern, path, fileType }) => {
    const targetPath = resolve(PROJECT_ROOT, path);
    let cmd = `grep -rnI --color=never --include='*.${fileType || "*"}' "${pattern.replace(/"/g, '\\"')}" "${targetPath}" 2>/dev/null | head -50`;
    if (!fileType) {
      cmd = `grep -rnI --color=never --exclude-dir=node_modules --exclude-dir=vendor --exclude-dir=.git --exclude-dir=dist "${pattern.replace(/"/g, '\\"')}" "${targetPath}" 2>/dev/null | head -50`;
    }
    const output = runShell(cmd);
    if (!output.trim()) {
      return { content: [{ type: "text", text: `No matches found for '${pattern}'` }] };
    }
    return { content: [{ type: "text", text: `# Search Results: '${pattern}'\n\n\`\`\`\n${truncate(output)}\n\`\`\`` }] };
  }
);

// 9. Git Status
server.tool(
  "git_status",
  "Show git status, recent commits, and branch info for the Rizquna project",
  { action: z.enum(["status", "log", "diff", "branch"]).optional().default("status").describe("Git action to show") },
  async ({ action }) => {
    let cmd;
    switch (action) {
      case "log": cmd = "git log --oneline -20"; break;
      case "diff": cmd = "git diff --stat"; break;
      case "branch": cmd = "git branch -a"; break;
      default: cmd = "git status -sb"; break;
    }
    const output = runShell(cmd);
    return { content: [{ type: "text", text: `# Git ${action}\n\n\`\`\`\n${output}\n\`\`\`` }] };
  }
);

// 10. PHP/Composer Info
server.tool(
  "composer_info",
  "Show Composer package info or run composer commands (show, outdated, dump-autoload)",
  { command: z.string().optional().default("show").describe("Composer command: 'show', 'outdated', 'validate'") },
  async ({ command }) => {
    const allowed = ["show", "outdated", "validate", "dump-autoload", "show --tree"];
    if (!allowed.some(a => command.startsWith(a))) {
      return { content: [{ type: "text", text: "⚠️ Only safe composer commands allowed: show, outdated, validate, dump-autoload" }] };
    }
    const output = runShell(`composer ${command} 2>&1`, PROJECT_ROOT, 60000);
    return { content: [{ type: "text", text: `# Composer ${command}\n\n\`\`\`\n${truncate(output)}\n\`\`\`` }] };
  }
);

// 11. Environment Info
server.tool(
  "env_info",
  "Show safe environment configuration (sensitive values are masked)",
  {},
  async () => {
    const sensitiveKeys = ["PASSWORD", "SECRET", "KEY", "TOKEN", "DSN", "SENTRY"];
    const lines = Object.entries(envVars).map(([k, v]) => {
      const isSensitive = sensitiveKeys.some(s => k.toUpperCase().includes(s));
      return `${k}=${isSensitive ? "********" : v}`;
    });
    return { content: [{ type: "text", text: `# Environment Configuration\n\n\`\`\`env\n${lines.join("\n")}\n\`\`\`` }] };
  }
);

// 12. Migration Status
server.tool(
  "migration_status",
  "Show Laravel migration status — which migrations have run and which are pending",
  {},
  async () => {
    const output = runShell("php artisan migrate:status 2>&1");
    return { content: [{ type: "text", text: `# Migration Status\n\n\`\`\`\n${output}\n\`\`\`` }] };
  }
);

// 13. API Health Check
server.tool(
  "api_health",
  "Check if the Rizquna API server is running and healthy",
  {},
  async () => {
    const appUrl = envVars.APP_URL || "http://localhost:8000";
    try {
      const output = runShell(`curl -s -o /dev/null -w "%{http_code}" ${appUrl}/api/v1/health 2>&1`, PROJECT_ROOT, 5000);
      const isUp = output.trim() === "200";
      
      let details = "";
      if (isUp) {
        details = runShell(`curl -s ${appUrl}/api/v1/health 2>&1`, PROJECT_ROOT, 5000);
      }
      
      return { content: [{ type: "text", text: isUp 
        ? `✅ API is running at ${appUrl}\n\n\`\`\`json\n${details}\n\`\`\`` 
        : `❌ API is not responding at ${appUrl} (HTTP ${output.trim()}).\n\nTry starting with: \`php artisan serve\`` 
      }] };
    } catch (err) {
      return { content: [{ type: "text", text: `❌ API unreachable at ${appUrl}: ${err.message}` }] };
    }
  }
);


// ═══════════════════════════════════════════════════════════════════════════
// Prompts
// ═══════════════════════════════════════════════════════════════════════════

server.prompt(
  "rizquna-context",
  "Get full project context for the Rizquna ERP system",
  async () => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `You are working on the Rizquna ERP (Kasir) project. Here is the key context:

**Tech Stack:**
- Backend: Laravel 12 (PHP 8.4) with PostgreSQL
- Frontend: React + TypeScript + Vite + Tailwind CSS (admin-panel/)
- Auth: Laravel Sanctum (token-based)
- Queue: Horizon
- Payments: Midtrans

**Key Directories:**
- app/Models/ — Eloquent models (User, Bank, Expense, Debt, Contact, CashTransaction, etc.)
- app/Models/Accounting/ — Account, Journal, JournalEntry, Period
- app/Http/Controllers/Api/V1/ — API controllers
- routes/api.php — All API routes (prefixed with /api/v1/)
- admin-panel/src/ — React frontend
- database/migrations/ — DB migrations

**API Modules:**
- Auth (login, logout, me, password)
- Finance (invoices, journals, accounts, expenses, banks, reports)
- Debts & Receivables
- Cash Transactions (Buku Kas)
- Audit Logs
- Settings
- Dashboard Stats

Use the available MCP tools (db_query, db_tables, artisan, etc.) to explore the project further.`,
      },
    }],
  })
);


// ═══════════════════════════════════════════════════════════════════════════
// Start Server
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 Rizquna Unified MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
