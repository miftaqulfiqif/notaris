import Image from 'next/image';
import logo from '@/assets/logo/Logo.svg';

interface BrandLogoProps {
    className?: string;
    width?: number;
    height?: number;
    alt?: string;
    priority?: boolean;
}

export function BrandLogo({
    className = '',
    width = 135,
    height = 50,
    alt = 'Notarix',
    priority = false,
}: BrandLogoProps) {
    return (
        <div className={`inline-flex items-center ${className}`}>
            <Image src={logo} alt={alt} width={width} height={height} priority={priority} />
        </div>
    );
}

