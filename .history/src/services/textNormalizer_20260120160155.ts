/**
 * 文本规范化器
 * 负责统一文本格式，移除无意义的空白差异
 */
export class TextNormalizer {
    /**
     * 规范化单行文本
     * - 移除行尾空白字符
     * - 将连续空白字符压缩为单个空格
     * @param line 原始文本行
     * @returns 规范化后的文本行
     */
    normalizeLine(line: string): string {
        return line
            .trimEnd()
            .replace(/[ \t]+/g, ' ')
    }

    /**
     * 规范化多行文本
     * - 规范化每一行
     * - 移除空行
     * - 保留文本语义内容
     * @param text 原始文本
     * @returns 规范化后的文本
     */
    normalizeText(text: string): string {
        return text
            .split('\n')
            .map(line => this.normalizeLine(line))
            .filter(line => line.length > 0)
            .join('\n')
    }

    /**
     * 规范化文本为行数组
     * - 规范化文本
     * - 分割为行数组
     * @param text 原始文本
     * @returns 规范化后的行数组
     */
    normalizeToLines(text: string): string[] {
        return text
            .split('\n')
            .map(line => this.normalizeLine(line))
            .filter(line => line.length > 0)
    }
}

// 导出单例实例
export const textNormalizer = new TextNormalizer()
