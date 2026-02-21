export type SettingViewMode = 'grid' | 'list';

export interface NotarisSetting {
    default_view: string;
    umum: string;
    halaman_awal: string;
    ukuran_font: string;
}

export interface NotarisPaket {
    paket: string | null;
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

export interface NotarisSettingData {
    setting: NotarisSetting;
    paket: NotarisPaket;
    member: NotarisMember[];
    notifikasi: NotarisNotificationSetting;
}

export interface NotarisSettingResponse {
    message: string;
    data: NotarisSettingData;
}

