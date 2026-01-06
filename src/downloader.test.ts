import { installSkill, InstallOptions } from './downloader';
import * as fs from 'fs';
import { execSync } from 'child_process';
import * as utils from './utils';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');
jest.mock('os', () => ({
  homedir: jest.fn(() => '/home/user'),
}));
jest.mock('ora', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    start: jest.fn(() => ({
      succeed: jest.fn(),
      fail: jest.fn(),
    })),
  })),
}));
jest.mock('@inquirer/prompts', () => ({
  checkbox: jest.fn(),
  confirm: jest.fn(),
}));
jest.mock('chalk', () => ({
  __esModule: true,
  default: {
    red: (str: string) => str,
    yellow: (str: string) => str,
    green: (str: string) => str,
    blue: (str: string) => str,
    cyan: (str: string) => str,
    dim: (str: string) => str,
    bold: (str: string) => str,
  },
}));
jest.mock('./utils', () => ({
  isLocalPath: jest.fn(),
  isGitUrl: jest.fn(),
  expandPath: jest.fn((path: string) => path),
  parseGitHubShorthand: jest.fn(),
}));

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockedUtils = utils as jest.Mocked<typeof utils>;

describe('installSkill', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.cwd = jest.fn(() => '/current/dir');
    (mockedFs.existsSync as jest.Mock).mockReturnValue(false);
    (mockedFs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (mockedFs.cpSync as jest.Mock).mockReturnValue(undefined);
    (mockedFs.rmSync as jest.Mock).mockReturnValue(undefined);
    
    // Setup default utils mocks
    (mockedUtils.isLocalPath as jest.Mock).mockReturnValue(false);
    (mockedUtils.isGitUrl as jest.Mock).mockReturnValue(false);
    (mockedUtils.expandPath as jest.Mock).mockImplementation((path: string) => path);
    (mockedUtils.parseGitHubShorthand as jest.Mock).mockReturnValue({
      repoUrl: 'https://github.com/owner/repo',
      skillSubpath: '',
    });
  });

  it('should install skill from local path', async () => {
    const localPath = '/path/to/skill';
    const options: InstallOptions = {
      targetDir: '/target/dir',
    };

    (mockedUtils.isLocalPath as jest.Mock).mockReturnValue(true);
    (mockedFs.existsSync as jest.Mock).mockImplementation((path: string) => {
      return path === localPath || path === `${localPath}/SKILL.md`;
    });
    (mockedFs.statSync as jest.Mock).mockReturnValue({
      isDirectory: () => true,
    });
    (mockedFs.readdirSync as jest.Mock).mockReturnValue([]);
    (mockedFs.readFileSync as jest.Mock).mockReturnValue('---\ndescription: Test skill\n---');

    await installSkill(localPath, options);

    expect(mockedUtils.isLocalPath).toHaveBeenCalledWith(localPath);
    expect(mockedFs.existsSync).toHaveBeenCalled();
    expect(mockedFs.mkdirSync).toHaveBeenCalled();
  });

  it('should handle local path that does not exist', async () => {
    const localPath = '/nonexistent/path';
    const options: InstallOptions = {
      targetDir: '/target/dir',
    };

    (mockedFs.existsSync as jest.Mock).mockReturnValue(false);

    await expect(installSkill(localPath, options)).rejects.toThrow();
  });

  it('should install skill from GitHub shorthand', async () => {
    const source = 'owner/repo';
    const options: InstallOptions = {};

    (mockedUtils.isLocalPath as jest.Mock).mockReturnValue(false);
    (mockedUtils.isGitUrl as jest.Mock).mockReturnValue(false);
    (mockedUtils.parseGitHubShorthand as jest.Mock).mockReturnValue({
      repoUrl: 'https://github.com/owner/repo',
      skillSubpath: '',
    });
    (mockedFs.existsSync as jest.Mock).mockReturnValue(true);
    (mockedFs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (mockedExecSync as jest.Mock).mockReturnValue(Buffer.from(''));
    (mockedFs.readdirSync as jest.Mock).mockReturnValue([
      {
        name: 'skill1',
        isDirectory: () => true,
      },
    ] as any);
    (mockedFs.readFileSync as jest.Mock).mockReturnValue('---\ndescription: Test\n---');

    await installSkill(source, options);

    expect(mockedUtils.parseGitHubShorthand).toHaveBeenCalledWith(source);
    expect(mockedExecSync).toHaveBeenCalled();
    expect(mockedExecSync).toHaveBeenCalledWith(
      expect.stringContaining('git clone'),
      expect.any(Object)
    );
  });

  it('should handle git clone failure', async () => {
    const source = 'owner/repo';
    const options: InstallOptions = {};

    (mockedUtils.isLocalPath as jest.Mock).mockReturnValue(false);
    (mockedUtils.isGitUrl as jest.Mock).mockReturnValue(false);
    (mockedUtils.parseGitHubShorthand as jest.Mock).mockReturnValue({
      repoUrl: 'https://github.com/owner/repo',
      skillSubpath: '',
    });
    (mockedFs.existsSync as jest.Mock).mockReturnValue(true);
    (mockedFs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (mockedExecSync as jest.Mock).mockImplementation(() => {
      const error = new Error('Clone failed');
      (error as any).stderr = Buffer.from('error');
      throw error;
    });

    await expect(installSkill(source, options)).rejects.toThrow();
  });
});
