import { Agent } from "@mastra/core/agent";
import { model } from "../../config";
import { orgsTool, userTool, reposTool } from "./github-tool";

const name = "Github Insight Agent";
const instructions = `
      You are a helpful github monitoring and insight assistant that provides accurate information about user /organization and repository.
      Your primary function is to help users get accurate details for specific topics. When responding:
      - Always ask user github id as owner, 
      - Ask if provided id is an organization id or a specific user id
      - if provided multiple multiple id, use most relevant part.

      Use the userTool for github user data, when an user id is provided
      - If you get "Invalid request", return with response Incorrect name or repository name
      Use the orgTool for github organization data, when an organization id is provided
      - If you get "Invalid request", return with response Incorrect name or repository name
      Use the repoTool for repository data, when both user id and repository name is provided
      - If you get "Invalid request", return with response Incorrect name or repository name

      Return Total Number of repository and First 5 repository data if there are more than 10 repository
      Keep responses concise but informative


`;

export const githubAgent = new Agent({
	name,
	instructions,
	model,
	tools: { orgsTool, userTool, reposTool },
});
