import { useEffect, useState } from 'react';

export function useCountUp(
    target: number,
    duration: number = 1500,
    delay: number = 0
): number {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (target === 0) return;
        
        let startTime: number | null = null;
        let animationFrame: number;
        
        const delayTimeout = setTimeout(() => {
            const animate = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min(
                    (timestamp - startTime) / duration,
                    1
                );
                // Ease out cubic
                const eased = 
                    1 - Math.pow(1 - progress, 3);
                setCurrent(Math.round(target * eased));
                
                if (progress < 1) {
                    animationFrame = 
                        requestAnimationFrame(animate);
                }
            };
            animationFrame = 
                requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(delayTimeout);
            cancelAnimationFrame(animationFrame);
        };
    }, [target, duration, delay]);

    return current;
}
