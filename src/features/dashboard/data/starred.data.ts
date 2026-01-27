import { Folder, FileText } from 'lucide-react';

export interface StarredItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    author: string;
    modifiedDate: string;
    location: string;
    isStarred: boolean;
}

export const starredItems: StarredItem[] = [
    {
        id: '1',
        name: 'PT. Abibas Sport',
        type: 'folder',
        author: 'Admin 2',
        modifiedDate: 'Januari, 13 2026',
        location: 'Pendirian',
        isStarred: true,
    },
    {
        id: '2',
        name: 'Akta.pdf',
        type: 'file',
        author: 'Admin 2',
        modifiedDate: 'Januari, 13 2026',
        location: 'PT. Abibas Sport',
        isStarred: true,
    },
];
