export interface FileInfo {
    name: string
    type: 'excel' | 'word'
    size: number
    content: string
    rawFile: File
}

export interface ParsedContent {
    text: string
    metadata: {
        sheets?: string[]
        paragraphs?: number
    }
}

export interface InlineChange {
    value: string
    type: 'added' | 'removed' | 'unchanged'
}

export interface DiffLine {
    lineNumber: number
    content: string
    type: 'added' | 'removed' | 'modified' | 'unchanged'
    changes?: InlineChange[]
}

export interface DiffResult {
    leftLines: DiffLine[]
    rightLines: DiffLine[]
    similarity: number
    totalLines: number
    changedLines: number
}

export class FileFormatError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'FileFormatError'
    }
}

export class ParseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ParseError'
    }
}

export class FileSizeError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'FileSizeError'
    }
}