import axios, { AxiosError } from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';

/**
 * GitHub API 返回的文件/目录项
 */
interface GitHubContentItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
}

/**
 * 使用 GitHub API 获取目录内容
 * @param owner - 仓库所有者
 * @param repo - 仓库名
 * @param branch - 分支名
 * @param dirPath - 目录路径
 * @returns 文件列表
 */
async function getDirectoryContents(
  owner: string,
  repo: string,
  branch: string,
  dirPath: string
): Promise<GitHubContentItem[]> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}?ref=${branch}`;
  
  try {
    const response = await axios.get<GitHubContentItem[]>(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'applyai-skills'
      }
    });
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      if (axiosError.response.status === 404) {
        throw new Error(`Directory not found: ${dirPath}`);
      }
      if (axiosError.response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      throw new Error(`GitHub API error: ${axiosError.response.status} ${axiosError.response.statusText}`);
    }
    throw error;
  }
}

/**
 * 递归下载目录内容
 * @param owner - 仓库所有者
 * @param repo - 仓库名
 * @param branch - 分支名
 * @param sourcePath - 源路径
 * @param targetPath - 目标路径
 */
async function downloadDirectory(
  owner: string,
  repo: string,
  branch: string,
  sourcePath: string,
  targetPath: string
): Promise<void> {
  const contents = await getDirectoryContents(owner, repo, branch, sourcePath);
  
  // 确保目标目录存在
  await fs.ensureDir(targetPath);
  
  for (const item of contents) {
    const itemTargetPath = path.join(targetPath, item.name);
    
    if (item.type === 'file') {
      // 下载文件
      if (!item.download_url) {
        throw new Error(`No download URL for file: ${item.name}`);
      }
      await downloadFile(item.download_url, itemTargetPath);
      console.log(chalk.green(`✓ Downloaded: ${item.name}`));
    } else if (item.type === 'dir') {
      // 递归下载子目录
      await downloadDirectory(owner, repo, branch, item.path, itemTargetPath);
    }
  }
}

/**
 * 下载单个文件
 * @param downloadUrl - 文件下载 URL
 * @param targetPath - 目标文件路径
 */
async function downloadFile(downloadUrl: string, targetPath: string): Promise<void> {
  try {
    const response = await axios.get(downloadUrl, {
      responseType: 'arraybuffer'
    });
    
    await fs.writeFile(targetPath, response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      throw new Error(`Failed to download file: ${axiosError.response.status} ${axiosError.response.statusText}`);
    }
    throw error;
  }
}

/**
 * 从 GitHub 下载目录到本地
 * @param owner - 仓库所有者
 * @param repo - 仓库名
 * @param branch - 分支名
 * @param sourcePath - 源路径
 * @param targetDir - 目标目录
 * @param directoryName - 目录名
 */
export async function downloadFromGitHub(
  owner: string,
  repo: string,
  branch: string,
  sourcePath: string,
  targetDir: string,
  directoryName: string
): Promise<void> {
  const targetPath = path.join(targetDir, directoryName);
  
  // 检查目标目录是否已存在
  if (await fs.pathExists(targetPath)) {
    throw new Error(`Directory already exists: ${directoryName}`);
  }
  
  console.log(chalk.blue(`Downloading from GitHub...`));
  console.log(chalk.gray(`Repository: ${owner}/${repo}`));
  console.log(chalk.gray(`Branch: ${branch}`));
  console.log(chalk.gray(`Path: ${sourcePath}`));
  console.log(chalk.gray(`Target: ${targetPath}\n`));
  
  await downloadDirectory(owner, repo, branch, sourcePath, targetPath);
  
  console.log(chalk.green(`\n✓ Successfully installed to: ${targetPath}`));
}
