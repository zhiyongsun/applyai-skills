import { parseGitHubUrl, GitHubUrlInfo } from './utils';

describe('parseGitHubUrl', () => {
  it('应该正确解析标准的 GitHub URL', () => {
    const url = 'https://github.com/01000001-01001110/agent-jira-skills/tree/main/jira-safe/jira-workflow';
    const result = parseGitHubUrl(url);
    
    expect(result.owner).toBe('01000001-01001110');
    expect(result.repo).toBe('agent-jira-skills');
    expect(result.branch).toBe('main');
    expect(result.path).toBe('jira-safe/jira-workflow');
    expect(result.directoryName).toBe('jira-workflow');
  });

  it('应该正确解析 master 分支的 URL', () => {
    const url = 'https://github.com/owner/repo/tree/master/path/to/directory';
    const result = parseGitHubUrl(url);
    
    expect(result.branch).toBe('master');
    expect(result.directoryName).toBe('directory');
  });

  it('应该正确解析单层路径', () => {
    const url = 'https://github.com/owner/repo/tree/main/skill-name';
    const result = parseGitHubUrl(url);
    
    expect(result.path).toBe('skill-name');
    expect(result.directoryName).toBe('skill-name');
  });

  it('应该正确解析多层路径', () => {
    const url = 'https://github.com/owner/repo/tree/main/a/b/c/d';
    const result = parseGitHubUrl(url);
    
    expect(result.path).toBe('a/b/c/d');
    expect(result.directoryName).toBe('d');
  });

  it('应该支持 http 协议', () => {
    const url = 'http://github.com/owner/repo/tree/main/path';
    const result = parseGitHubUrl(url);
    
    expect(result.owner).toBe('owner');
    expect(result.repo).toBe('repo');
  });

  it('应该支持 blob 类型 URL', () => {
    const url = 'https://github.com/owner/repo/blob/main/path/to/file.txt';
    const result = parseGitHubUrl(url);
    
    expect(result.branch).toBe('main');
    expect(result.path).toBe('path/to/file.txt');
    expect(result.directoryName).toBe('file.txt');
  });

  it('应该处理路径中的特殊字符', () => {
    const url = 'https://github.com/owner/repo/tree/main/path-with-dashes/name_with_underscores';
    const result = parseGitHubUrl(url);
    
    expect(result.path).toBe('path-with-dashes/name_with_underscores');
    expect(result.directoryName).toBe('name_with_underscores');
  });

  it('应该处理路径末尾的斜杠', () => {
    const url = 'https://github.com/owner/repo/tree/main/path/to/dir/';
    const result = parseGitHubUrl(url);
    
    expect(result.path).toBe('path/to/dir');
    expect(result.directoryName).toBe('dir');
  });

  it('应该抛出错误当 URL 格式无效', () => {
    const invalidUrls = [
      'https://github.com/owner/repo',
      'https://github.com/owner/repo/tree',
      'https://gitlab.com/owner/repo/tree/main/path',
      'not-a-url',
      '',
    ];

    invalidUrls.forEach(url => {
      expect(() => parseGitHubUrl(url)).toThrow();
    });
  });

  it('应该抛出错误当无法提取目录名', () => {
    // 这种情况理论上不应该发生，因为正则已经匹配了路径
    // 但为了完整性，我们测试空路径的情况
    const url = 'https://github.com/owner/repo/tree/main/';
    
    // 由于我们的实现会过滤空字符串，这应该返回最后一个非空部分
    // 如果路径为空，正则本身就不会匹配
    expect(() => parseGitHubUrl(url)).toThrow();
  });
});
