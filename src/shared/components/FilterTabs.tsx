import { LucideIcon } from 'lucide-react';

export interface TabItem {
    id: string;
    label: string;
    icon?: LucideIcon;
}

export interface FilterTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (id: string) => void;
}

export function FilterTabs({ tabs, activeTab, onChange }: FilterTabsProps) {
    return (
        <div className="flex gap-4 mb-6">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg border transition-colors ${isActive
                                ? 'bg-white border-gray-300 text-gray-900 font-medium shadow-sm'
                                : 'bg-transparent border-gray-200 text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {Icon && <Icon className="w-4 h-4" />}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
