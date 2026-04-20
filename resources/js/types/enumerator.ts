export type EnumeratorStatus = 'active' | 'inactive' | 'training';
export type AssignmentStatus = 'pending' | 'ongoing' | 'completed' | 'cancelled';
export type SurveyStatus = 'draft' | 'active' | 'closed';
export type Gender = 'male' | 'female';

export interface Enumerator {
    id: number;
    name: string;
    nik: string;
    phone: string;
    email: string;
    gender: Gender;
    address: string;
    photo?: string;
    status: EnumeratorStatus;
    education: string;
    join_date: string;
    total_assignments?: number;
    completed_assignments?: number;
    created_at: string;
    updated_at: string;
}

export interface Wilayah {
    id: number;
    kode: string;
    nama: string;
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    kelurahan: string;
    target_responden: number;
    luas_wilayah?: number;
    keterangan?: string;
    created_at: string;
    updated_at: string;
}

export interface Survey {
    id: number;
    judul: string;
    deskripsi: string;
    periode_mulai: string;
    periode_selesai: string;
    status: SurveyStatus;
    total_target: number;
    total_terkumpul?: number;
    created_at: string;
    updated_at: string;
}

export interface Assignment {
    id: number;
    enumerator_id: number;
    wilayah_id: number;
    survey_id: number;
    status: AssignmentStatus;
    target: number;
    terkumpul: number;
    tanggal_mulai: string;
    tanggal_selesai?: string;
    catatan?: string;
    enumerator?: Enumerator;
    wilayah?: Wilayah;
    survey?: Survey;
    created_at: string;
    updated_at: string;
}

export interface DashboardStats {
    total_enumerator: number;
    enumerator_aktif: number;
    total_wilayah: number;
    total_survey: number;
    total_assignment: number;
    assignment_ongoing: number;
    total_responden: number;
    progress_percentage: number;
    monthly_data: MonthlyData[];
    recent_activities: RecentActivity[];
    top_enumerators: TopEnumerator[];
}

export interface MonthlyData {
    month: string;
    target: number;
    collected: number;
}

export interface RecentActivity {
    id: number;
    type: string;
    message: string;
    created_at: string;
}

export interface TopEnumerator {
    id: number;
    name: string;
    completed: number;
    percentage: number;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

// ── RBAC ──────────────────────────────────────────────────

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface Permission {
    id: number;
    name: string;         // e.g. "enumerator.create"
    label: string;        // e.g. "Tambah Enumerator"
    group: string;        // e.g. "Enumerator"
    description?: string;
}

export interface Role {
    id: number;
    name: string;         // e.g. "admin"
    label: string;        // e.g. "Administrator"
    description?: string;
    color: string;        // e.g. "violet"
    permissions: Permission[];
    users_count?: number;
    is_system?: boolean;
    created_at: string;
    updated_at: string;
}

export interface AppUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    status: UserStatus;
    role: Role;
    last_login?: string;
    email_verified_at?: string | null;
    created_at: string;
    updated_at: string;
}
