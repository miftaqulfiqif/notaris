export type SettingViewMode = 'grid' | 'list';

export interface NotarisSetting {
    default_view: string;
    umum: string;
    halaman_awal: string;
    ukuran_font: string;
}

export interface NotarisPaket {
    name: string | null;
    features: string[] | null;
}

export interface NotarisMember {
    id: string;
    name: string;
    profile_picture: string | null;
    access: string | null;
}

export interface NotarisNotificationSetting {
    notifikasi_dalam_aplikasi: boolean;
    notifikasi_email: boolean;
}

export interface NotarisPackageStorage {
    used_storage_gb: number;
    total_storage_gb: number;
    remaining_storage_mb: number;
    percentage_used: number;
}

export interface NotarisSettingData {
    setting: NotarisSetting | null;
    subscription_package: NotarisPaket | null;
    member: NotarisMember[] | null;
    notifikasi: NotarisNotificationSetting | null;
    package_storage: NotarisPackageStorage | null;
}

export interface NotarisSettingResponse {
    message: string;
    data: NotarisSettingData;
}

export interface UpdateNotarisGeneralPayload {
    default_view: SettingViewMode;
    umum: SettingViewMode;
    halaman_awal: string;
    ukuran_font: string;
}

export interface UpdateNotarisGeneralResponse {
    message: string;
    data: NotarisSetting;
}

export interface UpdateNotarisMemberPayloadItem {
    user_id: string;
    access: string;
}

export interface UpdateNotarisMemberItem {
    id: string;
    access: string | null;
}

export interface UpdateNotarisMemberResponse {
    message: string;
    data: UpdateNotarisMemberItem[];
}
