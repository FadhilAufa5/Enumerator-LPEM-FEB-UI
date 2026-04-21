import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Users, Plus, Search, MoreHorizontal, Pencil, Trash2,
    ShieldCheck, UserCheck, UserX, UserMinus, Mail, Clock,
    CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { AppUser, Role, UserStatus } from '@/types';
import UserFormModal from './form-modal';
import DeleteConfirmDialog from '@/components/admin/delete-confirm-dialog';

// ── Props from Inertia ─────────────────────────────────────
interface Props {
    users: AppUser[];
    roles: Pick<Role, 'id' | 'name' | 'label' | 'color' | 'is_system'>[];
}

// ── Status config ──────────────────────────────────────────
const statusCfg: Record<UserStatus, { label: string; icon: React.ElementType; badge: 'default' | 'secondary' | 'destructive' | 'outline'; dot: string }> = {
    active:    { label: 'Aktif',       icon: CheckCircle2, badge: 'default',     dot: 'bg-emerald-500' },
    inactive:  { label: 'Tidak Aktif', icon: XCircle,      badge: 'secondary',   dot: 'bg-slate-400'   },
    suspended: { label: 'Suspended',   icon: AlertCircle,  badge: 'destructive', dot: 'bg-red-500'     },
};

const roleBg: Record<string, string> = {
    violet:  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    blue:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    slate:   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

function RoleBadge({ role }: { role: AppUser['role'] }) {
    if (!role) return <span className="text-xs text-muted-foreground">—</span>;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${roleBg[role.color] ?? roleBg.slate}`}>
            <ShieldCheck className="h-3 w-3" />
            {role.label}
        </span>
    );
}

function timeAgo(date?: string) {
    if (!date) return 'Belum pernah';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
}

export default function UserIndex({ users, roles }: Props) {
    const { props: pageProps } = usePage<{ flash?: { success?: string; error?: string } }>();

    const [search, setSearch]           = useState('');
    const [roleFilter, setRoleFilter]   = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isFormOpen, setIsFormOpen]   = useState(false);
    const [editingItem, setEditingItem] = useState<AppUser | null>(null);
    const [deletingItem, setDeletingItem] = useState<AppUser | null>(null);

    // Show flash messages as toasts
    const flash = pageProps.flash;
    if (flash?.success) toast.success(flash.success);
    if (flash?.error)   toast.error(flash.error);

    const filtered = users.filter((u) => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole   = roleFilter   === 'all' || u.role?.name === roleFilter;
        const matchStatus = statusFilter === 'all' || u.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });

    const stats = {
        total:     users.length,
        active:    users.filter((u) => u.status === 'active').length,
        suspended: users.filter((u) => u.status === 'suspended').length,
        inactive:  users.filter((u) => u.status === 'inactive').length,
    };

    const handleSave = (data: Partial<AppUser> & { password?: string; role_id?: number }) => {
        if (editingItem) {
            router.put(route('admin.users.update', editingItem.id), data, {
                onSuccess: () => {
                    toast.success('User berhasil diperbarui.');
                    setIsFormOpen(false);
                    setEditingItem(null);
                },
                onError: (errors) => {
                    toast.error('Gagal memperbarui user.', { description: Object.values(errors).join(', ') });
                },
            });
        } else {
            router.post(route('admin.users.store'), data, {
                onSuccess: () => {
                    toast.success('User berhasil ditambahkan.');
                    setIsFormOpen(false);
                },
                onError: (errors) => {
                    toast.error('Gagal menambahkan user.', { description: Object.values(errors).join(', ') });
                },
            });
        }
    };

    const handleStatusChange = (user: AppUser, status: UserStatus) => {
        router.patch(route('admin.users.status', user.id), { status }, {
            onSuccess: () => toast.success(`Status user diubah ke "${statusCfg[status].label}".`),
            onError:   () => toast.error('Gagal mengubah status.'),
        });
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(route('admin.users.destroy', deletingItem.id), {
            onSuccess: () => {
                toast.success(`User "${deletingItem.name}" berhasil dihapus.`);
                setDeletingItem(null);
            },
            onError: () => toast.error('Gagal menghapus user.'),
        });
    };

    return (
        <>
            <Head title="Manajemen User" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <div className="rounded-xl bg-violet-100 dark:bg-violet-900/30 p-2">
                                <Users className="h-6 w-6 text-violet-600" />
                            </div>
                            Manajemen User
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Kelola akun pengguna dan hak akses sistem</p>
                    </div>
                    <Button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" /> Tambah User
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Total User',  value: stats.total,     icon: Users,     bg: 'bg-violet-50 dark:bg-violet-900/20',  color: 'text-violet-600'  },
                        { label: 'Aktif',       value: stats.active,    icon: UserCheck, bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: 'text-emerald-600' },
                        { label: 'Suspended',   value: stats.suspended, icon: UserMinus, bg: 'bg-red-50 dark:bg-red-900/20',         color: 'text-red-600'     },
                        { label: 'Tidak Aktif', value: stats.inactive,  icon: UserX,     bg: 'bg-slate-50 dark:bg-slate-800/50',     color: 'text-slate-500'   },
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
                            <Input placeholder="Cari nama atau email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                        <div className="flex gap-2">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Semua Role" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Role</SelectItem>
                                    {roles.map((r) => <SelectItem key={r.name} value={r.name}>{r.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Daftar Pengguna</CardTitle>
                            <CardDescription>{filtered.length} dari {users.length} user</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pengguna</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Verifikasi</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Login Terakhir</th>
                                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                                <p>Tidak ada user ditemukan</p>
                                            </td>
                                        </tr>
                                    ) : filtered.map((user) => {
                                        const sc = statusCfg[user.status ?? 'active'];
                                        return (
                                            <tr key={user.id} className="border-b transition-colors hover:bg-muted/30 group">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative shrink-0">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                                                    {user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${sc.dot}`} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{user.name}</p>
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />{user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <sc.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <Badge variant={sc.badge}>{sc.label}</Badge>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {user.email_verified_at
                                                        ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Terverifikasi</span>
                                                        : <span className="inline-flex items-center gap-1 text-xs text-orange-500"><AlertCircle className="h-3.5 w-3.5" /> Belum</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {timeAgo(user.last_login)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-44">
                                                            <DropdownMenuLabel className="text-xs text-muted-foreground">Aksi User</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="gap-2" onClick={() => { setEditingItem(user); setIsFormOpen(true); }}>
                                                                <Pencil className="h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            {user.status === 'active' && (
                                                                <DropdownMenuItem className="gap-2 text-orange-600 focus:text-orange-600"
                                                                    onClick={() => handleStatusChange(user, 'suspended')}>
                                                                    <UserMinus className="h-4 w-4" /> Suspend
                                                                </DropdownMenuItem>
                                                            )}
                                                            {user.status === 'suspended' && (
                                                                <DropdownMenuItem className="gap-2 text-emerald-600 focus:text-emerald-600"
                                                                    onClick={() => handleStatusChange(user, 'active')}>
                                                                    <UserCheck className="h-4 w-4" /> Aktifkan
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive"
                                                                onClick={() => setDeletingItem(user)}
                                                                disabled={!!user.role?.is_system && user.id === 1}>
                                                                <Trash2 className="h-4 w-4" /> Hapus
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <UserFormModal
                open={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
                onSave={handleSave}
                initialData={editingItem}
                roles={roles}
            />
            <DeleteConfirmDialog
                open={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                onConfirm={handleDelete}
                title="Hapus User"
                description={`Hapus akun "${deletingItem?.name}"? Semua data terkait akan ikut terhapus.`}
            />
        </>
    );
}
