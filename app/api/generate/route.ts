import { createArdoqAgent } from "@/lib/ardoqAgent";
import { UIMessage } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const agent = await createArdoqAgent();
  const result = await agent.stream(messages);

  return result.toUIMessageStreamResponse();
}
