# MCP Auto Server

## Project Overview and Purpose

The MCP Auto Server is a tool designed to help AI assistants select the most suitable Large Language Models (LLMs) based on cost efficiency and performance criteria. It leverages the Model Context Protocol (MCP) to provide a standardized interface for accessing and utilizing LLM selection logic.

**Key Features:**

-   **LLM Selection:** Analyzes input prompts and recommends optimal LLMs based on factors like cost, token usage, and task suitability.
-   **MCP Compliance:** Implements the Model Context Protocol for seamless integration with AI assistants and other MCP-compatible tools.
-   **Configuration:** Allows customization of server settings, including rate limiting and caching options, via the `mcp_settings.json` file.
-   **Cline Integration:** Designed for use with the Cline AI assistant, providing a streamlined user experience.

## Installation Instructions

1.  **Prerequisites:**
    -   Node.js (version 18 or higher)
    -   npm (Node Package Manager)

2.  **Installation Steps:**
    -   Clone the repository:
        ```bash
        git clone <repository_url>
        cd mcp-auto
        ```
    -   Install dependencies:
        ```bash
        npm install
        ```
    -   Configure the server:
        -   Review and modify the `mcp_settings.json` file to adjust server settings as needed.

3.  **Verification:**
    -   Start the server:
        ```bash
        npm start
        ```
    -   Verify that the server is running without errors.

## Configuration Details

The `mcp_settings.json` file contains detailed configuration options for the MCP Auto Server.

**Key Configuration Options:**

-   **Rate Limiting:** Configure the maximum number of requests allowed per time window to prevent abuse and ensure server stability.
-   **Caching:** Enable caching to store frequently accessed LLM selection results, improving performance and reducing costs.
-   **Other Server Settings:** Customize other server parameters, such as port number, host address, and logging levels.

**Example Configuration:**

```json
{
  "port": 3000,
  "host": "localhost",
  "rateLimit": {
    "windowMs": 60000, // 1 minute
    "max": 100 // 100 requests per minute
  },
  "cache": {
    "enabled": true,
    "ttl": 3600 // 1 hour
  }
}
```

## Usage Examples

The MCP Auto Server is designed to be used with the Cline AI assistant. Users do not directly interact with the server; instead, they use Cline, which connects to the server automatically when needed.

**Example Usage:**

1.  Invoke Cline and provide a prompt:
    ```
    Cline: "Which LLM is best for writing a short story about a robot learning to paint?"
    ```

2.  Cline will connect to the MCP Auto Server, analyze the prompt, and recommend the most suitable LLM.

3.  Cline will then use the recommended LLM to generate the short story.

## API Documentation

The MCP Auto Server implements the following MCP tools:

### analyze\_prompt

Analyzes an input prompt and recommends the most suitable LLM models based on cost efficiency and performance criteria.

**Input:**

```json
{
  "prompt": "string" // The input prompt to analyze
}
```

**Output:**

```json
{
  "inputPrompt": "string",
  "estimatedTokenCount": "number",
  "detectedTasks": "array",
  "recommendations": {
    "topModels": "array",
    "optimizationTips": "array",
    "optimizedPromptExample": "string"
  }
}
```

**Error Handling:**

The server returns standard MCP error responses for invalid requests or internal server errors.

## Troubleshooting Guide

**Common Issues:**

-   **Server not starting:**
    -   Verify that Node.js and npm are installed correctly.
    -   Check the console for error messages.
    -   Ensure that the port specified in `mcp_settings.json` is not already in use.
-   **Cline not connecting to the server:**
    -   Verify that the server is running.
    -   Check the Cline configuration to ensure that it is pointing to the correct server address.
    -   Inspect the Cline logs for connection errors.

**Logging and Debugging:**

The MCP Auto Server uses a custom logging solution. Check the server logs for detailed information about server activity and errors.

**Support Resources:**

-   Contact the development team for assistance.
