import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Enumerator } from '@/types';

interface EnumeratorFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<Enumerator>) => void;
    initialData?: Enumerator | null;
}

const defaultForm: Partial<Enumerator> = {
    name: '',
    nik: '',
    phone: '',
    email: '',
    gender: 'male',
    address: '',
    status: 'active',
    education: 'SMA',
    join_date: new Date().toISOString().split('T')[0],
};

export default function EnumeratorFormModal({ open, onClose, onSave, initialData }: EnumeratorFormModalProps) {
    const [form, setForm] = useState<Partial<Enumerator>>(defaultForm);
    const [errors, setErrors] = useState<Partial<Record<keyof Enumerator, string>>>({});

    useEffect(() => {
        if (initialData) {
            setForm({ ...initialData });
        } else {
            setForm({ ...defaultForm });
        }
        setErrors({});
    }, [initialData, open]);

    const validate = () => {
        const newErrors: Partial<Record<keyof Enumerator, string>> = {};
        if (!form.name?.trim()) newErrors.name = 'Nama wajib diisi';
        if (!form.nik?.trim() || form.nik.length !== 16) newErrors.nik = 'NIK harus 16 digit';
        if (!form.phone?.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
        if (!form.email?.trim() || !form.email.includes('@')) newErrors.email = 'Email tidak valid';
        if (!form.address?.trim()) newErrors.address = 'Alamat wajib diisi';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(form);
        }
    };

    const set = (field: keyof Enumerator) => (value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-1.5">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        {initialData ? 'Edit Enumerator' : 'Tambah Enumerator Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Perbarui data enumerator di bawah ini.' : 'Isi form berikut untuk menambahkan enumerator baru.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Nama */}
                        <div className="sm:col-span-2 space-y-1.5">
                            <Label htmlFor="name">Nama Lengkap <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                value={form.name ?? ''}
                                onChange={(e) => set('name')(e.target.value)}
                                placeholder="Masukkan nama lengkap"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>

                        {/* NIK */}
                        <div className="space-y-1.5">
                            <Label htmlFor="nik">NIK <span className="text-destructive">*</span></Label>
                            <Input
                                id="nik"
                                value={form.nik ?? ''}
                                onChange={(e) => set('nik')(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                placeholder="16 digit NIK"
                                className={`font-mono ${errors.nik ? 'border-destructive' : ''}`}
                            />
                            {errors.nik && <p className="text-xs text-destructive">{errors.nik}</p>}
                        </div>

                        {/* Gender */}
                        <div className="space-y-1.5">
                            <Label htmlFor="gender">Jenis Kelamin</Label>
                            <Select value={form.gender} onValueChange={set('gender')}>
                                <SelectTrigger id="gender">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Laki-laki</SelectItem>
                                    <SelectItem value="female">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone">Nomor Telepon <span className="text-destructive">*</span></Label>
                            <Input
                                id="phone"
                                value={form.phone ?? ''}
                                onChange={(e) => set('phone')(e.target.value)}
                                placeholder="08xx xxxx xxxx"
                                className={errors.phone ? 'border-destructive' : ''}
                            />
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email ?? ''}
                                onChange={(e) => set('email')(e.target.value)}
                                placeholder="nama@email.com"
                                className={errors.email ? 'border-destructive' : ''}
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>

                        {/* Education */}
                        <div className="space-y-1.5">
                            <Label htmlFor="education">Pendidikan Terakhir</Label>
                            <Select value={form.education} onValueChange={set('education')}>
                                <SelectTrigger id="education">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SMP">SMP</SelectItem>
                                    <SelectItem value="SMA">SMA</SelectItem>
                                    <SelectItem value="D3">D3</SelectItem>
                                    <SelectItem value="S1">S1</SelectItem>
                                    <SelectItem value="S2">S2</SelectItem>
                                    <SelectItem value="S3">S3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <Label htmlFor="status">Status</Label>
                            <Select value={form.status} onValueChange={set('status')}>
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="training">Training</SelectItem>
                                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Join Date */}
                        <div className="space-y-1.5">
                            <Label htmlFor="join_date">Tanggal Bergabung</Label>
                            <Input
                                id="join_date"
                                type="date"
                                value={form.join_date ?? ''}
                                onChange={(e) => set('join_date')(e.target.value)}
                            />
                        </div>

                        {/* Address */}
                        <div className="sm:col-span-2 space-y-1.5">
                            <Label htmlFor="address">Alamat <span className="text-destructive">*</span></Label>
                            <textarea
                                id="address"
                                value={form.address ?? ''}
                                onChange={(e) => { set('address')(e.target.value); }}
                                placeholder="Alamat lengkap enumerator"
                                rows={3}
                                className={`w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none ${errors.address ? 'border-destructive' : 'border-input'}`}
                            />
                            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" className="gap-2">
                            {initialData ? 'Simpan Perubahan' : 'Tambah Enumerator'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
