import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Wilayah } from '@/types';

interface WilayahFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<Wilayah>) => void;
    initialData?: Wilayah | null;
}

const defaultForm: Partial<Wilayah> = {
    kode: '', nama: '', provinsi: '', kabupaten: '', kecamatan: '', kelurahan: '',
    target_responden: 100, luas_wilayah: undefined, keterangan: '',
};

export default function WilayahFormModal({ open, onClose, onSave, initialData }: WilayahFormModalProps) {
    const [form, setForm] = useState<Partial<Wilayah>>(defaultForm);
    const [errors, setErrors] = useState<Partial<Record<keyof Wilayah, string>>>({});

    useEffect(() => {
        setForm(initialData ? { ...initialData } : { ...defaultForm });
        setErrors({});
    }, [initialData, open]);

    const set = (field: keyof Wilayah) => (value: string | number) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        const e: Partial<Record<keyof Wilayah, string>> = {};
        if (!form.kode?.trim()) e.kode = 'Kode wajib diisi';
        if (!form.nama?.trim()) e.nama = 'Nama wajib diisi';
        if (!form.provinsi?.trim()) e.provinsi = 'Provinsi wajib diisi';
        if (!form.kabupaten?.trim()) e.kabupaten = 'Kabupaten wajib diisi';
        if (!form.kecamatan?.trim()) e.kecamatan = 'Kecamatan wajib diisi';
        if (!form.kelurahan?.trim()) e.kelurahan = 'Kelurahan/Desa wajib diisi';
        if (!form.target_responden || form.target_responden < 1) e.target_responden = 'Target harus lebih dari 0';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (validate()) onSave(form);
    };

    const Field = ({ id, label, required, error, children }: { id: string; label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label} {required && <span className="text-destructive">*</span>}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-1.5">
                            <MapPin className="h-4 w-4 text-emerald-600" />
                        </div>
                        {initialData ? 'Edit Wilayah' : 'Tambah Wilayah Baru'}
                    </DialogTitle>
                    <DialogDescription>Lengkapi informasi wilayah penugasan.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 py-2">
                    <Field id="kode" label="Kode Wilayah" required error={errors.kode}>
                        <Input id="kode" value={form.kode ?? ''} onChange={(e) => set('kode')(e.target.value)} placeholder="WLY-001" className={`font-mono ${errors.kode ? 'border-destructive' : ''}`} />
                    </Field>
                    <Field id="nama" label="Nama Wilayah" required error={errors.nama}>
                        <Input id="nama" value={form.nama ?? ''} onChange={(e) => set('nama')(e.target.value)} placeholder="Kelurahan/Desa..." className={errors.nama ? 'border-destructive' : ''} />
                    </Field>
                    <Field id="provinsi" label="Provinsi" required error={errors.provinsi}>
                        <Input id="provinsi" value={form.provinsi ?? ''} onChange={(e) => set('provinsi')(e.target.value)} placeholder="Jawa Barat" className={errors.provinsi ? 'border-destructive' : ''} />
                    </Field>
                    <Field id="kabupaten" label="Kabupaten/Kota" required error={errors.kabupaten}>
                        <Input id="kabupaten" value={form.kabupaten ?? ''} onChange={(e) => set('kabupaten')(e.target.value)} placeholder="Kab. Bogor" className={errors.kabupaten ? 'border-destructive' : ''} />
                    </Field>
                    <Field id="kecamatan" label="Kecamatan" required error={errors.kecamatan}>
                        <Input id="kecamatan" value={form.kecamatan ?? ''} onChange={(e) => set('kecamatan')(e.target.value)} placeholder="Ciawi" className={errors.kecamatan ? 'border-destructive' : ''} />
                    </Field>
                    <Field id="kelurahan" label="Kelurahan/Desa" required error={errors.kelurahan}>
                        <Input id="kelurahan" value={form.kelurahan ?? ''} onChange={(e) => set('kelurahan')(e.target.value)} placeholder="Sukamaju" className={errors.kelurahan ? 'border-destructive' : ''} />
                    </Field>
                    <Field id="target_responden" label="Target Responden" required error={errors.target_responden}>
                        <Input id="target_responden" type="number" min={1} value={form.target_responden ?? ''} onChange={(e) => set('target_responden')(Number(e.target.value))} placeholder="100" className={errors.target_responden ? 'border-destructive' : ''} />
                    </Field>
                    <Field id="luas_wilayah" label="Luas Wilayah (km²)">
                        <Input id="luas_wilayah" type="number" min={0} step={0.1} value={form.luas_wilayah ?? ''} onChange={(e) => set('luas_wilayah')(Number(e.target.value))} placeholder="0.0" />
                    </Field>
                    <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor="keterangan">Keterangan</Label>
                        <textarea id="keterangan" value={form.keterangan ?? ''} onChange={(e) => set('keterangan')(e.target.value)} rows={2} placeholder="Keterangan tambahan..." className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
                    </div>
                    <DialogFooter className="sm:col-span-2 gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit">{initialData ? 'Simpan Perubahan' : 'Tambah Wilayah'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
