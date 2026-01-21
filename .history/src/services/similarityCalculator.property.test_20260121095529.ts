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

// Feature: 文档对比优化, Property 8: 完全相同文档相似度为 100%
describe('Property 8: 完全相同文档相似度为 100%', () => {
    it('对于任意文档，与自身对比的相似度应该为 100%', () => {
        fc.assert(
            fc.property(
                fc.string(),
                (text) => {
                    const similarity = calculator.calculateFromContent(text, text)

                    expect(similarity).toBe(100)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('对于任意多行文档，与自身对比的相似度应该为 100%', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string(), { minLength: 1, maxLength: 20 }),
                (lines) => {
                    const text = lines.join('\n')
                    const similarity = calculator.calculateFromContent(text, text)

                    expect(similarity).toBe(100)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('对于空文档，相似度应该为 100%', () => {
        const similarity = calculator.calculateFromContent('', '')
        expect(similarity).toBe(100)
    })
})

// Feature: 文档对比优化, Property 9: 完全不同文档相似度接近 0%
describe('Property 9: 完全不同文档相似度接近 0%', () => {
    it('对于任意两个没有公共行的文档，相似度应该小于 10%', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string().filter(s => s.trim().length > 0 && !s.includes('common')), { minLength: 3, maxLength: 10 }),
                fc.array(fc.string().filter(s => s.trim().length > 0 && s.includes('different')), { minLength: 3, maxLength: 10 }),
                (lines1, lines2) => {
                    const text1 = lines1.join('\n')
                    const text2 = lines2.join('\n')

                    const similarity = calculator.calculateFromContent(text1, text2)

                    expect(similarity).toBeLessThan(10)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('对于完全不同的单行文档，相似度应该为 0%', () => {
        fc.assert(
            fc.property(
                fc.string().filter(s => s.trim().length > 0 && s !== 'xyz'),
                (text) => {
                    const text1 = text
                    const text2 = 'xyz'

                    const similarity = calculator.calculateFromContent(text1, text2)

                    expect(similarity).toBeLessThanOrEqual(10)
                }
            ),
            { numRuns: 100 }
        )
    })
})

// Feature: 文档对比优化, Property 10: LCS 相似度对称性
describe('Property 10: LCS 相似度对称性', () => {
    it('对于任意两个文档 A 和 B，similarity(A, B) 应该等于 similarity(B, A)', () => {
        fc.assert(
            fc.property(
                fc.string(),
                fc.string(),
                (text1, text2) => {
                    const similarity1 = calculator.calculateFromContent(text1, text2)
                    const similarity2 = calculator.calculateFromContent(text2, text1)

                    expect(similarity1).toBe(similarity2)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('对于任意两个多行文档，相似度计算应该对称', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
                fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
                (lines1, lines2) => {
                    const text1 = lines1.join('\n')
                    const text2 = lines2.join('\n')

                    const similarity1 = calculator.calculateFromContent(text1, text2)
                    const similarity2 = calculator.calculateFromContent(text2, text1)

                    expect(similarity1).toBe(similarity2)
                }
            ),
            { numRuns: 100 }
        )
    })
})
})
