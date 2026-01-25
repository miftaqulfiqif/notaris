import Image from 'next/image';
import SpotIllustration from '@/assets/images/Spot Ilustrations.png';

export function ActivitySection() {
    return (
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Aktivitas</h3>

            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                <div className="w-64 h-48 flex items-center justify-center relative mb-6">
                    <Image
                        src={SpotIllustration}
                        alt="No Activity Illustration"
                        className="object-contain"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>

                <h4 className="text-lg font-bold text-gray-900 mb-1">Belum ada aktivitas arsip Dokumen</h4>
            </div>
        </div>
    );
}
