import { DiffResult } from '../types'
import { textNormalizer } from './textNormalizer'

/**
 * 相似度计算器类
 */
export class SimilarityCalculator {
    /**
     * 计算文件相似度（使用 LCS 算法）
     * @param diffResult 差异结果
     * @returns 相似度百分比（0-100）
     */
    calculate(diffResult: DiffResult): number {
        const { leftLines, rightLines } = diffResult

        const lines1 = leftLines.map(line => line.content)
        const lines2 = rightLines.map(line => line.content)

        return this.calculateFromLines(lines1, lines2)
    }

    /**
     * 基于两个文本内容直接计算相似度（使用规范化文本和 LCS）
     * @param content1 第一个文件的内容
     * @param content2 第二个文件的内容
     * @returns 相似度百分比（0-100）
     */
    calculateFromContent(content1: string, content2: string): number {
        const normalizedContent1 = textNormalizer.normalizeText(content1)
        const normalizedContent2 = textNormalizer.normalizeText(content2)

        const lines1 = textNormalizer.normalizeToLines(normalizedContent1)
        const lines2 = textNormalizer.normalizeToLines(normalizedContent2)

        return this.calculateFromLines(lines1, lines2)
    }

    /**
     * 基于行数组计算相似度（使用 LCS 算法）
     * @param lines1 第一个文件的行数组
     * @param lines2 第二个文件的行数组
     * @returns 相似度百分比（0-100）
     */
    private calculateFromLines(lines1: string[], lines2: string[]): number {
        const totalLines = lines1.length + lines2.length

        if (totalLines === 0) {
            return 100
        }

        const lcsLength = this.longestCommonSubsequence(lines1, lines2)
        const similarity = (2 * lcsLength / totalLines) * 100

        return Math.max(0, Math.min(100, similarity))
    }

    /**
     * 计算最长公共子序列（LCS）的长度
     * @param lines1 第一个文件的行数组
     * @param lines2 第二个文件的行数组
     * @returns LCS 的长度
     */
    private longestCommonSubsequence(lines1: string[], lines2: string[]): number {
        const m = lines1.length
        const n = lines2.length

        if (m === 0 || n === 0) {
            return 0
        }

        const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (lines1[i - 1] === lines2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
                }
            }
        }

        return dp[m][n]
    }
}

// 导出单例实例
export const similarityCalculator = new SimilarityCalculator()
