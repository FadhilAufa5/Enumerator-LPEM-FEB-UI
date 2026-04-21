import { useState, useEffect } from 'react';
import { Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { AppUser, Role } from '@/types';

interface UserFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<AppUser> & { password?: string; role_id?: number }) => void;
    initialData?: AppUser | null;
    roles: Pick<Role, 'id' | 'name' | 'label' | 'color' | 'is_system'>[];
}

type FormState = {
    name: string;
    email: string;
    status: AppUser['status'];
    role_id: string;
    password: string;
};

const defaultForm: FormState = {
    name: '',
    email: '',
    status: 'active',
    role_id: '',
    password: '',
};

export default function UserFormModal({ open, onClose, onSave, initialData, roles }: UserFormModalProps) {
    const [form, setForm]     = useState<FormState>(defaultForm);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setForm({
                name:    initialData.name,
                email:   initialData.email,
                status:  initialData.status ?? 'active',
                role_id: initialData.role?.id?.toString() ?? '',
                password: '',
            });
        } else {
            setForm({ ...defaultForm });
        }
        setErrors({});
    }, [initialData, open]);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim())                           e.name     = 'Nama wajib diisi';
        if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email tidak valid';
        if (!initialData && form.password.length < 8)   e.password  = 'Password minimal 8 karakter';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;
        onSave({
            name:     form.name,
            email:    form.email,
            status:   form.status,
            role_id:  form.role_id ? Number(form.role_id) : undefined,
            password: form.password || undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-1.5">
                            <Users className="h-4 w-4 text-violet-600" />
                        </div>
                        {initialData ? 'Edit User' : 'Tambah User Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Perbarui informasi akun pengguna.' : 'Buat akun pengguna baru dan tetapkan role-nya.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Nama */}
                    <div className="space-y-1.5">
                        <Label htmlFor="u-name">Nama Lengkap <span className="text-destructive">*</span></Label>
                        <Input id="u-name" value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Nama pengguna"
                            className={errors.name ? 'border-destructive' : ''} />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="u-email">Email <span className="text-destructive">*</span></Label>
                        <Input id="u-email" type="email" value={form.email}
                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                            placeholder="user@email.com"
                            className={errors.email ? 'border-destructive' : ''} />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>

                    {/* Password — hanya saat tambah; kosong = tidak diubah */}
                    <div className="space-y-1.5">
                        <Label htmlFor="u-password">
                            Password {!initialData && <span className="text-destructive">*</span>}
                            {initialData && <span className="text-xs text-muted-foreground ml-1">(kosongkan jika tidak diubah)</span>}
                        </Label>
                        <Input id="u-password" type="password" value={form.password}
                            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                            placeholder="Min. 8 karakter"
                            className={errors.password ? 'border-destructive' : ''} />
                        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Role */}
                        <div className="space-y-1.5">
                            <Label htmlFor="u-role" className="flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                Role
                            </Label>
                            <Select value={form.role_id} onValueChange={(v) => setForm((p) => ({ ...p, role_id: v }))}>
                                <SelectTrigger id="u-role"><SelectValue placeholder="Pilih role" /></SelectTrigger>
                                <SelectContent>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.id.toString()}>{r.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <Label htmlFor="u-status">Status</Label>
                            <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as AppUser['status'] }))}>
                                <SelectTrigger id="u-status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit">{initialData ? 'Simpan Perubahan' : 'Tambah User'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
