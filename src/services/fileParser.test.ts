import { describe, it, expect, beforeEach } from 'vitest'
import { FileParser } from './fileParser'
import { ParseError } from '../types'
import * as XLSX from 'xlsx'

// 辅助函数：创建带有 arrayBuffer 方法的 File 对象
function createFileWithArrayBuffer(buffer: ArrayBuffer, name: string, type: string): File {
    const file = new File([buffer], name, { type })
    // 在测试环境中添加 arrayBuffer 方法
    if (!file.arrayBuffer) {
        Object.defineProperty(file, 'arrayBuffer', {
            value: async () => buffer,
            writable: false
        })
    }
    return file
}

describe('FileParser', () => {
    let parser: FileParser

    beforeEach(() => {
        parser = new FileParser()
    })

    describe('parseExcel', () => {
        it('应该成功解析简单的 Excel 文件', async () => {
            // 创建一个简单的 Excel 文件
            const worksheet = XLSX.utils.aoa_to_sheet([
                ['姓名', '年龄', '城市'],
                ['张三', 25, '北京'],
                ['李四', 30, '上海']
            ])
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
            const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
            const file = createFileWithArrayBuffer(
                excelBuffer,
                'test.xlsx',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )

            const result = await parser.parseExcel(file)

            expect(result.text).toContain('姓名')
            expect(result.text).toContain('张三')
            expect(result.text).toContain('李四')
            expect(result.metadata.sheets).toEqual(['Sheet1'])
        })

        it('应该解析包含多个工作表的 Excel 文件', async () => {
            const worksheet1 = XLSX.utils.aoa_to_sheet([['数据1']])
            const worksheet2 = XLSX.utils.aoa_to_sheet([['数据2']])
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet1, '工作表1')
            XLSX.utils.book_append_sheet(workbook, worksheet2, '工作表2')
            const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
            const file = createFileWithArrayBuffer(
                excelBuffer,
                'test.xlsx',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )

            const result = await parser.parseExcel(file)

            expect(result.text).toContain('工作表1')
            expect(result.text).toContain('工作表2')
            expect(result.text).toContain('数据1')
            expect(result.text).toContain('数据2')
            expect(result.metadata.sheets).toEqual(['工作表1', '工作表2'])
        })

        it('应该处理空单元格', async () => {
            const worksheet = XLSX.utils.aoa_to_sheet([
                ['A', '', 'C'],
                ['', 'B', '']
            ])
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
            const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
            const file = createFileWithArrayBuffer(
                excelBuffer,
                'test.xlsx',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )

            const result = await parser.parseExcel(file)

            expect(result.text).toBeTruthy()
            expect(result.metadata.sheets).toHaveLength(1)
        })

        it('应该在解析失败时抛出 ParseError', async () => {
            const invalidBuffer = new TextEncoder().encode('invalid content').buffer
            const invalidFile = createFileWithArrayBuffer(
                invalidBuffer,
                'test.xlsx',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )

            await expect(parser.parseExcel(invalidFile)).rejects.toThrow(ParseError)
        })
    })

    describe('parseWord', () => {
        it('应该在解析失败时抛出 ParseError', async () => {
            const invalidBuffer = new TextEncoder().encode('invalid content').buffer
            const invalidFile = createFileWithArrayBuffer(
                invalidBuffer,
                'test.docx',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )

            await expect(parser.parseWord(invalidFile)).rejects.toThrow(ParseError)
        })

        it('应该处理空文档', async () => {
            // 创建一个最小的空 docx（实际上会失败，但我们测试错误处理）
            const emptyBuffer = new ArrayBuffer(0)
            const file = createFileWithArrayBuffer(
                emptyBuffer,
                'empty.docx',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )

            await expect(parser.parseWord(file)).rejects.toThrow(ParseError)
        })
    })

    describe('parse', () => {
        it('应该根据文件类型调用正确的解析方法 - Excel', async () => {
            const worksheet = XLSX.utils.aoa_to_sheet([['测试']])
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
            const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
            const file = createFileWithArrayBuffer(
                excelBuffer,
                'test.xlsx',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )

            const result = await parser.parse(file)

            expect(result.text).toContain('测试')
            expect(result.metadata.sheets).toBeDefined()
        })

        it('应该对不支持的文件类型抛出错误', async () => {
            const buffer = new ArrayBuffer(10)
            const file = createFileWithArrayBuffer(buffer, 'test.txt', 'text/plain')

            await expect(parser.parse(file)).rejects.toThrow()
        })
    })

    describe('parseToFileInfo', () => {
        it('应该返回完整的 FileInfo 对象', async () => {
            const worksheet = XLSX.utils.aoa_to_sheet([['数据']])
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
            const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
            const file = createFileWithArrayBuffer(
                excelBuffer,
                'test.xlsx',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )

            const fileInfo = await parser.parseToFileInfo(file)

            expect(fileInfo.name).toBe('test.xlsx')
            expect(fileInfo.type).toBe('excel')
            expect(fileInfo.size).toBeGreaterThan(0)
            expect(fileInfo.content).toContain('数据')
            expect(fileInfo.rawFile).toBe(file)
        })
    })
})
