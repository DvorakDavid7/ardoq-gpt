import 'dotenv/config'
import { anthropic } from "@ai-sdk/anthropic"
import { createMCPClient } from "@ai-sdk/mcp"
import { Experimental_StdioMCPTransport } from "@ai-sdk/mcp/mcp-stdio"
import { convertToModelMessages, generateText, stepCountIs, streamText, UIMessage } from "ai"

const SYSTEM_PROMPT =
    "You are an assistant with access to the Ardoq architecture repository. Use the available tools to answer questions about the architecture. When showing architecture diagrams, include a Mermaid diagram in a ```mermaid code block."

const PROVIDER_OPTIONS = {
    anthropic: { cacheControl: { type: "ephemeral" } },
}

async function createMcp() {
    return createMCPClient({
        transport: new Experimental_StdioMCPTransport({
            command: "cmd",
            args: [
                "/c",
                "npx",
                "mcp-remote",
                "https://sazka.ardoq.com/mcp/",
                "--header",
                "Authorization:Bearer adq_338b609db58640459534a1f6f14cb126",
            ],
            env: {
                ARDOQ_API_TOKEN: "adq_338b609db58640459534a1f6f14cb126",
            },
        }),
    })
}

export async function createArdoqAgent() {
    const mcp = await createMcp()
    const tools = await mcp.tools()

    return {
        async run(prompt: string) {
            return generateText({
                model: anthropic("claude-sonnet-4-6"),
                system: SYSTEM_PROMPT,
                prompt,
                tools,
                stopWhen: stepCountIs(10),
                maxRetries: 3,
                providerOptions: PROVIDER_OPTIONS,
            })
        },

        async stream(messages: UIMessage[]) {
            return streamText({
                model: anthropic("claude-sonnet-4-6"),
                system: SYSTEM_PROMPT,
                messages: await convertToModelMessages(messages),
                tools,
                stopWhen: stepCountIs(10),
                maxRetries: 3,
                providerOptions: PROVIDER_OPTIONS,
                onFinish: async () => {
                    await mcp.close()
                },
            })
        },
    }
}
