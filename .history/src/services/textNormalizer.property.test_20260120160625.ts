import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { TextNormalizer } from './textNormalizer'

describe('TextNormalizer - Property Tests', () => {
    const normalizer = new TextNormalizer()

    // Feature: 文档对比优化, Property 1: 规范化保持幂等性
    describe('Property 1: 规范化保持幂等性', () => {
        it('对于任意文本，规范化两次应该与规范化一次产生相同结果', () => {
            fc.assert(
                fc.property(
                    fc.string(),
                    (text) => {
                        const normalizedOnce = normalizer.normalizeText(text)
                        const normalizedTwice = normalizer.normalizeText(normalizedOnce)
                        expect(normalizedOnce).toBe(normalizedTwice)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意单行文本，规范化两次应该与规范化一次产生相同结果', () => {
            fc.assert(
                fc.property(
                    fc.string(),
                    (line) => {
                        const normalizedOnce = normalizer.normalizeLine(line)
                        const normalizedTwice = normalizer.normalizeLine(normalizedOnce)
                        expect(normalizedOnce).toBe(normalizedTwice)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意文本，normalizeToLines 两次应该与一次产生相同结果', () => {
            fc.assert(
                fc.property(
                    fc.string(),
                    (text) => {
                        const linesOnce = normalizer.normalizeToLines(text)
                        const linesTwice = normalizer.normalizeToLines(linesOnce.join('\n'))
                        expect(linesOnce).toEqual(linesTwice)
                    }
                ),
                { numRuns: 100 }
            )
        })
    })
})

// Feature: 文档对比优化, Property 2: 规范化移除格式保留内容
describe('Property 2: 规范化移除格式保留内容', () => {
    it('对于任意包含行尾空白的文本，规范化后应该移除行尾空白', () => {
        fc.assert(
            fc.property(
                fc.string().filter(s => s.trim().length > 0),
                fc.constantFrom(' ', '\t', '  ', '\t\t', ' \t '),
                (content, whitespace) => {
                    const lineWithTrailing = content + whitespace
                    const normalized = normalizer.normalizeLine(lineWithTrailing)
                    expect(normalized).not.toMatch(/[ \t]$/)
                    expect(normalized.trimEnd()).toBe(normalized)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('对于任意包含连续空白的文本，规范化后应该压缩为单个空格', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 2, maxLength: 5 }),
                fc.constantFrom('  ', '\t', '   ', '\t\t', ' \t ', '    '),
                (words, separator) => {
                    const lineWithMultipleSpaces = words.join(separator)
                    const normalized = normalizer.normalizeLine(lineWithMultipleSpaces)
                    expect(normalized).not.toMatch(/[ \t]{2,}/)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('对于任意包含空行的文本，规范化后应该移除空行', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.oneof(
                        fc.string().filter(s => s.trim().length > 0),
                        fc.constant('')
                    ),
                    { minLength: 1, maxLength: 10 }
                ),
                (lines) => {
                    const text = lines.join('\n')
                    const normalizedLines = normalizer.normalizeToLines(text)
                    normalizedLines.forEach(line => {
                        expect(line.length).toBeGreaterThan(0)
                    })
                }
            ),
            { numRuns: 100 }
        )
    })

    it('对于任意文本，规范化后应该保留所有非空白内容', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
                (contentWords) => {
                    const text = contentWords.join('  \n  ')
                    const normalized = normalizer.normalizeText(text)

                    contentWords.forEach(word => {
                        const trimmedWord = word.trim()
                        if (trimmedWord.length > 0) {
                            expect(normalized).toContain(trimmedWord)
                        }
                    })
                }
            ),
            { numRuns: 100 }
        )
    })

    it('对于任意文本，规范化不应该改变非空白字符的顺序', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 2, maxLength: 5 }),
                (words) => {
                    const text = words.join('   ')
                    const normalized = normalizer.normalizeText(text)
                    const normalizedWords = normalized.split(' ').filter(w => w.length > 0)

                    expect(normalizedWords.length).toBe(words.length)
                    normalizedWords.forEach((word, index) => {
                        expect(word).toBe(words[index].trim())
                    })
                }
            ),
            { numRuns: 100 }
        )
    })
})
