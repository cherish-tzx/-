import { FileFormatError, ParseError, FileSizeError } from '../types'

/**
 * 错误处理器类
 */
export class ErrorHandler {
    /**
     * 统一处理错误并显示用户友好的消息
     * @param error 错误对象
     * @param context 错误上下文
     * @returns 用户友好的错误消息
     */
    static handle(error: Error, context: string): string {
        console.error(`[${context}]`, error)

        if (error instanceof FileFormatError) {
            return error.message
        }

        if (error instanceof ParseError) {
            return error.message
        }

        if (error instanceof FileSizeError) {
            return error.message
        }

        // 通用错误
        return `操作失败：${error.message || '未知错误'}，请重试`
    }

    /**
     * 显示错误消息（可以集成到 UI 框架的通知系统）
     * @param message 错误消息
     */
    static showError(message: string): void {
        // 这里可以集成 UI 框架的通知组件
        // 例如：ElMessage.error(message) 或 message.error(message)
        console.error('Error:', message)
        alert(message) // 简单实现，实际应用中应该使用更好的 UI 组件
    }
}
