#!/usr/bin/env node

import { program } from 'commander';
import { install } from '../src/index';
import { homedir } from 'os';
import { join } from 'path';

program
  .name('applyai-skills')
  .description('从 GitHub 仓库、Git URL 或本地路径安装技能包')
  .version('1.0.0');

program
  .command('install <source>')
  .description('安装技能（支持 GitHub URL、Git URL、本地路径或简写格式）')
  .option('-g, --global', '安装到全局目录（默认：项目目录）')
  .option('-y, --yes', '自动确认所有提示（非交互模式）')
  .option('-t, --target <dir>', '指定目标目录（覆盖默认位置）')
  .action(async (source: string, options: { global?: boolean; yes?: boolean; target?: string }) => {
    try {
      const installOptions = {
        global: options.global,
        yes: options.yes,
        targetDir: options.target || (options.global ? join(homedir(), '.applyai-skills') : undefined),
      };
      
      await install(source, installOptions);
    } catch (error) {
      const err = error as Error;
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program.parse();
