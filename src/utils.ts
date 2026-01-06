import { join, resolve } from 'path';
import { homedir } from 'os';

/**
 * GitHub URL parsing result
 */
export interface GitHubUrlInfo {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  directoryName: string;
}

/**
 * Check if source is a local path
 */
export function isLocalPath(source: string): boolean {
  return (
    source.startsWith('/') ||
    source.startsWith('./') ||
    source.startsWith('../') ||
    source.startsWith('~/')
  );
}

/**
 * Check if source is a Git URL (SSH, git://, or HTTPS)
 */
export function isGitUrl(source: string): boolean {
  return (
    source.startsWith('git@') ||
    source.startsWith('git://') ||
    source.startsWith('http://') ||
    source.startsWith('https://') ||
    source.endsWith('.git')
  );
}

/**
 * Expand ~ to home directory
 */
export function expandPath(source: string): string {
  if (source.startsWith('~/')) {
    return join(homedir(), source.slice(2));
  }
  return resolve(source);
}

/**
 * Parse GitHub URL and extract repository information and path
 * @param url - GitHub URL
 * @returns Object containing owner, repo, branch, path, directoryName
 */
export function parseGitHubUrl(url: string): GitHubUrlInfo {
  // Supported URL formats:
  // https://github.com/owner/repo/tree/branch/path/to/directory
  // https://github.com/owner/repo/blob/branch/path/to/file
  
  const urlPattern = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/(?:tree|blob)\/([^\/]+)\/(.+)$/;
  const match = url.match(urlPattern);
  
  if (!match) {
    throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo/tree/branch/path/to/directory');
  }
  
  const [, owner, repo, branch, path] = match;
  
  // Extract the last directory name
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

/**
 * Parse GitHub shorthand format (owner/repo or owner/repo/skill-path)
 */
export function parseGitHubShorthand(source: string): { repoUrl: string; skillSubpath: string } {
  const parts = source.split('/');
  if (parts.length === 2) {
    return {
      repoUrl: `https://github.com/${source}`,
      skillSubpath: ''
    };
  } else if (parts.length > 2) {
    return {
      repoUrl: `https://github.com/${parts[0]}/${parts[1]}`,
      skillSubpath: parts.slice(2).join('/')
    };
  } else {
    throw new Error('Invalid source format. Expected: owner/repo or owner/repo/skill-name');
  }
}
