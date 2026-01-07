#!/usr/bin/env node
/**
 * CLI Entry Point for Beautiful Seed Data Manager
 */

import { runCLI } from './BeautifulSeedCLI';

// Handle uncaught errors gracefully
process.on('unhandledRejection', (err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

// Run the CLI
runCLI().catch((err) => {
  console.error('CLI Error:', err);
  process.exit(1);
});