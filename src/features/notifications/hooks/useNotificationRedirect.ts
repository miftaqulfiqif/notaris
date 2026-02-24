'use client';

import { useCallback, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ApiResponse, apiGet } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { NotificationItem } from '@/features/notifications/types/notification.types';
import type { Service } from '@/features/dashboard/types/service.types';
import type { FolderSidebarResponse, ServiceType } from '@/features/services/types';

interface UseNotificationRedirectOptions {
    services: Service[];
    showToast: (options: { message: string; variant?: 'success' | 'error' | 'info'; duration?: number }) => void;
    markAsRead?: (notificationId: string) => Promise<void>;
}

interface FileSearchApiItem {
    folder_id: string | null;
    document_id: string | null;
    type: 'DOCUMENT' | 'FOLDER';
    name: string;
    parent: string;
}

interface FileSearchResponse {
    message: string;
    data: FileSearchApiItem[];
}

interface ResolvedDocumentTarget {
    documentId: string | null;
    folderId: string | null;
    parentTypeName: string | null;
}

const normalizeText = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, ' ');

const toSlug = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const parseActiveServiceRoute = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length < 3 || segments[0] !== 'services') {
        return null;
    }

    return {
        serviceSlug: segments[1],
        typeSlug: segments[2],
    };
};

const isTypeNameMatch = (sourceTypeName: string, candidateTypeName: string) => {
    const normalizedSource = normalizeText(sourceTypeName);
    const normalizedCandidate = normalizeText(candidateTypeName);
    const sourceSlug = toSlug(sourceTypeName);
    const candidateSlug = toSlug(candidateTypeName);

    return normalizedSource === normalizedCandidate
        || normalizedSource.includes(normalizedCandidate)
        || normalizedCandidate.includes(normalizedSource)
        || sourceSlug === candidateSlug;
};

const extractFileNameFromPath = (filePath: string | null) => {
    if (!filePath) return null;

    const plainPath = filePath.split(/[?#]/)[0] || filePath;
    const segments = plainPath.split('/').filter(Boolean);
    if (segments.length === 0) return null;

    return segments[segments.length - 1];
};

export function useNotificationRedirect({
    services,
    showToast,
    markAsRead,
}: UseNotificationRedirectOptions) {
    const router = useRouter();
    const pathname = usePathname();
    const [navigatingNotificationId, setNavigatingNotificationId] = useState<string | null>(null);

    const serviceTypesCacheRef = useRef<Record<string, ServiceType[]>>({});
    const folderRouteCacheRef = useRef<Record<string, string | null>>({});
    const folderTypeNameCacheRef = useRef<Record<string, string | null>>({});

    const fetchServiceTypesByService = useCallback(async (serviceId: string) => {
        const cached = serviceTypesCacheRef.current[serviceId];
        if (cached) {
            return cached;
        }

        const url = ENDPOINTS.USER.SERVICE_TYPES.replace(':serviceId', serviceId);
        const response = await apiGet<ApiResponse<ServiceType[]>>(url);
        const serviceTypes = response.data || [];
        serviceTypesCacheRef.current[serviceId] = serviceTypes;
        return serviceTypes;
    }, []);

    const resolveServiceAndTypeSlugs = useCallback(
        async (typeNameCandidates: string[]) => {
            const normalizedCandidates = typeNameCandidates
                .map((name) => name.trim())
                .filter(Boolean);

            if (normalizedCandidates.length === 0) {
                return null;
            }

            for (const service of services) {
                const serviceTypes = await fetchServiceTypesByService(service.id);
                const matchedType = serviceTypes.find((type) =>
                    normalizedCandidates.some((candidate) => isTypeNameMatch(type.name, candidate)),
                );

                if (matchedType) {
                    return {
                        serviceSlug: toSlug(service.name),
                        typeSlug: toSlug(matchedType.name),
                    };
                }
            }

            return null;
        },
        [fetchServiceTypesByService, services],
    );

    const searchFolderByName = useCallback(async (folderName: string, folderId?: string | null) => {
        const params = new URLSearchParams({
            file_type: 'FOLDER',
            search: folderName,
        });

        const response = await apiGet<FileSearchResponse>(
            `${ENDPOINTS.NOTARIS.FILE_SEARCH}?${params.toString()}`,
        );

        const normalizedTarget = normalizeText(folderName);
        const byIdMatch = (response.data || []).find(
            (item) => item.type === 'FOLDER' && item.folder_id === folderId,
        );

        if (byIdMatch?.folder_id) {
            return {
                folderId: byIdMatch.folder_id,
                parentTypeName: byIdMatch.parent || null,
            };
        }

        const exactNameMatch = (response.data || []).find(
            (item) => item.type === 'FOLDER'
                && item.folder_id
                && normalizeText(item.name) === normalizedTarget,
        );

        if (exactNameMatch?.folder_id) {
            return {
                folderId: exactNameMatch.folder_id,
                parentTypeName: exactNameMatch.parent || null,
            };
        }

        const fallbackMatch = (response.data || []).find((item) => item.type === 'FOLDER' && item.folder_id);
        if (!fallbackMatch?.folder_id) {
            return null;
        }

        return {
            folderId: fallbackMatch.folder_id,
            parentTypeName: fallbackMatch.parent || null,
        };
    }, []);

    const resolveTypeNameByFolderId = useCallback(async (folderId: string) => {
        const cached = folderTypeNameCacheRef.current[folderId];
        if (cached !== undefined) {
            return cached;
        }

        try {
            const url = ENDPOINTS.USER.DETAIL_FOLDER_SIDEBAR.replace(':folder_id', folderId);
            const response = await apiGet<FolderSidebarResponse & { data?: Record<string, unknown> }>(url);
            const typedData = response.data as {
                detail_folder?: { tipe_layanan?: string };
                tipe_layanan?: string;
            } | undefined;

            const resolved = typedData?.detail_folder?.tipe_layanan?.trim()
                || typedData?.tipe_layanan?.trim()
                || null;

            folderTypeNameCacheRef.current[folderId] = resolved;
            return resolved;
        } catch {
            folderTypeNameCacheRef.current[folderId] = null;
            return null;
        }
    }, []);

    const resolveFolderRoute = useCallback(
        async (folderId: string, typeNameCandidate?: string | null, folderName?: string | null) => {
            const cachedRoute = folderRouteCacheRef.current[folderId];
            if (cachedRoute !== undefined) {
                return cachedRoute;
            }

            const activeRoute = parseActiveServiceRoute(pathname);
            if (activeRoute && typeNameCandidate && toSlug(typeNameCandidate) === activeRoute.typeSlug) {
                const contextualRoute = `/services/${activeRoute.serviceSlug}/${activeRoute.typeSlug}/${folderId}`;
                folderRouteCacheRef.current[folderId] = contextualRoute;
                return contextualRoute;
            }

            const typeNameCandidates: string[] = [];
            if (typeNameCandidate?.trim()) {
                typeNameCandidates.push(typeNameCandidate.trim());
            }

            const typeNameFromDetail = await resolveTypeNameByFolderId(folderId);
            if (typeNameFromDetail) {
                typeNameCandidates.push(typeNameFromDetail);
            }

            if (folderName?.trim()) {
                try {
                    const searchedFolder = await searchFolderByName(folderName.trim(), folderId);
                    if (searchedFolder?.parentTypeName) {
                        typeNameCandidates.push(searchedFolder.parentTypeName);
                    }
                } catch {
                    // Ignore search errors for route resolution fallback.
                }
            }

            const resolvedSlugs = await resolveServiceAndTypeSlugs(typeNameCandidates);

            if (resolvedSlugs) {
                const route = `/services/${resolvedSlugs.serviceSlug}/${resolvedSlugs.typeSlug}/${folderId}`;
                folderRouteCacheRef.current[folderId] = route;
                return route;
            }

            if (activeRoute) {
                const contextualRoute = `/services/${activeRoute.serviceSlug}/${activeRoute.typeSlug}/${folderId}`;
                folderRouteCacheRef.current[folderId] = contextualRoute;
                return contextualRoute;
            }

            folderRouteCacheRef.current[folderId] = null;
            return null;
        },
        [pathname, resolveServiceAndTypeSlugs, resolveTypeNameByFolderId, searchFolderByName],
    );

    const resolveDocumentTarget = useCallback(async (notification: NotificationItem): Promise<ResolvedDocumentTarget> => {
        const candidates = new Set<string>();

        if (notification.objectName?.trim()) {
            candidates.add(notification.objectName.trim());
        }

        const fileNameFromPath = extractFileNameFromPath(notification.filePath);
        if (fileNameFromPath?.trim()) {
            candidates.add(fileNameFromPath.trim());
        }

        for (const candidate of candidates) {
            const params = new URLSearchParams({
                file_type: 'DOCUMENT',
                search: candidate,
            });

            const response = await apiGet<FileSearchResponse>(
                `${ENDPOINTS.NOTARIS.FILE_SEARCH}?${params.toString()}`,
            );

            const items = response.data || [];
            if (items.length === 0) {
                continue;
            }

            const exactObjectNameMatch = notification.objectName
                ? items.find(
                    (item) => item.type === 'DOCUMENT'
                        && item.document_id
                        && normalizeText(item.name) === normalizeText(notification.objectName),
                )
                : null;

            if (exactObjectNameMatch?.document_id) {
                return {
                    documentId: exactObjectNameMatch.document_id,
                    folderId: exactObjectNameMatch.folder_id,
                    parentTypeName: exactObjectNameMatch.parent || null,
                };
            }

            const exactPathNameMatch = fileNameFromPath
                ? items.find(
                    (item) => item.type === 'DOCUMENT'
                        && item.document_id
                        && normalizeText(item.name) === normalizeText(fileNameFromPath),
                )
                : null;

            if (exactPathNameMatch?.document_id) {
                return {
                    documentId: exactPathNameMatch.document_id,
                    folderId: exactPathNameMatch.folder_id,
                    parentTypeName: exactPathNameMatch.parent || null,
                };
            }

            const firstDocumentMatch = items.find((item) => item.type === 'DOCUMENT' && item.document_id);
            if (firstDocumentMatch?.document_id) {
                return {
                    documentId: firstDocumentMatch.document_id,
                    folderId: firstDocumentMatch.folder_id,
                    parentTypeName: firstDocumentMatch.parent || null,
                };
            }
        }

        return {
            documentId: null,
            folderId: notification.objectId || null,
            parentTypeName: null,
        };
    }, []);

    const openNotification = useCallback(async (notification: NotificationItem) => {
        if (navigatingNotificationId) {
            return;
        }

        setNavigatingNotificationId(notification.id);

        try {
            if (notification.unread && markAsRead) {
                try {
                    await markAsRead(notification.id);
                } catch {
                    showToast({ message: 'Gagal menandai notifikasi sebagai dibaca', variant: 'error' });
                }
            }

            const objectType = (notification.objectType || '').toUpperCase();

            if (objectType === 'DOCUMENT') {
                const hasLikelyFileName = /\.[a-z0-9]{2,5}$/i.test(notification.objectName || '');
                const shouldResolveDocumentPreview = Boolean(notification.filePath) || hasLikelyFileName;

                const resolvedDocument = shouldResolveDocumentPreview
                    ? await resolveDocumentTarget(notification)
                    : {
                        documentId: null,
                        folderId: notification.objectId || null,
                        parentTypeName: null,
                    };

                if (resolvedDocument.documentId) {
                    const previewUrl = ENDPOINTS.USER.DOCUMENT_VIEW.replace(':documentId', resolvedDocument.documentId);
                    const previewWindow = window.open(previewUrl, '_blank', 'noopener,noreferrer');

                    if (!previewWindow) {
                        showToast({ message: 'Gagal membuka preview dokumen', variant: 'error' });
                        return;
                    }

                    return;
                }

                if (resolvedDocument.folderId) {
                    const route = await resolveFolderRoute(
                        resolvedDocument.folderId,
                        resolvedDocument.parentTypeName,
                        notification.objectName,
                    );

                    if (route) {
                        showToast({
                            message: 'Preview dokumen tidak ditemukan, membuka folder terkait',
                            variant: 'info',
                        });
                        router.push(route);
                        return;
                    }
                }

                showToast({ message: 'Dokumen pada notifikasi tidak ditemukan', variant: 'error' });
                return;
            }

            if (objectType === 'FOLDER') {
                const folderId = notification.objectId;
                if (!folderId) {
                    showToast({ message: 'Folder pada notifikasi tidak valid', variant: 'error' });
                    return;
                }

                const route = await resolveFolderRoute(folderId, null, notification.objectName);

                if (!route) {
                    showToast({ message: 'Rute folder belum tersedia', variant: 'error' });
                    return;
                }

                router.push(route);
                return;
            }

            showToast({ message: 'Notifikasi ini belum memiliki halaman tujuan', variant: 'info' });
        } catch {
            showToast({ message: 'Gagal membuka notifikasi', variant: 'error' });
        } finally {
            setNavigatingNotificationId(null);
        }
    }, [markAsRead, navigatingNotificationId, resolveDocumentTarget, resolveFolderRoute, router, showToast]);

    return {
        navigatingNotificationId,
        openNotification,
    };
}
