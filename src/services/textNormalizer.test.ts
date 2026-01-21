import { describe, it, expect } from 'vitest'
import { TextNormalizer } from './textNormalizer'

describe('TextNormalizer - Unit Tests', () => {
    const normalizer = new TextNormalizer()

    describe('normalizeLine', () => {
        it('应该移除行尾空白', () => {
            expect(normalizer.normalizeLine('hello  ')).toBe('hello')
            expect(normalizer.normalizeLine('world\t')).toBe('world')
            expect(normalizer.normalizeLine('test \t ')).toBe('test')
        })

        it('应该压缩连续空白为单个空格', () => {
            expect(normalizer.normalizeLine('hello  world')).toBe('hello world')
            expect(normalizer.normalizeLine('a\t\tb')).toBe('a b')
            expect(normalizer.normalizeLine('x   y   z')).toBe('x y z')
        })

        it('应该处理空字符串', () => {
            expect(normalizer.normalizeLine('')).toBe('')
        })

        it('应该处理纯空白字符串', () => {
            expect(normalizer.normalizeLine('   ')).toBe('')
            expect(normalizer.normalizeLine('\t\t')).toBe('')
            expect(normalizer.normalizeLine(' \t ')).toBe('')
        })

        it('应该保留单个空格', () => {
            expect(normalizer.normalizeLine('a b')).toBe('a b')
        })

        it('应该处理特殊字符', () => {
            expect(normalizer.normalizeLine('你好  世界')).toBe('你好 世界')
            expect(normalizer.normalizeLine('test@#$%  123')).toBe('test@#$% 123')
        })
    })

    describe('normalizeText', () => {
        it('应该移除空行', () => {
            const text = 'line1\n\nline2\n\n\nline3'
            const result = normalizer.normalizeText(text)
            expect(result).toBe('line1\nline2\nline3')
        })

        it('应该规范化每一行', () => {
            const text = 'hello  world  \n  foo   bar\t'
            const result = normalizer.normalizeText(text)
            expect(result).toBe('hello world\nfoo bar')
        })

        it('应该处理空字符串', () => {
            expect(normalizer.normalizeText('')).toBe('')
        })

        it('应该处理只有空行的文本', () => {
            expect(normalizer.normalizeText('\n\n\n')).toBe('')
            expect(normalizer.normalizeText('   \n  \n\t')).toBe('')
        })

        it('应该保留非空白内容', () => {
            const text = '  hello  \n\n  world  \n'
            const result = normalizer.normalizeText(text)
            expect(result).toBe('hello\nworld')
        })
    })

    describe('normalizeToLines', () => {
        it('应该返回规范化的行数组', () => {
            const text = 'line1  \nline2\n\nline3'
            const result = normalizer.normalizeToLines(text)
            expect(result).toEqual(['line1', 'line2', 'line3'])
        })

        it('应该移除空行', () => {
            const text = 'a\n\nb\n\n\nc'
            const result = normalizer.normalizeToLines(text)
            expect(result).toEqual(['a', 'b', 'c'])
        })

        it('应该处理空字符串', () => {
            expect(normalizer.normalizeToLines('')).toEqual([])
        })

        it('应该处理只有空白的文本', () => {
            expect(normalizer.normalizeToLines('   \n  \n\t')).toEqual([])
        })

        it('应该规范化每一行的空白', () => {
            const text = 'hello  world\n  foo   bar  '
            const result = normalizer.normalizeToLines(text)
            expect(result).toEqual(['hello world', 'foo bar'])
        })
    })
})
