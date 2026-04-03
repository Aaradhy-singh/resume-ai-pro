/**
 * Enhanced Resume Upload Component
 * Drag-and-drop file upload with real-time parsing preview
 */

import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { parseResume, validateResumeFile, type ParsedResume } from '@/lib/parsers/resumeParser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ResumeUploadProps {
    onParsed: (parsed: ParsedResume) => void;
}

export function ResumeUpload({ onParsed }: ResumeUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);

    const handleFile = useCallback(async (file: File) => {
        setError(null);
        setIsProcessing(true);

        // Validate file
        const validation = validateResumeFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            setIsProcessing(false);
            return;
        }

        try {
            // Parse resume
            const parsed = await parseResume(file);
            setParsedResume(parsed);
            onParsed(parsed);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse resume');
        } finally {
            setIsProcessing(false);
        }
    }, [onParsed]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleClick = useCallback(() => {
        document.getElementById('resume-upload-input')?.click();
    }, []);

    return (
        <div className="space-y-4">
            <Card className="rounded-none shadow-none border-none bg-transparent">
                <CardHeader>
                    <CardTitle className="font-mono text-[13px] uppercase tracking-[0.08em] text-white font-normal">Upload Your Resume</CardTitle>
                    <CardDescription className="font-mono text-[13px] text-gray-300">Supports PDF, Word (.docx), and Text (.txt) files up to 5MB</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={handleClick}
                        className={cn(
                            'w-full flex flex-col items-center justify-center p-8 bg-[#111111] border-2 border-dashed border-gray-500 hover:border-[#00e5ff] hover:bg-white/5 transition-all duration-200 rounded-xl cursor-pointer',
                            (isDragging || parsedResume) && 'border-[#00e5ff] bg-white/5',
                            isProcessing && 'opacity-50 pointer-events-none'
                        )}
                        tabIndex={0}
                    >
                        <input
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFile(file);
                            }}
                            id="resume-upload-input"
                        />
                        {isProcessing ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-12 h-12 animate-spin text-[#00e5ff]" />
                                <p className="font-mono text-[11px] text-gray-300 uppercase tracking-[0.1em]">Parsing resume...</p>
                            </div>
                        ) : parsedResume ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-2 border-[#00e5ff] flex items-center justify-center text-[#00e5ff] text-lg mx-auto mb-3">✓</div>
                                <p className="text-[#00e5ff] text-[16px] font-medium font-mono">
                                    ✓ {parsedResume.metadata.fileName}
                                </p>
                                <p className="text-gray-300 text-[14px] font-mono">
                                    Parsed via {parsedResume.metadata.parsingMethod.toUpperCase()} • {' '}
                                    Confidence: {parsedResume.parsingConfidence}%
                                </p>
                                <Button
                                    variant="outline"
                                    className="bg-transparent text-gray-300 border-gray-600 border text-[11px] uppercase tracking-[0.08em] hover:border-white hover:text-white rounded-md mt-2 shadow-sm py-2 px-4 h-auto"
                                    onClick={(e) => { e.stopPropagation(); setParsedResume(null); }}
                                >
                                    Upload Different File
                                </Button>
                            </div>
                        ) : isDragging ? (
                            <div className="flex flex-col items-center gap-3">
                                <p className="text-white font-mono text-[12px] tracking-[0.15em] uppercase font-semibold">
                                    DROP TO UPLOAD
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="font-mono text-[11px] tracking-[0.15em] text-white mb-2">
                                    [ DROP FILE ]
                                </div>
                                <div className="flex flex-col gap-1 items-center">
                                    <p className="font-mono text-[15px] text-white">Drop your resume here or click to browse</p>
                                    <p className="font-mono text-[13px] text-gray-300">
                                        PDF, DOCX, or TXT • Max 5MB
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {parsedResume && parsedResume.warnings.length > 0 && (
                        <Alert className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-medium mb-1">Parsing Warnings:</p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    {parsedResume.warnings.map((warning, idx) => (
                                        <li key={idx}>{warning}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>


        </div>
    );
}
