import { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Assignment } from '@/types';

// Mock options for selects
const enumeratorOptions = [
    { id: 1, name: 'Ahmad Fauzi' },
    { id: 2, name: 'Siti Rahayu' },
    { id: 3, name: 'Budi Santoso' },
    { id: 4, name: 'Dewi Lestari' },
    { id: 5, name: 'Rizki Pratama' },
    { id: 6, name: 'Putri Amalia' },
];

const wilayahOptions = [
    { id: 1, nama: 'Kel. Sukamaju (WLY-001)' },
    { id: 2, nama: 'Kel. Mekarjaya (WLY-002)' },
    { id: 3, nama: 'Desa Cibadak (WLY-003)' },
    { id: 4, nama: 'Kel. Margahayu (WLY-004)' },
    { id: 5, nama: 'Desa Karanganyar (WLY-005)' },
];

const surveyOptions = [
    { id: 1, judul: 'Survei Kesehatan Masyarakat 2025' },
    { id: 2, judul: 'Survei Ekonomi Rumah Tangga' },
    { id: 3, judul: 'Survei Infrastruktur Desa 2025' },
];

interface AssignmentFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<Assignment>) => void;
    initialData?: Assignment | null;
}

const defaultForm: Partial<Assignment> = {
    enumerator_id: undefined,
    wilayah_id: undefined,
    survey_id: undefined,
    status: 'pending',
    target: 50,
    terkumpul: 0,
    tanggal_mulai: new Date().toISOString().split('T')[0],
    catatan: '',
};

export default function AssignmentFormModal({ open, onClose, onSave, initialData }: AssignmentFormModalProps) {
    const [form, setForm] = useState<Partial<Assignment>>(defaultForm);
    const [errors, setErrors] = useState<Partial<Record<keyof Assignment, string>>>({});

    useEffect(() => {
        setForm(initialData ? { ...initialData } : { ...defaultForm });
        setErrors({});
    }, [initialData, open]);

    const set = (field: keyof Assignment) => (value: string | number) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        const e: Partial<Record<keyof Assignment, string>> = {};
        if (!form.enumerator_id) e.enumerator_id = 'Enumerator wajib dipilih';
        if (!form.wilayah_id) e.wilayah_id = 'Wilayah wajib dipilih';
        if (!form.survey_id) e.survey_id = 'Survey wajib dipilih';
        if (!form.target || form.target < 1) e.target = 'Target harus lebih dari 0';
        if (!form.tanggal_mulai) e.tanggal_mulai = 'Tanggal mulai wajib diisi';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (validate()) onSave(form);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-1.5">
                            <Briefcase className="h-4 w-4 text-indigo-600" />
                        </div>
                        {initialData ? 'Edit Penugasan' : 'Buat Penugasan Baru'}
                    </DialogTitle>
                    <DialogDescription>Tetapkan enumerator ke wilayah dan program survei.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 py-2">
                    {/* Enumerator */}
                    <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor="enumerator_id">Enumerator <span className="text-destructive">*</span></Label>
                        <Select value={form.enumerator_id?.toString()} onValueChange={(v) => set('enumerator_id')(Number(v))}>
                            <SelectTrigger id="enumerator_id" className={errors.enumerator_id ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Pilih enumerator..." />
                            </SelectTrigger>
                            <SelectContent>
                                {enumeratorOptions.map((e) => <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {errors.enumerator_id && <p className="text-xs text-destructive">{errors.enumerator_id}</p>}
                    </div>

                    {/* Wilayah */}
                    <div className="space-y-1.5">
                        <Label htmlFor="wilayah_id">Wilayah <span className="text-destructive">*</span></Label>
                        <Select value={form.wilayah_id?.toString()} onValueChange={(v) => set('wilayah_id')(Number(v))}>
                            <SelectTrigger id="wilayah_id" className={errors.wilayah_id ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Pilih wilayah..." />
                            </SelectTrigger>
                            <SelectContent>
                                {wilayahOptions.map((w) => <SelectItem key={w.id} value={w.id.toString()}>{w.nama}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {errors.wilayah_id && <p className="text-xs text-destructive">{errors.wilayah_id}</p>}
                    </div>

                    {/* Survey */}
                    <div className="space-y-1.5">
                        <Label htmlFor="survey_id">Survey <span className="text-destructive">*</span></Label>
                        <Select value={form.survey_id?.toString()} onValueChange={(v) => set('survey_id')(Number(v))}>
                            <SelectTrigger id="survey_id" className={errors.survey_id ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Pilih survey..." />
                            </SelectTrigger>
                            <SelectContent>
                                {surveyOptions.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.judul}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {errors.survey_id && <p className="text-xs text-destructive">{errors.survey_id}</p>}
                    </div>

                    {/* Target */}
                    <div className="space-y-1.5">
                        <Label htmlFor="target">Target Responden <span className="text-destructive">*</span></Label>
                        <Input id="target" type="number" min={1} value={form.target ?? ''} onChange={(e) => set('target')(Number(e.target.value))} className={errors.target ? 'border-destructive' : ''} />
                        {errors.target && <p className="text-xs text-destructive">{errors.target}</p>}
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <Label htmlFor="status">Status</Label>
                        <Select value={form.status} onValueChange={set('status')}>
                            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Menunggu</SelectItem>
                                <SelectItem value="ongoing">Berjalan</SelectItem>
                                <SelectItem value="completed">Selesai</SelectItem>
                                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Terkumpul */}
                    <div className="space-y-1.5">
                        <Label htmlFor="terkumpul">Responden Terkumpul</Label>
                        <Input id="terkumpul" type="number" min={0} value={form.terkumpul ?? 0} onChange={(e) => set('terkumpul')(Number(e.target.value))} />
                    </div>

                    {/* Tanggal Mulai */}
                    <div className="space-y-1.5">
                        <Label htmlFor="tanggal_mulai">Tanggal Mulai <span className="text-destructive">*</span></Label>
                        <Input id="tanggal_mulai" type="date" value={form.tanggal_mulai ?? ''} onChange={(e) => set('tanggal_mulai')(e.target.value)} className={errors.tanggal_mulai ? 'border-destructive' : ''} />
                        {errors.tanggal_mulai && <p className="text-xs text-destructive">{errors.tanggal_mulai}</p>}
                    </div>

                    {/* Tanggal Selesai */}
                    <div className="space-y-1.5">
                        <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
                        <Input id="tanggal_selesai" type="date" value={form.tanggal_selesai ?? ''} onChange={(e) => set('tanggal_selesai')(e.target.value)} />
                    </div>

                    {/* Catatan */}
                    <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor="catatan">Catatan</Label>
                        <textarea id="catatan" value={form.catatan ?? ''} onChange={(e) => set('catatan')(e.target.value)} rows={2} placeholder="Catatan atau instruksi tambahan..." className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
                    </div>

                    <DialogFooter className="sm:col-span-2 gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit">{initialData ? 'Simpan Perubahan' : 'Buat Penugasan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
