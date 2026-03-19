/**
 * Central Resume Parser
 * Orchestrates parsing of PDF, DOCX, and TXT files
 */

import { extractTextFromPDF, validatePDFFile, type PDFParseResult } from './pdfParser';
import { extractTextFromDOCX, validateDOCXFile, type DOCXParseResult } from './docxParser';
import { normalizeParsedText, ParserError } from './textCleanup';

export interface ParsedResume {
    rawText: string;
    metadata: {
        fileName: string;
        fileSize: number;
        fileType: string;
        parseTimestamp: Date;
        pageCount?: number;
        parsingMethod: 'pdf' | 'docx' | 'txt';
    };
    parsingConfidence: number;
    warnings: string[];
}

/**
 * Extract text from a plain text file
 */
async function extractTextFromTXT(file: File): Promise<string> {
    const raw = await file.text();
    const cleaned = normalizeParsedText(raw);
    if (!cleaned) {
        throw new ParserError("Text file is empty or contains no readable text.", "NO_TEXT_EXTRACTED");
    }
    return cleaned;
}

/**
 * Validate TXT file
 */
function validateTXTFile(file: File): { valid: boolean; error?: string } {
    if (!file.type.includes('text/plain') && !file.name.endsWith('.txt')) {
        return { valid: false, error: 'File must be a text file (.txt)' };
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
        return { valid: false, error: 'Text file must be smaller than 2MB' };
    }

    return { valid: true };
}

/**
 * Main resume parser function
 * Automatically detects file type and uses appropriate parser
 */
export async function parseResume(file: File): Promise<ParsedResume> {
    try {
        const fileName = file.name;
        const fileSize = file.size;
        const parseTimestamp = new Date();

        let rawText: string;
        let parsingMethod: 'pdf' | 'docx' | 'txt';
        let parsingConfidence: number;
        const warnings: string[] = [];
        let pageCount: number | undefined;

        // Detect file type and parse accordingly
        if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
            // PDF parsing
            const validation = validatePDFFile(file);
            if (!validation.valid) {
                throw new ParserError(validation.error || "Invalid PDF", "UNSUPPORTED_TYPE");
            }

            const pdfResult = await extractTextFromPDF(file);
            rawText = pdfResult.text;
            pageCount = pdfResult.pageCount;
            parsingMethod = 'pdf';

            // Calculate confidence based on text extraction quality
            if (rawText.length < 100) {
                parsingConfidence = 40;
                warnings.push('Very little text extracted. PDF may contain images or scanned content.');
            } else if (rawText.length < 500) {
                parsingConfidence = 70;
                warnings.push('Limited text extracted. Some content may be missing.');
            } else {
                parsingConfidence = 95;
            }

        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.type === 'application/msword' ||
            fileName.endsWith('.docx') ||
            fileName.endsWith('.doc')
        ) {
            // DOCX parsing
            const validation = validateDOCXFile(file);
            if (!validation.valid) {
                throw new ParserError(validation.error || "Invalid DOCX", "UNSUPPORTED_TYPE");
            }

            const docxResult = await extractTextFromDOCX(file);
            rawText = docxResult.text;
            parsingMethod = 'docx';

            if (docxResult.messages.length > 0) {
                warnings.push(...docxResult.messages);
            }

            if (rawText.length < 100) {
                parsingConfidence = 50;
                warnings.push('Very little text extracted from document.');
            } else if (docxResult.messages.length > 3) {
                parsingConfidence = 75;
            } else {
                parsingConfidence = 90;
            }

        } else if (file.type.includes('text/plain') || fileName.endsWith('.txt')) {
            // TXT parsing
            const validation = validateTXTFile(file);
            if (!validation.valid) {
                throw new ParserError(validation.error || "Invalid TXT", "UNSUPPORTED_TYPE");
            }

            rawText = await extractTextFromTXT(file);
            parsingMethod = 'txt';
            parsingConfidence = 85;

        } else {
            throw new ParserError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.', 'UNSUPPORTED_TYPE');
        }

        // Additional validation
        if (rawText.trim().length === 0) {
            throw new ParserError('No text could be extracted from the file. The file may be empty or corrupted.', 'NO_TEXT_EXTRACTED');
        }

        return {
            rawText,
            metadata: {
                fileName,
                fileSize,
                fileType: file.type,
                parseTimestamp,
                pageCount,
                parsingMethod,
            },
            parsingConfidence,
            warnings,
        };
    } catch (error) {
        if (error instanceof ParserError) throw error;
        throw new ParserError(error instanceof Error ? error.message : "Unknown parsing error", "EMPTY_DOCUMENT", error);
    }
}



/**
 * Validate file before attempting to parse
 */
export function validateResumeFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isDOCX = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword' ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.doc');
    const isTXT = file.type.includes('text/plain') || file.name.endsWith('.txt');

    if (!isPDF && !isDOCX && !isTXT) {
        return {
            valid: false,
            error: 'Invalid file type. Please upload a PDF, Word document (.docx), or text file (.txt).',
        };
    }

    // Validate based on type
    if (isPDF) return validatePDFFile(file);
    if (isDOCX) return validateDOCXFile(file);
    if (isTXT) return validateTXTFile(file);

    return { valid: true };
}
