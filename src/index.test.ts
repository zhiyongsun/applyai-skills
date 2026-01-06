import { install } from './index';
import { parseGitHubUrl } from './utils';
import { downloadFromGitHub } from './downloader';

// Mock dependencies
jest.mock('./utils');
jest.mock('./downloader');
jest.mock('chalk', () => ({
  red: (str: string) => str,
}));

const mockedParseGitHubUrl = parseGitHubUrl as jest.MockedFunction<typeof parseGitHubUrl>;
const mockedDownloadFromGitHub = downloadFromGitHub as jest.MockedFunction<typeof downloadFromGitHub>;

describe('install', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.cwd = jest.fn(() => '/current/dir');
  });

  it('应该成功安装技能', async () => {
    const url = 'https://github.com/owner/repo/tree/main/path/to/skill';
    const mockUrlInfo = {
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      path: 'path/to/skill',
      directoryName: 'skill',
    };

    mockedParseGitHubUrl.mockReturnValue(mockUrlInfo);
    mockedDownloadFromGitHub.mockResolvedValue(undefined);

    await install(url);

    expect(mockedParseGitHubUrl).toHaveBeenCalledWith(url);
    expect(mockedDownloadFromGitHub).toHaveBeenCalledWith(
      'owner',
      'repo',
      'main',
      'path/to/skill',
      '/current/dir',
      'skill'
    );
  });

  it('应该处理 URL 解析错误', async () => {
    const url = 'invalid-url';
    const error = new Error('Invalid URL format');

    mockedParseGitHubUrl.mockImplementation(() => {
      throw error;
    });

    await expect(install(url)).rejects.toThrow('Invalid URL format');
    expect(mockedDownloadFromGitHub).not.toHaveBeenCalled();
  });

  it('应该处理下载错误', async () => {
    const url = 'https://github.com/owner/repo/tree/main/path/to/skill';
    const mockUrlInfo = {
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      path: 'path/to/skill',
      directoryName: 'skill',
    };
    const error = new Error('Download failed');

    mockedParseGitHubUrl.mockReturnValue(mockUrlInfo);
    mockedDownloadFromGitHub.mockRejectedValue(error);

    await expect(install(url)).rejects.toThrow('Download failed');
  });
});
