import axios from 'axios';
import * as fs from 'fs-extra';
import { downloadFromGitHub } from './downloader';

// Mock dependencies
jest.mock('axios');
jest.mock('fs-extra');
jest.mock('chalk', () => ({
  blue: (str: string) => str,
  gray: (str: string) => str,
  green: (str: string) => str,
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock console.log to avoid test output interference
global.console = {
  ...console,
  log: jest.fn(),
};

describe('downloadFromGitHub', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockedFs.pathExists as unknown as jest.Mock).mockResolvedValue(false);
    (mockedFs.ensureDir as unknown as jest.Mock).mockResolvedValue(undefined);
    (mockedFs.writeFile as unknown as jest.Mock).mockResolvedValue(undefined);
  });

  it('应该成功下载单个文件', async () => {
    const mockContents = [
      {
        name: 'file.txt',
        path: 'jira-workflow/file.txt',
        type: 'file' as const,
        download_url: 'https://raw.githubusercontent.com/owner/repo/main/jira-workflow/file.txt',
      },
    ];

    mockedAxios.get
      .mockResolvedValueOnce({ data: mockContents }) // getDirectoryContents
      .mockResolvedValueOnce({ data: Buffer.from('file content') }); // downloadFile

    await downloadFromGitHub(
      'owner',
      'repo',
      'main',
      'jira-workflow',
      '/tmp',
      'jira-workflow'
    );

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(mockedFs.ensureDir).toHaveBeenCalled();
    expect(mockedFs.writeFile).toHaveBeenCalled();
  });

  it('应该递归下载子目录', async () => {
    const mockRootContents = [
      {
        name: 'subdir',
        path: 'jira-workflow/subdir',
        type: 'dir' as const,
        download_url: null,
      },
    ];

    const mockSubdirContents = [
      {
        name: 'file.txt',
        path: 'jira-workflow/subdir/file.txt',
        type: 'file' as const,
        download_url: 'https://raw.githubusercontent.com/owner/repo/main/jira-workflow/subdir/file.txt',
      },
    ];

    mockedAxios.get
      .mockResolvedValueOnce({ data: mockRootContents }) // root directory
      .mockResolvedValueOnce({ data: mockSubdirContents }) // subdir
      .mockResolvedValueOnce({ data: Buffer.from('content') }); // file

    await downloadFromGitHub(
      'owner',
      'repo',
      'main',
      'jira-workflow',
      '/tmp',
      'jira-workflow'
    );

    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    expect(mockedFs.ensureDir).toHaveBeenCalledTimes(2); // root + subdir
  });

  it('应该在目录已存在时抛出错误', async () => {
    (mockedFs.pathExists as unknown as jest.Mock).mockResolvedValue(true);

    await expect(
      downloadFromGitHub(
        'owner',
        'repo',
        'main',
        'jira-workflow',
        '/tmp',
        'jira-workflow'
      )
    ).rejects.toThrow('Directory already exists');
  });

  it('应该处理 GitHub API 404 错误', async () => {
    const error = {
      response: {
        status: 404,
        statusText: 'Not Found',
      },
    };

    mockedAxios.get.mockRejectedValueOnce(error);

    await expect(
      downloadFromGitHub(
        'owner',
        'repo',
        'main',
        'nonexistent',
        '/tmp',
        'nonexistent'
      )
    ).rejects.toThrow('Directory not found');
  });

  it('应该处理 GitHub API 403 错误（限流）', async () => {
    const error = {
      response: {
        status: 403,
        statusText: 'Forbidden',
      },
    };

    mockedAxios.get.mockRejectedValueOnce(error);

    await expect(
      downloadFromGitHub(
        'owner',
        'repo',
        'main',
        'jira-workflow',
        '/tmp',
        'jira-workflow'
      )
    ).rejects.toThrow('GitHub API rate limit exceeded');
  });

  it('应该处理文件下载失败', async () => {
    const mockContents = [
      {
        name: 'file.txt',
        path: 'jira-workflow/file.txt',
        type: 'file' as const,
        download_url: 'https://raw.githubusercontent.com/owner/repo/main/jira-workflow/file.txt',
      },
    ];

    mockedAxios.get
      .mockResolvedValueOnce({ data: mockContents })
      .mockRejectedValueOnce({
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      });

    await expect(
      downloadFromGitHub(
        'owner',
        'repo',
        'main',
        'jira-workflow',
        '/tmp',
        'jira-workflow'
      )
    ).rejects.toThrow();
  });

  it('应该处理没有 download_url 的文件', async () => {
    const mockContents = [
      {
        name: 'file.txt',
        path: 'jira-workflow/file.txt',
        type: 'file' as const,
        download_url: null,
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockContents });

    await expect(
      downloadFromGitHub(
        'owner',
        'repo',
        'main',
        'jira-workflow',
        '/tmp',
        'jira-workflow'
      )
    ).rejects.toThrow('No download URL');
  });
});
