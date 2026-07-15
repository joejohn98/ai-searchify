import { config } from "dotenv";
config({ path: ".env" });

import { runAgentTUI, type AgentTUIAgent } from "@ai-sdk/tui";
import { researchAgent } from "./agent";

runAgentTUI({ agent: researchAgent as AgentTUIAgent });
