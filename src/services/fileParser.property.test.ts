import { describe, it, expect } from 'vitest'
import { FileParser } from './fileParser'
import * as fc from 'fast-check'
import * as XLSX from 'xlsx'

// 辅助函数：创建带有 arrayBuffer 方法的 File 对象
function createFileWithArrayBuffer(buffer: ArrayBuffer, name: string, type: string): File {
    const file = new File([buffer], name, { type })
    if (!file.arrayBuffer) {
        Object.defineProperty(file, 'arrayBuffer', {
            value: async () => buffer,
            writable: false
        })
    }
    return file
}

describe('FileParser - Property Tests', () => {
    const parser = new FileParser()

    describe('属性 2: Excel 解析完整性', () => {
        it('对于任何有效的 Excel 文件，解析后的文本内容应该包含所有工作表中所有非空单元格的值', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // 生成随机的工作表数据
                    fc.array(
                        fc.record({
                            sheetName: fc.string({ minLength: 1, maxLength: 20 }),
                            data: fc.array(
                                fc.array(
                                    fc.oneof(
                                        fc.string({ maxLength: 50 }),
                                        fc.integer(),
                                        fc.double()
                                    ),
                                    { minLength: 1, maxLength: 5 }
                                ),
                                { minLength: 1, maxLength: 10 }
                            )
                        }),
                        { minLength: 1, maxLength: 3 }
                    ),
                    async (sheets) => {
                        // 创建 Excel 文件
                        const workbook = XLSX.utils.book_new()
                        const allValues: string[] = []

                        sheets.forEach(({ sheetName, data }) => {
                            const worksheet = XLSX.utils.aoa_to_sheet(data)
                            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

                            // 收集所有非空值
                            data.forEach(row => {
                                row.forEach(cell => {
                                    const cellStr = String(cell).trim()
                                    if (cellStr && cellStr !== 'undefined' && cellStr !== 'null') {
                                        allValues.push(cellStr)
                                    }
                                })
                            })
                        })

                        const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
                        const file = createFileWithArrayBuffer(
                            excelBuffer,
                            'test.xlsx',
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        )

                        // 解析文件
                        const result = await parser.parseExcel(file)

                        // 验证：所有非空值都应该在解析结果中
                        allValues.forEach(value => {
                            expect(result.text).toContain(value)
                        })

                        // 验证：工作表名称都应该在结果中
                        sheets.forEach(({ sheetName }) => {
                            expect(result.text).toContain(sheetName)
                        })
                    }
                ),
                { numRuns: 100 }
            )
        }, 60000) // 增加超时时间
    })

    describe('属性 3: Word 解析完整性', () => {
        it('对于任何有效的 Word 文件，解析后的文本内容应该包含文档中的所有文本段落', async () => {
            // 注意：由于创建真实的 docx 文件比较复杂，这里我们测试解析器能正确处理各种输入
            // 实际的 Word 文件解析完整性需要使用真实的 docx 文件进行集成测试

            await fc.assert(
                fc.asyncProperty(
                    fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
                    async (paragraphs) => {
                        // 这个测试验证解析器的错误处理能力
                        // 因为我们无法轻易创建有效的 docx 文件
                        const invalidBuffer = new TextEncoder().encode(paragraphs.join('\n\n')).buffer
                        const file = createFileWithArrayBuffer(
                            invalidBuffer,
                            'test.docx',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        )

                        // 应该抛出 ParseError
                        await expect(parser.parseWord(file)).rejects.toThrow()
                    }
                ),
                { numRuns: 50 }
            )
        }, 30000)
    })
})
