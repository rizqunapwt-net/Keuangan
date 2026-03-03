#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP Server untuk Stitch AI (Artifact Labs)
 * 
 * CONFIGURATION: Set STITCH_API_KEY environment variable
 * Example: STITCH_API_KEY=your_api_key_here node src/index.js
 */

const STITCH_API_KEY = process.env.STITCH_API_KEY || '';
const STITCH_API_BASE = process.env.STITCH_API_BASE || 'https://api.stitch.ai/v1';

const server = new Server(
    {
        name: "stitch-ai-mcp",
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
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "stitch://status",
                name: "API Status",
                mimeType: "application/json",
                description: "Status koneksi ke Stitch AI API."
            },
            {
                uri: "stitch://config",
                name: "Configuration",
                mimeType: "application/json",
                description: "Konfigurasi Stitch AI server."
            }
        ]
    };
});

/**
 * BACA ISI SUMBER DAYA
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    
    switch (uri) {
        case "stitch://status":
            return {
                contents: [{
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify({
                        configured: !!STITCH_API_KEY,
                        api_base: STITCH_API_BASE,
                        message: STITCH_API_KEY 
                            ? "Stitch AI configured" 
                            : "STITCH_API_KEY not set"
                    }, null, 2)
                }]
            };
        case "stitch://config":
            return {
                contents: [{
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify({
                        api_base: STITCH_API_BASE,
                        version: "1.0.0",
                        features: [
                            "AI Chat",
                            "Code Generation",
                            "Data Analysis"
                        ]
                    }, null, 2)
                }]
            };
        default:
            throw new Error(`Resource not found: ${uri}`);
    }
});

/**
 * DAFTAR ALAT (Tools)
 * TODO: Sesuaikan dengan API Stitch yang sebenarnya
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "stitch_chat",
                description: "Kirim pesan ke Stitch AI untuk mendapatkan response.",
                inputSchema: {
                    type: "object",
                    properties: {
                        message: { type: "string", description: "Pesan untuk AI" },
                        context: { type: "string", description: "Konteks opsional" }
                    },
                    required: ["message"]
                }
            },
            {
                name: "stitch_code",
                description: "Generate code menggunakan Stitch AI.",
                inputSchema: {
                    type: "object",
                    properties: {
                        prompt: { type: "string", description: "Deskripsi code yang diinginkan" },
                        language: { type: "string", description: "Bahasa pemrograman" }
                    },
                    required: ["prompt"]
                }
            },
            {
                name: "stitch_analyze",
                description: "Analisis data menggunakan Stitch AI.",
                inputSchema: {
                    type: "object",
                    properties: {
                        data: { type: "string", description: "Data untuk dianalisis" },
                        type: { type: "string", description: "Tipe analisis" }
                    },
                    required: ["data"]
                }
            }
        ]
    };
});

/**
 * EKSEKUSI ALAT (Tool Execution)
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    if (!STITCH_API_KEY) {
        return {
            content: [{ 
                type: "text", 
                text: "Error: STITCH_API_KEY not configured. Please set environment variable." 
            }]
        };
    }
    
    switch (name) {
        case "stitch_chat":
            // TODO: Implementasi sesuai API Stitch
            return {
                content: [{ 
                    type: "text", 
                    text: `Stitch AI Chat: "${args.message}" - API call not implemented yet. Configure STITCH_API_KEY to enable.` 
                }]
            };
        case "stitch_code":
            return {
                content: [{ 
                    type: "text", 
                    text: `Stitch Code Generation: ${args.prompt} (${args.language}) - API call not implemented yet.` 
                }]
            };
        case "stitch_analyze":
            return {
                content: [{ 
                    type: "text", 
                    text: `Stitch Data Analysis: ${args.type} - API call not implemented yet.` 
                }]
            };
        default:
            throw new Error(`Tool not found: ${name}`);
    }
});

/**
 * JALANKAN SERVER
 */
async function main() {
    console.error("Stitch AI MCP Server starting...");
    if (!STITCH_API_KEY) {
        console.error("Warning: STITCH_API_KEY environment variable not set");
    }
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Stitch AI MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
