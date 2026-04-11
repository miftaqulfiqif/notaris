'use client';

import type { ReactNode } from 'react';

interface LandingCardProps {
    children: ReactNode;
    className?: string;
}

export function LandingCard({ children, className = '' }: LandingCardProps) {
    return (
        <section
            className={`relative overflow-hidden bg-[#6B5C48] text-[#F6F2ED] shadow-[0_24px_70px_rgba(0,0,0,0.25)] ${className || 'rounded-[22px]'}`}
        >


            <div className="relative">{children}</div>
        </section>
    );
}

