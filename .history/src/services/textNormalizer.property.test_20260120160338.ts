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
