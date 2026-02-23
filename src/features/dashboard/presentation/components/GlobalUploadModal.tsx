'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Folder, Plus, Loader2 } from 'lucide-react';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { apiGet, apiPost, ApiResponse } from '@/shared/api/api-client';
import { UploadFormData, EMPTY_UPLOAD_FORM } from '@/features/dashboard/types';
import { ServiceType } from '@/features/services/types';
import { DebouncedInput } from '@/shared/components/DebouncedInput';

export function GlobalUploadModal() {
    const { isOpen, closeModal, files, setFiles, preSelection } = useUploadModal();
    const { services } = useSidebar();
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<UploadFormData>(EMPTY_UPLOAD_FORM);

    const [tipeLayananList, setTipeLayananList] = useState<ServiceType[]>([]);
    const [isLoadingTipeLayanan, setIsLoadingTipeLayanan] = useState(false);

    const isLayananLocked = !!preSelection?.layananId;
    const isTipeLayananLocked = !!preSelection?.tipeLayananId;
    const isFolderLocked = !!preSelection?.folderName?.trim();

    const [prevIsOpen, setPrevIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen && !prevIsOpen) {
            setFormData({
                ...EMPTY_UPLOAD_FORM,
                layanan_id: preSelection?.layananId || '',
                tipe_layanan_id: preSelection?.tipeLayananId || '',
                folder_name: preSelection?.folderName?.trim() || '',
            });
            setError(null);
        }
        setPrevIsOpen(isOpen);
    }, [isOpen, preSelection, prevIsOpen]);

    useEffect(() => {
        const fetchTipeLayanan = async () => {
            if (!formData.layanan_id) {
                setTipeLayananList([]);
                return;
            }

            setIsLoadingTipeLayanan(true);
            try {
                const url = ENDPOINTS.USER.SERVICE_TYPES.replace(':serviceId', formData.layanan_id);
                const data = await apiGet<ApiResponse<ServiceType[]>>(url);
                setTipeLayananList(data.data || []);
            } catch (err) {
                console.error('Failed to fetch tipe layanan', err);
                setTipeLayananList([]);
            } finally {
                setIsLoadingTipeLayanan(false);
            }
        };

        fetchTipeLayanan();
    }, [formData.layanan_id]);

    useEffect(() => {
        if (files && files.length > 0) {
            setFormData(prev => ({
                ...prev,
                file_name: files[0].name.replace(/\.[^/.]+$/, '')
            }));
        }
    }, [files]);

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

    const handleInputChange = (field: keyof UploadFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'layanan_id') {
            setFormData(prev => ({ ...prev, tipe_layanan_id: '' }));
        }
    };

    const handleSubmit = async () => {
        const normalizedFolderName = formData.folder_name.trim();

        if (!normalizedFolderName) {
            setError('Nama Folder harus diisi');
            return;
        }
        if (!formData.layanan_id) {
            setError('Layanan harus dipilih');
            return;
        }
        if (!formData.tipe_layanan_id) {
            setError('Tipe Layanan harus dipilih');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                layanan_id: formData.layanan_id,
                tipe_layanan_id: formData.tipe_layanan_id,
                folder_name: normalizedFolderName,
                kedudukan: formData.kedudukan,
                nomor_akta: formData.nomor_akta,
                ...(formData.file_name ? { file_name: formData.file_name } : {}),
            };

            await apiPost(ENDPOINTS.USER.UPLOAD_FILE, payload);
            if (preSelection?.onSuccess) {
                preSelection.onSuccess();
            }
            closeModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload gagal');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getLayananDisplayName = () => {
        if (preSelection?.layananName) return preSelection.layananName;
        const service = services.find(s => s.id === formData.layanan_id);
        return service?.name || '';
    };

    return (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in duration-200 fade-in zoom-in-95">
                <div className="flex justify-between items-center p-4 border-gray-100 border-b">
                    <div>
                        <h2 className="font-bold text-gray-900 text-xl">Upload data baru</h2>
                        <p className="mt-1 text-gray-500 text-sm">Silahkan unggah data baru sesuai tipe layanan</p>
                    </div>
                    <button
                        onClick={closeModal}
                        className="hover:bg-gray-100 p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-[14px] p-6">
                    {error && (
                        <div className="bg-red-50 p-3 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="font-medium text-gray-700 text-sm">
                                Layanan <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                {isLayananLocked ? (
                                    <input
                                        type="text"
                                        value={getLayananDisplayName()}
                                        disabled
                                        className="bg-gray-100 px-3 py-2 border border-gray-200 rounded-xl w-full text-gray-700 cursor-not-allowed"
                                    />
                                ) : (
                                    <>
                                        <select
                                            value={formData.layanan_id}
                                            onChange={(e) => handleInputChange('layanan_id', e.target.value)}
                                            className="bg-white px-3 py-2 border border-gray-200 focus:border-[#8B7355] rounded-xl focus:outline-none focus:ring-[#8B7355]/20 focus:ring-2 w-full text-gray-700 appearance-none"
                                        >
                                            <option value="">Pilih Layanan</option>
                                            {services.map((service) => (
                                                <option key={service.id} value={service.id}>
                                                    {service.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="top-1/2 right-4 absolute text-gray-400 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium text-gray-700 text-sm">
                                Tipe Layanan <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                {isTipeLayananLocked ? (
                                    <input
                                        type="text"
                                        value={preSelection?.tipeLayananName || ''}
                                        disabled
                                        className="bg-gray-100 px-3 py-2 border border-gray-200 rounded-xl w-full text-gray-700 cursor-not-allowed"
                                    />
                                ) : (
                                    <>
                                        <select
                                            value={formData.tipe_layanan_id}
                                            onChange={(e) => handleInputChange('tipe_layanan_id', e.target.value)}
                                            disabled={!formData.layanan_id || isLoadingTipeLayanan}
                                            className="bg-white disabled:bg-gray-100 px-3 py-2 border border-gray-200 focus:border-[#8B7355] rounded-xl focus:outline-none focus:ring-[#8B7355]/20 focus:ring-2 w-full text-gray-700 appearance-none disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {isLoadingTipeLayanan ? 'Memuat...' : 'Pilih Tipe Layanan'}
                                            </option>
                                            {tipeLayananList.map((tipe) => (
                                                <option key={tipe.id} value={tipe.id}>
                                                    {tipe.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="top-1/2 right-4 absolute text-gray-400 -translate-y-1/2 pointer-events-none">
                                            {isLoadingTipeLayanan ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium text-gray-700 text-sm">
                                Nama Folder <span className="text-red-500">*</span>
                            </label>
                            {isFolderLocked ? (
                                <input
                                    type="text"
                                    value={formData.folder_name}
                                    disabled
                                    className="bg-gray-100 px-3 py-2 border border-gray-200 rounded-xl w-full text-gray-700 cursor-not-allowed"
                                />
                            ) : (
                                <DebouncedInput
                                    type="text"
                                    value={formData.folder_name}
                                    onChange={(value) => handleInputChange('folder_name', value as string)}
                                    placeholder="Contoh: PT ABC"
                                    required
                                    className="bg-white px-3 py-2 border border-gray-200 focus:border-[#8B7355] rounded-xl focus:outline-none focus:ring-[#8B7355]/20 focus:ring-2 w-full text-gray-700 placeholder:text-gray-400"
                                />
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium text-gray-700 text-sm">Kedudukan</label>
                            <DebouncedInput
                                type="text"
                                value={formData.kedudukan}
                                onChange={(value) => handleInputChange('kedudukan', value as string)}
                                placeholder="Kedudukan"
                                className="bg-white px-3 py-2 border border-gray-200 focus:border-[#8B7355] rounded-xl focus:outline-none focus:ring-[#8B7355]/20 focus:ring-2 w-full text-gray-700 placeholder:text-gray-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium text-gray-700 text-sm">Nomor Akta</label>
                            <DebouncedInput
                                type="text"
                                value={formData.nomor_akta}
                                onChange={(value) => handleInputChange('nomor_akta', value as string)}
                                placeholder="Nomor Akta"
                                className="bg-white px-3 py-2 border border-gray-200 focus:border-[#8B7355] rounded-xl focus:outline-none focus:ring-[#8B7355]/20 focus:ring-2 w-full text-gray-700 placeholder:text-gray-400"
                            />
                        </div>

                    </div>

                    <div className="space-y-2">
                        <label className="font-medium text-gray-700 text-sm">Upload File</label>
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all bg-gray-50 cursor-pointer
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
                                    <div className="inline-block bg-[#8B7355]/10 mb-4 p-3 rounded-lg">
                                        <Folder className="fill-[#8B7355]/20 stroke-[#8B7355] w-8 h-8" />
                                    </div>
                                    <p className="font-medium text-gray-900">{files.length} file(s) selected</p>
                                    <p className="mt-1 text-gray-500 text-sm">
                                        {Array.from(files).map(f => f.name).join(', ')}
                                    </p>
                                    <p className="mt-2 text-[#8B7355] text-sm hover:underline">Click or drag to change</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-[#FFCC00] mb-4 p-3 rounded-lg text-white">
                                        <Folder className="fill-white stroke-white w-8 h-8" />
                                    </div>
                                    <p className="text-gray-500">Seret atau tekan File disini</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center items-center gap-3 p-6 border-gray-100 border-t">
                    <button
                        onClick={closeModal}
                        disabled={isSubmitting}
                        className="hover:bg-gray-50 disabled:opacity-50 px-6 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.folder_name.trim()}
                        className="flex items-center gap-2 bg-[#8B7355] hover:bg-[#7A6548] disabled:opacity-50 shadow-sm px-6 py-2.5 rounded-xl font-medium text-white transition-colors"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                        <span>{isSubmitting ? 'Uploading...' : 'Upload File'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
