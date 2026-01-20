# 文件对比工具 - Vue 3 + TypeScript 版本

基于 Vue 3 和 TypeScript 开发的文件对比工具，支持 Excel 和 Word 文件的内容对比。

## 功能特性

- 支持 Excel 文件格式（.xls, .xlsx）
- 支持 Word 文件格式（.docx）**注意：仅支持 .docx，不支持旧版 .doc**
- 逐行对比，精确识别单行内的变化
- 类似 SVN 的并排对比视图
- 差异高亮显示（新增/删除/修改）
- 相似度百分比计算

## 项目结构

```
vue3-version/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── FileUploader.vue
│   │   ├── DiffViewer.vue
│   │   └── SimilarityDisplay.vue
│   ├── services/            # 业务逻辑服务
│   │   ├── fileParser.ts
│   │   ├── diffEngine.ts
│   │   └── similarityCalculator.ts
│   ├── utils/               # 工具函数
│   │   ├── fileValidator.ts
│   │   └── errorHandler.ts
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.json
```

## 安装依赖

```bash
npm install
```

## 运行开发服务器

```bash
npm run dev
```

应用将在 <http://localhost:3000> 启动

## 构建生产版本

```bash
npm run build
```

## 运行测试

```bash
npm run test
```

## 技术栈

- **框架**: Vue 3
- **语言**: TypeScript
- **构建工具**: Vite
- **测试框架**: Vitest
- **Excel 解析**: xlsx (SheetJS)
- **Word 解析**: mammoth.js
- **差异对比**: diff (jsdiff)
