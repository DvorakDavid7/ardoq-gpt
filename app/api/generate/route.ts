import { anthropic } from "@ai-sdk/anthropic";
import { createMCPClient } from "@ai-sdk/mcp";
import { Experimental_StdioMCPTransport } from "@ai-sdk/mcp/mcp-stdio";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const mcp = await createMCPClient({
    transport: new Experimental_StdioMCPTransport({
      command: "cmd",
      args: ["/c", "npx", "-y", "shadcn@latest", "mcp"],
    }),
  });

  const tools = await mcp.tools();

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system:
      "You are a helpful assistant with access to shadcn/ui documentation tools. Use them to answer questions about shadcn components and usage.",
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
    onFinish: async () => {
      await mcp.close();
    },
  });

  return result.toUIMessageStreamResponse();
}
