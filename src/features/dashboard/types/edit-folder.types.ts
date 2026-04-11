export interface EditFolderFormData {
    folder_name: string;
    kedudukan: string;
    nomor_akta: string;
}

export interface EditFolderPreSelection {
    folderId: string;
    initialData?: EditFolderFormData;
    onSuccess?: () => void;
}

export const EMPTY_EDIT_FOLDER_FORM: EditFolderFormData = {
    folder_name: '',
    kedudukan: '',
    nomor_akta: '',
};
