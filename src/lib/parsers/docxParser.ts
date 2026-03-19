/**
 * DOCX Parser using mammoth.js
 * Extracts text from Word document resumes
 */

import mammoth from 'mammoth';
import { normalizeParsedText, ParserError } from './textCleanup';

export interface DOCXParseResult {
    text: string;
    htmlContent?: string;
    messages: string[];
}

/**
 * Extract text from a DOCX file
 */
export async function extractTextFromDOCX(file: File): Promise<DOCXParseResult> {
    try {
        const arrayBuffer = await file.arrayBuffer();

        // Extract as plain text
        const result = await mammoth.extractRawText({ arrayBuffer });

        // Also extract HTML for better formatting preservation
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer });

        const cleanedText = normalizeParsedText(result.value);

        if (!cleanedText) {
            throw new ParserError("Word document contains no readable text.", "NO_TEXT_EXTRACTED");
        }

        return {
            text: cleanedText,
            htmlContent: htmlResult.value,
            messages: result.messages.map((msg) => msg.message),
        };
    } catch (error) {
        if (error instanceof ParserError) throw error;
        throw new ParserError(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown mammoth error'}`, 'DOCX_CORRUPT', error);
    }
}

/**
 * Validate DOCX file
 */
export function validateDOCXFile(file: File): { valid: boolean; error?: string } {
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
        return { valid: false, error: 'File must be a Word document (.docx or .doc)' };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return { valid: false, error: 'Document must be smaller than 5MB' };
    }

    return { valid: true };
}
