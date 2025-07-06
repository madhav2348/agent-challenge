# Nosana Builders Challenge: Agent-101

![Agent-101](./assets/NosanaBuildersChallengeAgents.jpg)

## Topic

Nosana Builders Challenge, 2nd edition
Agent-101: Build your first agent

## Description

The main goal of this `Nosana Builders Challenge` to teach participants to build and deploy agents. This first step will be in running a basic AI agent and giving it some basic functionality. Participants will add a tool, for the tool calling capabilities of the agent. These are basically some TypeScript functions, that will, for example, retrieve some data from a weather API, post a tweet via an API call, etc.


## GitHub Insight Agent

### **Agent Description and Purpose**

The **GitHub Insight Agent** is an intelligent AI agent designed to interact with the GitHub API using structured tools. It helps users retrieve accurate and concise information about GitHub users, organizations, and repositories.
It can:

* Fetch user or organization details based on a provided ID.
* List repository information with pagination awareness.
* Navigate to and describe specific repositories after identifying the owner.
* Handle invalid or missing data with clear error responses.


### **Setup Instructions**

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/github-insight-agent.git
   cd github-insight-agent
   ```

2. **Install Dependencies**:

   ```bash
   pnpm install
   ```
3. **Setup Ollama**

   - **[ Install Ollama ](https://ollama.com/download)**:

   - **Start Ollama service**:

   - ```bash
      ollama serve
     ```

   - **Pull and run the `qwen2.5:1.5b` model**:

     ```bash
     ollama pull qwen2.5:1.5b
     ollama run qwen2.5:1.5b
     ```
     **Why `qwen2.5:1.5b`?**

      - Lightweight (only ~1GB)
      - Fast inference on CPU
      - Supports tool calling
      - Great for development and testing

      Do note `qwen2.5:1.5b` is not suited for complex tasks.

      The Ollama server will run on `http://localhost:11434` by default and is compatible with the OpenAI API format that Mastra expects.
4. **Environment Variables Required**

   Add the following contentin `.env` file :

   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   ```   

    `GITHUB_TOKEN`: A **fine-grained personal access token** or **classic token** with read-only access to public data.

5. **Run Locally**:

   ```bash
   pnpm run dev
   ```

### 

### **Docker Build and Run Commands**

#### 🛠️ Build the Docker image:

```bash
docker build -t github-insight-agent .
```

#### 🚀 Run the container:

```bash
docker run -p 8080:8080 --env GITHUB_TOKEN=your_github_token github-insight-agent github-insight-agent
```

You can also use a `.env` file by adding `--env-file .env` to the `docker run` command.

### **Example Usage**

#### User:

ID is `vercel`, it's an organization

#### Agent:

`vercel` has 100 public repositories. Here are the first 5:
1. **next.js** – The React Framework
2. **vercel** – Vercel platform repo
   ...
   Would you like details on a specific repository?

#### User:

Yes, tell me about `next.js`

#### Agent:

Repository: `next.js` <br>
112,000 stars <br>
Description: The React Framework <br>
Open issues: 380 <br>
Forks: 21,000 

