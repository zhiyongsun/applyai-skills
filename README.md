# applyai-skills

[English](./README.md) | [中文](./README.zh.md)

A CLI tool for installing skill packages from GitHub repositories. Download specific directories from GitHub repositories without cloning the entire repository.

## Features

- 🚀 **Easy Installation** - Install skills directly from GitHub URLs
- 📦 **Selective Download** - Download only the directory you need, not the entire repository
- 🔄 **Recursive Download** - Automatically downloads all files and subdirectories
- 📁 **Preserve Structure** - Maintains the original directory structure
- ✨ **Type-Safe** - Built with TypeScript for better reliability
- 🎨 **User-Friendly** - Clear error messages and progress indicators

## Installation

### As a User

No installation needed! Use `npx` to run directly:

```bash
npx applyai-skills install <github-url>
```

### As a Developer

```bash
npm install
```

## Usage

### Basic Usage

```bash
npx applyai-skills install <github-url>
```

### Example

```bash
npx applyai-skills install https://github.com/01000001-01001110/agent-jira-skills/tree/main/jira-safe/jira-workflow
```

This will download all files from the specified GitHub directory to the current directory and create a folder named `jira-workflow` (using the last directory name from the URL).

### Supported URL Formats

- `https://github.com/owner/repo/tree/branch/path/to/directory`
- `https://github.com/owner/repo/blob/branch/path/to/file`
- Supports both `http` and `https` protocols
- Works with any branch name (`main`, `master`, `develop`, etc.)

## Development

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd applyai-skills

# Install dependencies
npm install

# Build TypeScript code
npm run build
```

### Available Scripts

```bash
# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Link locally for testing
npm link
```

### Project Structure

```
applyai-skills/
├── bin/
│   └── applyai-skills.ts      # CLI entry point
├── src/
│   ├── index.ts               # Main logic
│   ├── downloader.ts          # GitHub download module
│   ├── utils.ts               # Utility functions
│   └── *.test.ts              # Test files
├── scripts/
│   └── fix-bin-imports.js      # Build post-processing script
├── tsconfig.json              # TypeScript configuration
└── jest.config.js              # Jest test configuration
```

## Publishing

### Option 1: Publish to npm (Production)

```bash
# 1. Build the project
npm run build

# 2. Publish to npm
npm publish
```

After publishing, users can use it directly:

```bash
npx applyai-skills install <github-url>
```

### Option 2: Local Development (No Publishing Required)

```bash
# 1. Build the project
npm run build

# 2. Create global symlink
npm link

# 3. Use from any directory
npx applyai-skills install <github-url>
```

## How It Works

1. **URL Parsing**: Extracts repository information (owner, repo, branch, path) from the GitHub URL
2. **Directory Name Extraction**: Uses the last directory name from the URL path as the target folder name
3. **GitHub API Call**: Uses GitHub REST API to fetch directory contents
4. **Recursive Download**: Downloads files and recursively processes subdirectories
5. **File System**: Saves files to the current working directory while preserving the original structure

For detailed technical documentation, see [PRINCIPLE.md](./PRINCIPLE.md).

## Error Handling

The tool handles various error scenarios:

- **Invalid URL Format**: Validates GitHub URL structure
- **Directory Not Found**: Handles 404 errors from GitHub API
- **Rate Limiting**: Detects and reports API rate limit issues
- **Network Errors**: Handles connection failures gracefully
- **File System Errors**: Prevents overwriting existing directories
- **Permission Errors**: Reports file system permission issues

## Use Cases

### Install a Skill Package

```bash
npx applyai-skills install https://github.com/owner/repo/tree/main/path/to/skill
```

### Batch Installation

```bash
# Create a file with URLs
cat > skills.txt << EOF
https://github.com/owner/repo1/tree/main/skill1
https://github.com/owner/repo2/tree/main/skill2
EOF

# Install all skills
while read url; do
  npx applyai-skills install "$url"
done < skills.txt
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Install skills
  run: |
    npx applyai-skills install ${{ secrets.SKILL_URL }}
```

## Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Test individual functions and modules
- **Integration Tests**: Test the complete download workflow
- **Error Handling Tests**: Verify error scenarios are handled correctly

Run tests with:

```bash
npm test
```

## Technology Stack

- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment
- **Commander.js** - CLI framework
- **Axios** - HTTP client for API calls
- **fs-extra** - Enhanced file system operations
- **Jest** - Testing framework
- **Chalk** - Terminal string styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

## Acknowledgments

- Built with ❤️ using TypeScript
- Inspired by the need for selective GitHub directory downloads
