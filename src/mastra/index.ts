import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { githubStatsWorkflow } from "./agents/my-agent/workflow";
import { githubAgent } from "./agents/my-agent/github-agent"; 	

export const mastra = new Mastra({
	workflows: { githubStatsWorkflow },
	agents: { githubAgent },
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 10000,
	},
});
