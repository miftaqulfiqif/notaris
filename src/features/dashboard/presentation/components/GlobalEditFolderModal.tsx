'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useEditFolderModal } from '@/features/dashboard/context/EditFolderModalContext';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { apiPatch } from '@/shared/api/api-client';
import { DebouncedInput } from '@/shared/components/DebouncedInput';
import { EditFolderFormData, EMPTY_EDIT_FOLDER_FORM } from '@/features/dashboard/types';

export function GlobalEditFolderModal() {
    const { isOpen, closeModal, preSelection } = useEditFolderModal();
    const [formData, setFormData] = useState<EditFolderFormData>(EMPTY_EDIT_FOLDER_FORM);
    const [prevIsOpen, setPrevIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && !prevIsOpen) {
            setFormData(preSelection?.initialData || EMPTY_EDIT_FOLDER_FORM);
            setError(null);
        }
        setPrevIsOpen(isOpen);
    }, [isOpen, prevIsOpen, preSelection]);

    if (!isOpen) return null;

    const handleInputChange = (field: keyof EditFolderFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'folder_name' && value.trim()) {
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!preSelection?.folderId) {
            setError('Folder tidak ditemukan');
            return;
        }

        const normalizedFolderName = formData.folder_name.trim();
        if (!normalizedFolderName) {
            setError('Nama Folder harus diisi');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const url = ENDPOINTS.USER.EDIT_FOLDER.replace(':folder_id', preSelection.folderId);
            await apiPatch(url, {
                folder_name: normalizedFolderName,
                kedudukan: formData.kedudukan,
                nomor_akta: formData.nomor_akta,
            });

            if (preSelection?.onSuccess) {
                preSelection.onSuccess();
            }
            closeModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in duration-200 fade-in zoom-in-95">
                <div className="flex justify-between items-center p-4 border-gray-100 border-b">
                    <div>
                        <h2 className="font-bold text-gray-900 text-xl">Edit data folder</h2>
                        <p className="mt-1 text-gray-500 text-sm">Perbarui informasi folder</p>
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
                                Nama Folder <span className="text-red-500">*</span>
                            </label>
                            <DebouncedInput
                                type="text"
                                value={formData.folder_name}
                                onChange={(value) => handleInputChange('folder_name', value as string)}
                                placeholder="Contoh: PT ABC"
                                required
                                className="bg-white px-3 py-2 border border-gray-200 focus:border-[#8B7355] rounded-xl focus:outline-none focus:ring-[#8B7355]/20 focus:ring-2 w-full text-gray-700 placeholder:text-gray-400"
                            />
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
                        ) : null}
                        <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
