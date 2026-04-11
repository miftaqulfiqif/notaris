'use client';

import { useState } from 'react';

export function FontSizeSlider() {
    const steps = [0.85, 0.925, 1, 1.075, 1.15];

    const [stepIndex, setStepIndex] = useState(() => {
        if (typeof window === 'undefined') return 2;
        const saved = localStorage.getItem('font-scale');
        if (saved) {
            const val = parseFloat(saved);
            const idx = steps.findIndex(s => Math.abs(s - val) < 0.01);
            if (idx !== -1) {
                document.documentElement.style.setProperty('--font-scale', val.toString());
                return idx;
            }
        }
        return 2;
    });

    const onSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const idx = parseInt(e.target.value);
        setStepIndex(idx);
        const newVal = steps[idx];
        document.documentElement.style.setProperty('--font-scale', newVal.toString());
        localStorage.setItem('font-scale', newVal.toString());
    };

    return (
        <div className="px-6 py-4 border-gray-100 border-t">
            <div className="mb-3 font-semibold text-gray-700 text-sm">Ukuran Teks</div>
            <div className="relative mb-6">
                <input
                    type="range"
                    min="0"
                    max="4"
                    step="1"
                    value={stepIndex}
                    onChange={onSliderChange}
                    className="bg-gray-200 rounded-lg focus:outline-none w-full h-1 accent-[var(--sidebar-primary)] appearance-none cursor-pointer"
                />
                <div className="-left-1 absolute flex justify-between mt-2 px-1 w-full text-gray-500 text-xs">
                    <span className={`text-[0.85rem] ${stepIndex === 0 ? 'font-bold text-gray-900' : ''}`}>Kecil</span>
                    <span className={`text-[1rem] ${stepIndex === 2 ? 'font-bold text-gray-900' : ''}`}>Sedang</span>
                    <span className={`text-[1.15rem] leading-none ${stepIndex === 4 ? 'font-bold text-gray-900' : ''}`}>Besar</span>
                </div>
            </div>
        </div>
    );
}
