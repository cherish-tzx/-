# 需求文档

## 简介

文档对比功能存在多个核心问题：相似度计算不准确、差异识别错误、颜色标记混乱、对格式变化过于敏感。需要优化文本规范化、差异检测算法和相似度计算逻辑。

## 术语表

- **System**: 文档对比系统
- **Normalizer**: 文本规范化器
- **DiffEngine**: 差异检测引擎
- **SimilarityCalculator**: 相似度计算器
- **Content**: 文档文本内容
- **Line**: 文本行
- **Whitespace**: 空白字符（空格、制表符、换行符）

## 需求

### 需求 1: 文本规范化

**用户故事:** 作为用户，我希望系统能够忽略无意义的格式差异，这样相同内容不会被误判为不同。

#### 验收标准

1. WHEN 对比两个文档 THEN THE System SHALL 在对比前规范化文本内容
2. WHEN 规范化文本 THEN THE Normalizer SHALL 统一处理行尾空白字符
3. WHEN 规范化文本 THEN THE Normalizer SHALL 统一处理连续空白字符
4. WHEN 规范化文本 THEN THE Normalizer SHALL 移除空行但保留内容行
5. WHEN 规范化文本 THEN THE Normalizer SHALL 保留文本的语义内容

### 需求 2: 准确的差异检测

**用户故事:** 作为用户，我希望系统能够准确识别新增、删除和修改的内容，这样我能清楚看到文档的变化。

#### 验收标准

1. WHEN 一行内容完全相同 THEN THE DiffEngine SHALL 标记为未变化
2. WHEN 一行仅在原文档存在 THEN THE DiffEngine SHALL 标记为删除
3. WHEN 一行仅在新文档存在 THEN THE DiffEngine SHALL 标记为新增
4. WHEN 两行内容相似但不完全相同 THEN THE DiffEngine SHALL 标记为修改并计算行内差异
5. WHEN 判断是否为修改 THEN THE DiffEngine SHALL 使用合理的相似度阈值（50%）

### 需求 3: 精确的相似度计算

**用户故事:** 作为用户，我希望看到准确的文档相似度百分比，这样我能快速了解文档的变化程度。

#### 验收标准

1. WHEN 计算相似度 THEN THE SimilarityCalculator SHALL 基于规范化后的文本
2. WHEN 两个文档完全相同 THEN THE System SHALL 返回 100% 相似度
3. WHEN 两个文档完全不同 THEN THE System SHALL 返回接近 0% 的相似度
4. WHEN 计算相似度 THEN THE SimilarityCalculator SHALL 使用最长公共子序列算法
5. WHEN 文档为空 THEN THE System SHALL 正确处理边界情况

### 需求 4: 正确的颜色标记

**用户故事:** 作为用户，我希望看到正确的颜色标记，这样我能直观区分新增、删除、修改和未变化的内容。

#### 验收标准

1. WHEN 内容为新增 THEN THE System SHALL 使用绿色背景 (#d4edda)
2. WHEN 内容为删除 THEN THE System SHALL 使用红色背景 (#f8d7da)
3. WHEN 内容为修改 THEN THE System SHALL 使用黄色背景 (#fff3cd)
4. WHEN 内容未变化 THEN THE System SHALL 使用白色背景
5. WHEN 显示修改的行 THEN THE System SHALL 高亮显示行内具体变化部分

### 需求 5: Excel 文件特殊处理

**用户故事:** 作为用户，我希望系统能够正确处理 Excel 文件的单元格内容，这样表格对比结果准确。

#### 验收标准

1. WHEN 解析 Excel 单元格 THEN THE System SHALL 移除单元格前后空白
2. WHEN 解析 Excel 空单元格 THEN THE System SHALL 忽略空单元格
3. WHEN 对比 Excel 行 THEN THE System SHALL 忽略尾部空单元格差异
4. WHEN 格式化 Excel 行 THEN THE System SHALL 使用制表符分隔单元格
5. WHEN 单元格仅包含空白 THEN THE System SHALL 视为空单元格

### 需求 6: Word 文件特殊处理

**用户故事:** 作为用户，我希望系统能够正确处理 Word 文件的段落和格式，这样文档对比结果准确。

#### 验收标准

1. WHEN 解析 Word 文档 THEN THE System SHALL 提取纯文本内容
2. WHEN 对比 Word 段落 THEN THE System SHALL 规范化段落间空白
3. WHEN Word 文档包含格式 THEN THE System SHALL 忽略纯格式差异
4. WHEN 提取文本 THEN THE System SHALL 保留段落结构
5. WHEN 处理特殊字符 THEN THE System SHALL 统一字符编码
