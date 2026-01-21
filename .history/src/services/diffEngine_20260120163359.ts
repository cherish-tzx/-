import { diffLines, diffChars, Change } from 'diff'
import { DiffResult, DiffLine, InlineChange } from '../types'
import { textNormalizer } from './textNormalizer'

/**
 * 差异对比引擎类
 */
export class DiffEngine {
    /**
     * 计算两个文本内容的差异
     * @param content1 第一个文件的内容
     * @param content2 第二个文件的内容
     * @returns 差异结果
     */
    computeDiff(content1: string, content2: string): DiffResult {
        // 规范化文本后再进行对比
        const normalizedContent1 = textNormalizer.normalizeText(content1)
        const normalizedContent2 = textNormalizer.normalizeText(content2)

        const lines1 = normalizedContent1.split('\n').filter(line => line.length > 0)
        const lines2 = normalizedContent2.split('\n').filter(line => line.length > 0)

        const { leftLines, rightLines } = this.lineDiff(lines1, lines2)

        // 计算变化的行数
        const changedLines = leftLines.filter(
            line => line.type !== 'unchanged'
        ).length

        const totalLines = Math.max(lines1.length, lines2.length)

        return {
            leftLines,
            rightLines,
            similarity: 0, // 将由 SimilarityCalculator 计算
            totalLines,
            changedLines
        }
    }

    /**
     * 执行逐行差异对比
     * @param lines1 第一个文件的行数组
     * @param lines2 第二个文件的行数组
     * @returns 左右两侧的差异行数组
     */
    private lineDiff(lines1: string[], lines2: string[]): {
        leftLines: DiffLine[]
        rightLines: DiffLine[]
    } {
        const leftLines: DiffLine[] = []
        const rightLines: DiffLine[] = []

        // 使用 diff 库进行行级对比
        const changes = diffLines(lines1.join('\n'), lines2.join('\n'))

        let leftLineNumber = 1
        let rightLineNumber = 1

        changes.forEach(change => {
            const lines = change.value.split('\n').filter((line, index, arr) => {
                // 移除最后一个空行（由 split 产生）
                return index < arr.length - 1 || line !== ''
            })

            if (change.added) {
                // 新增的行
                lines.forEach(line => {
                    rightLines.push({
                        lineNumber: rightLineNumber++,
                        content: line,
                        type: 'added',
                        changes: undefined
                    })
                })
            } else if (change.removed) {
                // 删除的行
                lines.forEach(line => {
                    leftLines.push({
                        lineNumber: leftLineNumber++,
                        content: line,
                        type: 'removed',
                        changes: undefined
                    })
                })
            } else {
                // 未变化的行
                lines.forEach(line => {
                    leftLines.push({
                        lineNumber: leftLineNumber++,
                        content: line,
                        type: 'unchanged',
                        changes: undefined
                    })
                    rightLines.push({
                        lineNumber: rightLineNumber++,
                        content: line,
                        type: 'unchanged',
                        changes: undefined
                    })
                })
            }
        })

        // 检测修改的行（在相同位置但内容不同）
        this.detectModifiedLines(leftLines, rightLines)

        return { leftLines, rightLines }
    }

    /**
     * 检测并标记修改的行
     * @param leftLines 左侧行数组
     * @param rightLines 右侧行数组
     */
    private detectModifiedLines(leftLines: DiffLine[], rightLines: DiffLine[]): void {
        let leftIndex = 0
        let rightIndex = 0

        while (leftIndex < leftLines.length && rightIndex < rightLines.length) {
            const leftLine = leftLines[leftIndex]
            const rightLine = rightLines[rightIndex]

            // 如果左侧是删除，右侧是新增，且它们相邻，可能是修改
            if (leftLine.type === 'removed' && rightLine.type === 'added') {
                // 计算相似度，如果相似度高，认为是修改
                const similarity = this.calculateLineSimilarity(leftLine.content, rightLine.content)

                if (similarity > 0.3) { // 相似度阈值
                    // 标记为修改
                    leftLine.type = 'modified'
                    rightLine.type = 'modified'

                    // 计算行内差异
                    leftLine.changes = this.inlineDiff(leftLine.content, rightLine.content)
                    rightLine.changes = this.inlineDiff(leftLine.content, rightLine.content)
                }

                leftIndex++
                rightIndex++
            } else if (leftLine.type === 'removed') {
                leftIndex++
            } else if (rightLine.type === 'added') {
                rightIndex++
            } else {
                leftIndex++
                rightIndex++
            }
        }
    }

    /**
     * 计算两行文本的相似度
     * @param line1 第一行文本
     * @param line2 第二行文本
     * @returns 相似度（0-1）
     */
    private calculateLineSimilarity(line1: string, line2: string): number {
        const maxLength = Math.max(line1.length, line2.length)
        if (maxLength === 0) return 1

        const changes = diffChars(line1, line2)
        const unchangedLength = changes
            .filter(change => !change.added && !change.removed)
            .reduce((sum, change) => sum + change.value.length, 0)

        return unchangedLength / maxLength
    }

    /**
     * 计算行内字符级差异
     * @param line1 第一行文本
     * @param line2 第二行文本
     * @returns 行内变化数组
     */
    private inlineDiff(line1: string, line2: string): InlineChange[] {
        const changes = diffChars(line1, line2)
        const inlineChanges: InlineChange[] = []

        changes.forEach(change => {
            if (change.added) {
                inlineChanges.push({
                    value: change.value,
                    type: 'added'
                })
            } else if (change.removed) {
                inlineChanges.push({
                    value: change.value,
                    type: 'removed'
                })
            } else {
                inlineChanges.push({
                    value: change.value,
                    type: 'unchanged'
                })
            }
        })

        return inlineChanges
    }
}

// 导出单例实例
export const diffEngine = new DiffEngine()
