/**
 * CheckpointManager - Manages database snapshots at orchestrator checkpoints
 * Enables fast TDD by restoring to specific states
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SeedContext } from './interfaces';

const execAsync = promisify(exec);

export interface CheckpointConfig {
  checkpointDir?: string;
  dbUrl?: string;
  containerName?: string;
  useDocker?: boolean;
}

export class CheckpointManager {
  private checkpointDir: string;
  private dbUrl: string;
  private containerName?: string;
  private useDocker: boolean;

  constructor(config: CheckpointConfig = {}) {
    this.checkpointDir = config.checkpointDir || path.join(process.cwd(), '.checkpoints');
    this.dbUrl = config.dbUrl || process.env.DATABASE_URL || 'postgresql://paramarsh:paramarsh123@localhost:5432/paramarsh_sms';
    this.containerName = config.containerName;
    this.useDocker = config.useDocker ?? !!config.containerName;
  }

  /**
   * Initialize checkpoint directory
   */
  async init(): Promise<void> {
    await fs.mkdir(this.checkpointDir, { recursive: true });
    console.log(`📁 Checkpoint directory ready: ${this.checkpointDir}`);
  }

  /**
   * Create a checkpoint after a specific seeder completes
   */
  async createCheckpoint(name: string, context: SeedContext): Promise<void> {
    const checkpointFile = path.join(this.checkpointDir, `checkpoint_${name}.sql`);
    
    try {
      console.log(`💾 Creating checkpoint: ${name}`);
      
      if (this.useDocker && this.containerName) {
        // Use Docker exec for containerized database
        await execAsync(
          `docker exec ${this.containerName} pg_dump -U paramarsh -d paramarsh_sms --data-only --inserts > ${checkpointFile}`
        );
      } else {
        // Direct pg_dump for local database
        const dbParts = this.parseDbUrl(this.dbUrl);
        await execAsync(
          `PGPASSWORD=${dbParts.password} pg_dump -h ${dbParts.host} -p ${dbParts.port} -U ${dbParts.user} -d ${dbParts.database} --data-only --inserts > ${checkpointFile}`
        );
      }

      // Save metadata about the checkpoint
      const metadata = {
        name,
        createdAt: new Date().toISOString(),
        branchId: context.branchId,
        entities: Array.from(context.createdEntities.keys()),
        counts: {} as Record<string, number>
      };

      // Record counts for each entity
      for (const [entityName, entities] of context.createdEntities.entries()) {
        metadata.counts[entityName] = Array.isArray(entities) ? entities.length : 1;
      }

      await fs.writeFile(
        path.join(this.checkpointDir, `checkpoint_${name}.json`),
        JSON.stringify(metadata, null, 2)
      );

      console.log(`✅ Checkpoint created: ${name} (${checkpointFile})`);
    } catch (error) {
      console.error(`❌ Failed to create checkpoint ${name}:`, error);
      throw error;
    }
  }

  /**
   * Restore database to a specific checkpoint
   */
  async restoreCheckpoint(name: string): Promise<void> {
    const checkpointFile = path.join(this.checkpointDir, `checkpoint_${name}.sql`);
    
    try {
      // Check if checkpoint exists
      await fs.access(checkpointFile);
      
      console.log(`🔄 Restoring checkpoint: ${name}`);
      
      // Clear database first
      await this.clearDatabase();
      
      if (this.useDocker && this.containerName) {
        // Use Docker exec for containerized database
        await execAsync(
          `docker exec -i ${this.containerName} psql -U paramarsh -d paramarsh_sms < ${checkpointFile}`
        );
      } else {
        // Direct psql for local database
        const dbParts = this.parseDbUrl(this.dbUrl);
        await execAsync(
          `PGPASSWORD=${dbParts.password} psql -h ${dbParts.host} -p ${dbParts.port} -U ${dbParts.user} -d ${dbParts.database} < ${checkpointFile}`
        );
      }

      console.log(`✅ Checkpoint restored: ${name}`);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        throw new Error(`Checkpoint not found: ${name}`);
      }
      console.error(`❌ Failed to restore checkpoint ${name}:`, error);
      throw error;
    }
  }

  /**
   * List all available checkpoints
   */
  async listCheckpoints(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.checkpointDir);
      return files
        .filter(f => f.startsWith('checkpoint_') && f.endsWith('.sql'))
        .map(f => f.replace('checkpoint_', '').replace('.sql', ''));
    } catch {
      return [];
    }
  }

  /**
   * Get checkpoint metadata
   */
  async getCheckpointMetadata(name: string): Promise<any> {
    const metadataFile = path.join(this.checkpointDir, `checkpoint_${name}.json`);
    try {
      const content = await fs.readFile(metadataFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Clear all data from database (keeping schema)
   */
  private async clearDatabase(): Promise<void> {
    if (this.useDocker && this.containerName) {
      // Get all table names and truncate them
      const { stdout } = await execAsync(
        `docker exec ${this.containerName} psql -U paramarsh -d paramarsh_sms -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"`
      );
      
      const tables = stdout.split('\n').filter(t => t.trim()).map(t => t.trim());
      
      if (tables.length > 0) {
        const truncateCmd = `TRUNCATE TABLE "${tables.join('", "')}" CASCADE`;
        await execAsync(
          `docker exec ${this.containerName} psql -U paramarsh -d paramarsh_sms -c "${truncateCmd}"`
        );
      }
    } else {
      const dbParts = this.parseDbUrl(this.dbUrl);
      
      // Get all table names
      const { stdout } = await execAsync(
        `PGPASSWORD=${dbParts.password} psql -h ${dbParts.host} -p ${dbParts.port} -U ${dbParts.user} -d ${dbParts.database} -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"`
      );
      
      const tables = stdout.split('\n').filter(t => t.trim()).map(t => t.trim());
      
      if (tables.length > 0) {
        const truncateCmd = `TRUNCATE TABLE "${tables.join('", "')}" CASCADE`;
        await execAsync(
          `PGPASSWORD=${dbParts.password} psql -h ${dbParts.host} -p ${dbParts.port} -U ${dbParts.user} -d ${dbParts.database} -c "${truncateCmd}"`
        );
      }
    }
  }

  /**
   * Parse database URL into components
   */
  private parseDbUrl(url: string): {
    host: string;
    port: string;
    user: string;
    password: string;
    database: string;
  } {
    // Handle both postgresql:// and postgres:// prefixes
    const normalizedUrl = url.replace(/^postgres:\/\//, 'postgresql://');
    
    // Parse URL - handle both standard format and with query params
    const match = normalizedUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:\/]+):(\d+)\/([^?]+)/);
    if (!match) {
      throw new Error(`Invalid database URL: ${url}`);
    }
    
    return {
      user: match[1],
      password: match[2],
      host: match[3],
      port: match[4],
      database: match[5]
    };
  }

  /**
   * Clean up old checkpoints
   */
  async cleanup(keepLast: number = 5): Promise<void> {
    const checkpoints = await this.listCheckpoints();
    
    if (checkpoints.length > keepLast) {
      const toDelete = checkpoints.slice(0, checkpoints.length - keepLast);
      
      for (const checkpoint of toDelete) {
        const sqlFile = path.join(this.checkpointDir, `checkpoint_${checkpoint}.sql`);
        const jsonFile = path.join(this.checkpointDir, `checkpoint_${checkpoint}.json`);
        
        await fs.unlink(sqlFile).catch(() => {});
        await fs.unlink(jsonFile).catch(() => {});
        
        console.log(`🗑️ Deleted old checkpoint: ${checkpoint}`);
      }
    }
  }
}