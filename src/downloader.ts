import { readFileSync, readdirSync, existsSync, mkdirSync, rmSync, cpSync, statSync } from 'fs';
import { join, basename, resolve } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { checkbox, confirm } from '@inquirer/prompts';
import { ExitPromptError } from '@inquirer/core';
import { isLocalPath, isGitUrl, expandPath, parseGitHubShorthand } from './utils';

/**
 * Installation options
 */
export interface InstallOptions {
  global?: boolean;
  yes?: boolean;
  targetDir?: string;
}

/**
 * Skill information
 */
interface SkillInfo {
  skillDir: string;
  skillName: string;
  description?: string;
  targetPath: string;
  size: number;
}

/**
 * Install skill from local path
 */
async function installFromLocal(
  localPath: string,
  targetDir: string,
  options: InstallOptions
): Promise<void> {
  if (!existsSync(localPath)) {
    console.error(chalk.red(`Error: Path does not exist: ${localPath}`));
    process.exit(1);
  }

  const stats = statSync(localPath);
  if (!stats.isDirectory()) {
    console.error(chalk.red('Error: Path must be a directory'));
    process.exit(1);
  }

  // Check if this is a single skill directory (has SKILL.md) or a directory containing multiple skills
  const skillMdPath = join(localPath, 'SKILL.md');
  
  // Find skills in subdirectories
  const findSkills = (dir: string): string[] => {
    const skills: string[] = [];
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && existsSync(join(fullPath, 'SKILL.md'))) {
        skills.push(fullPath);
      }
    }
    return skills;
  };
  
  const subSkills = findSkills(localPath);
  
  if (existsSync(skillMdPath) || subSkills.length === 0) {
    // Single skill directory (has SKILL.md or no sub-skill directories)
    const isProject = targetDir.includes(process.cwd());
    await installSingleLocalSkill(localPath, targetDir, isProject, options);
  } else {
    // Directory containing multiple skills
    await installFromRepo(localPath, targetDir, options);
  }
}

/**
 * Install a single local skill directory
 */
async function installSingleLocalSkill(
  skillDir: string,
  targetDir: string,
  isProject: boolean,
  options: InstallOptions
): Promise<void> {
  const skillMdPath = join(skillDir, 'SKILL.md');
  let content: string;
  
  if (existsSync(skillMdPath)) {
    content = readFileSync(skillMdPath, 'utf-8');
  }

  const skillName = basename(skillDir);
  const targetPath = join(targetDir, skillName);

  const shouldInstall = await warnIfConflict(skillName, targetPath, isProject, options.yes);
  if (!shouldInstall) {
    console.log(chalk.yellow(`Skipped: ${skillName}`));
    return;
  }

  mkdirSync(targetDir, { recursive: true });
  
  // Security check: ensure target path is within target directory
  const resolvedTargetPath = resolve(targetPath);
  const resolvedTargetDir = resolve(targetDir);
  if (!resolvedTargetPath.startsWith(resolvedTargetDir + '/')) {
    console.error(chalk.red('Security error: Installation path outside target directory'));
    process.exit(1);
  }

  cpSync(skillDir, targetPath, { recursive: true, dereference: true });

  console.log(chalk.green(`✅ Installed: ${skillName}`));
  console.log(`   Location: ${targetPath}`);
}

/**
 * Install specific skill from Git repository
 */
async function installSpecificSkill(
  repoDir: string,
  skillSubpath: string,
  targetDir: string,
  isProject: boolean,
  options: InstallOptions
): Promise<void> {
  const skillDir = join(repoDir, skillSubpath);
  const skillMdPath = join(skillDir, 'SKILL.md');

  if (!existsSync(skillDir)) {
    console.error(chalk.red(`Error: Skill directory does not exist: ${skillSubpath}`));
    process.exit(1);
  }

  const skillName = basename(skillSubpath) || basename(skillDir);
  const targetPath = join(targetDir, skillName);

  // Check for conflicts
  const shouldInstall = await warnIfConflict(skillName, targetPath, isProject, options.yes);
  if (!shouldInstall) {
    console.log(chalk.yellow(`Skipped: ${skillName}`));
    return;
  }

  mkdirSync(targetDir, { recursive: true });
  
  // Security check
  const resolvedTargetPath = resolve(targetPath);
  const resolvedTargetDir = resolve(targetDir);
  if (!resolvedTargetPath.startsWith(resolvedTargetDir + '/')) {
    console.error(chalk.red('Security error: Installation path outside target directory'));
    process.exit(1);
  }

  cpSync(skillDir, targetPath, { recursive: true, dereference: true });

  console.log(chalk.green(`✅ Installed: ${skillName}`));
  console.log(`   Location: ${targetPath}`);
}

/**
 * Install from repository (with interactive selection support)
 */
async function installFromRepo(
  repoDir: string,
  targetDir: string,
  options: InstallOptions
): Promise<void> {
  // Find all skill directories
  const findSkills = (dir: string): string[] => {
    const skills: string[] = [];
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        // Check if SKILL.md file exists
        if (existsSync(join(fullPath, 'SKILL.md'))) {
          skills.push(fullPath);
        } else {
          // Recursively search subdirectories
          skills.push(...findSkills(fullPath));
        }
      }
    }
    return skills;
  };

  const skillDirs = findSkills(repoDir);

  if (skillDirs.length === 0) {
    console.error(chalk.red('Error: No skill directories found in repository'));
    process.exit(1);
  }

  console.log(chalk.dim(`Found ${skillDirs.length} skill(s)\n`));

  // Build skill information list
  const skillInfos: SkillInfo[] = skillDirs
    .map((skillDir) => {
      const skillMdPath = join(skillDir, 'SKILL.md');
      let content: string;
      let description: string | undefined;

      if (existsSync(skillMdPath)) {
        content = readFileSync(skillMdPath, 'utf-8');
        // Try to extract description (simple frontmatter parsing)
        const descMatch = content.match(/description:\s*(.+)/i);
        if (descMatch) {
          description = descMatch[1].trim();
        }
      }

      const skillName = basename(skillDir);
      const targetPath = join(targetDir, skillName);
      const size = getDirectorySize(skillDir);

      return {
        skillDir,
        skillName,
        description,
        targetPath,
        size,
      };
    })
    .filter((info) => info !== null);

  if (skillInfos.length === 0) {
    console.error(chalk.red('Error: No valid skill directories found'));
    process.exit(1);
  }

  // Interactive selection (unless -y flag is used or only one skill)
  let skillsToInstall = skillInfos;

  if (!options.yes && skillInfos.length > 1) {
    try {
      const choices = skillInfos.map((info) => ({
        name: `${chalk.bold(info.skillName.padEnd(25))} ${chalk.dim(formatSize(info.size))}`,
        value: info.skillName,
        description: info.description?.slice(0, 80) || '',
        checked: true, // Check all by default
      }));

      const selected = await checkbox({
        message: 'Select skills to install',
        choices,
        pageSize: 15,
      });

      if (selected.length === 0) {
        console.log(chalk.yellow('No skills selected. Installation cancelled.'));
        return;
      }

      skillsToInstall = skillInfos.filter((info) => selected.includes(info.skillName));
    } catch (error) {
      if (error instanceof ExitPromptError) {
        console.log(chalk.yellow('\n\nCancelled by user'));
        process.exit(0);
      }
      throw error;
    }
  }

  // Install selected skills
  const isProject = targetDir.includes(process.cwd());
  let installedCount = 0;

  for (const info of skillsToInstall) {
    // Check for conflicts
    const shouldInstall = await warnIfConflict(info.skillName, info.targetPath, isProject, options.yes);
    if (!shouldInstall) {
      console.log(chalk.yellow(`Skipped: ${info.skillName}`));
      continue;
    }

    mkdirSync(targetDir, { recursive: true });
    
    // Security check
    const resolvedTargetPath = resolve(info.targetPath);
    const resolvedTargetDir = resolve(targetDir);
    if (!resolvedTargetPath.startsWith(resolvedTargetDir + '/')) {
      console.error(chalk.red('Security error: Installation path outside target directory'));
      continue;
    }

    cpSync(info.skillDir, info.targetPath, { recursive: true, dereference: true });

    console.log(chalk.green(`✅ Installed: ${info.skillName}`));
    installedCount++;
  }

  console.log(chalk.green(`\n✅ Installation complete: ${installedCount} skill(s) installed`));
}

/**
 * Check for conflicts and warn user
 * Returns true to proceed with installation, false to skip
 */
async function warnIfConflict(
  skillName: string,
  targetPath: string,
  isProject: boolean,
  skipPrompt = false
): Promise<boolean> {
  // Check if overwriting existing skill
  if (existsSync(targetPath)) {
    if (skipPrompt) {
      // Auto-overwrite in non-interactive mode
      console.log(chalk.dim(`Overwriting: ${skillName}`));
      return true;
    }
    try {
      const shouldOverwrite = await confirm({
        message: chalk.yellow(`Skill '${skillName}' already exists. Overwrite?`),
        default: false,
      });

      if (!shouldOverwrite) {
        return false; // Skip this skill, continue with others
      }
    } catch (error) {
      if (error instanceof ExitPromptError) {
        console.log(chalk.yellow('\n\nCancelled by user'));
        process.exit(0);
      }
      throw error;
    }
  }

  return true; // OK to proceed
}

/**
 * Get directory size in bytes
 */
function getDirectorySize(dirPath: string): number {
  let size = 0;

  const entries = readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isFile()) {
      size += statSync(fullPath).size;
    } else if (entry.isDirectory()) {
      size += getDirectorySize(fullPath);
    }
  }

  return size;
}

/**
 * Format bytes to human-readable size
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Main function to install skill
 */
export async function installSkill(source: string, options: InstallOptions): Promise<void> {
  const targetDir = options.targetDir || process.cwd();
  const isProject = !options.global;
  
  const location = isProject
    ? chalk.blue(`project (${targetDir})`)
    : chalk.dim(`global (~/${targetDir})`);

  console.log(`Installing from: ${chalk.cyan(source)}`);
  console.log(`Location: ${location}\n`);

  // Handle local path installation
  if (isLocalPath(source)) {
    const localPath = expandPath(source);
    await installFromLocal(localPath, targetDir, options);
    return;
  }

  // Parse Git source
  let repoUrl: string;
  let skillSubpath: string = '';

  if (isGitUrl(source)) {
    // Full Git URL (SSH, HTTPS, git://)
    repoUrl = source;
  } else {
    // GitHub shorthand format: owner/repo or owner/repo/skill-path
    const parsed = parseGitHubShorthand(source);
    repoUrl = parsed.repoUrl;
    skillSubpath = parsed.skillSubpath;
  }

  // Clone and install
  const tempDir = join(homedir(), `.applyai-skills-temp-${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });

  try {
    const spinner = ora('Cloning repository...').start();
    try {
      execSync(`git clone --depth 1 --quiet "${repoUrl}" "${tempDir}/repo"`, {
        stdio: 'pipe',
      });
      spinner.succeed('Repository cloned');
    } catch (error) {
      spinner.fail('Failed to clone repository');
      const err = error as { stderr?: Buffer };
      if (err.stderr) {
        console.error(chalk.dim(err.stderr.toString().trim()));
      }
      console.error(chalk.yellow('\nTip: For private repos, ensure git SSH keys or credentials are configured'));
      process.exit(1);
    }

    const repoDir = join(tempDir, 'repo');

    if (skillSubpath) {
      const isProject = targetDir.includes(process.cwd());
      await installSpecificSkill(repoDir, skillSubpath, targetDir, isProject, options);
    } else {
      await installFromRepo(repoDir, targetDir, options);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}
