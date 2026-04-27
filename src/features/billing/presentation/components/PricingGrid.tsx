'use client';

import type { BillingPackage } from '../../types/billing.types';
import { PricingCard } from './PricingCard';

export function PricingGrid({ packages }: Readonly<{ packages: BillingPackage[] }>) {
    return (
        <div className="flex flex-wrap items-start justify-center gap-6">
            {packages.map((packageItem) => (
                <PricingCard key={packageItem.id} packageItem={packageItem} />
            ))}
        </div>
    );
}
