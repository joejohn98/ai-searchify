import { ToolLoopAgent, tool, isStepCount } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { tavily } from "@tavily/core";
import { z } from "zod";

const google = createGoogleGenerativeAI();

const client = tavily({ apiKey: process.env.TAVILY_API_KEY });

const webSearchTool = tool({
  description: "Search the web for information using Tavily API",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    const response = await client.search(query, {
      maxResults: 5,
      searchDepth: "advanced",
      topic: "news",
    });
    return response.results.map((result) => ({
      title: result.title,
      url: result.url,
      content: result.content,
    }));
  },
});

export const researchAgent = new ToolLoopAgent({
  model: google("gemini-3.1-flash-lite"),
  tools: { webSearch: webSearchTool },
  stopWhen: isStepCount(5),
  instructions:
    `You are a research assistant. Today's date is ${new Date().toISOString().split("T")[0]}. ` +
    "ALWAYS use the webSearch tool before answering ANY question. " +
    "Never answer from your own training data or knowledge. " +
    "If you don't know something, search for it first. " +
    "Summarize your findings in bullet points. " +
    "Always include source URLs for each piece of information. " +
    "Respond in the same language as the user.",
});
