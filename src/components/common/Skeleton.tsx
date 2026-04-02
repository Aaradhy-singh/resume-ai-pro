export function Skeleton({ 
    width = '100%', 
    height = 20,
    style = {}
}: { 
    width?: string | number;
    height?: number;
    style?: React.CSSProperties;
}) {
    return (
        <div style={{
            width,
            height,
            background: 
                'linear-gradient(90deg, ' +
                '#1A1A1A 25%, ' +
                '#2A2A2A 50%, ' +
                '#1A1A1A 75%)',
            backgroundSize: '200% 100%',
            animation: 
                'shimmer 1.5s infinite',
            borderRadius: '2px',
            ...style,
        }} />
    );
}
