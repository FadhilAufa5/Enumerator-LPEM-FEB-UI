import { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    ClipboardList,
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    Calendar,
    Target,
    CheckCircle2,
    Clock,
    XCircle,
    FileText,
    TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Survey, SurveyStatus } from '@/types';
import SurveyFormModal from './form-modal';
import DeleteConfirmDialog from '@/components/admin/delete-confirm-dialog';

const mockSurveys: Survey[] = [
    { id: 1, judul: 'Survei Kesehatan Masyarakat 2025', deskripsi: 'Pengumpulan data kesehatan dasar seluruh masyarakat di wilayah target', periode_mulai: '2025-01-01', periode_selesai: '2025-06-30', status: 'active', total_target: 1500, total_terkumpul: 876, created_at: '2024-12-01', updated_at: '2024-12-01' },
    { id: 2, judul: 'Survei Ekonomi Rumah Tangga', deskripsi: 'Pendataan kondisi ekonomi dan sosial rumah tangga di wilayah piloting', periode_mulai: '2025-02-01', periode_selesai: '2025-04-30', status: 'active', total_target: 800, total_terkumpul: 542, created_at: '2024-12-15', updated_at: '2024-12-15' },
    { id: 3, judul: 'Survei Pendidikan Anak 2024', deskripsi: 'Evaluasi akses pendidikan anak usia sekolah di daerah terpencil', periode_mulai: '2024-07-01', periode_selesai: '2024-12-31', status: 'closed', total_target: 600, total_terkumpul: 598, created_at: '2024-06-01', updated_at: '2024-12-31' },
    { id: 4, judul: 'Survei Infrastruktur Desa 2025', deskripsi: 'Pendataan kondisi infrastruktur jalan, air bersih dan sanitasi', periode_mulai: '2025-04-01', periode_selesai: '2025-09-30', status: 'draft', total_target: 400, total_terkumpul: 0, created_at: '2025-03-01', updated_at: '2025-03-01' },
];

const statusConfig: Record<SurveyStatus, { label: string; icon: React.ElementType; color: string; bg: string; badge: 'default' | 'secondary' | 'outline' }> = {
    active: { label: 'Aktif', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', badge: 'default' },
    draft: { label: 'Draft', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', badge: 'outline' },
    closed: { label: 'Selesai', icon: CheckCircle2, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', badge: 'secondary' },
};

export default function SurveyIndex() {
    const [items, setItems] = useState<Survey[]>(mockSurveys);
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Survey | null>(null);
    const [deletingItem, setDeletingItem] = useState<Survey | null>(null);

    const filtered = items.filter((s) =>
        s.judul.toLowerCase().includes(search.toLowerCase()) ||
        s.deskripsi.toLowerCase().includes(search.toLowerCase())
    );

    const handleSave = (data: Partial<Survey>) => {
        if (editingItem) {
            setItems((prev) => prev.map((s) => (s.id === editingItem.id ? { ...s, ...data } : s)));
        } else {
            setItems((prev) => [...prev, { ...data, id: Date.now(), total_terkumpul: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Survey]);
        }
        setIsFormOpen(false);
        setEditingItem(null);
    };

    return (
        <>
            <Head title="Manajemen Survey" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <div className="rounded-xl bg-purple-100 dark:bg-purple-900/30 p-2">
                                <ClipboardList className="h-6 w-6 text-purple-600" />
                            </div>
                            Manajemen Survey
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Kelola program survei dan kuesioner</p>
                    </div>
                    <Button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" /> Buat Survey
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {(['active', 'draft', 'closed'] as SurveyStatus[]).map((status) => {
                        const count = items.filter((s) => s.status === status).length;
                        const cfg = statusConfig[status];
                        return (
                            <Card key={status} className={`${cfg.bg} border-0 transition-all hover:scale-105`}>
                                <CardContent className="p-4">
                                    <cfg.icon className={`h-5 w-5 ${cfg.color} mb-2`} />
                                    <p className="text-2xl font-bold">{count}</p>
                                    <p className="text-xs text-muted-foreground">{cfg.label}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Cari nama atau deskripsi survey..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                    </CardContent>
                </Card>

                {/* Survey Cards */}
                <div className="space-y-4">
                    {filtered.map((survey) => {
                        const cfg = statusConfig[survey.status];
                        const progress = survey.total_target > 0 ? Math.round(((survey.total_terkumpul ?? 0) / survey.total_target) * 100) : 0;
                        const daysLeft = Math.max(0, Math.ceil((new Date(survey.periode_selesai).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                        return (
                            <Card key={survey.id} className="group hover:shadow-md transition-all duration-200">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className={`rounded-xl p-2.5 shrink-0 ${cfg.bg}`}>
                                                <cfg.icon className={`h-5 w-5 ${cfg.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h3 className="font-semibold text-base">{survey.judul}</h3>
                                                    <Badge variant={cfg.badge}>{cfg.label}</Badge>
                                                    {survey.status === 'active' && daysLeft <= 30 && (
                                                        <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {daysLeft} hari lagi
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{survey.deskripsi}</p>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(survey.periode_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        {' — '}
                                                        {new Date(survey.periode_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Target className="h-3 w-3" />
                                                        {survey.total_terkumpul?.toLocaleString('id-ID')} / {survey.total_target.toLocaleString('id-ID')} responden
                                                    </span>
                                                </div>
                                                <div className="mt-3 space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="font-medium">{progress}% selesai</span>
                                                        <span className="text-muted-foreground">{survey.total_terkumpul?.toLocaleString('id-ID')} terkumpul</span>
                                                    </div>
                                                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-700 ${
                                                                progress >= 100 ? 'bg-emerald-500' : progress >= 70 ? 'bg-primary' : 'bg-orange-500'
                                                            }`}
                                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="gap-2" onClick={() => { setEditingItem(survey); setIsFormOpen(true); }}>
                                                    <Pencil className="h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => setDeletingItem(survey)}>
                                                    <Trash2 className="h-4 w-4" /> Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center py-16 text-muted-foreground">
                        <ClipboardList className="h-12 w-12 opacity-20 mb-3" />
                        <p>Tidak ada survey ditemukan</p>
                    </div>
                )}
            </div>

            <SurveyFormModal open={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingItem(null); }} onSave={handleSave} initialData={editingItem} />
            <DeleteConfirmDialog
                open={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                onConfirm={() => { setItems((prev) => prev.filter((s) => s.id !== deletingItem?.id)); setDeletingItem(null); }}
                title="Hapus Survey"
                description={`Hapus survey "${deletingItem?.judul}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </>
    );
}
