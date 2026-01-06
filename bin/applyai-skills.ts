#!/usr/bin/env node

import { program } from 'commander';
import { install } from '../src/index';

program
  .name('applyai-skills')
  .description('Install skills from GitHub repositories')
  .version('1.0.0');

program
  .command('install <url>')
  .description('Install a skill from a GitHub URL')
  .action(async (url: string) => {
    try {
      await install(url);
    } catch (error) {
      const err = error as Error;
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program.parse();
