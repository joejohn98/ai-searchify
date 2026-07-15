import { ToolLoopAgent, tool } from "ai";
import { google } from "@ai-sdk/google";
import { config } from "dotenv";
import { z } from "zod";

config();

const wordCountTool = tool({
  description: "Count the number of words in a given text.",
  inputSchema: z.object({
    text: z.string().describe("The text to count words in."),
  }),
  execute: async ({ text }) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return `Word count: ${words.length}`;
  },
});

async function main() {

  const agent = new ToolLoopAgent({
    model: google("gemini-3.1-flash-lite"),
    instructions: "You are a helpful assistant.",
    tools: {
      wordCount: wordCountTool,
    },
  });

  const result = await agent.generate({
    prompt:
      'Use the wordCount tool to count the words in this sentence: "AI agents can call tools in loops."',
  });

  console.log(result.text);
}

void main();
