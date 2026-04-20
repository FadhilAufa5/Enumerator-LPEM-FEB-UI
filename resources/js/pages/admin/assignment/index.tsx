import { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Briefcase,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Pencil,
    Trash2,
    CheckCircle2,
    Clock,
    Activity,
    XCircle,
    User,
    MapPin,
    ClipboardList,
    TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Assignment, AssignmentStatus } from '@/types';
import AssignmentFormModal from './form-modal';
import DeleteConfirmDialog from '@/components/admin/delete-confirm-dialog';

const mockAssignments: Assignment[] = [
    { id: 1, enumerator_id: 1, wilayah_id: 1, survey_id: 1, status: 'ongoing', target: 50, terkumpul: 38, tanggal_mulai: '2025-01-15', catatan: 'Area padat penduduk, perlu koordinasi RT', enumerator: { id: 1, name: 'Ahmad Fauzi', nik: '', phone: '', email: '', gender: 'male', address: '', status: 'active', education: 'S1', join_date: '', created_at: '', updated_at: '' }, wilayah: { id: 1, kode: 'WLY-001', nama: 'Kel. Sukamaju', provinsi: 'Jawa Barat', kabupaten: 'Bogor', kecamatan: 'Ciawi', kelurahan: 'Sukamaju', target_responden: 150, created_at: '', updated_at: '' }, survey: { id: 1, judul: 'Survei Kesehatan Masyarakat 2025', deskripsi: '', periode_mulai: '', periode_selesai: '', status: 'active', total_target: 1500, created_at: '', updated_at: '' }, created_at: '2025-01-15', updated_at: '2025-01-15' },
    { id: 2, enumerator_id: 2, wilayah_id: 2, survey_id: 1, status: 'completed', target: 60, terkumpul: 60, tanggal_mulai: '2025-01-10', tanggal_selesai: '2025-02-15', enumerator: { id: 2, name: 'Siti Rahayu', nik: '', phone: '', email: '', gender: 'female', address: '', status: 'active', education: 'D3', join_date: '', created_at: '', updated_at: '' }, wilayah: { id: 2, kode: 'WLY-002', nama: 'Kel. Mekarjaya', provinsi: 'Jawa Barat', kabupaten: 'Bogor', kecamatan: 'Dramaga', kelurahan: 'Mekarjaya', target_responden: 200, created_at: '', updated_at: '' }, survey: { id: 1, judul: 'Survei Kesehatan Masyarakat 2025', deskripsi: '', periode_mulai: '', periode_selesai: '', status: 'active', total_target: 1500, created_at: '', updated_at: '' }, created_at: '2025-01-10', updated_at: '2025-02-15' },
    { id: 3, enumerator_id: 3, wilayah_id: 3, survey_id: 2, status: 'pending', target: 40, terkumpul: 0, tanggal_mulai: '2025-03-01', enumerator: { id: 3, name: 'Budi Santoso', nik: '', phone: '', email: '', gender: 'male', address: '', status: 'training', education: 'SMA', join_date: '', created_at: '', updated_at: '' }, wilayah: { id: 3, kode: 'WLY-003', nama: 'Desa Cibadak', provinsi: 'Jawa Barat', kabupaten: 'Sukabumi', kecamatan: 'Cibadak', kelurahan: 'Cibadak', target_responden: 120, created_at: '', updated_at: '' }, survey: { id: 2, judul: 'Survei Ekonomi Rumah Tangga', deskripsi: '', periode_mulai: '', periode_selesai: '', status: 'active', total_target: 800, created_at: '', updated_at: '' }, created_at: '2025-02-20', updated_at: '2025-02-20' },
    { id: 4, enumerator_id: 4, wilayah_id: 4, survey_id: 2, status: 'ongoing', target: 45, terkumpul: 22, tanggal_mulai: '2025-02-01', catatan: 'Sampel acak sistematik', enumerator: { id: 4, name: 'Dewi Lestari', nik: '', phone: '', email: '', gender: 'female', address: '', status: 'active', education: 'S1', join_date: '', created_at: '', updated_at: '' }, wilayah: { id: 4, kode: 'WLY-004', nama: 'Kel. Margahayu', provinsi: 'Jawa Barat', kabupaten: 'Bandung', kecamatan: 'Margahayu', kelurahan: 'Margahayu', target_responden: 180, created_at: '', updated_at: '' }, survey: { id: 2, judul: 'Survei Ekonomi Rumah Tangga', deskripsi: '', periode_mulai: '', periode_selesai: '', status: 'active', total_target: 800, created_at: '', updated_at: '' }, created_at: '2025-02-01', updated_at: '2025-02-01' },
    { id: 5, enumerator_id: 5, wilayah_id: 5, survey_id: 1, status: 'cancelled', target: 35, terkumpul: 12, tanggal_mulai: '2025-01-20', catatan: 'Dibatalkan karena enumerator tidak aktif', enumerator: { id: 5, name: 'Rizki Pratama', nik: '', phone: '', email: '', gender: 'male', address: '', status: 'inactive', education: 'D3', join_date: '', created_at: '', updated_at: '' }, wilayah: { id: 5, kode: 'WLY-005', nama: 'Desa Karanganyar', provinsi: 'Jawa Tengah', kabupaten: 'Karanganyar', kecamatan: 'Tasikmadu', kelurahan: 'Karanganyar', target_responden: 90, created_at: '', updated_at: '' }, survey: { id: 1, judul: 'Survei Kesehatan Masyarakat 2025', deskripsi: '', periode_mulai: '', periode_selesai: '', status: 'active', total_target: 1500, created_at: '', updated_at: '' }, created_at: '2025-01-20', updated_at: '2025-01-25' },
];

const statusConfig: Record<AssignmentStatus, { label: string; icon: React.ElementType; badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive'; color: string; bg: string }> = {
    pending: { label: 'Menunggu', icon: Clock, badgeVariant: 'outline', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    ongoing: { label: 'Berjalan', icon: Activity, badgeVariant: 'default', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    completed: { label: 'Selesai', icon: CheckCircle2, badgeVariant: 'secondary', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    cancelled: { label: 'Dibatalkan', icon: XCircle, badgeVariant: 'destructive', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
};

export default function AssignmentIndex() {
    const [items, setItems] = useState<Assignment[]>(mockAssignments);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Assignment | null>(null);
    const [deletingItem, setDeletingItem] = useState<Assignment | null>(null);

    const filtered = items.filter((a) => {
        const matchSearch =
            a.enumerator?.name.toLowerCase().includes(search.toLowerCase()) ||
            a.wilayah?.nama.toLowerCase().includes(search.toLowerCase()) ||
            a.survey?.judul.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const stats = {
        total: items.length,
        ongoing: items.filter((a) => a.status === 'ongoing').length,
        completed: items.filter((a) => a.status === 'completed').length,
        pending: items.filter((a) => a.status === 'pending').length,
    };

    const handleSave = (data: Partial<Assignment>) => {
        if (editingItem) {
            setItems((prev) => prev.map((a) => (a.id === editingItem.id ? { ...a, ...data } : a)));
        } else {
            setItems((prev) => [...prev, { ...data, id: Date.now(), terkumpul: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Assignment]);
        }
        setIsFormOpen(false);
        setEditingItem(null);
    };

    return (
        <>
            <Head title="Manajemen Penugasan" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <div className="rounded-xl bg-indigo-100 dark:bg-indigo-900/30 p-2">
                                <Briefcase className="h-6 w-6 text-indigo-600" />
                            </div>
                            Manajemen Penugasan
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Kelola penugasan enumerator ke wilayah survei</p>
                    </div>
                    <Button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" /> Buat Penugasan
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Total', value: stats.total, icon: Briefcase, bg: 'bg-indigo-50 dark:bg-indigo-900/20', color: 'text-indigo-600' },
                        { label: 'Berjalan', value: stats.ongoing, icon: Activity, bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-600' },
                        { label: 'Selesai', value: stats.completed, icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: 'text-emerald-600' },
                        { label: 'Menunggu', value: stats.pending, icon: Clock, bg: 'bg-orange-50 dark:bg-orange-900/20', color: 'text-orange-600' },
                    ].map((s) => (
                        <Card key={s.label} className={`${s.bg} border-0 transition-all hover:scale-105`}>
                            <CardContent className="p-4">
                                <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4 flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Cari enumerator, wilayah, atau survey..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="pending">Menunggu</SelectItem>
                                    <SelectItem value="ongoing">Berjalan</SelectItem>
                                    <SelectItem value="completed">Selesai</SelectItem>
                                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Daftar Penugasan</CardTitle>
                            <CardDescription>{filtered.length} dari {items.length} data</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Enumerator</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Wilayah</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Survey</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Progress</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal Mulai</th>
                                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                                <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                                <p>Tidak ada penugasan</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((assignment) => {
                                            const cfg = statusConfig[assignment.status];
                                            const progress = assignment.target > 0 ? Math.round((assignment.terkumpul / assignment.target) * 100) : 0;
                                            return (
                                                <tr key={assignment.id} className="border-b transition-colors hover:bg-muted/30 group">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                                                                    {assignment.enumerator?.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="font-medium text-sm">{assignment.enumerator?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                            <span className="text-sm">{assignment.wilayah?.nama}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 max-w-[200px]">
                                                        <div className="flex items-center gap-1.5">
                                                            <ClipboardList className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                            <span className="text-sm line-clamp-1">{assignment.survey?.judul}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <cfg.icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                                                            <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span>{assignment.terkumpul}/{assignment.target}</span>
                                                                <span className="text-muted-foreground">{progress}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        {new Date(assignment.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem className="gap-2" onClick={() => { setEditingItem(assignment); setIsFormOpen(true); }}>
                                                                    <Pencil className="h-4 w-4" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => setDeletingItem(assignment)}>
                                                                    <Trash2 className="h-4 w-4" /> Hapus
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AssignmentFormModal open={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingItem(null); }} onSave={handleSave} initialData={editingItem} />
            <DeleteConfirmDialog
                open={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                onConfirm={() => { setItems((prev) => prev.filter((a) => a.id !== deletingItem?.id)); setDeletingItem(null); }}
                title="Hapus Penugasan"
                description="Hapus penugasan ini? Tindakan ini tidak dapat dibatalkan."
            />
        </>
    );
}
