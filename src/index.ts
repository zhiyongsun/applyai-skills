import { installSkill, InstallOptions } from './downloader';
import chalk from 'chalk';

/**
 * Main function to install skill
 * @param source - Source path (GitHub URL, Git URL, local path, or shorthand format)
 * @param options - Installation options
 */
export async function install(source: string, options: InstallOptions = {}): Promise<void> {
  try {
    await installSkill(source, options);
  } catch (error) {
    const err = error as Error;
    console.error(chalk.red(`\n✗ Error: ${err.message}`));
    throw error;
  }
}
