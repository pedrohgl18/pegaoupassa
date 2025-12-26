export interface AdminStats {
    totalUsers: number;
    newToday: number;
    newWeek: number;
    totalMatches: number;
    totalSwipes: number;
    likesCount: number;
    passesCount: number;
    vipUsers: number;
    matchRate: number;
}

export interface UserRow {
    id: string;
    name: string;
    email: string;
    city: string | null;
    state: string | null;
    is_vip: boolean;
    vip_expires_at: string | null;
    is_active: boolean;
    created_at: string;
    photos: { url: string }[];
}

export interface GeoData {
    name: string;
    count: number;
}

export interface QuotaInfo {
    tableName: string;
    sizeBytes: number;
    sizePretty: string;
}

export interface StorageBucket {
    bucketId: string;
    filesCount: number;
    totalBytes: number;
}

export interface ReportRow {
    id: string;
    reporter_id: string;
    reported_id: string;
    reason: string;
    description: string | null;
    status: 'pending' | 'resolved' | 'dismissed';
    created_at: string;
    reporter: { name: string; email: string; photos: { url: string }[] };
    reported: { name: string; email: string; photos: { url: string }[]; is_active: boolean };
}

export interface AdminLog {
    id: string;
    admin_id: string;
    action: string;
    target_user_id: string | null;
    details: any;
    created_at: string;
    target_user?: { name: string; email: string };
}

export interface AdminAlert {
    type: 'warning' | 'danger';
    title: string;
    description: string;
}

export type AdminTab = 'dashboard' | 'users' | 'geography' | 'quota' | 'reports' | 'analytics' | 'logs';
