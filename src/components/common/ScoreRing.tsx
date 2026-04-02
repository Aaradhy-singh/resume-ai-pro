import { useEffect, useRef } from 'react';
import { useCountUp } from '@/hooks/useCountUp';

interface ScoreRingProps {
    score: number;
    color: string;
    size?: number;
    strokeWidth?: number;
    delay?: number;
}

export function ScoreRing({
    score,
    color,
    size = 160,
    strokeWidth = 8,
    delay = 0,
}: ScoreRingProps) {
    const animatedScore = useCountUp(
        score, 1500, delay
    );
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (animatedScore / 100);
    const strokeDashoffset = 
        circumference - progress * circumference;

    return (
        <div style={{ 
            position: 'relative',
            width: size,
            height: size,
            display: 'inline-block',
        }}>
            <svg
                width={size}
                height={size}
                style={{ 
                    transform: 'rotate(-90deg)',
                }}
            >
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#1A1A1A"
                    strokeWidth={strokeWidth}
                />
                {/* Animated progress arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.05s linear',
                    }}
                />
            </svg>
            {/* Score number in center */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
            }}>
                <div style={{
                    fontSize: size * 0.28,
                    color: color,
                    fontFamily: 'inherit',
                    lineHeight: 1,
                    fontWeight: 'bold',
                }}>
                    {animatedScore}
                </div>
                <div style={{
                    fontSize: size * 0.1,
                    color: '#555555',
                    fontFamily: 'inherit',
                    letterSpacing: '0.1em',
                }}>
                    /100
                </div>
            </div>
        </div>
    );
}
