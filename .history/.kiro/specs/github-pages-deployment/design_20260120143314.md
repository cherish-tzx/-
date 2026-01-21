# Design Document: GitHub Pages Deployment

## Overview

本设计文档描述如何配置 Vite 项目以支持 GitHub Pages 部署，包括正确的基础路径配置、构建优化和自动化部署流程。

## Architecture

部署架构包含以下关键组件：

1. **Vite 配置层**: 配置 base 路径和构建选项
2. **构建脚本层**: 自动化构建和部署流程
3. **GitHub Pages 托管层**: 静态文件托管服务

```
┌─────────────────┐
│  Source Code    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vite Build     │ ← base path 配置
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  dist/ 目录     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  gh-pages 分支  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub Pages   │
└─────────────────┘
```

## Components and Interfaces

### 1. Vite 配置 (vite.config.ts)

**职责**: 配置构建选项和基础路径

**配置项**:

- `base`: 根据环境变量设置基础路径
- `build.outDir`: 输出目录（默认 dist）
- `build.assetsDir`: 静态资源目录

**接口**:

```typescript
interface ViteConfig {
  base: string;  // '/' for dev, '/repo-name/' for production
  build: {
    outDir: string;
    assetsDir: string;
  };
}
```

### 2. 部署脚本 (deploy.sh)

**职责**: 自动化构建和部署流程

**步骤**:

1. 执行 `npm run build` 构建生产版本
2. 进入 dist 目录
3. 初始化 git 仓库
4. 提交所有文件
5. 强制推送到 gh-pages 分支

### 3. Package.json 脚本

**职责**: 提供便捷的命令行接口

**新增脚本**:

- `deploy`: 执行部署脚本

## Data Models

### 环境变量

```typescript
interface DeploymentEnv {
  VITE_BASE_PATH?: string;  // 可选的基础路径覆盖
  NODE_ENV: 'development' | 'production';
}
```

## Correctness Properties

*属性是一种特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性充当人类可读规范和机器可验证正确性保证之间的桥梁。*

### Property 1: 基础路径一致性

*对于任何* 构建环境，所有生成的资源路径都应该使用配置的 base 路径作为前缀

**Validates: Requirements 1.1, 1.2**

### Property 2: 资源路径可访问性

*对于任何* 部署到 GitHub Pages 的应用，所有静态资源（JS、CSS、图片）都应该返回 200 状态码而不是 404

**Validates: Requirements 1.2, 3.2**

### Property 3: 构建幂等性

*对于任何* 相同的源代码，多次执行构建应该产生功能等效的输出

**Validates: Requirements 2.3**

## Error Handling

### 构建错误

- TypeScript 编译错误：在构建前运行 `vue-tsc` 检查
- 依赖缺失：确保 `npm install` 在构建前执行

### 部署错误

- Git 权限错误：确保有推送到仓库的权限
- 分支冲突：使用 force push 覆盖 gh-pages 分支

### 运行时错误

- 404 错误：通过正确的 base 配置避免
- CORS 错误：GitHub Pages 自动处理，无需额外配置

## Testing Strategy

### 单元测试

- 验证 Vite 配置正确导出
- 测试环境变量解析逻辑

### 集成测试

- 本地构建测试：`npm run build && npm run preview`
- 验证构建产物结构
- 检查资源路径前缀

### 手动验证

- 部署后访问 GitHub Pages URL
- 检查浏览器控制台无 404 错误
- 验证应用功能正常

**测试配置**:

- 属性测试使用 fast-check 库
- 每个属性测试运行最少 100 次迭代
- 测试标签格式: **Feature: github-pages-deployment, Property {number}: {property_text}**
