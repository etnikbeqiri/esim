interface CountryFlagProps {
    countryCode: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'h-4 w-6',
    md: 'h-6 w-9',
    lg: 'h-8 w-12',
    xl: 'h-12 w-18',
};

export function CountryFlag({
    countryCode,
    size = 'md',
    className = '',
}: CountryFlagProps) {
    const code = countryCode.toLowerCase();
    const src = `https://flagcdn.com/${code}.svg`;

    return (
        <img
            src={src}
            alt={`${countryCode.toUpperCase()} flag`}
            className={`inline-block object-cover ${sizeClasses[size]} ${className}`}
            loading="lazy"
        />
    );
}
