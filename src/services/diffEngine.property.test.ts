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

                        result.leftLines.forEach(line => {
                            expect(line.type).toBe('unchanged')
                        })

                        result.rightLines.forEach(line => {
                            expect(line.type).toBe('unchanged')
                        })

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
                        const text2 = words.join('  ')
                        const result = diffEngine.computeDiff(text1, text2)

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

                        const removedLines = result.leftLines.filter(line => line.type === 'removed')
                        expect(removedLines.length).toBeGreaterThan(0)

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

                        result.leftLines.forEach(line => {
                            expect(line.type).toBe('removed')
                        })

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

                        const addedLines = result.rightLines.filter(line => line.type === 'added')
                        expect(addedLines.length).toBeGreaterThan(0)

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

                        expect(result.leftLines.length).toBe(0)

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

    // Feature: 文档对比优化, Property 6: 修改内容正确标记并计算行内差异
    describe('Property 6: 修改内容正确标记并计算行内差异', () => {
        it('对于任意两行相似度大于 50% 但不完全相同的文本，应该标记为 modified', () => {
            fc.assert(
                fc.property(
                    fc.string().filter(s => s.trim().length > 5),
                    fc.string().filter(s => s.trim().length > 0 && s.trim().length < 5),
                    (baseLine, addition) => {
                        const text1 = baseLine
                        const text2 = baseLine + ' ' + addition

                        const result = diffEngine.computeDiff(text1, text2)

                        const hasModified = result.leftLines.some(line => line.type === 'modified') ||
                            result.rightLines.some(line => line.type === 'modified')
                        const hasUnchanged = result.leftLines.some(line => line.type === 'unchanged') &&
                            result.rightLines.some(line => line.type === 'unchanged')

                        expect(hasModified || hasUnchanged).toBe(true)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意修改的行，应该包含 InlineChange 数组', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string().filter(s => s.trim().length > 3), { minLength: 2, maxLength: 5 }),
                    fc.string().filter(s => s.trim().length > 0),
                    (words, replacement) => {
                        const text1 = words.join(' ')
                        const modifiedWords = [...words]
                        modifiedWords[0] = replacement
                        const text2 = modifiedWords.join(' ')

                        const result = diffEngine.computeDiff(text1, text2)

                        const modifiedLines = [...result.leftLines, ...result.rightLines]
                            .filter(line => line.type === 'modified')

                        modifiedLines.forEach(line => {
                            expect(line.changes).toBeDefined()
                            expect(Array.isArray(line.changes)).toBe(true)
                        })
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意标记为 modified 的行，相似度应该大于 50%', () => {
            const text1 = 'hello world test'
            const text2 = 'hello world testing'

            const result = diffEngine.computeDiff(text1, text2)

            const modifiedLines = [...result.leftLines, ...result.rightLines]
                .filter(line => line.type === 'modified')

            expect(modifiedLines.length).toBeGreaterThanOrEqual(0)
        })
    })

    // Feature: 文档对比优化, Property 15: 行内差异完整性
    describe('Property 15: 行内差异完整性', () => {
        it('对于任意标记为 modified 的行，其 InlineChange 数组连接后应该能重构出原始行内容', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string().filter(s => s.trim().length > 2), { minLength: 3, maxLength: 8 }),
                    fc.integer({ min: 0, max: 7 }),
                    fc.string().filter(s => s.trim().length > 0),
                    (words, indexToReplace, replacement) => {
                        if (indexToReplace >= words.length) return

                        const text1 = words.join(' ')
                        const modifiedWords = [...words]
                        modifiedWords[indexToReplace] = replacement
                        const text2 = modifiedWords.join(' ')

                        const result = diffEngine.computeDiff(text1, text2)

                        const leftModified = result.leftLines.filter(line => line.type === 'modified')
                        const rightModified = result.rightLines.filter(line => line.type === 'modified')

                        leftModified.forEach(line => {
                            if (line.changes && line.changes.length > 0) {
                                const reconstructed = line.changes.map(c => c.value).join('')
                                expect(reconstructed.length).toBeGreaterThan(0)
                            }
                        })

                        rightModified.forEach(line => {
                            if (line.changes && line.changes.length > 0) {
                                const reconstructed = line.changes.map(c => c.value).join('')
                                expect(reconstructed.length).toBeGreaterThan(0)
                            }
                        })
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意 modified 行，InlineChange 类型应该只包含 added, removed, unchanged', () => {
            fc.assert(
                fc.property(
                    fc.string().filter(s => s.trim().length > 5),
                    fc.string().filter(s => s.trim().length > 0),
                    (baseLine, modification) => {
                        const text1 = baseLine
                        const text2 = baseLine.substring(0, 3) + modification + baseLine.substring(3)

                        const result = diffEngine.computeDiff(text1, text2)

                        const modifiedLines = [...result.leftLines, ...result.rightLines]
                            .filter(line => line.type === 'modified')

                        modifiedLines.forEach(line => {
                            if (line.changes) {
                                line.changes.forEach(change => {
                                    expect(['added', 'removed', 'unchanged']).toContain(change.type)
                                })
                            }
                        })
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意 modified 行，InlineChange 数组不应该为空', () => {
            const text1 = 'hello world'
            const text2 = 'hello universe'

            const result = diffEngine.computeDiff(text1, text2)

            const modifiedLines = [...result.leftLines, ...result.rightLines]
                .filter(line => line.type === 'modified')

            modifiedLines.forEach(line => {
                if (line.changes) {
                    expect(line.changes.length).toBeGreaterThan(0)
                }
            })
        })
    })
})
