/**
 * GitHub URL 解析结果
 */
export interface GitHubUrlInfo {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  directoryName: string;
}

/**
 * 解析 GitHub URL，提取仓库信息和路径
 * @param url - GitHub URL
 * @returns 包含 owner, repo, branch, path, directoryName 的对象
 */
export function parseGitHubUrl(url: string): GitHubUrlInfo {
  // 支持的 URL 格式：
  // https://github.com/owner/repo/tree/branch/path/to/directory
  // https://github.com/owner/repo/blob/branch/path/to/file
  
  const urlPattern = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/(?:tree|blob)\/([^\/]+)\/(.+)$/;
  const match = url.match(urlPattern);
  
  if (!match) {
    throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo/tree/branch/path/to/directory');
  }
  
  const [, owner, repo, branch, path] = match;
  
  // 提取最后一个目录名
  const pathParts = path.split('/').filter(Boolean);
  const directoryName = pathParts[pathParts.length - 1];
  
  if (!directoryName) {
    throw new Error('Could not extract directory name from URL path');
  }
  
  return {
    owner,
    repo,
    branch,
    path: pathParts.join('/'),
    directoryName
  };
}
