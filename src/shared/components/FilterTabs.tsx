import { Clock, Star } from 'lucide-react';

export type ActivityTab = 'recent' | 'favorite';

interface FilterTabsProps {
    activeTab: ActivityTab;
    onTabChange: (tab: ActivityTab) => void;
}

export function FilterTabs({ activeTab, onTabChange }: FilterTabsProps) {
    return (
        <div className="flex gap-4 mb-6">
            <button
                onClick={() => onTabChange('recent')}
                className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg border transition-colors ${activeTab === 'recent'
                    ? 'bg-white border-gray-300 text-gray-900 font-medium shadow-sm'
                    : 'bg-transparent border-gray-200 text-gray-500 hover:text-gray-700'
                    }`}
            >
                <Clock className="w-4 h-4" />
                Baru di tambahkan
            </button>
            <button
                onClick={() => onTabChange('favorite')}
                className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg border transition-colors ${activeTab === 'favorite'
                    ? 'bg-white border-gray-300 text-gray-900 font-medium shadow-sm'
                    : 'bg-transparent border-gray-200 text-gray-500 hover:text-gray-700'
                    }`}
            >
                <Star className="w-4 h-4" />
                Favorite
            </button>
        </div>
    );
}
