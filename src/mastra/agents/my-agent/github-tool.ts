import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface GitHubResponse {
  name: string;
  email: string | null;
  bio: string | null;
  company: string | null;
  twitter_username: string | null;
  followers:number
  following:number
  location: string | null;
  repos_url: string | null;
}

interface Repository {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: string;
  open_issues: number;
  clone_url: string;
  language: string;
  forks: number;
}

const repositorySchema =z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable() ,
  stargazers_count: z.string(),
  open_issues: z.number(),
  clone_url: z.string(),
  language: z.string(),
  forks:z. number()
})


const getUserInfo = async (owner: string) => {
  const githubUrl = `https://api.github.com/users/${owner}`;
  try {
    const sendRespone = await fetch(githubUrl, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    const responseData = (await sendRespone.json()) as GitHubResponse;
    const allRepo = await fetchallRepos(responseData.repos_url);
    return {

      name: responseData.name,
    owner: owner,
    email: responseData.email,
    company: responseData.company,
    location:responseData.location,
    bio:responseData.bio,
    followers:responseData.followers,
    following:responseData.following,
    twitter:responseData.twitter_username,
    repositories: allRepo,

    }

  } catch (e) {
    throw new Error("Invalid request");
  }
};


const getOrgsInfo = async (owner: string) => {
  const githubUrl = `https://api.github.com/orgs/${owner}`;
  try {
    const sendRespone = await fetch(githubUrl, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    const responseData = (await sendRespone.json()) as GitHubResponse;
    const allRepo = await fetchallRepos(responseData.repos_url) ;
    return{

    name: responseData.name,
    owner: owner,
    email: responseData.email,
    twitter:responseData.twitter_username,
    followers:responseData.followers,
    following:responseData.following,
    location:responseData.location,
    repositories: allRepo,

    }

  } catch (e) {
    throw new Error("Invalid request");
  }
};


const getRepoInfo = async (owner: string, repoName:string) => {
  const githubUrl = `"https://api.github.com/repos/${owner}/${repoName}`;
  try {
    const sendRespone = await fetch(githubUrl, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    const responseData = (await sendRespone.json()) as GitHubResponse;
    const allRepo = await fetchallRepos(responseData.repos_url) ;
    return{

    name: responseData.name,
    owner: owner,
    email: responseData.email,
    twitter:responseData.twitter_username,
    location:responseData.location,
    repositories: allRepo,

    }

  } catch (e) {
    throw new Error("Invalid request");
  }
};


const fetchallRepos = async (repoLink: string | null)=>{
  try{
    if(!repoLink){
      return [];
    }
    const sendRespone = await fetch(repoLink, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    const responseData = (await sendRespone.json()) as Repository[];
    return responseData;

  }catch (e) {
    throw new Error("Invalid request");
  }
}


export const userTool = createTool({
  id: "github-user-stats",
  description: "Get specific Github user data",
  inputSchema: z.object({
    owner: z.string().describe("Github user"),
  }),
 outputSchema: z.object({
  name: z.string().describe("Github user name"),
  owner: z.string().describe("Github id"),
  email: z.string().nullable().describe("Github user email"),
  company: z.string().nullable().describe("Github user company name"),
  location: z.string().nullable().describe("Github user location"),
  bio: z.string().nullable().describe("Github user bio"),
  followers:z.number().describe('GitHub user followers'),
  following:z.number().describe('GitHub user following'),
  twitter: z.string().nullable().describe("Github user Twitter handle"),
  repositories: z.array(repositorySchema).describe("Github repositories"),
}),

  execute: async ({ context }) => {
    return await getUserInfo(context.owner);
  },
});

export const orgsTool = createTool({
  id: "github-orgs-stats",
  description: "Get a specific organization data",
  inputSchema: z.object({
    owner: z.string().describe("Github org"),
  }),
 outputSchema: z.object({
  name: z.string().describe("Github organization name"),
  owner: z.string().describe("Github id"),
  email: z.string().nullable().describe("Github organization email"),
  location: z.string().nullable().describe("Github organization location"),
  followers:z.number().describe('GitHub user followers'),
  following:z.number().describe('GitHub user following'),
  twitter: z.string().nullable().describe("Github organization Twitter handle"),
  repositories: z.array(repositorySchema).describe("Github repositories"),
}),
  execute: async ({ context }) => {
    return await getOrgsInfo(context.owner);
  },
});

export const reposTool = createTool({
  id: "github-repo-stats",
  description: "Get specific repository data",
  inputSchema: z.object({
    repo: z.string().describe("Github repo"),
    id:z.string().describe('Github organization owner/user id'),
    }),
 outputSchema: z.object({
  name: z.string().describe("Github organization name"),
  owner: z.string().describe("Github id"),
  email: z.string().nullable().describe("Github organization email"),
  location: z.string().nullable().describe("Github organization location"),
  twitter: z.string().nullable().describe("Github organization Twitter handle"),
  repositories: z.array(repositorySchema).describe("Github repositories"),
}),
  execute: async ({ context }) => {
    return await getRepoInfo(context.repo ,context.id,);
  },
});

