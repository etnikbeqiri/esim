import { ImgHTMLAttributes } from 'react';

interface AppLogoIconProps extends ImgHTMLAttributes<HTMLImageElement> {
    size?: 'sm' | 'md' | 'lg';
}

export default function AppLogoIcon({ size = 'md', className = '', ...props }: AppLogoIconProps) {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
    };

    return (
        <img
            src="/logo.png"
            alt="Logo"
            className={`${sizeClasses[size]} object-contain ${className}`}
            {...props}
        />
    );
}
