/**
 * PDF Parser using pdf.js
 * Extracts text from PDF resumes
 */

import * as pdfjsLib from 'pdfjs-dist';
// Use unpkg CDN to reliably load the worker across dev and prod
// This bypasses Vite's dynamic import/worker bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface PDFParseResult {
    text: string;
    pageCount: number;
    metadata?: {
        title?: string;
        author?: string;
        subject?: string;
        creator?: string;
    };
}

import { normalizeParsedText, ParserError } from './textCleanup';

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<PDFParseResult> {
    try {
        const arrayBuffer = await file.arrayBuffer();

        // Guard against loading errors
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        const metadata = await pdf.getMetadata().catch(() => null);
        const pageCount = pdf.numPages;

        let fullText = '';

        // Extract text from each page
        for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            let pageText = '';
            let lastX = 0;
            let lastY = 0;
            let lastWidth = 0;
            let lastStr = '';

            textContent.items.forEach((item: unknown) => {
                const textItem = item as { str: string; transform: number[]; width: number; height: number };
                if (!textItem.str) return;

                const x = textItem.transform[4];
                const y = textItem.transform[5];
                const width = textItem.width;

                if (pageText === '') {
                    pageText += textItem.str;
                } else {
                    const yDiff = Math.abs(y - lastY);
                    const xGap = x - (lastX + lastWidth);

                    if (yDiff > 5) {
                        // New line
                        pageText += '\n' + textItem.str;
                    } else if (xGap > 8) {
                        // Large horizontal gap — new word
                        pageText += ' ' + textItem.str;
                    } else if (xGap < -2) {
                        // Overlapping or same position — likely continuation
                        pageText += textItem.str;
                    } else if (/[-\u2010\u2011\u2012\u2013\u2014\u2015]$/.test(lastStr) && xGap < 2) {
                        // Hyphenated word at end of line — keep hyphen and join without space
                        pageText = pageText + textItem.str;
                    } else {
                        // Normal adjacent text
                        pageText += textItem.str;
                    }
                }

                lastX = x;
                lastY = y;
                lastWidth = width;
                lastStr = textItem.str;
            });

            fullText += pageText + '\n\n';
        }

        const cleanedText = normalizeParsedText(fullText);

        // Validate extraction result
        if (!cleanedText) {
            throw new ParserError("PDF contains no readable text. It may be an image scan without OCR.", "NO_TEXT_EXTRACTED");
        }

        console.log('PDF PARSED TEXT:', cleanedText.substring(0, 500));

        return {
            text: cleanedText,
            pageCount,
            metadata: metadata?.info ? {
                title: metadata.info.Title,
                author: metadata.info.Author,
                subject: metadata.info.Subject,
                creator: metadata.info.Creator,
            } : undefined,
        };
    } catch (error) {
        if (error instanceof ParserError) throw error;

        console.error("PDF Parsing Error:", error);
        throw new ParserError(
            `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown PDF.js error'}`,
            "PDF_CORRUPT",
            error
        );
    }
}

/**
 * Validate PDF file
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
    if (file.type !== 'application/pdf') {
        return { valid: false, error: 'File must be a PDF' };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return { valid: false, error: 'PDF must be smaller than 5MB' };
    }

    return { valid: true };
}
