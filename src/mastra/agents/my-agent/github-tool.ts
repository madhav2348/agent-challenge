import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface GitHubResponse {
  name: string;
  email: string | null;
  bio: string | null;
  company: string | null;
  twitter_username: string | null;
  followers: number;
  following: number;
  location: string | null;
  repos_url: string | null;
}

interface Repository {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  open_issues: number;
  clone_url: string;
  language: string;
  forks: number;
}

const repositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  stargazers_count: z.number(),
  open_issues: z.number(),
  clone_url: z.string(),
  language: z.string().nullable(),
  forks: z.number(),
});

const getUserInfo = async (owner: string) => {
  const githubUrl = `https://api.github.com/users/${owner}`;
  try {
    const sendResponse = await fetch(githubUrl, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    
    if (!sendResponse.ok) {
      throw new Error(`GitHub API error: ${sendResponse.status}`);
    }
    
    const responseData = (await sendResponse.json()) as GitHubResponse;
    const allRepo = await fetchallRepos(responseData.repos_url);
    console.log(responseData);

    
    return {
      name: responseData.name,
      owner: owner,
      email: responseData.email,
      company: responseData.company,
      location: responseData.location,
      bio: responseData.bio,
      followers: responseData.followers,
      following: responseData.following,
      twitter: responseData.twitter_username,
      repositories: allRepo,
    };
  } catch (e) {
    console.error("Error fetching user info:", e);
    throw new Error(`Failed to fetch user info for ${owner}: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
};

const getOrgsInfo = async (owner: string) => {
  const githubUrl = `https://api.github.com/orgs/${owner}`;
  try {
    const sendResponse = await fetch(githubUrl, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    
    if (!sendResponse.ok) {
      throw new Error(`GitHub API error: ${sendResponse.status}`);
    }
    
    const responseData = (await sendResponse.json()) as GitHubResponse;
    const allRepo = await fetchallRepos(responseData.repos_url);
    console.log(responseData);

    
    return {
      name: responseData.name,
      owner: owner,
      email: responseData.email,
      twitter: responseData.twitter_username,
      followers: responseData.followers,
      following: responseData.following,
      location: responseData.location,
      repositories: allRepo,
    };
  } catch (e) {
    console.error("Error fetching org info:", e);
    throw new Error(`Failed to fetch org info for ${owner}: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
};

const getRepoInfo = async (owner: string, repoName: string) => {
  const githubUrl = `https://api.github.com/repos/${owner}/${repoName}`;
  try {
    const sendResponse = await fetch(githubUrl, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    
    if (!sendResponse.ok) {
      throw new Error(`GitHub API error: ${sendResponse.status}`);
    }
    
    const responseData = (await sendResponse.json()) as Repository;
    console.log(responseData);
    
    return {
      name: responseData.name,
      owner: owner,
      description: responseData.description,
      forks: responseData.forks,
      languages: responseData.language,
      issue: responseData.open_issues,
      stars: responseData.stargazers_count,
      url: responseData.clone_url,
    };
  } catch (e) {
    console.error("Error fetching repo info:", e);
    throw new Error(`Failed to fetch repo info for ${owner}/${repoName}: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
};

const fetchallRepos = async (repoLink: string | null) => {
  try {
    if (!repoLink) {
      return [];
    }
    
    const sendResponse = await fetch(repoLink, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    
    if (!sendResponse.ok) {
      throw new Error(`GitHub API error: ${sendResponse.status}`);
    }
    
    const responseData = (await sendResponse.json()) as Repository[];
    return responseData;
  } catch (e) {
    console.error("Error fetching repositories:", e);
    throw new Error(`Failed to fetch repositories: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
};

export const userTool = createTool({
  id: "github-user-stats",
  description: "Get specific Github user data including profile information and repositories",
  inputSchema: z.object({
    owner: z.string().describe("Github username to fetch data for"),
  }),
  outputSchema: z.object({
    name: z.string().describe("Github user name"),
    owner: z.string().describe("Github username"),
    email: z.string().nullable().describe("Github user email"),
    company: z.string().nullable().describe("Github user company name"),
    location: z.string().nullable().describe("Github user location"),
    bio: z.string().nullable().describe("Github user bio"),
    followers: z.number().describe("GitHub user followers count"),
    following: z.number().describe("GitHub user following count"),
    twitter: z.string().nullable().describe("Github user Twitter handle"),
    repositories: z.array(repositorySchema).describe("User's Github repositories"),
  }),
  execute: async ({ context }) => {
    return await getUserInfo(context.owner);
  },
});

export const orgsTool = createTool({
  id: "github-orgs-stats",
  description: "Get specific GitHub organization data including profile and repositories",
  inputSchema: z.object({
    owner: z.string().describe("Github organization name to fetch data for"),
  }),
  outputSchema: z.object({
    name: z.string().describe("Github organization name"),
    owner: z.string().describe("Github organization username"),
    email: z.string().nullable().describe("Github organization email"),
    location: z.string().nullable().describe("Github organization location"),
    followers: z.number().describe("GitHub organization followers count"),
    following: z.number().describe("GitHub organization following count"),
    twitter: z
      .string()
      .nullable()
      .describe("Github organization Twitter handle"),
    repositories: z.array(repositorySchema).describe("Organization's Github repositories"),
  }),
  execute: async ({ context }) => {
    return await getOrgsInfo(context.owner);
  },
});

export const reposTool = createTool({
  id: "github-repo-stats",
  description: "Get specific repository data including stats, issues, and metadata",
  inputSchema: z.object({
    owner: z.string().describe("Github repository owner (user or organization)"),
    repo: z.string().describe("Github repository name"),
  }),
  outputSchema: z.object({
    name: z.string().describe("Github Repository name"),
    owner: z.string().describe("Github repository owner"),
    description: z
      .string()
      .nullable()
      .describe("Github Repository Description"),
    forks: z.number().describe("Github Repository total forks"),
    languages: z.string().nullable().describe("Primary programming language"),
    issue: z.number().describe("Github total number of open issues"),
    stars: z.number().describe("Github Repository total stars"),
    url: z.string().describe("Github repository clone URL"),
  }),
  execute: async ({ context }) => {
    return await getRepoInfo(context.owner, context.repo);
  },
});