import { install } from './index';
import { installSkill } from './downloader';
import chalk from 'chalk';

// Mock dependencies
jest.mock('./downloader');
jest.mock('chalk', () => ({
  __esModule: true,
  default: {
    red: (str: string) => str,
  },
}));

const mockedInstallSkill = installSkill as jest.MockedFunction<typeof installSkill>;

describe('install', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully install skill', async () => {
    const source = 'owner/repo';
    const options = {};

    mockedInstallSkill.mockResolvedValue(undefined);

    await install(source, options);

    expect(mockedInstallSkill).toHaveBeenCalledWith(source, options);
  });

  it('should handle installation errors', async () => {
    const source = 'owner/repo';
    const options = {};
    const error = new Error('Installation failed');

    mockedInstallSkill.mockRejectedValue(error);

    await expect(install(source, options)).rejects.toThrow('Installation failed');
    expect(mockedInstallSkill).toHaveBeenCalledWith(source, options);
  });

  it('should pass options correctly', async () => {
    const source = 'owner/repo';
    const options = {
      global: true,
      yes: true,
      targetDir: '/custom/path',
    };

    mockedInstallSkill.mockResolvedValue(undefined);

    await install(source, options);

    expect(mockedInstallSkill).toHaveBeenCalledWith(source, options);
  });
});
