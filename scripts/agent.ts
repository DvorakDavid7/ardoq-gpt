import { createArdoqAgent } from "@/lib/ardoqAgent"

async function main() {
    const agent = await createArdoqAgent()
    const result = await agent.run("use the ardoq mcp and show me the architecture of the LSP")
    console.log(result.text)
}

main()
