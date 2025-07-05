import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { weatherWorkflow } from "./agents/weather-agent/weather-workflow"; // This can be deleted later
import { githubAgent } from "./agents/my-agent/github-agent"; 	

export const mastra = new Mastra({
	workflows: { weatherWorkflow }, // can be deleted later
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
