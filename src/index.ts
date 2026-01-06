import { parseGitHubUrl } from './utils';
import { downloadFromGitHub } from './downloader';
import chalk from 'chalk';

/**
 * 安装技能的主函数
 * @param url - GitHub URL
 */
export async function install(url: string): Promise<void> {
  try {
    // 解析 URL
    const { owner, repo, branch, path: sourcePath, directoryName } = parseGitHubUrl(url);
    
    // 获取当前工作目录
    const targetDir = process.cwd();
    
    // 下载文件
    await downloadFromGitHub(owner, repo, branch, sourcePath, targetDir, directoryName);
    
  } catch (error) {
    const err = error as Error;
    console.error(chalk.red(`\n✗ Error: ${err.message}`));
    throw error;
  }
}
