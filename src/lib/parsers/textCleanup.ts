/**
 * Text Normalization & Cleanup Utility
 * Hardens document parsing by removing bad unicode,
 * normalizing whitespace, and preparing text for NLP analysis.
 */

export function normalizeParsedText(rawText: string): string {
    if (!rawText) return '';

    let text = rawText;

    // 1. Unicode Sanitation
    // Replace non-breaking spaces with regular spaces
    text = text.replace(/[\u00A0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, ' ');

    // Remove zero-width characters and directional formatting
    text = text.replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, '');

    // Replace fancy quotes and dashes
    text = text.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
    text = text.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
    text = text.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-');

    // 2. Whitespace Compression
    // Fix broken newlines (e.g., from PDF line wrapping)
    // If a line ends with a lowercase letter and the next starts with lowercase, join them
    text = text.replace(/([a-z])\s*\n\s*([a-z])/g, '$1 $2');

    // Collapse multiple spaces into one
    text = text.replace(/[ \t]{2,}/g, ' ');

    // Fix incorrectly spaced hyphens — "word - word" → "word-word"
    text = text.replace(/(\w)\s+-\s+(\w)/g, '$1-$2');

    // Normalize newlines (max 2 consecutive newlines to preserve paragraphs)
    text = text.replace(/\n{3,}/g, '\n\n');

    // Remove leading/trailing whitespace
    return text.trim();
}

/**
 * Structured Parser Error for UI resilience
 */
export class ParserError extends Error {
    constructor(
        message: string,
        public readonly code: 'EMPTY_DOCUMENT' | 'PDF_CORRUPT' | 'DOCX_CORRUPT' | 'NO_TEXT_EXTRACTED' | 'UNSUPPORTED_TYPE',
        public readonly diagnostics?: unknown
    ) {
        super(message);
        this.name = 'ParserError';
    }
}
