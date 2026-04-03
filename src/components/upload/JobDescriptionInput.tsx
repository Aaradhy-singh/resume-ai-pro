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
        <Card className="rounded-none shadow-none border-none bg-transparent">
            <CardHeader>
                <CardTitle className="font-mono text-[13px] uppercase tracking-[0.08em] text-white font-normal">Job Description</CardTitle>
                <CardDescription className="font-mono text-[11px] text-gray-300">Paste the full job description to enable ATS scoring and keyword gap analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="job-description" className="font-mono text-[11px] uppercase tracking-[0.1em] text-white">Job Description Text</Label>
                    <Textarea
                        id="job-description"
                        placeholder="e.g. We are looking for an AI/ML Engineer with 3+ years of experience building LLM pipelines, prompt engineering, and deploying models using Python and PyTorch..."
                        value={jobDescription}
                        onChange={(e) => handleChange(e.target.value)}
                        onBlur={() => setJdTouched(true)}
                        rows={Math.max(10, Math.min(20, jobDescription.split('\n').length))}
                        className="bg-[#1A1A1A] border border-gray-500 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] resize-y min-h-[250px] shadow-none font-mono text-[14px]"
                    />
                    <div className="flex items-center justify-between font-mono text-[11px] text-gray-300 mt-2">
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
                    <p className="font-mono text-[10px] text-red-500 mt-1">
                        Job description is too short for meaningful analysis.
                        Paste the full JD for accurate keyword gap detection.
                    </p>
                )}
                {jdTouched && jobDescription.length >= minChars && (
                    <p className="font-mono text-[10px] text-green-500 mt-1">
                        ✓ {jobDescription.length} characters — ready for analysis
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
