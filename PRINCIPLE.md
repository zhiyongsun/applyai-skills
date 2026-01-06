# 工作原理说明

## 1. npx 运行机制

### 是否需要发布？

**两种使用方式：**

#### 方式一：发布到 npm（推荐用于生产环境）
```bash
# 1. 构建项目
npm run build

# 2. 发布到 npm
npm publish

# 3. 用户可以直接使用
npx applyai-skills install <url>
```

**原理：**
- `npx` 会从 npm  registry 下载包
- 如果包不存在本地缓存，会临时下载并执行
- 执行完成后可以选择保留或删除缓存

#### 方式二：本地开发测试（无需发布）
```bash
# 1. 构建项目
npm run build

# 2. 本地链接
npm link

# 3. 在任何目录使用
npx applyai-skills install <url>
```

**原理：**
- `npm link` 会在全局创建一个符号链接
- 指向当前项目的 `dist/bin/applyai-skills.js`
- `npx` 会优先使用全局链接的包

## 2. CLI 工具执行流程

```
用户输入: npx applyai-skills install <github-url>
    ↓
1. npx 查找并执行 bin/applyai-skills.js
    ↓
2. Commander.js 解析命令行参数
    - 提取 <url> 参数
    ↓
3. 调用 install(url) 函数
    ↓
4. parseGitHubUrl(url) 解析 URL
    - 提取: owner, repo, branch, path
    - 提取目录名: directoryName
    ↓
5. downloadFromGitHub() 下载文件
    ↓
6. 递归下载目录内容
    - 调用 GitHub API 获取目录列表
    - 遍历每个文件/目录
    - 下载文件或递归处理子目录
    ↓
7. 保存到本地
    - 在当前目录创建 directoryName 文件夹
    - 保持原始目录结构
```

## 3. GitHub API 调用原理

### API 端点
```
GET https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}
```

### 响应格式
```json
[
  {
    "name": "file.txt",
    "path": "jira-safe/jira-workflow/file.txt",
    "type": "file",
    "download_url": "https://raw.githubusercontent.com/..."
  },
  {
    "name": "subdir",
    "path": "jira-safe/jira-workflow/subdir",
    "type": "dir",
    "download_url": null
  }
]
```

### 递归下载流程
```
getDirectoryContents(owner, repo, branch, path)
    ↓
返回文件列表
    ↓
遍历每个项目:
    ├─ type === 'file' → downloadFile(download_url)
    └─ type === 'dir'  → downloadDirectory(递归调用)
```

## 4. 文件系统操作

### 目录结构保持
- 使用 `fs-extra` 确保目录存在
- 使用 `path.join()` 构建完整路径
- 递归创建所有必要的父目录

### 文件下载
- 使用 `axios` 下载文件内容（arraybuffer）
- 直接写入文件系统
- 保持原始文件内容

## 5. 构建流程

```
TypeScript 源码 (.ts)
    ↓
tsc 编译
    ↓
JavaScript 输出 (.js)
    ↓
fix-bin-imports.js 修复导入路径
    ↓
可执行的 CLI 工具
```

### 为什么需要 fix-bin-imports.js？

**问题：**
- `bin/applyai-skills.ts` 中导入 `../src/index`
- 编译后 `bin/applyai-skills.js` 在 `dist/bin/` 目录
- 但 `src/index.js` 编译到 `dist/index.js`
- 所以需要将 `../src/index` 改为 `../index`

**解决方案：**
- 构建后脚本自动替换导入路径
- 确保运行时能正确找到模块

## 6. 错误处理

### URL 解析错误
- 格式验证：正则表达式匹配
- 路径验证：确保能提取目录名

### GitHub API 错误
- 404: 目录不存在
- 403: API 限流
- 网络错误：连接失败

### 文件系统错误
- 目录已存在：防止覆盖
- 权限错误：写入失败
- 磁盘空间：存储不足

## 7. 使用场景

### 场景一：安装技能包
```bash
npx applyai-skills install https://github.com/owner/repo/tree/main/path/to/skill
```

### 场景二：批量安装
```bash
# 可以创建脚本批量安装多个技能
for url in $(cat skills.txt); do
  npx applyai-skills install $url
done
```

### 场景三：CI/CD 集成
```yaml
# GitHub Actions 示例
- name: Install skills
  run: |
    npx applyai-skills install ${{ secrets.SKILL_URL }}
```

## 8. 优势

1. **无需克隆整个仓库**：只下载需要的目录
2. **保持目录结构**：递归下载子目录
3. **类型安全**：TypeScript 提供类型检查
4. **易于使用**：npx 一键执行
5. **错误友好**：清晰的错误提示
