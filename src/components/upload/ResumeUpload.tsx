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
            <Card className="rounded-none shadow-none" style={{ background: '#0D0D0D', border: '1px solid #555555' }}>
                <CardHeader>
                    <CardTitle style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#F0F0F0', fontWeight: 'normal' }}>Upload Your Resume</CardTitle>
                    <CardDescription style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#9A9A9A' }}>Supports PDF, Word (.docx), and Text (.txt) files up to 5MB</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={handleClick}
                        className={cn(
                            'dropzone-container rounded-none p-12 text-center cursor-pointer',
                            'text-[var(--text-muted)]',
                            (isDragging || parsedResume) && 'is-active',
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
                                <Loader2 className="w-12 h-12 animate-spin text-[var(--accent)]" />
                                <p className="font-[var(--font-body)] text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em]">Parsing resume...</p>
                            </div>
                        ) : parsedResume ? (
                            <div className="flex flex-col items-center gap-3">
                                <div style={{
                                    width: '40px', height: '40px',
                                    border: '2px solid #0EA5E9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#0EA5E9', fontSize: '18px',
                                    margin: '0 auto 12px auto'
                                }}>✓</div>
                                <p style={{ color: '#0EA5E9', fontSize: '15px', fontWeight: 500 }}
                                    className="font-[var(--font-body)]">
                                    ✓ {parsedResume.metadata.fileName}
                                </p>
                                <p style={{ color: '#6B6B6B', fontSize: '12px' }}
                                    className="font-[var(--font-body)]">
                                    Parsed via {parsedResume.metadata.parsingMethod.toUpperCase()} • {' '}
                                    Confidence: {parsedResume.parsingConfidence}%
                                </p>
                                <Button
                                    variant="outline"
                                    style={{ borderColor: '#3A3A3A', color: '#A0A0A0', transition: 'border-color 150ms ease, color 150ms ease' }}
                                    className="bg-transparent text-[11px] uppercase tracking-[0.08em] rounded-none hover:border-[#0EA5E9] hover:text-[#F0F0F0] hover:bg-transparent h-auto py-2 px-4 shadow-none mt-2"
                                    onClick={(e) => { e.stopPropagation(); setParsedResume(null); }}
                                >
                                    Upload Different File
                                </Button>
                            </div>
                        ) : isDragging ? (
                            <div className="flex flex-col items-center gap-3">
                                <p style={{
                                    color: '#0EA5E9',
                                    fontFamily: 'DM Mono, monospace',
                                    fontSize: '12px',
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase' as const,
                                    fontWeight: 600,
                                }}>DROP TO UPLOAD</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="font-[var(--font-body)] text-[11px] tracking-[0.15em] text-[#E0E0E0] mb-2">
                                    [ DROP FILE ]
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="font-[var(--font-body)] text-[13px] text-[#E0E0E0]">Drop your resume here or click to browse</p>
                                    <p className="font-[var(--font-body)] text-[11px] text-[#E0E0E0]">
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
