import { describe, it, expect } from 'vitest'
import { DiffEngine } from './diffEngine'

describe('DiffEngine - Unit Tests', () => {
    const diffEngine = new DiffEngine()

    describe('边界情况', () => {
        it('应该处理空文档对比', () => {
            const result = diffEngine.computeDiff('', '')

            expect(result.leftLines.length).toBe(0)
            expect(result.rightLines.length).toBe(0)
            expect(result.similarity).toBe(0) // DiffEngine 返回 0，由 SimilarityCalculator 计算实际相似度
        })

        it('应该处理单行文档', () => {
            const text = 'hello world'
            const result = diffEngine.computeDiff(text, text)

            expect(result.leftLines.length).toBe(1)
            expect(result.rightLines.length).toBe(1)
            expect(result.leftLines[0].type).toBe('unchanged')
            expect(result.rightLines[0].type).toBe('unchanged')
        })

        it('应该处理空文档与非空文档对比', () => {
            const result = diffEngine.computeDiff('', 'hello\nworld')

            expect(result.leftLines.length).toBe(0)
            expect(result.rightLines.length).toBe(2)
            result.rightLines.forEach(line => {
                expect(line.type).toBe('added')
            })
        })

        it('应该处理非空文档与空文档对比', () => {
            const result = diffEngine.computeDiff('hello\nworld', '')

            expect(result.leftLines.length).toBe(2)
            expect(result.rightLines.length).toBe(0)
            result.leftLines.forEach(line => {
                expect(line.type).toBe('removed')
            })
        })
    })

    describe('复杂差异场景', () => {
        it('应该正确处理混合变更（新增、删除、修改）', () => {
            const text1 = 'line1\nline2\nline3\nline4'
            const text2 = 'line1\nmodified line2\nline4\nline5'

            const result = diffEngine.computeDiff(text1, text2)

            expect(result.leftLines.some(line => line.type === 'unchanged')).toBe(true)
            expect(result.leftLines.some(line => line.type === 'removed' || line.type === 'modified')).toBe(true)
            expect(result.rightLines.some(line => line.type === 'added' || line.type === 'modified')).toBe(true)
        })

        it('应该正确处理多行删除', () => {
            const text1 = 'line1\nline2\nline3\nline4\nline5'
            const text2 = 'line1\nline5'

            const result = diffEngine.computeDiff(text1, text2)

            const removedCount = result.leftLines.filter(line => line.type === 'removed').length
            expect(removedCount).toBeGreaterThan(0)
        })

        it('应该正确处理多行新增', () => {
            const text1 = 'line1\nline5'
            const text2 = 'line1\nline2\nline3\nline4\nline5'

            const result = diffEngine.computeDiff(text1, text2)

            const addedCount = result.rightLines.filter(line => line.type === 'added').length
            expect(addedCount).toBeGreaterThan(0)
        })

        it('应该正确处理行顺序变化', () => {
            const text1 = 'line1\nline2\nline3'
            const text2 = 'line3\nline2\nline1'

            const result = diffEngine.computeDiff(text1, text2)

            expect(result.leftLines.length).toBe(3)
            expect(result.rightLines.length).toBe(3)
        })
    })

    describe('修改检测', () => {
        it('应该将相似度大于 50% 的行标记为 modified', () => {
            const text1 = 'hello world test'
            const text2 = 'hello world testing'

            const result = diffEngine.computeDiff(text1, text2)

            const hasModified = result.leftLines.some(line => line.type === 'modified') ||
                result.rightLines.some(line => line.type === 'modified')
            expect(hasModified).toBe(true)
        })

        it('应该为 modified 行生成行内差异', () => {
            const text1 = 'hello world'
            const text2 = 'hello universe'

            const result = diffEngine.computeDiff(text1, text2)

            const modifiedLines = [...result.leftLines, ...result.rightLines]
                .filter(line => line.type === 'modified')

            modifiedLines.forEach(line => {
                expect(line.changes).toBeDefined()
                expect(Array.isArray(line.changes)).toBe(true)
                expect(line.changes!.length).toBeGreaterThan(0)
            })
        })

        it('应该将相似度低于 50% 的行标记为 added/removed', () => {
            const text1 = 'completely different text'
            const text2 = 'xyz'

            const result = diffEngine.computeDiff(text1, text2)

            const hasAddedOrRemoved =
                result.leftLines.some(line => line.type === 'removed') ||
                result.rightLines.some(line => line.type === 'added')
            expect(hasAddedOrRemoved).toBe(true)
        })
    })

    describe('规范化集成', () => {
        it('应该忽略行尾空白差异', () => {
            const text1 = 'hello world   '
            const text2 = 'hello world'

            const result = diffEngine.computeDiff(text1, text2)

            result.leftLines.forEach(line => {
                expect(line.type).toBe('unchanged')
            })
            result.rightLines.forEach(line => {
                expect(line.type).toBe('unchanged')
            })
        })

        it('应该忽略连续空白差异', () => {
            const text1 = 'hello    world'
            const text2 = 'hello world'

            const result = diffEngine.computeDiff(text1, text2)

            result.leftLines.forEach(line => {
                expect(line.type).toBe('unchanged')
            })
            result.rightLines.forEach(line => {
                expect(line.type).toBe('unchanged')
            })
        })

        it('应该忽略空行', () => {
            const text1 = 'line1\n\n\nline2'
            const text2 = 'line1\nline2'

            const result = diffEngine.computeDiff(text1, text2)

            expect(result.leftLines.length).toBe(2)
            expect(result.rightLines.length).toBe(2)
        })
    })

    describe('行号分配', () => {
        it('应该为左侧行分配正确的行号', () => {
            const text = 'line1\nline2\nline3'
            const result = diffEngine.computeDiff(text, text)

            result.leftLines.forEach((line, index) => {
                expect(line.lineNumber).toBe(index + 1)
            })
        })

        it('应该为右侧行分配正确的行号', () => {
            const text = 'line1\nline2\nline3'
            const result = diffEngine.computeDiff(text, text)

            result.rightLines.forEach((line, index) => {
                expect(line.lineNumber).toBe(index + 1)
            })
        })
    })
})
