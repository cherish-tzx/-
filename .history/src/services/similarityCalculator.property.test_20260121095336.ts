import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { SimilarityCalculator } from './similarityCalculator'

describe('SimilarityCalculator - Property Tests', () => {
    const calculator = new SimilarityCalculator()

    // Feature: 文档对比优化, Property 7: 相似度基于规范化文本
    describe('Property 7: 相似度基于规范化文本', () => {
        it('对于任意两个仅格式不同的文档（内容相同），相似度应该为 100%', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
                    (words) => {
                        const text1 = words.join(' ')
                        const text2 = words.join('  ') // 双空格

                        const similarity = calculator.calculateFromContent(text1, text2)

                        expect(similarity).toBe(100)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意文本，添加行尾空白不应该影响相似度', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 1, maxLength: 5 }),
                    (lines) => {
                        const text1 = lines.join('\n')
                        const text2 = lines.map(line => line + '   ').join('\n')

                        const similarity = calculator.calculateFromContent(text1, text2)

                        expect(similarity).toBe(100)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意文本，添加空行不应该影响相似度', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 1, maxLength: 5 }),
                    (lines) => {
                        const text1 = lines.join('\n')
                        const text2 = lines.join('\n\n\n')

                        const similarity = calculator.calculateFromContent(text1, text2)

                        expect(similarity).toBe(100)
                    }
                ),
                { numRuns: 100 }
            )
        })
    })
})
