import { describe, it, expect } from 'vitest'
import { SimilarityCalculator } from './similarityCalculator'
import { DiffResult, DiffLine } from '../types'

describe('SimilarityCalculator - Unit Tests', () => {
    const calculator = new SimilarityCalculator()

    describe('LCS 算法边界情况', () => {
        it('应该处理空文档', () => {
            const similarity = calculator.calculateFromContent('', '')
            expect(similarity).toBe(100)
        })

        it('应该处理一个空文档和一个非空文档', () => {
            const similarity = calculator.calculateFromContent('', 'hello\nworld')
            expect(similarity).toBe(0)
        })

        it('应该处理单行文档', () => {
            const similarity = calculator.calculateFromContent('hello', 'hello')
            expect(similarity).toBe(100)
        })

        it('应该处理完全不同的单行文档', () => {
            const similarity = calculator.calculateFromContent('hello', 'world')
            expect(similarity).toBe(0)
        })

        it('应该处理部分相同的多行文档', () => {
            const text1 = 'line1\nline2\nline3'
            const text2 = 'line1\nline3'

            const similarity = calculator.calculateFromContent(text1, text2)

            expect(similarity).toBeGreaterThan(0)
            expect(similarity).toBeLessThan(100)
        })
    })

    describe('除零保护', () => {
        it('应该处理两个空文档而不抛出错误', () => {
            expect(() => {
                calculator.calculateFromContent('', '')
            }).not.toThrow()
        })

        it('应该为空文档返回 100% 相似度', () => {
            const similarity = calculator.calculateFromContent('', '')
            expect(similarity).toBe(100)
        })
    })

    describe('calculate 方法（基于 DiffResult）', () => {
        it('应该基于 DiffResult 计算相似度', () => {
            const leftLines: DiffLine[] = [
                { lineNumber: 1, content: 'line1', type: 'unchanged' },
                { lineNumber: 2, content: 'line2', type: 'unchanged' }
            ]
            const rightLines: DiffLine[] = [
                { lineNumber: 1, content: 'line1', type: 'unchanged' },
                { lineNumber: 2, content: 'line2', type: 'unchanged' }
            ]

            const diffResult: DiffResult = {
                leftLines,
                rightLines,
                similarity: 0,
                totalLines: 2,
                changedLines: 0
            }

            const similarity = calculator.calculate(diffResult)
            expect(similarity).toBe(100)
        })

        it('应该处理空的 DiffResult', () => {
            const diffResult: DiffResult = {
                leftLines: [],
                rightLines: [],
                similarity: 0,
                totalLines: 0,
                changedLines: 0
            }

            const similarity = calculator.calculate(diffResult)
            expect(similarity).toBe(100)
        })

        it('应该处理部分匹配的 DiffResult', () => {
            const leftLines: DiffLine[] = [
                { lineNumber: 1, content: 'line1', type: 'unchanged' },
                { lineNumber: 2, content: 'line2', type: 'removed' }
            ]
            const rightLines: DiffLine[] = [
                { lineNumber: 1, content: 'line1', type: 'unchanged' },
                { lineNumber: 2, content: 'line3', type: 'added' }
            ]

            const diffResult: DiffResult = {
                leftLines,
                rightLines,
                similarity: 0,
                totalLines: 2,
                changedLines: 1
            }

            const similarity = calculator.calculate(diffResult)
            expect(similarity).toBeGreaterThan(0)
            expect(similarity).toBeLessThan(100)
        })
    })

    describe('规范化集成', () => {
        it('应该忽略空白差异', () => {
            const text1 = 'hello   world'
            const text2 = 'hello world'

            const similarity = calculator.calculateFromContent(text1, text2)
            expect(similarity).toBe(100)
        })

        it('应该忽略空行', () => {
            const text1 = 'line1\n\n\nline2'
            const text2 = 'line1\nline2'

            const similarity = calculator.calculateFromContent(text1, text2)
            expect(similarity).toBe(100)
        })

        it('应该忽略行尾空白', () => {
            const text1 = 'line1   \nline2   '
            const text2 = 'line1\nline2'

            const similarity = calculator.calculateFromContent(text1, text2)
            expect(similarity).toBe(100)
        })
    })

    describe('相似度范围', () => {
        it('相似度应该在 0-100 范围内', () => {
            const text1 = 'hello world'
            const text2 = 'hello universe'

            const similarity = calculator.calculateFromContent(text1, text2)

            expect(similarity).toBeGreaterThanOrEqual(0)
            expect(similarity).toBeLessThanOrEqual(100)
        })

        it('完全相同的文档应该返回 100%', () => {
            const text = 'line1\nline2\nline3'
            const similarity = calculator.calculateFromContent(text, text)
            expect(similarity).toBe(100)
        })

        it('完全不同的文档应该返回接近 0%', () => {
            const text1 = 'aaa\nbbb\nccc'
            const text2 = 'xxx\nyyy\nzzz'

            const similarity = calculator.calculateFromContent(text1, text2)
            expect(similarity).toBeLessThan(10)
        })
    })
})
