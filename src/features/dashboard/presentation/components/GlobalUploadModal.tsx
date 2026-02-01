'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Folder, Plus } from 'lucide-react';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';

export function GlobalUploadModal() {
    const { isOpen, closeModal, files, setFiles } = useUploadModal();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(e.dataTransfer.files);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(e.target.files);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Upload data baru</h2>
                        <p className="text-sm text-gray-500 mt-1">Silahkan unggah data baru sesuai tipe layanan</p>
                    </div>
                    <button
                        onClick={closeModal}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-[14px]">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Layanan <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355] appearance-none">
                                    <option>PT</option>
                                    <option>CV</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Tipe Layanan <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355] appearance-none">
                                    <option>Pendirian, Pembubaran Dll</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Kedudukan</label>
                            <input
                                type="text"
                                placeholder="Pendirian"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nomor Akta</label>
                            <input
                                type="text"
                                placeholder="Pendirian"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nomor PT</label>
                            <input
                                type="text"
                                placeholder="Pendirian"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Nama Penghadap <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Pendirian"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                NIK Penghadap <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Pendirian"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Upload File <span className="text-red-500">*</span>
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all bg-gray-50
                                ${isDragging ? 'border-[#8B7355] bg-[#8B7355]/5' : 'border-gray-300 hover:border-gray-400'}
                            `}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileInput}
                                multiple
                            />

                            {files && files.length > 0 ? (
                                <div className="text-center">
                                    <div className="bg-[#8B7355]/10 p-3 rounded-lg mb-4 inline-block">
                                        <Folder className="w-8 h-8 stroke-[#8B7355] fill-[#8B7355]/20" />
                                    </div>
                                    <p className="text-gray-900 font-medium">{files.length} file(s) selected</p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {Array.from(files).map(f => f.name).join(', ')}
                                    </p>
                                    <p className="text-[#8B7355] text-sm mt-2 hover:underline">Click or drag to change</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-[#FFCC00] p-3 rounded-lg mb-4 text-white">
                                        <Folder className="w-8 h-8 fill-white stroke-white" />
                                    </div>
                                    <p className="text-gray-500">Seret atau tekan File disini</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-3 p-6 border-t border-gray-100">
                    <button
                        onClick={closeModal}
                        className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#8B7355] text-white font-medium rounded-xl hover:bg-[#7A6548] transition-colors shadow-sm">
                        <Plus className="w-5 h-5" />
                        <span>Upload File</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
