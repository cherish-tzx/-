import { DiffResult } from '../types'

/**
 * 相似度计算器类
 */
export class SimilarityCalculator {
    /**
     * 计算文件相似度
     * @param diffResult 差异结果
     * @returns 相似度百分比（0-100）
     */
    calculate(diffResult: DiffResult): number {
        const { totalLines, changedLines } = diffResult

        if (totalLines === 0) {
            return 100
        }

        const unchangedLines = totalLines - changedLines
        const similarity = (unchangedLines / totalLines) * 100

        // 确保结果在 0-100 范围内
        return Math.max(0, Math.min(100, similarity))
    }

    /**
     * 基于两个文本内容直接计算相似度
     * @param content1 第一个文件的内容
     * @param content2 第二个文件的内容
     * @returns 相似度百分比（0-100）
     */
    calculateFromContent(content1: string, content2: string): number {
        const lines1 = content1.split('\n')
        const lines2 = content2.split('\n')

        const totalLines = Math.max(lines1.length, lines2.length)

        if (totalLines === 0) {
            return 100
        }

        // 简单的行匹配计算
        let matchedLines = 0
        const minLength = Math.min(lines1.length, lines2.length)

        for (let i = 0; i < minLength; i++) {
            if (lines1[i] === lines2[i]) {
                matchedLines++
            }
        }

        const similarity = (matchedLines / totalLines) * 100
        return Math.max(0, Math.min(100, similarity))
    }
}

// 导出单例实例
export const similarityCalculator = new SimilarityCalculator()
