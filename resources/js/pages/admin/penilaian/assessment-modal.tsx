import { useState, useEffect } from 'react';
import { Star, ClipboardCheck } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import type { EnumeratorAssessment, EnumeratorOption } from '@/types';

// ── Criteria config ─────────────────────────────────────────
const CRITERIA: { key: keyof CriteriaScores; label: string; desc: string }[] = [
    { key: 'pemahaman_tugas',           label: 'Pemahaman Tugas',                   desc: 'Kemampuan memahami instruksi dan tujuan survei' },
    { key: 'keterampilan_wawancara',    label: 'Keterampilan Wawancara',             desc: 'Kemampuan berkomunikasi dan memandu responden' },
    { key: 'kualitas_pengisian_data',   label: 'Kualitas Pengisian Data',            desc: 'Keakuratan, kelengkapan, dan konsistensi data' },
    { key: 'ketepatan_waktu',           label: 'Ketepatan Waktu & Produktivitas',    desc: 'Penyelesaian tugas sesuai tenggat dan target' },
    { key: 'etika_profesionalisme',     label: 'Etika & Profesionalisme',            desc: 'Sikap, penampilan, dan perilaku saat bertugas' },
    { key: 'kepatuhan_sop',             label: 'Kepatuhan terhadap SOP Lapangan',    desc: 'Mengikuti prosedur dan protokol yang ditetapkan' },
    { key: 'kemampuan_teknis',          label: 'Kemampuan Teknis',                   desc: 'Penggunaan perangkat, aplikasi, dan teknologi' },
    { key: 'evaluasi_supervisor',       label: 'Evaluasi Supervisor',                desc: 'Penilaian keseluruhan dari supervisor langsung' },
];

type CriteriaScores = {
    pemahaman_tugas: number;
    keterampilan_wawancara: number;
    kualitas_pengisian_data: number;
    ketepatan_waktu: number;
    etika_profesionalisme: number;
    kepatuhan_sop: number;
    kemampuan_teknis: number;
    evaluasi_supervisor: number;
};

const defaultScores: CriteriaScores = {
    pemahaman_tugas: 3,
    keterampilan_wawancara: 3,
    kualitas_pengisian_data: 3,
    ketepatan_waktu: 3,
    etika_profesionalisme: 3,
    kepatuhan_sop: 3,
    kemampuan_teknis: 3,
    evaluasi_supervisor: 3,
};

const SCORE_LABELS: Record<number, string> = {
    1: 'Sangat Kurang',
    2: 'Kurang',
    3: 'Cukup',
    4: 'Baik',
    5: 'Sangat Baik',
};

// ── StarRating Component ────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                    <Star
                        className={`h-6 w-6 transition-colors duration-150 ${
                            star <= (hovered || value)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/30'
                        }`}
                    />
                </button>
            ))}
            <span className="ml-2 text-xs font-medium text-muted-foreground">
                {SCORE_LABELS[hovered || value]}
            </span>
        </div>
    );
}

// ── Props ───────────────────────────────────────────────────
interface AssessmentModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<EnumeratorAssessment>) => void;
    initialData?: EnumeratorAssessment | null;
    enumerators: EnumeratorOption[];
    defaultEnumeratorId?: string;
}

export default function AssessmentModal({
    open,
    onClose,
    onSave,
    initialData,
    enumerators,
    defaultEnumeratorId,
}: AssessmentModalProps) {
    const [selectedEnumeratorId, setSelectedEnumeratorId] = useState<string>('');
    const [supervisorName, setSupervisorName]             = useState('');
    const [periode, setPeriode]                           = useState('');
    const [catatan, setCatatan]                           = useState('');
    const [scores, setScores]                             = useState<CriteriaScores>(defaultScores);
    const [errors, setErrors]                             = useState<Record<string, string>>({});

    // Populate when editing or pre-select when assessing
    useEffect(() => {
        if (initialData) {
            setSelectedEnumeratorId(String(initialData.enumerator_id));
            setSupervisorName(initialData.supervisor_name);
            setPeriode(initialData.periode ?? '');
            setCatatan(initialData.catatan ?? '');
            setScores({
                pemahaman_tugas:           initialData.pemahaman_tugas,
                keterampilan_wawancara:    initialData.keterampilan_wawancara,
                kualitas_pengisian_data:   initialData.kualitas_pengisian_data,
                ketepatan_waktu:           initialData.ketepatan_waktu,
                etika_profesionalisme:     initialData.etika_profesionalisme,
                kepatuhan_sop:             initialData.kepatuhan_sop,
                kemampuan_teknis:          initialData.kemampuan_teknis,
                evaluasi_supervisor:       initialData.evaluasi_supervisor,
            });
        } else {
            setSelectedEnumeratorId(defaultEnumeratorId ?? '');
            setSupervisorName('');
            setPeriode('');
            setCatatan('');
            setScores(defaultScores);
        }
        setErrors({});
    }, [initialData, open, defaultEnumeratorId]);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!selectedEnumeratorId) e.enumerator = 'Pilih enumerator terlebih dahulu';
        if (!supervisorName.trim()) e.supervisor = 'Nama supervisor wajib diisi';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;

        const enumerator = enumerators.find((e) => String(e.id) === selectedEnumeratorId);
        if (!enumerator) return;

        onSave({
            enumerator_id:           enumerator.id,
            enumerator_name:         enumerator.name,
            enumerator_nik:          enumerator.nik,
            supervisor_name:         supervisorName.trim(),
            periode:                 periode.trim() || undefined,
            catatan:                 catatan.trim() || undefined,
            ...scores,
        });
    };

    const avgScore = Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / 8) * 10) / 10;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-1.5">
                            <ClipboardCheck className="h-4 w-4 text-violet-600" />
                        </div>
                        {initialData ? 'Edit Penilaian' : 'Tambah Penilaian Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Perbarui penilaian kinerja enumerator.'
                            : 'Isi form berikut untuk menilai kinerja enumerator.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    {/* ── Info Umum ── */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Enumerator */}
                        <div className="sm:col-span-2 space-y-1.5">
                            <Label htmlFor="enumerator">
                                ID Enumerator <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={selectedEnumeratorId}
                                onValueChange={(v) => {
                                    setSelectedEnumeratorId(v);
                                    if (errors.enumerator) setErrors((p) => ({ ...p, enumerator: '' }));
                                }}
                                disabled={!!initialData}
                            >
                                <SelectTrigger
                                    id="enumerator"
                                    className={errors.enumerator ? 'border-destructive' : ''}
                                >
                                    <SelectValue placeholder="Pilih enumerator..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {enumerators.map((e) => (
                                        <SelectItem key={e.id} value={String(e.id)}>
                                            <span className="font-medium">{e.name}</span>
                                            <span className="ml-2 text-xs text-muted-foreground font-mono">
                                                {e.nik}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.enumerator && (
                                <p className="text-xs text-destructive">{errors.enumerator}</p>
                            )}
                        </div>

                        {/* Supervisor */}
                        <div className="space-y-1.5">
                            <Label htmlFor="supervisor">
                                Nama Supervisor <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="supervisor"
                                value={supervisorName}
                                onChange={(e) => {
                                    setSupervisorName(e.target.value);
                                    if (errors.supervisor) setErrors((p) => ({ ...p, supervisor: '' }));
                                }}
                                placeholder="Nama penyelia"
                                className={errors.supervisor ? 'border-destructive' : ''}
                            />
                            {errors.supervisor && (
                                <p className="text-xs text-destructive">{errors.supervisor}</p>
                            )}
                        </div>

                        {/* Periode */}
                        <div className="space-y-1.5">
                            <Label htmlFor="periode">Periode Penilaian</Label>
                            <Input
                                id="periode"
                                value={periode}
                                onChange={(e) => setPeriode(e.target.value)}
                                placeholder="cth: April 2026"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* ── Kriteria Penilaian ── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold">Kriteria Penilaian</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Rata-rata:</span>
                                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                                    avgScore >= 4.5 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    avgScore >= 3.5 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                    avgScore >= 2.5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                    {avgScore.toFixed(1)} / 5.0
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {CRITERIA.map((c, i) => (
                                <div key={c.key} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-start">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                                        {i + 1}
                                    </span>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{c.label}</p>
                                        <p className="text-xs text-muted-foreground">{c.desc}</p>
                                        <StarRating
                                            value={scores[c.key]}
                                            onChange={(v) => setScores((prev) => ({ ...prev, [c.key]: v }))}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* ── Catatan ── */}
                    <div className="space-y-1.5">
                        <Label htmlFor="catatan">Catatan Tambahan</Label>
                        <textarea
                            id="catatan"
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            placeholder="Catatan evaluasi tambahan (opsional)..."
                            rows={3}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                        />
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" className="gap-2">
                            <ClipboardCheck className="h-4 w-4" />
                            {initialData ? 'Simpan Perubahan' : 'Simpan Penilaian'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
