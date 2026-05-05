import type { Metadata } from 'next';
import { LandingPage as MarketingLandingPage } from '@/features/landing/LandingPage';
import { siteConfig } from '@/shared/utils/seo';

export const metadata: Metadata = {
    title: siteConfig.title,
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    alternates: {
        canonical: '/',
    },
};

const structuredData = [
    {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
    },
    {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: 'id-ID',
    },
];

export default function LandingPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <MarketingLandingPage />
        </>
    );
}
