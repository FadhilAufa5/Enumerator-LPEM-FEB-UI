import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ShieldCheck, Plus, Pencil, Trash2, Users, Lock,
    ChevronDown, ChevronUp, Check, X, Crown, Shield, Eye, Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { Role, Permission } from '@/types';
import RoleFormModal from './form-modal';
import DeleteConfirmDialog from '@/components/admin/delete-confirm-dialog';

// ── Props from Inertia ─────────────────────────────────────
interface Props {
    roles: Role[];
    allPermissions: Permission[];
}

// ── Role color map ─────────────────────────────────────────
const roleColors: Record<string, { bg: string; text: string; ring: string; icon: React.ElementType }> = {
    violet:  { bg: 'bg-violet-100 dark:bg-violet-900/30',   text: 'text-violet-700 dark:text-violet-400',   ring: 'ring-violet-200 dark:ring-violet-800',   icon: Crown   },
    blue:    { bg: 'bg-blue-100 dark:bg-blue-900/30',       text: 'text-blue-700 dark:text-blue-400',       ring: 'ring-blue-200 dark:ring-blue-800',       icon: Shield  },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-800', icon: Settings},
    slate:   { bg: 'bg-slate-100 dark:bg-slate-800',        text: 'text-slate-600 dark:text-slate-400',     ring: 'ring-slate-200 dark:ring-slate-700',     icon: Eye     },
};

// ── Permission Matrix Row ──────────────────────────────────
function PermissionMatrixRow({ group, permissions, roles }: { group: string; permissions: Permission[]; roles: Role[] }) {
    const [expanded, setExpanded] = useState(false);
    const groupPerms = permissions.filter((p) => p.group === group);
    const hasAll = (role: Role, perms: Permission[]) => perms.every((p) => role.permissions.some((rp) => rp.id === p.id));

    return (
        <div className="border rounded-xl overflow-hidden transition-all duration-200">
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
            >
                <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{group}</span>
                    <Badge variant="secondary" className="text-xs">{groupPerms.length} permission</Badge>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex gap-2">
                        {roles.map((role) => {
                            const cfg = roleColors[role.color] ?? roleColors.slate;
                            const full = hasAll(role, groupPerms);
                            const partial = !full && groupPerms.some((p) => role.permissions.some((rp) => rp.id === p.id));
                            return (
                                <span key={role.id} title={role.label}
                                    className={`h-2.5 w-2.5 rounded-full border transition-all
                                        ${full    ? `${cfg.bg} border-transparent ring-1 ${cfg.ring}` :
                                          partial ? 'bg-orange-300 border-transparent' :
                                                    'bg-muted border-muted-foreground/20'}`} />
                            );
                        })}
                    </div>
                    {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
            </button>

            {expanded && (
                <div className="divide-y">
                    {groupPerms.map((perm) => (
                        <div key={perm.id} className="grid items-center gap-0 px-4 py-2.5 hover:bg-muted/20 transition-colors"
                            style={{ gridTemplateColumns: `1fr repeat(${roles.length}, 80px)` }}>
                            <div>
                                <p className="text-sm">{perm.label}</p>
                                <p className="text-xs text-muted-foreground font-mono">{perm.name}</p>
                            </div>
                            {roles.map((role) => {
                                const cfg = roleColors[role.color] ?? roleColors.slate;
                                const has = role.permissions.some((rp) => rp.id === perm.id);
                                return (
                                    <div key={role.id} className="flex justify-center">
                                        <span className={`flex h-6 w-6 items-center justify-center rounded-full transition-all
                                            ${has ? `${cfg.bg} ${cfg.text}` : 'text-muted-foreground/30'}`}>
                                            {has ? <Check className="h-3.5 w-3.5" /> : <X className="h-3 w-3" />}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Role Card ──────────────────────────────────────────────
function RoleCard({ role, allPermissions, onEdit, onDelete }: { role: Role; allPermissions: Permission[]; onEdit: () => void; onDelete: () => void }) {
    const cfg = roleColors[role.color] ?? roleColors.slate;
    const RoleIcon = cfg.icon;
    const pct = allPermissions.length > 0 ? Math.round((role.permissions.length / allPermissions.length) * 100) : 0;
    const permGroups = [...new Set(allPermissions.map((p) => p.group))];

    return (
        <Card className={`group relative overflow-hidden border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${cfg.ring} ring-1`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className={`rounded-xl p-2.5 ${cfg.bg} ${cfg.text}`}>
                        <RoleIcon className="h-5 w-5" />
                    </div>
                    {role.is_system && (
                        <Badge variant="outline" className="text-xs gap-1 shrink-0">
                            <Lock className="h-3 w-3" /> System
                        </Badge>
                    )}
                </div>
                <div className="mt-2">
                    <CardTitle className={`text-base ${cfg.text}`}>{role.label}</CardTitle>
                    <CardDescription className="text-xs mt-0.5 line-clamp-2">{role.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{role.permissions.length} permission aktif</span>
                        <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${cfg.bg} ring-1 ${cfg.ring}`} style={{ width: `${pct}%` }} />
                    </div>
                </div>

                <div className={`flex items-center gap-1.5 rounded-lg px-3 py-2 ${cfg.bg}`}>
                    <Users className={`h-4 w-4 ${cfg.text}`} />
                    <span className={`text-sm font-semibold ${cfg.text}`}>{role.users_count}</span>
                    <span className="text-xs text-muted-foreground">pengguna</span>
                </div>

                <div className="flex flex-wrap gap-1">
                    {permGroups.slice(0, 3).map((g) => {
                        const has = role.permissions.some((p) => p.group === g);
                        return (
                            <span key={g} className={`rounded-full px-2 py-0.5 text-[10px] font-medium
                                ${has ? `${cfg.bg} ${cfg.text}` : 'bg-muted text-muted-foreground line-through opacity-50'}`}>
                                {g}
                            </span>
                        );
                    })}
                    {permGroups.length > 3 && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] bg-muted text-muted-foreground">
                            +{permGroups.length - 3} lagi
                        </span>
                    )}
                </div>

                <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs h-8" onClick={onEdit}>
                        <Pencil className="h-3 w-3" /> Edit
                    </Button>
                    {!role.is_system && (
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 text-destructive hover:text-destructive border-destructive/30" onClick={onDelete}>
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ── Main Page ──────────────────────────────────────────────
export default function RolesIndex({ roles, allPermissions }: Props) {
    const { props: pageProps } = usePage<{ flash?: { success?: string; error?: string } }>();

    const [isFormOpen, setIsFormOpen]     = useState(false);
    const [editingItem, setEditingItem]   = useState<Role | null>(null);
    const [deletingItem, setDeletingItem] = useState<Role | null>(null);

    const flash = pageProps.flash;
    if (flash?.success) toast.success(flash.success);
    if (flash?.error)   toast.error(flash.error);

    const permGroups = [...new Set(allPermissions.map((p) => p.group))];

    const handleSave = (data: Partial<Role> & { permission_ids?: number[] }) => {
        if (editingItem) {
            router.put(route('admin.roles.update', editingItem.id), data, {
                onSuccess: () => {
                    toast.success('Role berhasil diperbarui.');
                    setIsFormOpen(false);
                    setEditingItem(null);
                },
                onError: (errors) => toast.error('Gagal memperbarui role.', { description: Object.values(errors).join(', ') }),
            });
        } else {
            router.post(route('admin.roles.store'), data, {
                onSuccess: () => {
                    toast.success('Role berhasil ditambahkan.');
                    setIsFormOpen(false);
                },
                onError: (errors) => toast.error('Gagal menambahkan role.', { description: Object.values(errors).join(', ') }),
            });
        }
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(route('admin.roles.destroy', deletingItem.id), {
            onSuccess: () => {
                toast.success(`Role "${deletingItem.label}" berhasil dihapus.`);
                setDeletingItem(null);
            },
            onError: () => toast.error('Gagal menghapus role.'),
        });
    };

    return (
        <>
            <Head title="Role & Permissions" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <div className="rounded-xl bg-violet-100 dark:bg-violet-900/30 p-2">
                                <ShieldCheck className="h-6 w-6 text-violet-600" />
                            </div>
                            Role & Permissions
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Kelola peran dan hak akses pengguna sistem</p>
                    </div>
                    <Button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" /> Tambah Role
                    </Button>
                </div>

                {/* Role Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {roles.map((role) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            allPermissions={allPermissions}
                            onEdit={() => { setEditingItem(role); setIsFormOpen(true); }}
                            onDelete={() => setDeletingItem(role)}
                        />
                    ))}
                </div>

                {/* Permission Matrix */}
                <div>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            Permission Matrix
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Perbandingan hak akses antar role — klik grup untuk melihat detail
                        </p>
                    </div>

                    {/* Matrix header */}
                    <Card className="mb-3">
                        <CardContent className="py-3 px-4">
                            <div className="grid items-center gap-0"
                                style={{ gridTemplateColumns: `1fr repeat(${roles.length}, 80px)` }}>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fitur / Permission</span>
                                {roles.map((role) => {
                                    const cfg = roleColors[role.color] ?? roleColors.slate;
                                    const RoleIcon = cfg.icon;
                                    return (
                                        <div key={role.id} className="flex flex-col items-center gap-1">
                                            <div className={`rounded-lg p-1.5 ${cfg.bg}`}>
                                                <RoleIcon className={`h-4 w-4 ${cfg.text}`} />
                                            </div>
                                            <span className={`text-xs font-semibold text-center leading-tight ${cfg.text}`}>{role.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Matrix rows */}
                    <div className="space-y-2">
                        {permGroups.map((group) => (
                            <PermissionMatrixRow
                                key={group}
                                group={group}
                                permissions={allPermissions}
                                roles={roles}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <RoleFormModal
                open={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
                onSave={handleSave}
                initialData={editingItem}
                allPermissions={allPermissions}
            />
            <DeleteConfirmDialog
                open={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                onConfirm={handleDelete}
                title="Hapus Role"
                description={`Hapus role "${deletingItem?.label}"? User dengan role ini tidak akan bisa login.`}
            />
        </>
    );
}
