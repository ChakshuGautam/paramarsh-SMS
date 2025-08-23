#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { NodeSSH } from "node-ssh";
import axios from "axios";
import { z } from "zod";

const DeployConfigSchema = z.object({
  host: z.string(),
  username: z.string(),
  privateKeyPath: z.string().optional(),
  password: z.string().optional(),
  projectPath: z.string().default("/root/paramarsh-sms"),
  apiUrl: z.string().default("https://api.paramarsh-sms.theflywheel.in"),
  webUrl: z.string().default("https://paramarsh-sms.theflywheel.in"),
  apiPort: z.number().default(10011),
  webPort: z.number().default(10010),
  githubRepo: z.string().default("git@github.com:yourusername/paramarsh-SMS.git"),
  branch: z.string().default("main"),
});

type DeployConfig = z.infer<typeof DeployConfigSchema>;

class ParamarshDeployServer {
  private server: Server;
  private ssh: NodeSSH;
  private config: DeployConfig | null = null;

  constructor() {
    this.ssh = new NodeSSH();
    this.server = new Server(
      {
        name: "paramarsh-deploy",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        const { name, arguments: args } = request.params;

        try {
          switch (name) {
            // Configuration
            case "configure":
              return await this.configure(args);
            case "test-connection":
              return await this.testConnection();
            
            // Setup commands
            case "setup-directories":
              return await this.setupDirectories();
            case "install-bun":
              return await this.installBun();
            case "install-pm2":
              return await this.installPM2();
            case "clone-repo":
              return await this.cloneRepo(args);
            
            // Code management
            case "git-pull":
              return await this.gitPull();
            case "git-status":
              return await this.gitStatus();
            case "git-checkout":
              return await this.gitCheckout(args);
            
            // Dependencies
            case "install-deps":
              return await this.installDependencies(args);
            case "install-api-deps":
              return await this.installApiDeps();
            case "install-web-deps":
              return await this.installWebDeps();
            
            // Database
            case "db-generate":
              return await this.dbGenerate();
            case "db-migrate":
              return await this.dbMigrate();
            case "db-seed":
              return await this.dbSeed();
            case "db-reset":
              return await this.dbReset();
            
            // Build
            case "build-api":
              return await this.buildApi();
            case "build-web":
              return await this.buildWeb();
            case "build-all":
              return await this.buildAll();
            
            // PM2 Process Management
            case "pm2-start":
              return await this.pm2Start(args);
            case "pm2-stop":
              return await this.pm2Stop(args);
            case "pm2-restart":
              return await this.pm2Restart(args);
            case "pm2-status":
              return await this.pm2Status();
            case "pm2-logs":
              return await this.pm2Logs(args);
            case "pm2-save":
              return await this.pm2Save();
            case "pm2-startup":
              return await this.pm2Startup();
            
            // Monitoring
            case "health-check":
              return await this.healthCheck();
            case "check-ports":
              return await this.checkPorts();
            case "tail-logs":
              return await this.tailLogs(args);
            
            // Combined operations
            case "full-deploy":
              return await this.fullDeploy(args);
            case "quick-deploy":
              return await this.quickDeploy();
            case "first-setup":
              return await this.firstTimeSetup(args);
            
            default:
              throw new Error(`Unknown tool: ${name}`);
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      }
    );
  }

  private getTools(): Tool[] {
    return [
      // Configuration
      {
        name: "configure",
        description: "Configure the deployment server connection",
        inputSchema: {
          type: "object",
          properties: {
            host: { type: "string", description: "Server IP address" },
            username: { type: "string", description: "SSH username" },
            privateKeyPath: { type: "string", description: "Path to SSH private key" },
            password: { type: "string", description: "SSH password (if not using key)" },
            projectPath: { type: "string", description: "Project path on server" },
            apiPort: { type: "number", description: "API port (default: 10011)" },
            webPort: { type: "number", description: "Web port (default: 10010)" },
            githubRepo: { type: "string", description: "GitHub repository SSH URL" },
            branch: { type: "string", description: "Git branch to deploy" },
          },
          required: ["host", "username"],
        },
      },
      {
        name: "test-connection",
        description: "Test SSH connection to server",
        inputSchema: { type: "object", properties: {} },
      },
      
      // Setup commands
      {
        name: "setup-directories",
        description: "Create necessary directories on server",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "install-bun",
        description: "Install Bun runtime on server",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "install-pm2",
        description: "Install PM2 process manager globally",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "clone-repo",
        description: "Clone GitHub repository",
        inputSchema: {
          type: "object",
          properties: {
            repo: { type: "string", description: "Repository URL (uses configured if not provided)" },
            force: { type: "boolean", description: "Force clone even if directory exists" },
          },
        },
      },
      
      // Code management
      {
        name: "git-pull",
        description: "Pull latest code from git",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "git-status",
        description: "Check git status",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "git-checkout",
        description: "Checkout a git branch",
        inputSchema: {
          type: "object",
          properties: {
            branch: { type: "string", description: "Branch name" },
          },
          required: ["branch"],
        },
      },
      
      // Dependencies
      {
        name: "install-deps",
        description: "Install all dependencies (API and Web)",
        inputSchema: {
          type: "object",
          properties: {
            clean: { type: "boolean", description: "Clean install (remove node_modules)" },
          },
        },
      },
      {
        name: "install-api-deps",
        description: "Install API dependencies only",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "install-web-deps",
        description: "Install Web dependencies only",
        inputSchema: { type: "object", properties: {} },
      },
      
      // Database
      {
        name: "db-generate",
        description: "Generate Prisma client",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "db-migrate",
        description: "Run database migrations",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "db-seed",
        description: "Seed the database",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "db-reset",
        description: "Reset database (CAUTION: destroys data)",
        inputSchema: {
          type: "object",
          properties: {
            confirm: { type: "boolean", description: "Confirm database reset" },
          },
          required: ["confirm"],
        },
      },
      
      // Build
      {
        name: "build-api",
        description: "Build API application",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "build-web",
        description: "Build Web application",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "build-all",
        description: "Build both API and Web",
        inputSchema: { type: "object", properties: {} },
      },
      
      // PM2 Process Management
      {
        name: "pm2-start",
        description: "Start PM2 processes",
        inputSchema: {
          type: "object",
          properties: {
            service: { type: "string", enum: ["api", "web", "all"], description: "Which service to start" },
          },
        },
      },
      {
        name: "pm2-stop",
        description: "Stop PM2 processes",
        inputSchema: {
          type: "object",
          properties: {
            service: { type: "string", enum: ["api", "web", "all"], description: "Which service to stop" },
          },
        },
      },
      {
        name: "pm2-restart",
        description: "Restart PM2 processes",
        inputSchema: {
          type: "object",
          properties: {
            service: { type: "string", enum: ["api", "web", "all"], description: "Which service to restart" },
          },
        },
      },
      {
        name: "pm2-status",
        description: "Get PM2 process status",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "pm2-logs",
        description: "View PM2 logs",
        inputSchema: {
          type: "object",
          properties: {
            service: { type: "string", enum: ["api", "web", "all"], description: "Which service logs" },
            lines: { type: "number", description: "Number of lines to show" },
          },
        },
      },
      {
        name: "pm2-save",
        description: "Save PM2 process list",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "pm2-startup",
        description: "Generate PM2 startup script",
        inputSchema: { type: "object", properties: {} },
      },
      
      // Monitoring
      {
        name: "health-check",
        description: "Check health of deployed services",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "check-ports",
        description: "Check if required ports are listening",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "tail-logs",
        description: "Tail application logs",
        inputSchema: {
          type: "object",
          properties: {
            service: { type: "string", enum: ["api", "web"], description: "Which service" },
            type: { type: "string", enum: ["out", "error"], description: "Log type" },
            lines: { type: "number", description: "Number of lines" },
          },
        },
      },
      
      // Combined operations
      {
        name: "full-deploy",
        description: "Full deployment (pull, install, build, migrate, restart)",
        inputSchema: {
          type: "object",
          properties: {
            skipBuild: { type: "boolean", description: "Skip build step" },
            skipInstall: { type: "boolean", description: "Skip dependency installation" },
            skipMigrate: { type: "boolean", description: "Skip database migration" },
          },
        },
      },
      {
        name: "quick-deploy",
        description: "Quick deployment (pull and restart only)",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "first-setup",
        description: "First time setup (install everything from scratch)",
        inputSchema: {
          type: "object",
          properties: {
            repo: { type: "string", description: "Repository URL" },
          },
        },
      },
    ];
  }

  private async connectSSH() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    const connectConfig: any = {
      host: this.config.host,
      username: this.config.username,
    };

    if (this.config.privateKeyPath) {
      connectConfig.privateKey = this.config.privateKeyPath;
    } else if (this.config.password) {
      connectConfig.password = this.config.password;
    }

    await this.ssh.connect(connectConfig);
  }

  private async configure(args: any) {
    try {
      this.config = DeployConfigSchema.parse(args);
      
      await this.connectSSH();
      await this.ssh.dispose();

      return {
        content: [
          {
            type: "text",
            text: `✅ Configuration saved and connection tested successfully.
Server: ${this.config.host}
User: ${this.config.username}
Project Path: ${this.config.projectPath}
API URL: ${this.config.apiUrl} (port ${this.config.apiPort})
Web URL: ${this.config.webUrl} (port ${this.config.webPort})`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Configuration failed: ${error}`);
    }
  }

  private async testConnection() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const result = await this.ssh.execCommand("uname -a && echo '---' && pwd && echo '---' && whoami");
      
      return {
        content: [
          {
            type: "text",
            text: `✅ Connection successful!\n\n${result.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async setupDirectories() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const commands = [
        `mkdir -p ${this.config.projectPath}`,
        `mkdir -p /root/logs`,
        `ls -la ${this.config.projectPath}`,
      ];

      let output = "";
      for (const cmd of commands) {
        const result = await this.ssh.execCommand(cmd);
        output += `$ ${cmd}\n${result.stdout}\n`;
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ Directories created:\n\n${output}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async installBun() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      // Check if bun is already installed
      const checkBun = await this.ssh.execCommand("which bun");
      
      if (checkBun.stdout) {
        const version = await this.ssh.execCommand("bun --version");
        return {
          content: [
            {
              type: "text",
              text: `✅ Bun already installed\nVersion: ${version.stdout}`,
            },
          ],
        };
      }

      // Install bun
      const install = await this.ssh.execCommand("curl -fsSL https://bun.sh/install | bash");
      
      // Add to PATH
      await this.ssh.execCommand("echo 'export PATH=\"$HOME/.bun/bin:$PATH\"' >> ~/.bashrc");
      
      // Verify installation
      const verify = await this.ssh.execCommand("source ~/.bashrc && bun --version");

      return {
        content: [
          {
            type: "text",
            text: `✅ Bun installed successfully\nVersion: ${verify.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async installPM2() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      // Check if PM2 is already installed
      const checkPM2 = await this.ssh.execCommand("which pm2");
      
      if (checkPM2.stdout) {
        const version = await this.ssh.execCommand("pm2 --version");
        return {
          content: [
            {
              type: "text",
              text: `✅ PM2 already installed\nVersion: ${version.stdout}`,
            },
          ],
        };
      }

      // Install PM2
      const install = await this.ssh.execCommand("npm install -g pm2");
      
      // Verify installation
      const verify = await this.ssh.execCommand("pm2 --version");

      return {
        content: [
          {
            type: "text",
            text: `✅ PM2 installed successfully\nVersion: ${verify.stdout}\n\nOutput:\n${install.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async cloneRepo(args: any) {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const repo = args.repo || this.config.githubRepo;
      
      // Check if repo already exists
      const checkRepo = await this.ssh.execCommand(`ls -la ${this.config.projectPath}/.git`);
      
      if (checkRepo.stdout && !args.force) {
        return {
          content: [
            {
              type: "text",
              text: `Repository already exists at ${this.config.projectPath}\nUse force: true to override`,
            },
          ],
        };
      }

      if (args.force) {
        await this.ssh.execCommand(`rm -rf ${this.config.projectPath}`);
        await this.ssh.execCommand(`mkdir -p ${this.config.projectPath}`);
      }

      // Clone repository
      const clone = await this.ssh.execCommand(
        `cd ${this.config.projectPath} && git clone ${repo} .`
      );

      // Get status
      const status = await this.ssh.execCommand(
        `cd ${this.config.projectPath} && git status`
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ Repository cloned successfully\n\n${status.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async gitPull() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const pull = await this.ssh.execCommand(
        `cd ${this.config.projectPath} && git fetch origin && git pull origin ${this.config.branch}`
      );

      const status = await this.ssh.execCommand(
        `cd ${this.config.projectPath} && git status`
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ Git pull completed\n\n${pull.stdout}\n\nStatus:\n${status.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async gitStatus() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const status = await this.ssh.execCommand(
        `cd ${this.config.projectPath} && git status`
      );

      const log = await this.ssh.execCommand(
        `cd ${this.config.projectPath} && git log --oneline -5`
      );

      return {
        content: [
          {
            type: "text",
            text: `Git Status:\n${status.stdout}\n\nRecent commits:\n${log.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async gitCheckout(args: any) {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const checkout = await this.ssh.execCommand(
        `cd ${this.config.projectPath} && git checkout ${args.branch}`
      );

      const status = await this.ssh.execCommand(
        `cd ${this.config.projectPath} && git status`
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ Checked out branch: ${args.branch}\n\n${checkout.stdout}\n\nStatus:\n${status.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async installDependencies(args: any) {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      let output = "";

      if (args.clean) {
        output += "🧹 Cleaning old dependencies...\n";
        await this.ssh.execCommand(
          `cd ${this.config.projectPath}/apps/api && rm -rf node_modules bun.lockb`
        );
        await this.ssh.execCommand(
          `cd ${this.config.projectPath}/apps/web && rm -rf node_modules bun.lockb`
        );
      }

      output += "\n📦 Installing API dependencies...\n";
      const apiInstall = await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/api && bun install`
      );
      output += apiInstall.stdout + "\n";

      output += "\n📦 Installing Web dependencies...\n";
      const webInstall = await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/web && bun install`
      );
      output += webInstall.stdout;

      return {
        content: [
          {
            type: "text",
            text: `✅ Dependencies installed\n\n${output}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async installApiDeps() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const install = await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/api && bun install`
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ API dependencies installed\n\n${install.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async installWebDeps() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const install = await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/web && bun install`
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ Web dependencies installed\n\n${install.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async dbGenerate() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const generate = await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/api && npx prisma generate`
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ Prisma client generated\n\n${generate.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async dbMigrate() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const migrate = await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/api && npx prisma migrate deploy`
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ Database migrations completed\n\n${migrate.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async dbSeed() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const seed = await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/api && npx prisma db seed`
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ Database seeded\n\n${seed.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async dbReset() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const reset = await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/api && npx prisma migrate reset --force`
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ Database reset completed\n\n${reset.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async buildApi() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const build = await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/api && bun run build`
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ API built successfully\n\n${build.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async buildWeb() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const build = await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/web && bun run build`
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ Web app built successfully\n\n${build.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async buildAll() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      let output = "🔨 Building API...\n";
      const apiBuild = await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/api && bun run build`
      );
      output += apiBuild.stdout + "\n\n";

      output += "🔨 Building Web...\n";
      const webBuild = await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/web && bun run build`
      );
      output += webBuild.stdout;

      return {
        content: [
          {
            type: "text",
            text: `✅ Build completed\n\n${output}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async pm2Start(args: any) {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const service = args.service || "all";
      let command = "";
      
      if (service === "all") {
        // Copy ecosystem config first
        await this.ssh.execCommand(
          `cp ${this.config.projectPath}/mcp/paramarsh-deploy/ecosystem.config.js ${this.config.projectPath}/`
        );
        command = `cd ${this.config.projectPath} && pm2 start ecosystem.config.js`;
      } else if (service === "api") {
        command = "pm2 start paramarsh-api";
      } else if (service === "web") {
        command = "pm2 start paramarsh-web";
      }

      const start = await this.ssh.execCommand(command);
      const status = await this.ssh.execCommand("pm2 list");

      return {
        content: [
          {
            type: "text",
            text: `✅ PM2 processes started\n\n${start.stdout}\n\nStatus:\n${status.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async pm2Stop(args: any) {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const service = args.service || "all";
      let command = "";
      
      if (service === "all") {
        command = "pm2 stop all";
      } else if (service === "api") {
        command = "pm2 stop paramarsh-api";
      } else if (service === "web") {
        command = "pm2 stop paramarsh-web";
      }

      const stop = await this.ssh.execCommand(command);
      const status = await this.ssh.execCommand("pm2 list");

      return {
        content: [
          {
            type: "text",
            text: `✅ PM2 processes stopped\n\n${stop.stdout}\n\nStatus:\n${status.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async pm2Restart(args: any) {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const service = args.service || "all";
      let command = "";
      
      if (service === "all") {
        command = "pm2 restart all";
      } else if (service === "api") {
        command = "pm2 restart paramarsh-api";
      } else if (service === "web") {
        command = "pm2 restart paramarsh-web";
      }

      const restart = await this.ssh.execCommand(command);
      const status = await this.ssh.execCommand("pm2 list");

      return {
        content: [
          {
            type: "text",
            text: `✅ PM2 processes restarted\n\n${restart.stdout}\n\nStatus:\n${status.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async pm2Status() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const list = await this.ssh.execCommand("pm2 list");
      const jlist = await this.ssh.execCommand("pm2 jlist");

      return {
        content: [
          {
            type: "text",
            text: `PM2 Status:\n${list.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async pm2Logs(args: any) {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const service = args.service || "all";
      const lines = args.lines || 50;
      let command = "";
      
      if (service === "all") {
        command = `pm2 logs --lines ${lines} --nostream`;
      } else if (service === "api") {
        command = `pm2 logs paramarsh-api --lines ${lines} --nostream`;
      } else if (service === "web") {
        command = `pm2 logs paramarsh-web --lines ${lines} --nostream`;
      }

      const logs = await this.ssh.execCommand(command);

      return {
        content: [
          {
            type: "text",
            text: logs.stdout,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async pm2Save() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const save = await this.ssh.execCommand("pm2 save");

      return {
        content: [
          {
            type: "text",
            text: `✅ PM2 process list saved\n\n${save.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async pm2Startup() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const startup = await this.ssh.execCommand("pm2 startup");

      return {
        content: [
          {
            type: "text",
            text: `PM2 Startup Script:\n\n${startup.stdout}\n\nRun the command above to enable PM2 on system startup`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async healthCheck() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    const results = [];

    // Check API
    try {
      const apiStart = Date.now();
      const apiResponse = await axios.get(`${this.config.apiUrl}/health`, {
        timeout: 10000,
      });
      const apiTime = Date.now() - apiStart;
      
      results.push(`✅ API Health Check:
  Status: ${apiResponse.status}
  Response Time: ${apiTime}ms
  URL: ${this.config.apiUrl}`);
    } catch (error) {
      results.push(`❌ API Health Check Failed:
  Error: ${error instanceof Error ? error.message : 'Unknown error'}
  URL: ${this.config.apiUrl}`);
    }

    // Check Web
    try {
      const webStart = Date.now();
      const webResponse = await axios.get(this.config.webUrl, {
        timeout: 10000,
      });
      const webTime = Date.now() - webStart;
      
      results.push(`✅ Web Health Check:
  Status: ${webResponse.status}
  Response Time: ${webTime}ms
  URL: ${this.config.webUrl}`);
    } catch (error) {
      results.push(`❌ Web Health Check Failed:
  Error: ${error instanceof Error ? error.message : 'Unknown error'}
  URL: ${this.config.webUrl}`);
    }

    return {
      content: [
        {
          type: "text",
          text: results.join("\n\n"),
        },
      ],
    };
  }

  private async checkPorts() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const checkApi = await this.ssh.execCommand(`lsof -i :${this.config.apiPort} | grep LISTEN`);
      const checkWeb = await this.ssh.execCommand(`lsof -i :${this.config.webPort} | grep LISTEN`);
      const netstat = await this.ssh.execCommand("netstat -tlnp | grep -E '10010|10011'");

      let result = "Port Status:\n\n";
      result += `API Port ${this.config.apiPort}: ${checkApi.stdout ? '✅ Listening' : '❌ Not listening'}\n`;
      result += `Web Port ${this.config.webPort}: ${checkWeb.stdout ? '✅ Listening' : '❌ Not listening'}\n\n`;
      result += `Netstat output:\n${netstat.stdout}`;

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async tailLogs(args: any) {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      const service = args.service || "api";
      const type = args.type || "out";
      const lines = args.lines || 50;
      
      const logFile = `/root/logs/paramarsh-${service}-${type}.log`;
      const tail = await this.ssh.execCommand(`tail -n ${lines} ${logFile}`);

      return {
        content: [
          {
            type: "text",
            text: `Last ${lines} lines of ${service} ${type} log:\n\n${tail.stdout}`,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async fullDeploy(args: any) {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      let output = "🚀 Starting full deployment...\n\n";

      // Step 1: Git pull
      output += "📥 Pulling latest code...\n";
      const pull = await this.ssh.execCommand(
        `cd ${this.config.projectPath} && git pull origin ${this.config.branch}`
      );
      output += pull.stdout + "\n\n";

      // Step 2: Install dependencies
      if (!args.skipInstall) {
        output += "📦 Installing dependencies...\n";
        await this.ssh.execCommand(
          `cd ${this.config.projectPath}/apps/api && bun install`
        );
        await this.ssh.execCommand(
          `cd ${this.config.projectPath}/apps/web && bun install`
        );
        output += "Dependencies installed\n\n";
      }

      // Step 3: Build
      if (!args.skipBuild) {
        output += "🔨 Building applications...\n";
        await this.ssh.execCommand(
          `cd ${this.config.projectPath}/apps/api && bun run build`
        );
        await this.ssh.execCommand(
          `cd ${this.config.projectPath}/apps/web && bun run build`
        );
        output += "Build completed\n\n";
      }

      // Step 4: Migrate
      if (!args.skipMigrate) {
        output += "🗄️ Running migrations...\n";
        const migrate = await this.ssh.execCommand(
          `cd ${this.config.projectPath}/apps/api && npx prisma migrate deploy`
        );
        output += migrate.stdout + "\n\n";
      }

      // Step 5: Restart
      output += "🔄 Restarting services...\n";
      await this.ssh.execCommand("pm2 restart all");
      
      // Step 6: Status
      const status = await this.ssh.execCommand("pm2 list");
      output += "\n📊 Final status:\n" + status.stdout;

      return {
        content: [
          {
            type: "text",
            text: output,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async quickDeploy() {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      let output = "⚡ Quick deployment...\n\n";

      // Git pull
      output += "📥 Pulling latest code...\n";
      const pull = await this.ssh.execCommand(
        `cd ${this.config.projectPath} && git pull origin ${this.config.branch}`
      );
      output += pull.stdout + "\n\n";

      // Restart
      output += "🔄 Restarting services...\n";
      await this.ssh.execCommand("pm2 restart all");
      
      // Status
      const status = await this.ssh.execCommand("pm2 list");
      output += "\n📊 Status:\n" + status.stdout;

      return {
        content: [
          {
            type: "text",
            text: output,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  private async firstTimeSetup(args: any) {
    if (!this.config) {
      throw new Error("Please configure the deployment server first");
    }

    await this.connectSSH();
    
    try {
      let output = "🎯 First-time setup starting...\n\n";

      // Create directories
      output += "📁 Creating directories...\n";
      await this.ssh.execCommand(`mkdir -p ${this.config.projectPath}`);
      await this.ssh.execCommand(`mkdir -p /root/logs`);

      // Clone repo
      output += "📥 Cloning repository...\n";
      const repo = args.repo || this.config.githubRepo;
      await this.ssh.execCommand(
        `cd ${this.config.projectPath} && git clone ${repo} .`
      );

      // Install dependencies
      output += "📦 Installing dependencies...\n";
      await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/api && bun install`
      );
      await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/web && bun install`
      );

      // Database setup
      output += "🗄️ Setting up database...\n";
      await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/api && npx prisma generate`
      );
      await this.ssh.execCommand(
        `cd ${this.config.projectPath}/apps/api && npx prisma migrate deploy`
      );

      // Copy ecosystem config
      await this.ssh.execCommand(
        `cp ${this.config.projectPath}/mcp/paramarsh-deploy/ecosystem.config.js ${this.config.projectPath}/`
      );

      // Start PM2
      output += "🚀 Starting PM2 processes...\n";
      await this.ssh.execCommand(
        `cd ${this.config.projectPath} && pm2 start ecosystem.config.js`
      );

      // Save PM2
      await this.ssh.execCommand("pm2 save");

      const status = await this.ssh.execCommand("pm2 list");
      output += "\n✅ Setup complete!\n\n" + status.stdout;

      return {
        content: [
          {
            type: "text",
            text: output,
          },
        ],
      };
    } finally {
      await this.ssh.dispose();
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Paramarsh Deploy MCP server running");
  }
}

const server = new ParamarshDeployServer();
server.run().catch(console.error);