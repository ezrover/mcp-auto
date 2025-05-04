#!/usr/bin/env node

/**
 * MCP server for mcp-auto
 *
 * This server wraps the mcp-auto.js functionality as an MCP tool,
 * allowing AI agents to analyze prompts and determine the most suitable LLM models.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
// Use dynamic import with the correct absolute path
// @ts-ignore
const mcpAutoModule = await import('/Users/naderrahimizad/Projects/AI/mcp-auto/src/mcp-auto.js');

// Create the MCP server
const server = new Server(
  {
    name: "mcp-auto-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Add logging for server initialization
console.log("Initializing mcp-auto-server...");

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  handler: (request: any) => Promise<any>;
}

class ToolRegistry {
  private tools: { [name: string]: ToolDefinition } = {};

  registerTool(tool: ToolDefinition) {
    this.tools[tool.name] = tool;
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools[name];
  }

  getTools(): ToolDefinition[] {
    return Object.values(this.tools);
  }

  async executeTool(name: string, request: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, `Tool ${name} not found`);
    }
    return await tool.handler(request);
  }
}

const toolRegistry = new ToolRegistry();

// Define the Model Selection Tool
const analyzePromptTool: ToolDefinition = {
  name: "analyze_prompt",
  description: "Analyzes a prompt to determine the most suitable LLM models based on cost efficiency and token usage",
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "The input prompt to analyze",
      },
    },
    required: ["prompt"],
  },
  handler: async (request: any) => {
    console.log("Handling analyze_prompt request...");
    const prompt = String(request.params.arguments?.prompt);
    if (!prompt) {
      console.error("Error: Prompt is required");
      throw new McpError(ErrorCode.InvalidParams, "Prompt is required");
    }
    try {
      console.log(`Analyzing prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);
      const analysis = mcpAutoModule.analyzePrompt(prompt);
      console.log("Analysis completed successfully");
      
      // Convert the analysis to a formatted string
      const formattedAnalysis = JSON.stringify(analysis, null, 2);
      console.log("Returning formatted text response");
      
      return {
        content: [
          {
            type: "text",
            text: formattedAnalysis,
          },
        ],
      };
    } catch (error: any) {
      console.error(`Error analyzing prompt: ${error.message}`);
      throw new McpError(ErrorCode.InternalError, `Prompt analysis failed: ${error.message}`);
    }
  },
};

toolRegistry.registerTool(analyzePromptTool);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = toolRegistry.getTools();
  return {
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    return await toolRegistry.executeTool(request.params.name, request);
  } catch (error: any) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
  }
});


/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  console.log("Starting mcp-auto-server...");
  const transport = new StdioServerTransport();
  
  server.onerror = (error) => {
    console.error("MCP Server Error:", error);
  };
  
  try {
    await server.connect(transport);
    console.log("MCP server connected and ready");
  } catch (error) {
    console.error("Failed to connect server:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error("Fatal server error:", error);
  process.exit(1);
});
