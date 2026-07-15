import { config } from "dotenv";
config({ path: ".env" });

import { runAgentTUI, type AgentTUIAgent } from "@ai-sdk/tui";
import { researchAgent } from "./agent";

await runAgentTUI({
  title: "AI Searchify Research Agent",
  agent: researchAgent as AgentTUIAgent,
});
