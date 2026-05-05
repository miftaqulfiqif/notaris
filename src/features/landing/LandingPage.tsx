import { LandingCard } from '@/features/landing/components/LandingCard';
import { LandingCTA } from '@/features/landing/components/LandingCTA';
import { LandingFeatures } from '@/features/landing/components/LandingFeatures';
import { LandingFooter } from '@/features/landing/components/LandingFooter';
import { LandingHero } from '@/features/landing/components/LandingHero';
import { LandingNavbar } from '@/features/landing/components/LandingNavbar';
import { LandingTestimonial } from '@/features/landing/components/LandingTestimonial';

export function LandingPage() {
    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10 lg:px-[60px] lg:py-11">
                <LandingNavbar />

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
