# applyai-skills

[English](./README.md) | [中文](./README.zh.md)

一个用于从 GitHub 仓库安装技能包的 CLI 工具。无需克隆整个仓库，即可下载指定的目录。

## 功能特性

- 🚀 **简单易用** - 直接从 GitHub URL 安装技能
- 📦 **选择性下载** - 只下载需要的目录，而不是整个仓库
- 🔄 **递归下载** - 自动下载所有文件和子目录
- 📁 **保持结构** - 维持原始目录结构
- ✨ **类型安全** - 使用 TypeScript 构建，更加可靠
- 🎨 **用户友好** - 清晰的错误提示和进度显示

## 安装

### 作为用户

无需安装！直接使用 `npx` 运行：

```bash
npx applyai-skills install <github-url>
```

### 作为开发者

```bash
npm install
```

## 使用方法

### 基本用法

```bash
npx applyai-skills install <github-url>
```

### 示例

```bash
npx applyai-skills install https://github.com/01000001-01001110/agent-jira-skills/tree/main/jira-safe/jira-workflow
```

这将从指定的 GitHub 目录下载所有文件到当前目录，并创建一个名为 `jira-workflow` 的文件夹（使用 URL 中最后一个目录名）。

### 支持的 URL 格式

- `https://github.com/owner/repo/tree/branch/path/to/directory`
- `https://github.com/owner/repo/blob/branch/path/to/file`
- 支持 `http` 和 `https` 协议
- 支持任何分支名（`main`、`master`、`develop` 等）

## 开发

### 前置要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 设置

```bash
# 克隆仓库
git clone <repository-url>
cd applyai-skills

# 安装依赖
npm install

# 构建 TypeScript 代码
npm run build
```

### 可用脚本

```bash
# 构建项目
npm run build

# 运行测试
npm test

# 运行测试（监听模式）
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage

# 本地链接测试
npm link
```

### 项目结构

```
applyai-skills/
├── bin/
│   └── applyai-skills.ts      # CLI 入口文件
├── src/
│   ├── index.ts               # 主逻辑
│   ├── downloader.ts          # GitHub 下载模块
│   ├── utils.ts               # 工具函数
│   └── *.test.ts              # 测试文件
├── scripts/
│   └── fix-bin-imports.js      # 构建后处理脚本
├── tsconfig.json              # TypeScript 配置
└── jest.config.js             # Jest 测试配置
```

## 发布

### 方式一：发布到 npm（生产环境）

```bash
# 1. 构建项目
npm run build

# 2. 发布到 npm
npm publish
```

发布后，用户可以直接使用：

```bash
npx applyai-skills install <github-url>
```

### 方式二：本地开发测试（无需发布）

```bash
# 1. 构建项目
npm run build

# 2. 创建全局符号链接
npm link

# 3. 在任何目录使用
npx applyai-skills install <github-url>
```

## 工作原理

1. **URL 解析**：从 GitHub URL 中提取仓库信息（owner、repo、branch、path）
2. **目录名提取**：使用 URL 路径中最后一个目录名作为目标文件夹名
3. **GitHub API 调用**：使用 GitHub REST API 获取目录内容
4. **递归下载**：下载文件并递归处理子目录
5. **文件系统**：将文件保存到当前工作目录，同时保持原始结构

详细技术文档请查看 [PRINCIPLE.md](./PRINCIPLE.md)。

## 错误处理

工具处理各种错误场景：

- **无效的 URL 格式**：验证 GitHub URL 结构
- **目录未找到**：处理 GitHub API 的 404 错误
- **速率限制**：检测并报告 API 速率限制问题
- **网络错误**：优雅地处理连接失败
- **文件系统错误**：防止覆盖现有目录
- **权限错误**：报告文件系统权限问题

## 使用场景

### 安装技能包

```bash
npx applyai-skills install https://github.com/owner/repo/tree/main/path/to/skill
```

### 批量安装

```bash
# 创建包含 URL 的文件
cat > skills.txt << EOF
https://github.com/owner/repo1/tree/main/skill1
https://github.com/owner/repo2/tree/main/skill2
EOF

# 安装所有技能
while read url; do
  npx applyai-skills install "$url"
done < skills.txt
```

### CI/CD 集成

```yaml
# GitHub Actions 示例
- name: Install skills
  run: |
    npx applyai-skills install ${{ secrets.SKILL_URL }}
```

## 测试

项目包含全面的测试覆盖：

- **单元测试**：测试单个函数和模块
- **集成测试**：测试完整的下载工作流
- **错误处理测试**：验证错误场景是否正确处理

运行测试：

```bash
npm test
```

## 技术栈

- **TypeScript** - 类型安全的 JavaScript
- **Node.js** - 运行时环境
- **Commander.js** - CLI 框架
- **Axios** - HTTP 客户端，用于 API 调用
- **fs-extra** - 增强的文件系统操作
- **Jest** - 测试框架
- **Chalk** - 终端字符串样式

## 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建您的功能分支（`git checkout -b feature/AmazingFeature`）
3. 提交您的更改（`git commit -m 'Add some AmazingFeature'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 LICENSE 文件。

## 支持

如果您遇到任何问题或有疑问，请在 GitHub 上提交 issue。

## 致谢

- 使用 TypeScript 和 ❤️ 构建
- 灵感来源于选择性下载 GitHub 目录的需求
