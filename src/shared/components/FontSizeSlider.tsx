'use client';

import { useEffect, useState } from 'react';

export function FontSizeSlider() {
    const [stepIndex, setStepIndex] = useState(2);
    const steps = [0.85, 0.925, 1, 1.075, 1.15];

    useEffect(() => {
        const saved = localStorage.getItem('font-scale');
        if (saved) {
            const val = parseFloat(saved);
            const idx = steps.findIndex(s => Math.abs(s - val) < 0.01);
            if (idx !== -1) {
                setStepIndex(idx);
                document.documentElement.style.setProperty('--font-scale', val.toString());
            }
        }
    }, []);

    const onSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const idx = parseInt(e.target.value);
        setStepIndex(idx);
        const newVal = steps[idx];
        document.documentElement.style.setProperty('--font-scale', newVal.toString());
        localStorage.setItem('font-scale', newVal.toString());
    };

    return (
        <div className="px-6 py-4 border-t border-gray-100">
            <div className="mb-3 text-sm font-semibold text-gray-700">Ukuran Teks</div>
            <div className="relative mb-6">
                <input
                    type="range"
                    min="0"
                    max="4"
                    step="1"
                    value={stepIndex}
                    onChange={onSliderChange}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--sidebar-primary)] focus:outline-none"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2 absolute w-full -left-1 px-1">
                    <span className={`text-[0.85rem] ${stepIndex === 0 ? 'font-bold text-gray-900' : ''}`}>Kecil</span>
                    <span className={`text-[1rem] ${stepIndex === 2 ? 'font-bold text-gray-900' : ''}`}>Sedang</span>
                    <span className={`text-[1.15rem] leading-none ${stepIndex === 4 ? 'font-bold text-gray-900' : ''}`}>Besar</span>
                </div>
            </div>
        </div>
    );
}
