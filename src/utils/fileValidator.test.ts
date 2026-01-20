import { describe, it, expect } from 'vitest'
import {
    validateFileFormat,
    validateFileSize,
    validateFile,
    getFileType,
    MAX_FILE_SIZE,
    ALL_SUPPORTED_EXTENSIONS
} from './fileValidator'
import { FileFormatError, FileSizeError } from '../types'

describe('fileValidator', () => {
    // 创建模拟文件的辅助函数
    const createMockFile = (name: string, size: number = 1024): File => {
        const content = new Array(size).fill('a').join('')
        return new File([content], name, { type: 'application/octet-stream' })
    }

    describe('validateFileFormat', () => {
        it('应该接受 .xlsx 文件', () => {
            const file = createMockFile('test.xlsx')
            expect(validateFileFormat(file)).toBe(true)
        })

        it('应该接受 .xls 文件', () => {
            const file = createMockFile('test.xls')
            expect(validateFileFormat(file)).toBe(true)
        })

        it('应该接受 .docx 文件', () => {
            const file = createMockFile('test.docx')
            expect(validateFileFormat(file)).toBe(true)
        })

        it('应该接受 .doc 文件', () => {
            const file = createMockFile('test.doc')
            expect(validateFileFormat(file)).toBe(true)
        })

        it('应该接受大写扩展名', () => {
            const file = createMockFile('TEST.XLSX')
            expect(validateFileFormat(file)).toBe(true)
        })

        it('应该拒绝 .txt 文件', () => {
            const file = createMockFile('test.txt')
            expect(() => validateFileFormat(file)).toThrow(FileFormatError)
        })

        it('应该拒绝 .pdf 文件', () => {
            const file = createMockFile('test.pdf')
            expect(() => validateFileFormat(file)).toThrow(FileFormatError)
        })

        it('应该拒绝没有扩展名的文件', () => {
            const file = createMockFile('test')
            expect(() => validateFileFormat(file)).toThrow(FileFormatError)
        })

        it('错误消息应该包含支持的格式列表', () => {
            const file = createMockFile('test.txt')
            try {
                validateFileFormat(file)
            } catch (error) {
                expect(error).toBeInstanceOf(FileFormatError)
                expect((error as Error).message).toContain('.xls')
                expect((error as Error).message).toContain('.xlsx')
                expect((error as Error).message).toContain('.doc')
                expect((error as Error).message).toContain('.docx')
            }
        })
    })

    describe('validateFileSize', () => {
        it('应该接受小于限制的文件', () => {
            const file = createMockFile('test.xlsx', 1024)
            expect(validateFileSize(file)).toBe(true)
        })

        it('应该接受等于限制的文件', () => {
            const file = createMockFile('test.xlsx', MAX_FILE_SIZE)
            expect(validateFileSize(file)).toBe(true)
        })

        it('应该拒绝超过限制的文件', () => {
            const file = createMockFile('test.xlsx', MAX_FILE_SIZE + 1)
            expect(() => validateFileSize(file)).toThrow(FileSizeError)
        })

        it('错误消息应该包含文件大小限制', () => {
            const file = createMockFile('test.xlsx', MAX_FILE_SIZE + 1)
            try {
                validateFileSize(file)
            } catch (error) {
                expect(error).toBeInstanceOf(FileSizeError)
                expect((error as Error).message).toContain('MB')
            }
        })
    })

    describe('getFileType', () => {
        it('应该识别 .xlsx 为 excel 类型', () => {
            const file = createMockFile('test.xlsx')
            expect(getFileType(file)).toBe('excel')
        })

        it('应该识别 .xls 为 excel 类型', () => {
            const file = createMockFile('test.xls')
            expect(getFileType(file)).toBe('excel')
        })

        it('应该识别 .docx 为 word 类型', () => {
            const file = createMockFile('test.docx')
            expect(getFileType(file)).toBe('word')
        })

        it('应该识别 .doc 为 word 类型', () => {
            const file = createMockFile('test.doc')
            expect(getFileType(file)).toBe('word')
        })

        it('应该对不支持的文件抛出错误', () => {
            const file = createMockFile('test.txt')
            expect(() => getFileType(file)).toThrow(FileFormatError)
        })
    })

    describe('validateFile', () => {
        it('应该通过格式和大小都正确的文件', () => {
            const file = createMockFile('test.xlsx', 1024)
            expect(validateFile(file)).toBe(true)
        })

        it('应该拒绝格式错误的文件', () => {
            const file = createMockFile('test.txt', 1024)
            expect(() => validateFile(file)).toThrow(FileFormatError)
        })

        it('应该拒绝大小超限的文件', () => {
            const file = createMockFile('test.xlsx', MAX_FILE_SIZE + 1)
            expect(() => validateFile(file)).toThrow(FileSizeError)
        })

        it('应该拒绝格式和大小都错误的文件（先检查格式）', () => {
            const file = createMockFile('test.txt', MAX_FILE_SIZE + 1)
            expect(() => validateFile(file)).toThrow(FileFormatError)
        })
    })

    describe('常量', () => {
        it('ALL_SUPPORTED_EXTENSIONS 应该包含所有支持的扩展名', () => {
            expect(ALL_SUPPORTED_EXTENSIONS).toContain('.xls')
            expect(ALL_SUPPORTED_EXTENSIONS).toContain('.xlsx')
            expect(ALL_SUPPORTED_EXTENSIONS).toContain('.doc')
            expect(ALL_SUPPORTED_EXTENSIONS).toContain('.docx')
            expect(ALL_SUPPORTED_EXTENSIONS).toHaveLength(4)
        })

        it('MAX_FILE_SIZE 应该是 10MB', () => {
            expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024)
        })
    })
})
