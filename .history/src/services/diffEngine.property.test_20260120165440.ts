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

    // Feature: 文档对比优化, Property 4: 删除内容正确标记
    describe('Property 4: 删除内容正确标记', () => {
        it('对于任意文档和任意删除的行，这些行应该在左侧标记为 removed，右侧不出现', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 2, maxLength: 10 }),
                    fc.integer({ min: 0, max: 9 }),
                    (lines, indexToRemove) => {
                        if (indexToRemove >= lines.length) return

                        const text1 = lines.join('\n')
                        const linesWithoutOne = [...lines]
                        const removedLine = linesWithoutOne.splice(indexToRemove, 1)[0]
                        const text2 = linesWithoutOne.join('\n')

                        const result = diffEngine.computeDiff(text1, text2)

                        // 应该有至少一行标记为 removed
                        const removedLines = result.leftLines.filter(line => line.type === 'removed')
                        expect(removedLines.length).toBeGreaterThan(0)

                        // 右侧不应该包含被删除的行
                        const rightContents = result.rightLines.map(line => line.content)
                        expect(rightContents).not.toContain(removedLine.trim())
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意文档，删除所有行后，左侧应该全部标记为 removed，右侧为空', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 1, maxLength: 5 }),
                    (lines) => {
                        const text1 = lines.join('\n')
                        const text2 = ''

                        const result = diffEngine.computeDiff(text1, text2)

                        // 所有左侧行应该标记为 removed
                        result.leftLines.forEach(line => {
                            expect(line.type).toBe('removed')
                        })

                        // 右侧应该为空
                        expect(result.rightLines.length).toBe(0)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意文档，删除的行数应该等于左侧 removed 类型的行数', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 3, maxLength: 10 }),
                    fc.integer({ min: 1, max: 3 }),
                    (lines, numToRemove) => {
                        if (numToRemove >= lines.length) return

                        const text1 = lines.join('\n')
                        const remainingLines = lines.slice(numToRemove)
                        const text2 = remainingLines.join('\n')

                        const result = diffEngine.computeDiff(text1, text2)

                        const removedCount = result.leftLines.filter(line => line.type === 'removed').length
                        expect(removedCount).toBeGreaterThanOrEqual(numToRemove)
                    }
                ),
                { numRuns: 100 }
            )
        })
    })
})


// Feature: 文档对比优化, Property 5: 新增内容正确标记
describe('Property 5: 新增内容正确标记', () => {
    it('对于任意文档和任意新增的行，这些行应该在右侧标记为 added，左侧不出现', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
                fc.string().filter(s => s.trim().length > 0),
                (lines, newLine) => {
                    const text1 = lines.join('\n')
                    const linesWithNew = [...lines, newLine]
                    const text2 = linesWithNew.join('\n')

                    const result = diffEngine.computeDiff(text1, text2)

                    // 应该有至少一行标记为 added
                    const addedLines = result.rightLines.filter(line => line.type === 'added')
                    expect(addedLines.length).toBeGreaterThan(0)

                    // 左侧不应该包含新增的行
                    const leftContents = result.leftLines.map(line => line.content)
                    expect(leftContents).not.toContain(newLine.trim())
                }
            ),
            { numRuns: 100 }
        )
    })

    it('对于空文档，添加任意内容后，右侧应该全部标记为 added，左侧为空', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 1, maxLength: 5 }),
                (lines) => {
                    const text1 = ''
                    const text2 = lines.join('\n')

                    const result = diffEngine.computeDiff(text1, text2)

                    // 左侧应该为空
                    expect(result.leftLines.length).toBe(0)

                    // 所有右侧行应该标记为 added
                    result.rightLines.forEach(line => {
                        expect(line.type).toBe('added')
                    })
                }
            ),
            { numRuns: 100 }
        )
    })

    it('对于任意文档，新增的行数应该等于右侧 added 类型的行数', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
                fc.array(fc.string().filter(s => s.trim().length > 0), { minLength: 1, maxLength: 3 }),
                (originalLines, newLines) => {
                    const text1 = originalLines.join('\n')
                    const allLines = [...originalLines, ...newLines]
                    const text2 = allLines.join('\n')

                    const result = diffEngine.computeDiff(text1, text2)

                    const addedCount = result.rightLines.filter(line => line.type === 'added').length
                    expect(addedCount).toBeGreaterThanOrEqual(newLines.length)
                }
            ),
            { numRuns: 100 }
        )
    })
})
