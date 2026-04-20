import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Survey } from '@/types';

interface SurveyFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<Survey>) => void;
    initialData?: Survey | null;
}

const defaultForm: Partial<Survey> = {
    judul: '', deskripsi: '',
    periode_mulai: new Date().toISOString().split('T')[0],
    periode_selesai: '',
    status: 'draft',
    total_target: 100,
};

export default function SurveyFormModal({ open, onClose, onSave, initialData }: SurveyFormModalProps) {
    const [form, setForm] = useState<Partial<Survey>>(defaultForm);
    const [errors, setErrors] = useState<Partial<Record<keyof Survey, string>>>({});

    useEffect(() => {
        setForm(initialData ? { ...initialData } : { ...defaultForm });
        setErrors({});
    }, [initialData, open]);

    const set = (field: keyof Survey) => (value: string | number) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        const e: Partial<Record<keyof Survey, string>> = {};
        if (!form.judul?.trim()) e.judul = 'Judul wajib diisi';
        if (!form.deskripsi?.trim()) e.deskripsi = 'Deskripsi wajib diisi';
        if (!form.periode_mulai) e.periode_mulai = 'Tanggal mulai wajib diisi';
        if (!form.periode_selesai) e.periode_selesai = 'Tanggal selesai wajib diisi';
        if (form.periode_mulai && form.periode_selesai && form.periode_selesai <= form.periode_mulai)
            e.periode_selesai = 'Tanggal selesai harus setelah tanggal mulai';
        if (!form.total_target || form.total_target < 1) e.total_target = 'Target harus lebih dari 0';
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
                        <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-1.5">
                            <ClipboardList className="h-4 w-4 text-purple-600" />
                        </div>
                        {initialData ? 'Edit Survey' : 'Buat Survey Baru'}
                    </DialogTitle>
                    <DialogDescription>Isi informasi program survei yang akan dilaksanakan.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="judul">Judul Survey <span className="text-destructive">*</span></Label>
                        <Input id="judul" value={form.judul ?? ''} onChange={(e) => set('judul')(e.target.value)} placeholder="Nama program survei..." className={errors.judul ? 'border-destructive' : ''} />
                        {errors.judul && <p className="text-xs text-destructive">{errors.judul}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="deskripsi">Deskripsi <span className="text-destructive">*</span></Label>
                        <textarea id="deskripsi" value={form.deskripsi ?? ''} onChange={(e) => set('deskripsi')(e.target.value)} placeholder="Deskripsi tujuan dan ruang lingkup survei..." rows={3} className={`w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none ${errors.deskripsi ? 'border-destructive' : 'border-input'}`} />
                        {errors.deskripsi && <p className="text-xs text-destructive">{errors.deskripsi}</p>}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="periode_mulai">Tanggal Mulai <span className="text-destructive">*</span></Label>
                            <Input id="periode_mulai" type="date" value={form.periode_mulai ?? ''} onChange={(e) => set('periode_mulai')(e.target.value)} className={errors.periode_mulai ? 'border-destructive' : ''} />
                            {errors.periode_mulai && <p className="text-xs text-destructive">{errors.periode_mulai}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="periode_selesai">Tanggal Selesai <span className="text-destructive">*</span></Label>
                            <Input id="periode_selesai" type="date" value={form.periode_selesai ?? ''} onChange={(e) => set('periode_selesai')(e.target.value)} className={errors.periode_selesai ? 'border-destructive' : ''} />
                            {errors.periode_selesai && <p className="text-xs text-destructive">{errors.periode_selesai}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="total_target">Target Responden <span className="text-destructive">*</span></Label>
                            <Input id="total_target" type="number" min={1} value={form.total_target ?? ''} onChange={(e) => set('total_target')(Number(e.target.value))} className={errors.total_target ? 'border-destructive' : ''} />
                            {errors.total_target && <p className="text-xs text-destructive">{errors.total_target}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="status">Status</Label>
                            <Select value={form.status} onValueChange={set('status')}>
                                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="closed">Selesai</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit">{initialData ? 'Simpan Perubahan' : 'Buat Survey'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
