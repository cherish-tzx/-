import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { DiffEngine } from './diffEngine'

describe('DiffEngine - Property Tests', () => {
    const diffEngine = new DiffEngine()

    // Feature: 文档对比优化, Property 3: 相同内容标记为未变化
    describe('Property 3: 相同内容标记为未变化', () => {
        it('对于任意文本，当两个文档内容完全相同时，所有行应该标记为 unchanged', () => {
            fc.assert(
                fc.property(
                    fc.string(),
                    (text) => {
                        const result = diffEngine.computeDiff(text, text)

                        // 所有左侧行应该标记为 unchanged
                        result.leftLines.forEach(line => {
                            expect(line.type).toBe('unchanged')
                        })

                        // 所有右侧行应该标记为 unchanged
                        result.rightLines.forEach(line => {
                            expect(line.type).toBe('unchanged')
                        })

                        // 左右两侧行数应该相同
                        expect(result.leftLines.length).toBe(result.rightLines.length)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意多行文本，当内容相同时，所有行都应该标记为 unchanged', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
                    (lines) => {
                        const text = lines.join('\n')
                        const result = diffEngine.computeDiff(text, text)

                        result.leftLines.forEach(line => {
                            expect(line.type).toBe('unchanged')
                        })

                        result.rightLines.forEach(line => {
                            expect(line.type).toBe('unchanged')
                        })
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意文本，当仅格式不同时（空白差异），应该标记为 unchanged', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 1, maxLength: 5 }),
                    (words) => {
                        const text1 = words.join(' ')
                        const text2 = words.join('  ') // 双空格
                        const result = diffEngine.computeDiff(text1, text2)

                        // 由于规范化，应该被视为相同
                        result.leftLines.forEach(line => {
                            expect(line.type).toBe('unchanged')
                        })

                        result.rightLines.forEach(line => {
                            expect(line.type).toBe('unchanged')
                        })
                    }
                ),
                { numRuns: 100 }
            )
        })
    })
})
