import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    ClipboardCheck,
    Search,
    Star,
    TrendingUp,
    Award,
    Users,
    Pencil,
    Trash2,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { EnumeratorAssessment, EnumeratorOption } from '@/types';
import AssessmentModal from './assessment-modal';
import DeleteConfirmDialog from '@/components/admin/delete-confirm-dialog';

// ── Criteria keys ──────────────────────────────────────────
const CRITERIA_KEYS: { key: keyof EnumeratorAssessment; short: string; long: string }[] = [
    { key: 'pemahaman_tugas',         short: 'PT',  long: 'Pemahaman Tugas' },
    { key: 'keterampilan_wawancara',  short: 'KW',  long: 'Keterampilan Wawancara' },
    { key: 'kualitas_pengisian_data', short: 'KPD', long: 'Kualitas Pengisian Data' },
    { key: 'ketepatan_waktu',         short: 'KtW', long: 'Ketepatan Waktu & Produktivitas' },
    { key: 'etika_profesionalisme',   short: 'EP',  long: 'Etika & Profesionalisme' },
    { key: 'kepatuhan_sop',           short: 'KS',  long: 'Kepatuhan SOP' },
    { key: 'kemampuan_teknis',        short: 'KTk', long: 'Kemampuan Teknis' },
    { key: 'evaluasi_supervisor',     short: 'ES',  long: 'Evaluasi Supervisor' },
];

// ── Helpers ────────────────────────────────────────────────
function scoreInfo(score: number) {
    if (score >= 4.5) return { label: 'Sangat Baik', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', bar: 'bg-emerald-500' };
    if (score >= 3.5) return { label: 'Baik',        cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',             bar: 'bg-blue-500'    };
    if (score >= 2.5) return { label: 'Cukup',       cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',         bar: 'bg-amber-500'   };
    return              { label: 'Kurang',            cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',                 bar: 'bg-red-500'     };
}

function MiniStars({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
                <Star key={s} className={`h-3 w-3 ${s <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/25'}`} />
            ))}
        </div>
    );
}

// ── Row-level action chip ──────────────────────────────────
function ActionChip({
    hasAssessment,
    onAssess,
    onEdit,
    onDelete,
}: {
    hasAssessment: boolean;
    onAssess: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex items-center gap-2">
            {hasAssessment ? (
                <>
                    {/* Edit chip */}
                    <button
                        onClick={onEdit}
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition-all hover:bg-blue-100 hover:border-blue-300 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                    >
                        <Pencil className="h-3 w-3" />
                        Edit
                    </button>
                    {/* Delete chip */}
                    <button
                        onClick={onDelete}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-all hover:bg-red-100 hover:border-red-300 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                    >
                        <Trash2 className="h-3 w-3" />
                        Remove
                    </button>
                </>
            ) : (
                <button
                    onClick={onAssess}
                    className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 transition-all hover:bg-violet-100 hover:border-violet-300 hover:shadow-sm dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/40"
                >
                    <ClipboardCheck className="h-3 w-3" />
                    Rate
                </button>
            )}
        </div>
    );
}

// ── Props ──────────────────────────────────────────────────
interface Props {
    assessments: EnumeratorAssessment[];
    enumerators: EnumeratorOption[];
}

export default function PenilaianIndex({ assessments: initialAssessments, enumerators }: Props) {
    const [assessments, setAssessments]   = useState<EnumeratorAssessment[]>(initialAssessments);
    const [search, setSearch]             = useState('');
    const [isFormOpen, setIsFormOpen]     = useState(false);
    const [editingItem, setEditingItem]   = useState<EnumeratorAssessment | null>(null);
    const [deletingItem, setDeletingItem] = useState<EnumeratorAssessment | null>(null);
    // Track which enumerator we're assessing (for pre-filling the modal)
    const [targetEnumerator, setTargetEnumerator] = useState<EnumeratorOption | null>(null);

    // Map: enumeratorId -> latest assessment
    const assessmentMap = new Map<number, EnumeratorAssessment>();
    assessments.forEach((a) => {
        const existing = assessmentMap.get(a.enumerator_id);
        if (!existing || new Date(a.created_at) > new Date(existing.created_at)) {
            assessmentMap.set(a.enumerator_id, a);
        }
    });

    // Filter enumerators by search
    const filteredEnumerators = enumerators.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.nik.includes(search)
    );

    // Stats
    const assessed   = enumerators.filter((e) => assessmentMap.has(e.id)).length;
    const unassessed = enumerators.length - assessed;
    const allScores  = assessments.map((a) => a.nilai_akhir);
    const avgScore   = allScores.length ? allScores.reduce((s, v) => s + v, 0) / allScores.length : 0;
    const topScore   = allScores.length ? Math.max(...allScores) : 0;

    // Open modal for new assessment on a specific enumerator
    const handleOpenAssess = (enumerator: EnumeratorOption) => {
        setTargetEnumerator(enumerator);
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (assessment: EnumeratorAssessment) => {
        setTargetEnumerator(null);
        setEditingItem(assessment);
        setIsFormOpen(true);
    };

    const handleSave = (data: Partial<EnumeratorAssessment>) => {
        if (editingItem) {
            router.put(`/admin/penilaian/${editingItem.id}`, data as Record<string, unknown>, {
                preserveScroll: true,
                onSuccess: () =>
                    setAssessments((prev) =>
                        prev.map((a) => (a.id === editingItem.id ? { ...a, ...data } : a))
                    ),
            });
        } else {
            router.post('/admin/penilaian', data as Record<string, unknown>, {
                preserveScroll: true,
            });
        }
        setIsFormOpen(false);
        setEditingItem(null);
        setTargetEnumerator(null);
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(`/admin/penilaian/${deletingItem.id}`, {
            preserveScroll: true,
            onSuccess: () =>
                setAssessments((prev) => prev.filter((a) => a.id !== deletingItem.id)),
        });
        setDeletingItem(null);
    };

    // Build a pre-filled "initialData" when targeting a specific enumerator
    const modalInitialData: EnumeratorAssessment | null = editingItem ?? null;
    // For pre-selecting enumerator in the modal we pass it as a prop override
    const modalEnumerators: EnumeratorOption[] = targetEnumerator
        ? [targetEnumerator, ...enumerators.filter((e) => e.id !== targetEnumerator.id)]
        : enumerators;

    return (
        <TooltipProvider>
            <Head title="Penilaian Enumerator" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* ── Header ── */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <div className="rounded-xl bg-violet-100 dark:bg-violet-900/30 p-2">
                            <ClipboardCheck className="h-6 w-6 text-violet-600" />
                        </div>
                        Penilaian Enumerator
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Evaluasi kinerja petugas enumerator lapangan
                    </p>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Total Enumerator',   value: enumerators.length, icon: Users,         color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20'       },
                        { label: 'Sudah Dinilai',       value: assessed,           icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Belum Dinilai',       value: unassessed,         icon: Clock,         color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20'     },
                        { label: 'Rata-rata Nilai',     value: avgScore.toFixed(1),icon: TrendingUp,    color: 'text-violet-600',  bg: 'bg-violet-50 dark:bg-violet-900/20'   },
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

                {/* ── Search ── */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama atau NIK enumerator..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ── Main Table ── */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Daftar Penilaian Enumerator</CardTitle>
                            <CardDescription>
                                {filteredEnumerators.length} enumerator
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama Enumerator</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">NIK</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status Penilaian</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            <TooltipProvider>
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    {CRITERIA_KEYS.map((c) => (
                                                        <Tooltip key={c.key}>
                                                            <TooltipTrigger asChild>
                                                                <span className="cursor-default rounded bg-muted px-1 py-0.5 text-[10px] font-semibold">
                                                                    {c.short}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p className="text-xs">{c.long}</p></TooltipContent>
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            </TooltipProvider>
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nilai Akhir</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEnumerators.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                                                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                                <p>Tidak ada enumerator ditemukan</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEnumerators.map((enumerator) => {
                                            const assessment = assessmentMap.get(enumerator.id);
                                            const initials = enumerator.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .substring(0, 2)
                                                .toUpperCase();

                                            return (
                                                <tr key={enumerator.id} className="border-b transition-colors hover:bg-muted/30 group">

                                                    {/* Nama */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarFallback className={`text-xs font-semibold ${assessment ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' : 'bg-muted text-muted-foreground'}`}>
                                                                    {initials}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium leading-none">{enumerator.name}</p>
                                                                {assessment?.periode && (
                                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                                        Periode: {assessment.periode}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* NIK */}
                                                    <td className="px-4 py-3">
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            {enumerator.nik}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-4 py-3">
                                                        {assessment ? (
                                                            <Badge className="gap-1.5 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Sudah Dinilai
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                                                                <Clock className="h-3 w-3" />
                                                                Belum Dinilai
                                                            </Badge>
                                                        )}
                                                    </td>

                                                    {/* Per-criteria scores */}
                                                    <td className="px-4 py-3">
                                                        {assessment ? (
                                                            <div className="flex items-center gap-1 flex-wrap">
                                                                {CRITERIA_KEYS.map((c) => {
                                                                    const val = assessment[c.key] as number;
                                                                    return (
                                                                        <Tooltip key={c.key}>
                                                                            <TooltipTrigger asChild>
                                                                                <span className={`inline-flex items-center justify-center h-5 w-7 rounded text-[10px] font-bold cursor-default ${
                                                                                    val >= 4 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                                                    val >= 3 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                                    val >= 2 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                                }`}>
                                                                                    {val}
                                                                                </span>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent side="top">
                                                                                <div className="text-xs space-y-1">
                                                                                    <p className="font-medium">{c.long}</p>
                                                                                    <MiniStars value={val} />
                                                                                </div>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">—</span>
                                                        )}
                                                    </td>

                                                    {/* Nilai Akhir */}
                                                    <td className="px-4 py-3">
                                                        {assessment ? (() => {
                                                            const info = scoreInfo(assessment.nilai_akhir);
                                                            return (
                                                                <div className="space-y-1.5">
                                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.cls}`}>
                                                                        {assessment.nilai_akhir.toFixed(1)} — {info.label}
                                                                    </span>
                                                                    <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full ${info.bar} transition-all`}
                                                                            style={{ width: `${(assessment.nilai_akhir / 5) * 100}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })() : (
                                                            <span className="text-xs text-muted-foreground">—</span>
                                                        )}
                                                    </td>

                                                    {/* Aksi */}
                                                    <td className="px-4 py-3">
                                                        <ActionChip
                                                            hasAssessment={!!assessment}
                                                            onAssess={() => handleOpenAssess(enumerator)}
                                                            onEdit={() => assessment && handleOpenEdit(assessment)}
                                                            onDelete={() => assessment && setDeletingItem(assessment)}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Legend */}
                        <div className="border-t px-4 py-3 bg-muted/20">
                            <p className="text-xs text-muted-foreground mb-2 font-medium">Keterangan Nilai:</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { range: '≥ 4.5', label: 'Sangat Baik', cls: 'bg-emerald-100 text-emerald-700' },
                                    { range: '3.5–4.4', label: 'Baik',      cls: 'bg-blue-100 text-blue-700'     },
                                    { range: '2.5–3.4', label: 'Cukup',     cls: 'bg-amber-100 text-amber-700'   },
                                    { range: '< 2.5',   label: 'Kurang',    cls: 'bg-red-100 text-red-700'       },
                                ].map((l) => (
                                    <span key={l.label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${l.cls}`}>
                                        {l.range} = {l.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Modals ── */}
            <AssessmentModal
                open={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingItem(null); setTargetEnumerator(null); }}
                onSave={handleSave}
                initialData={modalInitialData}
                enumerators={modalEnumerators}
                defaultEnumeratorId={targetEnumerator ? String(targetEnumerator.id) : undefined}
            />
            <DeleteConfirmDialog
                open={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                onConfirm={handleDelete}
                title="Hapus Penilaian"
                description={`Apakah Anda yakin ingin menghapus penilaian untuk "${deletingItem?.enumerator_name}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </TooltipProvider>
    );
}
