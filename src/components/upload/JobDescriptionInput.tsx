/**
 * Job Description Input Component
 * Textarea for pasting job descriptions
 */

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface JobDescriptionInputProps {
    onJobDescriptionChange: (jd: string) => void;
}

export function JobDescriptionInput({ onJobDescriptionChange }: JobDescriptionInputProps) {
    const [jobDescription, setJobDescription] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [jdTouched, setJdTouched] = useState(false);

    const handleChange = (value: string) => {
        setJobDescription(value);
        setCharCount(value.length);
        onJobDescriptionChange(value);
    };

    const minChars = 50;
    const maxChars = 10000;
    const isValid = charCount >= minChars && charCount <= maxChars;

    return (
        <Card className="rounded-none shadow-none" style={{ background: '#0D0D0D', border: '1px solid #555555' }}>
            <CardHeader>
                <CardTitle style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#F0F0F0', fontWeight: 'normal' }}>Job Description</CardTitle>
                <CardDescription style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#9A9A9A' }}>Paste the full job description to enable ATS scoring and keyword gap analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="job-description" className="font-[var(--font-body)] text-[11px] uppercase tracking-[0.1em] text-[#E0E0E0]">Job Description Text</Label>
                    <Textarea
                        id="job-description"
                        placeholder="e.g. We are looking for an AI/ML Engineer with 3+ years of experience building LLM pipelines, prompt engineering, and deploying models using Python and PyTorch..."
                        value={jobDescription}
                        onChange={(e) => handleChange(e.target.value)}
                        onBlur={() => setJdTouched(true)}
                        rows={Math.max(10, Math.min(20, jobDescription.split('\n').length))}
                        className="rounded-none resize-y min-h-[250px] shadow-none focus-visible:ring-0" style={{ background: '#080808', border: '1px solid #555555', color: '#F0F0F0', fontFamily: "'DM Mono', monospace", fontSize: '12px' }}
                    />
                    <div className="flex items-center justify-between font-[var(--font-body)] text-[11px] text-[#E0E0E0] mt-2">
                        <span className={charCount < minChars ? '' : isValid ? 'text-[var(--accent)]' : 'text-red-500'}>
                            {charCount.toLocaleString()} characters
                        </span>
                        {charCount >= 8000 && charCount <= maxChars && (
                            <span className="text-[#F59E0B]">
                                Warning: JD too long
                            </span>
                        )}
                        {charCount > 0 && charCount < minChars && (
                            <span>
                                {minChars - charCount} more characters needed
                            </span>
                        )}
                        {charCount > maxChars && (
                            <span className="text-red-500">
                                {charCount - maxChars} characters over limit
                            </span>
                        )}
                    </div>
                </div>

                {jdTouched && jobDescription.length > 0 && jobDescription.length < minChars && (
                    <p style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '10px',
                        color: '#EF4444',
                        marginTop: '6px',
                    }}>
                        Job description is too short for meaningful analysis.
                        Paste the full JD for accurate keyword gap detection.
                    </p>
                )}
                {jdTouched && jobDescription.length >= minChars && (
                    <p style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '10px',
                        color: '#10B981',
                        marginTop: '6px',
                    }}>
                        ✓ {jobDescription.length} characters — ready for analysis
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
