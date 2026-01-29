import { useState } from 'react';
import { ActivityTab } from '@/shared/components/FilterTabs';

export function useActivityTabs(initialTab: ActivityTab = 'recent') {
    const [activeTab, setActiveTab] = useState<ActivityTab>(initialTab);

    return {
        activeTab,
        setActiveTab
    };
}
