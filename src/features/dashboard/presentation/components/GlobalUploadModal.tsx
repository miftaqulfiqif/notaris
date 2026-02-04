'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Folder, Plus, Loader2 } from 'lucide-react';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { apiGet, apiPost, ApiResponse } from '@/shared/api/api-client';
import { UploadFormData, EMPTY_UPLOAD_FORM } from '@/features/dashboard/types';
import { ServiceType } from '@/features/services/types';

export function GlobalUploadModal() {
    const { isOpen, closeModal, files, setFiles, preSelection } = useUploadModal();
    const { services } = useSidebar();
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState<UploadFormData>(EMPTY_UPLOAD_FORM);

    // Tipe layanan for selected layanan
    const [tipeLayananList, setTipeLayananList] = useState<ServiceType[]>([]);
    const [isLoadingTipeLayanan, setIsLoadingTipeLayanan] = useState(false);

    // Check if layanan is pre-selected (locked)
    const isLayananLocked = !!preSelection?.layananId;
    // Check if tipe layanan is pre-selected (locked) - for future use
    const isTipeLayananLocked = !!preSelection?.tipeLayananId;

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                ...EMPTY_UPLOAD_FORM,
                layanan_id: preSelection?.layananId || '',
                tipe_layanan_id: preSelection?.tipeLayananId || '',
            });
            setError(null);
        }
    }, [isOpen, preSelection]);

    // Fetch tipe layanan when layanan changes
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

    // Sync file_name with selected files
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
        // Reset tipe_layanan when layanan changes
        if (field === 'layanan_id') {
            setFormData(prev => ({ ...prev, tipe_layanan_id: '' }));
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.layanan_id) {
            setError('Layanan harus dipilih');
            return;
        }
        if (!formData.tipe_layanan_id) {
            setError('Tipe Layanan harus dipilih');
            return;
        }
        if (!formData.nama_penghadap) {
            setError('Nama Penghadap harus diisi');
            return;
        }
        if (!formData.nik_penghadap) {
            setError('NIK Penghadap harus diisi');
            return;
        }
        if (!files || files.length === 0) {
            setError('File harus dipilih');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await apiPost(ENDPOINTS.USER.UPLOAD_FILE, formData);
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

    // Get display name for locked layanan
    const getLayananDisplayName = () => {
        if (preSelection?.layananName) return preSelection.layananName;
        const service = services.find(s => s.id === formData.layanan_id);
        return service?.name || '';
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
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Layanan Select */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Layanan <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                {isLayananLocked ? (
                                    <input
                                        type="text"
                                        value={getLayananDisplayName()}
                                        disabled
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-not-allowed"
                                    />
                                ) : (
                                    <>
                                        <select
                                            value={formData.layanan_id}
                                            onChange={(e) => handleInputChange('layanan_id', e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355] appearance-none"
                                        >
                                            <option value="">Pilih Layanan</option>
                                            {services.map((service) => (
                                                <option key={service.id} value={service.id}>
                                                    {service.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Tipe Layanan Select */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Tipe Layanan <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                {isTipeLayananLocked ? (
                                    <input
                                        type="text"
                                        value={preSelection?.tipeLayananName || ''}
                                        disabled
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-not-allowed"
                                    />
                                ) : (
                                    <>
                                        <select
                                            value={formData.tipe_layanan_id}
                                            onChange={(e) => handleInputChange('tipe_layanan_id', e.target.value)}
                                            disabled={!formData.layanan_id || isLoadingTipeLayanan}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355] appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
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

                        {/* Folder Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nama Folder</label>
                            <input
                                type="text"
                                value={formData.folder_name}
                                onChange={(e) => handleInputChange('folder_name', e.target.value)}
                                placeholder="Contoh: PT MasPek Jaya"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
                            />
                        </div>

                        {/* Kedudukan */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Kedudukan</label>
                            <input
                                type="text"
                                value={formData.kedudukan}
                                onChange={(e) => handleInputChange('kedudukan', e.target.value)}
                                placeholder="Kedudukan"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
                            />
                        </div>

                        {/* Nomor Akta */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nomor Akta</label>
                            <input
                                type="text"
                                value={formData.nomor_akta}
                                onChange={(e) => handleInputChange('nomor_akta', e.target.value)}
                                placeholder="Nomor Akta"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
                            />
                        </div>

                        {/* Nomor PT */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nomor PT</label>
                            <input
                                type="text"
                                value={formData.nomor_pt}
                                onChange={(e) => handleInputChange('nomor_pt', e.target.value)}
                                placeholder="Nomor PT"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
                            />
                        </div>

                        {/* Nama Penghadap */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Nama Penghadap <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.nama_penghadap}
                                onChange={(e) => handleInputChange('nama_penghadap', e.target.value)}
                                placeholder="Nama Penghadap"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
                            />
                        </div>

                        {/* NIK Penghadap */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                NIK Penghadap <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.nik_penghadap}
                                onChange={(e) => handleInputChange('nik_penghadap', e.target.value)}
                                placeholder="NIK Penghadap"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355]"
                            />
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Upload File <span className="text-red-500">*</span>
                        </label>
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
                        disabled={isSubmitting}
                        className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#8B7355] text-white font-medium rounded-xl hover:bg-[#7A6548] transition-colors shadow-sm disabled:opacity-50"
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
