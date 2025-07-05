
import { Agent } from "@mastra/core/agent";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { model } from "../../config";

const githubAgent = new Agent({
  name: "GitHub Stats Agent",
  model,
  instructions: `
You are a GitHub analytics expert. Your job is to provide structured insights for a GitHub user or organization.

For each user or organization, structure your response exactly as follows:

👤 PROFILE OVERVIEW
• Name: [Full name or org name]
• Username: @username
• Bio: [short bio]
• Location: [city/country or "Not specified"]
• Public Repositories: [number]
• Followers: [number]
• Following: [number]

📦 REPOSITORY LIST
_For each repository (limit to top 5 by star count) sort by stars on repo_


### 🔹 [Repository Name]
• Description: [short description or “No description”]
• Language: [primary language or “Unknown”]
• ⭐ Stars: [number]
• 🍴 Forks: [number]
• ❗ Open Issues: [number]
• 📅 Last Updated: [Date]
• 🔗 Repo Link: [URL]

📈 ENGAGEMENT INSIGHTS
• Most starred repository: [repo name] with ⭐ [star count]
• Most forked repository: [repo name] with 🍴 [fork count]
• Most active repository (recent updates): [repo name]
• Popular languages used: [top 3 languages]

⚠️ NOTES & CONSIDERATIONS
• All data is fetched via GitHub REST API v3
• May be affected by GitHub rate limits
`,
});


const repositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  stargazers_count: z.number(),
  open_issues: z.number(),
  clone_url: z.string(),
  language: z.string().nullable(),
  forks: z.number(),
  updated_at: z.string(),
  html_url: z.string(),
});

const githubStatsSchema = z.object({
  name: z.string().nullable(),
  username: z.string(),
  email: z.string().nullable(),
  bio: z.string().nullable(),
  company: z.string().nullable(),
  location: z.string().nullable(),
  followers: z.number(),
  following: z.number(),
  public_repos: z.number(),
  twitter: z.string().nullable(),
  repositories: z.array(repositorySchema),
});


const fetchGitHubProfileData = async (username: string) => {
  const headers = {
    "Accept": "application/vnd.github+json",
    "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const userUrl = `https://api.github.com/users/${username}`;
  const userResponse = await fetch(userUrl, { headers });
  if (!userResponse.ok) throw new Error("GitHub user not found");
  const userData = await userResponse.json();

  const reposUrl = userData.repos_url;
  const reposResponse = await fetch(`${reposUrl}?per_page=100`, { headers });
  const reposData = await reposResponse.json();

  const repositories = reposData.map((repo: any) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    stargazers_count: repo.stargazers_count,
    open_issues: repo.open_issues_count,
    clone_url: repo.clone_url,
    language: repo.language,
    forks: repo.forks_count,
    updated_at: repo.updated_at,
    html_url: repo.html_url,
  }));

  return {
    name: userData.name,
    username: userData.login,
    email: userData.email,
    bio: userData.bio,
    company: userData.company,
    location: userData.location,
    followers: userData.followers,
    following: userData.following,
    public_repos: userData.public_repos,
    twitter: userData.twitter_username,
    repositories,
  };
};


const fetchGitHubStats = createStep({
  id: "fetch-github-stats",
  description: "Fetch GitHub profile and repository data",
  inputSchema: z.object({
    username: z.string().describe("GitHub username or organization"),
  }),
  outputSchema: githubStatsSchema,
  execute: async ({ inputData }) => {
    return await fetchGitHubProfileData(inputData.username);
  },
});

const generateReport = createStep({
  id: "generate-github-report",
  description: "Generate a structured report from GitHub data",
  inputSchema: githubStatsSchema,
  outputSchema: z.object({
    report: z.string(),
  }),
  execute: async ({ inputData }) => {
    const prompt = `Generate a GitHub stats report for:\n\n${JSON.stringify(inputData, null, 2)}`;

    const response = await githubAgent.stream([
      { role: "user", content: prompt },
    ]);

    let result = "";
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      result += chunk;
    }

    return { report: result };
  },
});

const githubStatsWorkflow = createWorkflow({
  id: "github-stats-workflow",
  inputSchema: z.object({
    username: z.string().describe("GitHub username or organization"),
  }),
  outputSchema: z.object({
    report: z.string(),
  }),
})
  .then(fetchGitHubStats)
  .then(generateReport);

githubStatsWorkflow.commit();

export { githubStatsWorkflow };
