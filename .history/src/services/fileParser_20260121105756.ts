import * as XLSX from 'xlsx'
import * as mammoth from 'mammoth'
import { ParsedContent, FileInfo, ParseError } from '../types'
import { getFileType } from '../utils/fileValidator'
import { textNormalizer } from './textNormalizer'

/**
 * 文件解析服务类
 */
export class FileParser {
    /**
     * 解析 Excel 文件
     * @param file Excel 文件对象
     * @returns 解析后的内容
     */
    async parseExcel(file: File): Promise<ParsedContent> {
        try {
            const arrayBuffer = await file.arrayBuffer()

            // 尝试使用不同的选项读取工作簿
            let workbook: XLSX.WorkBook
            try {
                workbook = XLSX.read(arrayBuffer, {
                    type: 'array',
                    cellDates: true,
                    cellNF: false,
                    cellText: false
                })
            } catch (readError) {
                // 如果第一次读取失败，尝试使用更宽松的选项
                workbook = XLSX.read(arrayBuffer, {
                    type: 'array',
                    bookVBA: false,
                    cellDates: true,
                    WTF: true // 允许解析一些非标准格式
                })
            }

            const sheets: string[] = []
            const textLines: string[] = []

            // 遍历所有工作表
            workbook.SheetNames.forEach(sheetName => {
                sheets.push(sheetName)
                const worksheet = workbook.Sheets[sheetName]

                // 将工作表转换为 JSON 格式
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: '',
                    blankrows: true,
                    raw: false // 将所有值转换为字符串
                }) as any[][]

                // 添加工作表名称作为标题
                textLines.push(`[工作表: ${sheetName}]`)

                // 将每行数据转换为文本
                jsonData.forEach(row => {
                    if (Array.isArray(row) && row.length > 0) {
                        // 对每个单元格进行清理：trim() 移除前后空白
                        const cleanedCells = row.map(cell => String(cell ?? '').trim())

                        // 移除行尾的空单元格
                        while (cleanedCells.length > 0 && cleanedCells[cleanedCells.length - 1] === '') {
                            cleanedCells.pop()
                        }

                        // 过滤空单元格和纯空白单元格，然后用制表符连接
                        const rowText = cleanedCells
                            .filter(cell => cell !== '')
                            .join('\t')

                        if (rowText) {
                            textLines.push(rowText)
                        }
                    }
                })

                // 工作表之间添加空行
                textLines.push('')
            })

            return {
                text: textLines.join('\n'),
                metadata: {
                    sheets
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误'

            // 提供更友好的错误提示
            if (errorMessage.includes('Unrecognized') || errorMessage.includes('LOTUS') || errorMessage.includes('BOF')) {
                throw new ParseError(
                    'Excel 文件格式不支持或文件已损坏。\n请尝试：\n' +
                    '1. 使用 Excel 打开文件并另存为 .xlsx 格式\n' +
                    '2. 确保文件是有效的 Excel 文件\n' +
                    '3. 检查文件是否损坏'
                )
            }

            throw new ParseError(
                `Excel 文件解析失败: ${errorMessage}`
            )
        }
    }

    /**
     * 解析 Word 文件
     * @param file Word 文件对象
     * @returns 解析后的内容
     */
    async parseWord(file: File): Promise<ParsedContent> {
        try {
            const arrayBuffer = await file.arrayBuffer()
            const result = await mammoth.extractRawText({ arrayBuffer })

            // 统计段落数（以双换行符分隔）
            const paragraphs = result.value
                .split('\n\n')
                .filter(p => p.trim().length > 0)
                .length

            return {
                text: result.value,
                metadata: {
                    paragraphs
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误'

            // 提供更友好的错误提示
            if (errorMessage.includes('zip') || errorMessage.includes('central directory') || errorMessage.includes('ZIP')) {
                throw new ParseError(
                    'Word 文件格式不支持或文件已损坏。\n请尝试：\n' +
                    '1. 确保文件是 .docx 格式（不是 .doc 格式）\n' +
                    '2. 使用 Word 打开文件并另存为 .docx 格式\n' +
                    '3. 检查文件是否损坏\n' +
                    '注意：仅支持 .docx 格式，不支持旧版 .doc 格式'
                )
            }

            throw new ParseError(
                `Word 文件解析失败: ${errorMessage}`
            )
        }
    }

    /**
     * 统一的文件解析方法
     * @param file 文件对象
     * @returns 解析后的内容
     */
    async parse(file: File): Promise<ParsedContent> {
        const fileType = getFileType(file)

        if (fileType === 'excel') {
            return this.parseExcel(file)
        } else if (fileType === 'word') {
            return this.parseWord(file)
        }

        throw new ParseError('不支持的文件类型')
    }

    /**
     * 解析文件并返回 FileInfo 对象
     * @param file 文件对象
     * @returns FileInfo 对象
     */
    async parseToFileInfo(file: File): Promise<FileInfo> {
        const fileType = getFileType(file)
        const parsedContent = await this.parse(file)

        return {
            name: file.name,
            type: fileType,
            size: file.size,
            content: parsedContent.text,
            rawFile: file
        }
    }
}

// 导出单例实例
export const fileParser = new FileParser()
