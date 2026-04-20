import { useState, useEffect } from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Role, Permission } from '@/types';

interface RoleFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<Role>) => void;
    initialData?: Role | null;
    allPermissions: Permission[];
}

const permGroups = (perms: Permission[]) => [...new Set(perms.map((p) => p.group))];

const defaultForm = {
    name: '',
    label: '',
    description: '',
    color: 'slate',
};

export default function RoleFormModal({ open, onClose, onSave, initialData, allPermissions }: RoleFormModalProps) {
    const [form, setForm]               = useState(defaultForm);
    const [selectedPerms, setSelected]  = useState<number[]>([]);
    const [errors, setErrors]           = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setForm({ name: initialData.name, label: initialData.label, description: initialData.description ?? '', color: initialData.color });
            setSelected(initialData.permissions.map((p) => p.id));
        } else {
            setForm({ ...defaultForm });
            setSelected([]);
        }
        setErrors({});
    }, [initialData, open]);

    const toggle = (id: number) =>
        setSelected((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);

    const toggleGroup = (group: string) => {
        const groupIds = allPermissions.filter((p) => p.group === group).map((p) => p.id);
        const allSelected = groupIds.every((id) => selectedPerms.includes(id));
        setSelected((prev) =>
            allSelected ? prev.filter((id) => !groupIds.includes(id)) : [...new Set([...prev, ...groupIds])]
        );
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.label.trim()) e.label = 'Nama role wajib diisi';
        if (!form.name.trim())  e.name  = 'Slug role wajib diisi';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;
        const perms = allPermissions.filter((p) => selectedPerms.includes(p.id));
        onSave({ ...form, permissions: perms });
    };

    const colorOptions = [
        { value: 'violet',  label: 'Violet',  cls: 'bg-violet-500'  },
        { value: 'blue',    label: 'Biru',    cls: 'bg-blue-500'    },
        { value: 'emerald', label: 'Hijau',   cls: 'bg-emerald-500' },
        { value: 'slate',   label: 'Abu-abu', cls: 'bg-slate-400'   },
        { value: 'orange',  label: 'Orange',  cls: 'bg-orange-500'  },
    ];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-1.5">
                            <ShieldCheck className="h-4 w-4 text-violet-600" />
                        </div>
                        {initialData ? 'Edit Role' : 'Tambah Role Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Perbarui nama, warna, dan hak akses role.' : 'Tentukan nama dan pilih permission yang dimiliki role ini.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    {/* Basic info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="r-label">Nama Role <span className="text-destructive">*</span></Label>
                            <Input id="r-label" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                                placeholder="Contoh: Supervisor" className={errors.label ? 'border-destructive' : ''} />
                            {errors.label && <p className="text-xs text-destructive">{errors.label}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="r-name">Slug <span className="text-destructive">*</span></Label>
                            <Input id="r-name" value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                                placeholder="supervisor" className={`font-mono ${errors.name ? 'border-destructive' : ''}`} />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="r-desc">Deskripsi</Label>
                            <Input id="r-desc" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                placeholder="Penjelasan singkat tentang role ini..." />
                        </div>
                    </div>

                    {/* Color picker */}
                    <div className="space-y-2">
                        <Label>Warna Role</Label>
                        <div className="flex gap-2">
                            {colorOptions.map((c) => (
                                <button type="button" key={c.value} onClick={() => setForm((p) => ({ ...p, color: c.value }))}
                                    title={c.label}
                                    className={`h-7 w-7 rounded-full transition-all duration-150 ${c.cls}
                                        ${form.color === c.value ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'opacity-60 hover:opacity-100'}`}>
                                    {form.color === c.value && <Check className="h-4 w-4 text-white mx-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Permissions */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">
                                Permissions
                                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                                    {selectedPerms.length}/{allPermissions.length} dipilih
                                </span>
                            </Label>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" className="h-7 text-xs"
                                    onClick={() => setSelected(allPermissions.map((p) => p.id))}>
                                    Pilih Semua
                                </Button>
                                <Button type="button" variant="outline" size="sm" className="h-7 text-xs"
                                    onClick={() => setSelected([])}>
                                    Reset
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                            {permGroups(allPermissions).map((group) => {
                                const groupPerms = allPermissions.filter((p) => p.group === group);
                                const groupIds   = groupPerms.map((p) => p.id);
                                const allSel     = groupIds.every((id) => selectedPerms.includes(id));
                                const partialSel = !allSel && groupIds.some((id) => selectedPerms.includes(id));

                                return (
                                    <div key={group} className="rounded-lg border overflow-hidden">
                                        {/* Group toggle */}
                                        <button type="button" onClick={() => toggleGroup(group)}
                                            className="w-full flex items-center justify-between px-3 py-2 bg-muted/40 hover:bg-muted/70 transition-colors text-left">
                                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group}</span>
                                            <div className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors
                                                ${allSel ? 'bg-primary border-primary' :
                                                  partialSel ? 'bg-primary/30 border-primary' :
                                                               'border-muted-foreground/40'}`}>
                                                {(allSel || partialSel) && <Check className="h-2.5 w-2.5 text-white" />}
                                            </div>
                                        </button>

                                        {/* Permission checkboxes */}
                                        <div className="grid grid-cols-2 gap-px bg-border">
                                            {groupPerms.map((perm) => {
                                                const checked = selectedPerms.includes(perm.id);
                                                return (
                                                    <label key={perm.id}
                                                        className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 bg-card transition-colors hover:bg-muted/30 ${checked ? 'bg-primary/5' : ''}`}>
                                                        <div
                                                            onClick={() => toggle(perm.id)}
                                                            className={`h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center cursor-pointer transition-all
                                                                ${checked ? 'bg-primary border-primary' : 'border-muted-foreground/40 hover:border-primary/60'}`}>
                                                            {checked && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                                                        </div>
                                                        <span className="text-xs">{perm.label}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit">{initialData ? 'Simpan Perubahan' : 'Buat Role'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
