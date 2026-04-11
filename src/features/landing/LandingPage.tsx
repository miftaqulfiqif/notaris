import { LandingCard } from '@/features/landing/components/LandingCard';
import { LandingCTA } from '@/features/landing/components/LandingCTA';
import { LandingFeatures } from '@/features/landing/components/LandingFeatures';
import { LandingFooter } from '@/features/landing/components/LandingFooter';
import { LandingHero } from '@/features/landing/components/LandingHero';
import { LandingNavbar } from '@/features/landing/components/LandingNavbar';
import { LandingTestimonial } from '@/features/landing/components/LandingTestimonial';

export function LandingPage() {
    return (
        <main
            className="min-h-screen"
            style={{
                background:
                    'radial-gradient(1200px 600px at 50% 0%, rgba(152,133,107,0.20), rgba(245,242,238,1) 55%)',
            }}
        >
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
                {/* Navbar serves as the folder tab */}
                <LandingNavbar />
                
                {/* Main brown hero card, sitting exactly below the navbar tab */}
                <LandingCard className="rounded-tl-none rounded-tr-[22px] rounded-b-[22px] -mt-[1px]">
                    <LandingHero />
                </LandingCard>
            </div>

            <LandingFeatures />
            <LandingTestimonial />
            <LandingCTA />
            <LandingFooter />
        </main>
    );
}
