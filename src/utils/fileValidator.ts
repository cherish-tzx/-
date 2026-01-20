import { FileFormatError, FileSizeError } from '../types'

// 支持的文件类型
export const SUPPORTED_FILE_TYPES = {
    EXCEL: ['.xls', '.xlsx'],
    WORD: ['.docx'] // 注意：仅支持 .docx，不支持旧版 .doc
} as const

// 所有支持的扩展名
export const ALL_SUPPORTED_EXTENSIONS = [
    ...SUPPORTED_FILE_TYPES.EXCEL,
    ...SUPPORTED_FILE_TYPES.WORD
]

// 文件大小限制（10MB）
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * 验证文件格式是否支持
 * @param file 要验证的文件
 * @returns 如果文件格式支持返回 true
 * @throws FileFormatError 如果文件格式不支持
 */
export function validateFileFormat(file: File): boolean {
    const fileName = file.name.toLowerCase()
    const isSupported = ALL_SUPPORTED_EXTENSIONS.some(ext =>
        fileName.endsWith(ext)
    )

    if (!isSupported) {
        throw new FileFormatError(
            `不支持的文件格式。请上传以下格式的文件：${ALL_SUPPORTED_EXTENSIONS.join(', ')}`
        )
    }

    return true
}

/**
 * 验证文件大小是否在限制范围内
 * @param file 要验证的文件
 * @returns 如果文件大小符合要求返回 true
 * @throws FileSizeError 如果文件过大
 */
export function validateFileSize(file: File): boolean {
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)
        throw new FileSizeError(
            `文件过大，请上传小于 ${sizeMB}MB 的文件`
        )
    }

    return true
}

/**
 * 获取文件类型（excel 或 word）
 * @param file 文件对象
 * @returns 文件类型
 */
export function getFileType(file: File): 'excel' | 'word' {
    const fileName = file.name.toLowerCase()

    if (SUPPORTED_FILE_TYPES.EXCEL.some(ext => fileName.endsWith(ext))) {
        return 'excel'
    }

    if (SUPPORTED_FILE_TYPES.WORD.some(ext => fileName.endsWith(ext))) {
        return 'word'
    }

    throw new FileFormatError('无法识别的文件类型')
}

/**
 * 验证文件（格式和大小）
 * @param file 要验证的文件
 * @returns 如果验证通过返回 true
 * @throws FileFormatError 或 FileSizeError
 */
export function validateFile(file: File): boolean {
    validateFileFormat(file)
    validateFileSize(file)
    return true
}
