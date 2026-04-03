import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
    validateGitHubUsername,
    extractGitHubUsername
} from '@/lib/integrations/githubClient';

interface GitHubInputProps {
    onValidUsername: (username: string) => void;
}

export function GitHubInput({ onValidUsername }: GitHubInputProps) {
    const [input, setInput] = useState('');
    const [validationState, setValidationState] = useState<
        'idle' | 'valid' | 'invalid'
    >('idle');
    const [error, setError] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (value: string) => {
        setInput(value);
        setError(null);
        if (!value.trim()) {
            setValidationState('idle');
            onValidUsername('');
            return;
        }
        const validation = validateGitHubUsername(value);
        if (validation.valid) {
            setValidationState('valid');
            const username = extractGitHubUsername(value);
            if (username) onValidUsername(username);
        } else {
            setValidationState('invalid');
            setError(validation.error || 'Invalid GitHub username');
            onValidUsername('');
        }
    };

    const handleBlur = () => {
        if (validationState === 'valid') {
            const username = extractGitHubUsername(input);
            if (username) onValidUsername(username);
        } else if (input.trim() === '') {
            onValidUsername('');
        }
    };

    const borderColor =
        validationState === 'valid'
            ? '#10B981'
            : validationState === 'invalid'
                ? '#EF4444'
                : isFocused
                    ? '#00e5ff'
                    : '#6b7280';

    return (
        <div style={{
            background: 'transparent',
            border: 'none',
            marginTop: '0'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid #555555',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
            }}>
                <p style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '11px',
                    color: '#F0F0F0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em'
                }}>
                    GitHub Portfolio
                </p>
                <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '10px',
                    color: '#444444',
                    letterSpacing: '0.1em',
                    border: '1px solid #222222',
                    padding: '2px 6px',
                    borderRadius: '4px'
                }}>OPTIONAL</span>
            </div>

            <div style={{ padding: '20px 24px' }}>
                {/* Label */}
                <p style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '10px',
                    color: '#E0E0E0',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                }}>GITHUB USERNAME OR URL</p>

                {/* Input */}
                <div style={{ position: 'relative' }}>
                    <input
                        id="github-input"
                        placeholder="username or github.com/username"
                        value={input}
                        onChange={(e) => handleChange(e.target.value)}
                        onFocus={() => {
                            setIsFocused(true);
                        }}
                        onBlur={() => {
                            setIsFocused(false);
                            handleBlur();
                        }}
                        style={{
                            width: '100%',
                            background: '#1A1A1A',
                            border: `1px solid ${validationState === 'idle' && !isFocused ? '#6b7280' : borderColor}`,
                            borderRadius: '0.5rem',
                            color: '#ffffff',
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '14px',
                            letterSpacing: '0.05em',
                            padding: '12px 40px 12px 16px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'border-color 150ms ease, box-shadow 150ms ease',
                            boxShadow: isFocused ? `0 0 0 1px ${borderColor}` : 'none'
                        }}
                    />
                    {validationState === 'valid' && (
                        <span style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#10B981',
                            fontSize: '13px'
                        }}>✓</span>
                    )}
                    {validationState === 'invalid' && (
                        <AlertCircle style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '14px',
                            height: '14px',
                            color: '#EF4444'
                        }} />
                    )}
                </div>

                {/* Validation message */}
                {input && (
                    <p style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '10px',
                        color: validationState === 'valid' ? '#10B981' : '#EF4444',
                        marginTop: '6px',
                        letterSpacing: '0.05em'
                    }}>
                        {validationState === 'valid'
                            ? `✓ Username: ${extractGitHubUsername(input)}`
                            : error || 'Enter a GitHub username or github.com/username URL'}
                    </p>
                )}

                {/* Info box — only when idle and empty */}
                {validationState === 'idle' && input.trim() === '' && (
                    <div style={{
                        marginTop: '16px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px'
                    }}>
                        {[
                            'Code quality assessment',
                            'Language diversity analysis',
                            'Project documentation score',
                            'Commit activity tracking',
                        ].map((item) => (
                            <div key={item} style={{
                                background: '#0D0D0D',
                                border: '1px solid #2A2A2A',
                                padding: '10px 14px',
                                fontFamily: "'DM Mono', monospace",
                                fontSize: '10px',
                                color: '#888888',
                                lineHeight: 1.6
                            }}>
                                <span style={{ color: '#666666', marginRight: '6px' }}>→</span>
                                {item}
                            </div>
                        ))}
                    </div>
                )}

                {/* Rate limit note */}
                <p style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '10px',
                    color: '#E0E0E0',
                    marginTop: '14px',
                    lineHeight: 1.6
                }}>
                    Rate limit: 60 requests/hour without token.
                </p>
            </div>
        </div>
    );
}
