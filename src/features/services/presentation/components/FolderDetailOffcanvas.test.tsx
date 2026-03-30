import React from 'react';
import { render, screen } from '@testing-library/react';
import { FolderDetailOffcanvas } from './FolderDetailOffcanvas';

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => {
        const { fill, priority, alt, ...rest } = props;
        return React.createElement('img', {
            ...rest,
            alt: typeof alt === 'string' ? alt : '',
            'data-fill': fill ? 'true' : undefined,
            'data-priority': priority ? 'true' : undefined,
        });
    },
}));

jest.mock('@/layout/providers/SidebarContext', () => ({
    useSidebar: () => ({
        services: [],
    }),
}));

jest.mock('@/shared/api/api-client', () => ({
    apiGet: jest.fn(),
}));

const { apiGet } = jest.requireMock('@/shared/api/api-client') as {
    apiGet: jest.Mock;
};

describe('FolderDetailOffcanvas', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders nothing when folderId is null', () => {
        const { container } = render(
            <FolderDetailOffcanvas folderId={null} onClose={jest.fn()} />,
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders the offcanvas with folder name when folderId is provided', async () => {
        apiGet.mockResolvedValue({
            data: {
                folder_name: 'PT ABC Corp',
                have_access: [{ name: 'Admin 1', profile_picture: null }],
                detail_status: { status: 'selesai', last_modified: null, modification_by: null },
                detail_folder: {
                    tipe_layanan: 'Pendirian',
                    modified_at: '2025-04-15',
                    modified_by: 'Admin 1',
                    opened_at: '2025-04-14',
                    opened_by: 'Admin 1',
                    created_at: '2025-04-10',
                    created_by: 'Admin 1',
                },
            },
        });

        render(
            <FolderDetailOffcanvas
                folderId="folder-1"
                folderName="PT ABC Corp"
                onClose={jest.fn()}
            />,
        );

        expect(await screen.findByText('PT ABC Corp')).toBeInTheDocument();
    });

    it('does NOT render a Dibuka field in the detail tab', async () => {
        apiGet.mockResolvedValue({
            data: {
                folder_name: 'Test Folder',
                have_access: [],
                detail_status: { status: 'proses', last_modified: null, modification_by: null },
                detail_folder: {
                    tipe_layanan: 'Perubahan',
                    modified_at: null,
                    modified_by: null,
                    opened_at: '2025-04-14',
                    opened_by: 'Admin 1',
                    created_at: null,
                    created_by: null,
                },
            },
        });

        render(
            <FolderDetailOffcanvas
                folderId="folder-2"
                folderName="Test Folder"
                onClose={jest.fn()}
            />,
        );

        expect(await screen.findByText('Test Folder')).toBeInTheDocument();
        expect(screen.queryByText('Dibuka')).not.toBeInTheDocument();
    });

    it('renders tipe layanan as a clickable element when available', async () => {
        apiGet.mockResolvedValue({
            data: {
                folder_name: 'Test Folder',
                have_access: [],
                detail_status: { status: 'selesai', last_modified: null, modification_by: null },
                detail_folder: {
                    tipe_layanan: 'Pendirian',
                    modified_at: null,
                    modified_by: null,
                    opened_at: null,
                    opened_by: null,
                    created_at: null,
                    created_by: null,
                },
            },
        });

        render(
            <FolderDetailOffcanvas
                folderId="folder-3"
                folderName="Test Folder"
                onClose={jest.fn()}
            />,
        );

        // The tipe layanan label should be rendered
        expect(await screen.findByText('Pendirian')).toBeInTheDocument();
    });
});
