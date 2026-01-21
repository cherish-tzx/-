# 设计文档

## 概述

本设计优化文档对比系统的核心算法，解决相似度计算不准确、差异识别错误、颜色标记混乱等问题。通过引入文本规范化、改进差异检测算法、使用 LCS 相似度计算，确保对比结果准确可靠。

## 架构

系统采用三层处理架构：

1. **规范化层** - TextNormalizer 负责文本预处理
2. **差异检测层** - DiffEngine 负责计算文本差异
3. **相似度计算层** - SimilarityCalculator 负责计算相似度

```
文件输入 → 解析器 → 规范化器 → 差异引擎 → 相似度计算 → 结果输出
```

## 组件和接口

### TextNormalizer (新增)

文本规范化器，负责统一文本格式。

```typescript
class TextNormalizer {
  // 规范化单行文本
  normalizeLine(line: string): string
  
  // 规范化多行文本
  normalizeText(text: string): string
  
  // 规范化文本为行数组
  normalizeToLines(text: string): string[]
}
```

**规范化规则：**

- 移除行尾空白字符
- 将连续空白字符（空格/制表符）压缩为单个空格
- 移除空行
- 保留文本语义内容

### DiffEngine (优化)

差异检测引擎，计算文本差异。

```typescript
class DiffEngine {
  // 计算差异（使用规范化文本）
  computeDiff(content1: string, content2: string): DiffResult
  
  // 行级差异检测
  private lineDiff(lines1: string[], lines2: string[]): {
    leftLines: DiffLine[]
    rightLines: DiffLine[]
  }
  
  // 检测修改的行（提高阈值到 0.5）
  private detectModifiedLines(leftLines: DiffLine[], rightLines: DiffLine[]): void
  
  // 计算行相似度
  private calculateLineSimilarity(line1: string, line2: string): number
  
  // 行内字符差异
  private inlineDiff(line1: string, line2: string): InlineChange[]
}
```

**关键改进：**

- 在对比前规范化文本
- 修改判定阈值从 0.3 提高到 0.5
- 使用规范化后的文本计算相似度

### SimilarityCalculator (重构)

相似度计算器，使用 LCS 算法。

```typescript
class SimilarityCalculator {
  // 基于 LCS 计算相似度
  calculate(diffResult: DiffResult): number
  
  // 直接从内容计算相似度（使用 LCS）
  calculateFromContent(content1: string, content2: string): number
  
  // LCS 算法实现
  private longestCommonSubsequence(lines1: string[], lines2: string[]): number
}
```

**LCS 相似度公式：**

```
similarity = (2 * LCS_length) / (lines1.length + lines2.length) * 100
```

### FileParser (优化)

文件解析器，增强 Excel 和 Word 处理。

```typescript
class FileParser {
  // Excel 解析（优化单元格处理）
  async parseExcel(file: File): Promise<ParsedContent>
  
  // Word 解析（优化段落处理）
  async parseWord(file: File): Promise<ParsedContent>
  
  // 统一解析接口
  async parse(file: File): Promise<ParsedContent>
}
```

**Excel 优化：**

- 移除单元格前后空白
- 过滤空单元格
- 忽略尾部空单元格

**Word 优化：**

- 提取纯文本
- 规范化段落间空白

## 数据模型

无需修改现有数据模型，继续使用：

```typescript
interface DiffResult {
  leftLines: DiffLine[]
  rightLines: DiffLine[]
  similarity: number
  totalLines: number
  changedLines: number
}

interface DiffLine {
  lineNumber: number
  content: string
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  changes?: InlineChange[]
}

interface InlineChange {
  value: string
  type: 'added' | 'removed' | 'unchanged'
}
```

## 正确性属性

*属性是关于系统应该满足的特征或行为的形式化陈述，适用于所有有效执行。属性是人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1: 规范化保持幂等性

*对于任意* 文本，规范化两次应该与规范化一次产生相同结果
**验证需求: 1.5**

### 属性 2: 规范化移除格式保留内容

*对于任意* 包含空白字符的文本，规范化后应该移除行尾空白、压缩连续空白、移除空行，但保留所有非空白内容
**验证需求: 1.2, 1.3, 1.4**

### 属性 3: 相同内容标记为未变化

*对于任意* 文本，当两个文档内容完全相同时，所有行应该标记为 unchanged
**验证需求: 2.1**

### 属性 4: 删除内容正确标记

*对于任意* 文档和任意删除的行，这些行应该在左侧标记为 removed，右侧不出现
**验证需求: 2.2**

### 属性 5: 新增内容正确标记

*对于任意* 文档和任意新增的行，这些行应该在右侧标记为 added，左侧不出现
**验证需求: 2.3**

### 属性 6: 修改内容正确标记并计算行内差异

*对于任意* 两行相似度大于 50% 但不完全相同的文本，应该标记为 modified 并包含 InlineChange 数组
**验证需求: 2.4**

### 属性 7: 相似度基于规范化文本

*对于任意* 两个仅格式不同的文档（内容相同），相似度应该为 100%
**验证需求: 3.1**

### 属性 8: 完全相同文档相似度为 100%

*对于任意* 文档，与自身对比的相似度应该为 100%
**验证需求: 3.2**

### 属性 9: 完全不同文档相似度接近 0%

*对于任意* 两个没有公共行的文档，相似度应该小于 10%
**验证需求: 3.3**

### 属性 10: LCS 相似度对称性

*对于任意* 两个文档 A 和 B，similarity(A, B) 应该等于 similarity(B, A)
**验证需求: 3.4**

### 属性 11: Excel 单元格清理

*对于任意* Excel 单元格，解析后应该移除前后空白，空单元格和纯空白单元格应该被过滤
**验证需求: 5.1, 5.2**

### 属性 12: Excel 行格式一致性

*对于任意* Excel 行，应该使用制表符分隔非空单元格，忽略尾部空单元格
**验证需求: 5.3, 5.4**

### 属性 13: Word 格式忽略

*对于任意* 两个内容相同但格式不同的 Word 文档，提取的文本应该相同
**验证需求: 6.1, 6.3**

### 属性 14: Word 段落结构保留

*对于任意* Word 文档，提取文本应该保留段落边界，规范化段落间空白
**验证需求: 6.2, 6.4**

### 属性 15: 行内差异完整性

*对于任意* 标记为 modified 的行，其 InlineChange 数组连接后应该能重构出原始行内容
**验证需求: 4.5**

## 错误处理

### 规范化错误

- 空文本输入返回空字符串
- null/undefined 输入抛出错误

### 差异检测错误

- 空文档对比返回空差异结果
- 无效输入抛出 ParseError

### 相似度计算错误

- 空文档相似度返回 100%
- 除零保护

### 文件解析错误

- 保持现有错误处理机制
- 增强错误消息可读性

## 测试策略

### 双重测试方法

系统使用单元测试和基于属性的测试相结合的方法：

**单元测试：**

- 验证特定示例和边界情况
- 测试错误条件
- 验证组件集成点
- 关注具体场景（如：空文档、单行文档）

**基于属性的测试：**

- 验证跨所有输入的通用属性
- 通过随机化实现全面的输入覆盖
- 每个属性测试最少 100 次迭代
- 使用 fast-check 库进行 TypeScript 属性测试

**测试标注格式：**
每个属性测试必须使用注释引用设计文档属性：

```typescript
// Feature: 文档对比优化, Property 1: 规范化保持幂等性
```

### 测试覆盖范围

**TextNormalizer 测试：**

- 属性 1: 幂等性测试
- 属性 2: 格式移除测试
- 单元测试: 边界情况（空字符串、纯空白）

**DiffEngine 测试：**

- 属性 3-6: 差异类型标记测试
- 属性 15: 行内差异完整性测试
- 单元测试: 复杂差异场景

**SimilarityCalculator 测试：**

- 属性 7-10: 相似度计算测试
- 单元测试: LCS 算法边界情况

**FileParser 测试：**

- 属性 11-14: Excel 和 Word 解析测试
- 单元测试: 文件格式错误处理

### 测试工具

- **测试框架**: Vitest
- **属性测试库**: fast-check
- **最小迭代次数**: 100 次/属性
- **覆盖率目标**: 核心逻辑 90%+
