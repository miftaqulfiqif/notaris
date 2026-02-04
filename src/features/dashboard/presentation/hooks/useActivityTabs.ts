import { useState } from 'react';

export type ActivityTab = 'recent' | 'favorite';

export function useActivityTabs(initialTab: ActivityTab = 'recent') {
    const [activeTab, setActiveTab] = useState<ActivityTab>(initialTab);

    return {
        activeTab,
        setActiveTab
    };
}
