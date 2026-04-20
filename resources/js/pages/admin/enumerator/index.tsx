import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Users,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    PhoneCall,
    Mail,
    CheckCircle2,
    XCircle,
    GraduationCap,
    UserCheck,
    UserX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem, Enumerator, EnumeratorStatus } from '@/types';
import EnumeratorFormModal from './form-modal';
import DeleteConfirmDialog from '@/components/admin/delete-confirm-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Enumerator', href: '/admin/enumerator' },
];

// Mock data
const mockEnumerators: Enumerator[] = [
    { id: 1, name: 'Ahmad Fauzi', nik: '3201010101010001', phone: '081234567890', email: 'ahmad@mail.com', gender: 'male', address: 'Jl. Merdeka No. 1, Jakarta', status: 'active', education: 'S1', join_date: '2024-01-15', total_assignments: 12, completed_assignments: 11, created_at: '2024-01-15', updated_at: '2024-01-15' },
    { id: 2, name: 'Siti Rahayu', nik: '3201010101010002', phone: '081234567891', email: 'siti@mail.com', gender: 'female', address: 'Jl. Pahlawan No. 5, Bandung', status: 'active', education: 'D3', join_date: '2024-02-10', total_assignments: 10, completed_assignments: 9, created_at: '2024-02-10', updated_at: '2024-02-10' },
    { id: 3, name: 'Budi Santoso', nik: '3201010101010003', phone: '081234567892', email: 'budi@mail.com', gender: 'male', address: 'Jl. Melati No. 9, Surabaya', status: 'training', education: 'SMA', join_date: '2024-03-05', total_assignments: 5, completed_assignments: 3, created_at: '2024-03-05', updated_at: '2024-03-05' },
    { id: 4, name: 'Dewi Lestari', nik: '3201010101010004', phone: '081234567893', email: 'dewi@mail.com', gender: 'female', address: 'Jl. Mawar No. 12, Yogyakarta', status: 'active', education: 'S1', join_date: '2024-01-20', total_assignments: 15, completed_assignments: 13, created_at: '2024-01-20', updated_at: '2024-01-20' },
    { id: 5, name: 'Rizki Pratama', nik: '3201010101010005', phone: '081234567894', email: 'rizki@mail.com', gender: 'male', address: 'Jl. Kenanga No. 3, Medan', status: 'inactive', education: 'D3', join_date: '2023-11-01', total_assignments: 8, completed_assignments: 7, created_at: '2023-11-01', updated_at: '2023-11-01' },
    { id: 6, name: 'Putri Amalia', nik: '3201010101010006', phone: '081234567895', email: 'putri@mail.com', gender: 'female', address: 'Jl. Anggrek No. 7, Semarang', status: 'active', education: 'S2', join_date: '2024-04-01', total_assignments: 6, completed_assignments: 5, created_at: '2024-04-01', updated_at: '2024-04-01' },
];

const statusConfig: Record<EnumeratorStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType; color: string }> = {
    active: { label: 'Aktif', variant: 'default', icon: CheckCircle2, color: 'text-emerald-600' },
    inactive: { label: 'Tidak Aktif', variant: 'secondary', icon: XCircle, color: 'text-slate-500' },
    training: { label: 'Training', variant: 'outline', icon: GraduationCap, color: 'text-orange-600' },
};

export default function EnumeratorIndex() {
    const [enumerators, setEnumerators] = useState<Enumerator[]>(mockEnumerators);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Enumerator | null>(null);
    const [deletingItem, setDeletingItem] = useState<Enumerator | null>(null);

    const filtered = enumerators.filter((e) => {
        const matchSearch =
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.nik.includes(search) ||
            e.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const stats = {
        total: enumerators.length,
        active: enumerators.filter((e) => e.status === 'active').length,
        training: enumerators.filter((e) => e.status === 'training').length,
        inactive: enumerators.filter((e) => e.status === 'inactive').length,
    };

    const handleSave = (data: Partial<Enumerator>) => {
        if (editingItem) {
            setEnumerators((prev) => prev.map((e) => (e.id === editingItem.id ? { ...e, ...data } : e)));
        } else {
            const newEnumerator: Enumerator = {
                ...data,
                id: Date.now(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } as Enumerator;
            setEnumerators((prev) => [...prev, newEnumerator]);
        }
        setIsFormOpen(false);
        setEditingItem(null);
    };

    const handleDelete = () => {
        if (deletingItem) {
            setEnumerators((prev) => prev.filter((e) => e.id !== deletingItem.id));
            setDeletingItem(null);
        }
    };

    return (
        <>
            <Head title="Manajemen Enumerator" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-2">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            Manajemen Enumerator
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Kelola data petugas enumerator lapangan
                        </p>
                    </div>
                    <Button
                        onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
                        className="gap-2 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Enumerator
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Total', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Aktif', value: stats.active, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Training', value: stats.training, icon: GraduationCap, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                        { label: 'Tidak Aktif', value: stats.inactive, icon: UserX, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800/50' },
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
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama, NIK, atau email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Filter Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="training">Training</SelectItem>
                                        <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Daftar Enumerator</CardTitle>
                            <CardDescription>{filtered.length} dari {enumerators.length} data</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Enumerator</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kontak</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pendidikan</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Penugasan</th>
                                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                                <p>Tidak ada data enumerator</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((enumerator) => {
                                            const status = statusConfig[enumerator.status];
                                            const completion = enumerator.total_assignments
                                                ? Math.round(((enumerator.completed_assignments ?? 0) / enumerator.total_assignments) * 100)
                                                : 0;
                                            return (
                                                <tr key={enumerator.id} className="border-b transition-colors hover:bg-muted/30 group">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                                                    {enumerator.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{enumerator.name}</p>
                                                                <p className="text-xs text-muted-foreground font-mono">{enumerator.nik}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5 text-xs">
                                                                <PhoneCall className="h-3 w-3 text-muted-foreground" />
                                                                {enumerator.phone}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <Mail className="h-3 w-3" />
                                                                {enumerator.email}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline">{enumerator.education}</Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <status.icon className={`h-3.5 w-3.5 ${status.color}`} />
                                                            <Badge variant={status.variant}>{status.label}</Badge>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span>{enumerator.completed_assignments}/{enumerator.total_assignments}</span>
                                                                <span className="text-muted-foreground">{completion}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full bg-primary transition-all"
                                                                    style={{ width: `${completion}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem className="gap-2">
                                                                    <Eye className="h-4 w-4" /> Detail
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="gap-2"
                                                                    onClick={() => { setEditingItem(enumerator); setIsFormOpen(true); }}
                                                                >
                                                                    <Pencil className="h-4 w-4" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="gap-2 text-destructive focus:text-destructive"
                                                                    onClick={() => setDeletingItem(enumerator)}
                                                                >
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

            <EnumeratorFormModal
                open={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
                onSave={handleSave}
                initialData={editingItem}
            />
            <DeleteConfirmDialog
                open={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                onConfirm={handleDelete}
                title="Hapus Enumerator"
                description={`Apakah Anda yakin ingin menghapus enumerator "${deletingItem?.name}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </>
    );
}
