import { NextRequest } from "next/server";
import { createAgentUIStreamResponse } from "ai";
import { researchAgent } from "@/lib/agent";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  return createAgentUIStreamResponse({
    agent: researchAgent,
    uiMessages: messages,
  });
}
