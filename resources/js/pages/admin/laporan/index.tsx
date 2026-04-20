import { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    BarChart3,
    Download,
    TrendingUp,
    Users,
    MapPin,
    Target,
    Calendar,
    CheckCircle2,
    Clock,
    Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan', href: '/admin/laporan' },
];

const wilayahProgress = [
    { nama: 'Kel. Sukamaju', kecamatan: 'Ciawi', target: 150, terkumpul: 112, enumerator: 3 },
    { nama: 'Kel. Mekarjaya', kecamatan: 'Dramaga', target: 200, terkumpul: 200, enumerator: 4 },
    { nama: 'Desa Cibadak', kecamatan: 'Cibadak', target: 120, terkumpul: 45, enumerator: 2 },
    { nama: 'Kel. Margahayu', kecamatan: 'Margahayu', target: 180, terkumpul: 156, enumerator: 3 },
    { nama: 'Desa Karanganyar', kecamatan: 'Tasikmadu', target: 90, terkumpul: 12, enumerator: 1 },
];

const enumeratorReport = [
    { name: 'Ahmad Fauzi', wilayah: 'Kel. Sukamaju', target: 50, terkumpul: 48, status: 'ongoing', persen: 96 },
    { name: 'Siti Rahayu', wilayah: 'Kel. Mekarjaya', target: 60, terkumpul: 60, status: 'completed', persen: 100 },
    { name: 'Budi Santoso', wilayah: 'Desa Cibadak', target: 40, terkumpul: 15, status: 'ongoing', persen: 37 },
    { name: 'Dewi Lestari', wilayah: 'Kel. Margahayu', target: 45, terkumpul: 43, status: 'ongoing', persen: 95 },
    { name: 'Rizki Pratama', wilayah: 'Desa Karanganyar', target: 35, terkumpul: 12, status: 'cancelled', persen: 34 },
    { name: 'Putri Amalia', wilayah: 'Kel. Sukamaju', target: 45, terkumpul: 32, status: 'ongoing', persen: 71 },
];

export default function LaporanIndex() {
    const [surveyFilter, setSurveyFilter] = useState('all');

    const totalTerkumpul = wilayahProgress.reduce((s, w) => s + w.terkumpul, 0);
    const totalTarget = wilayahProgress.reduce((s, w) => s + w.target, 0);
    const overallPct = Math.round((totalTerkumpul / totalTarget) * 100);

    return (
        <>
            <Head title="Laporan" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <div className="rounded-xl bg-violet-100 dark:bg-violet-900/30 p-2">
                                <BarChart3 className="h-6 w-6 text-violet-600" />
                            </div>
                            Laporan & Analitik
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Ringkasan progres pelaksanaan survei lapangan</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={surveyFilter} onValueChange={setSurveyFilter}>
                                <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Survey</SelectItem>
                                    <SelectItem value="1">Survei Kesehatan Masyarakat 2025</SelectItem>
                                    <SelectItem value="2">Survei Ekonomi Rumah Tangga</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" /> Ekspor
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Total Responden', value: totalTerkumpul.toLocaleString('id-ID'), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', desc: `dari ${totalTarget} target` },
                        { label: 'Progress Keseluruhan', value: `${overallPct}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', desc: 'dari total target' },
                        { label: 'Wilayah Selesai', value: `${wilayahProgress.filter((w) => w.terkumpul >= w.target).length}/${wilayahProgress.length}`, icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', desc: 'wilayah' },
                        { label: 'Enumerator Aktif', value: enumeratorReport.filter((e) => e.status === 'ongoing').length, icon: CheckCircle2, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', desc: 'dari total enumerator' },
                    ].map((s) => (
                        <Card key={s.label} className="relative overflow-hidden">
                            <CardContent className="p-5">
                                <div className={`mb-3 w-fit rounded-xl p-2.5 ${s.bg}`}>
                                    <s.icon className={`h-5 w-5 ${s.color}`} />
                                </div>
                                <p className="text-3xl font-bold">{s.value}</p>
                                <p className="text-sm font-medium mt-0.5">{s.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Progress per Wilayah */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Progress per Wilayah
                        </CardTitle>
                        <CardDescription>Status pengumpulan responden di setiap wilayah penugasan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {wilayahProgress.map((w) => {
                            const pct = Math.round((w.terkumpul / w.target) * 100);
                            const isDone = pct >= 100;
                            return (
                                <div key={w.nama} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${isDone ? 'bg-emerald-500' : pct < 50 ? 'bg-red-400' : 'bg-orange-400'}`} />
                                            <span className="font-medium">{w.nama}</span>
                                            <span className="text-muted-foreground text-xs">— Kec. {w.kecamatan}</span>
                                            <Badge variant="secondary" className="text-xs">{w.enumerator} enumerator</Badge>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-muted-foreground text-xs">
                                                {w.terkumpul.toLocaleString('id-ID')} / {w.target.toLocaleString('id-ID')}
                                            </span>
                                            <span className={`font-bold text-sm min-w-[3rem] text-right ${isDone ? 'text-emerald-600' : pct < 50 ? 'text-red-500' : 'text-orange-500'}`}>
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${isDone ? 'bg-emerald-500' : pct < 50 ? 'bg-red-400' : 'bg-orange-400'}`}
                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Enumerator Performance Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Kinerja Enumerator
                        </CardTitle>
                        <CardDescription>Rekap capaian masing-masing enumerator</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Enumerator</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Wilayah</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Target</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Terkumpul</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Capaian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enumeratorReport.map((e, i) => (
                                        <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-medium">{e.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground text-xs">{e.wilayah}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={e.status === 'completed' ? 'default' : e.status === 'cancelled' ? 'destructive' : 'outline'}>
                                                    {e.status === 'completed' ? 'Selesai' : e.status === 'cancelled' ? 'Dibatalkan' : 'Berjalan'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">{e.target}</td>
                                            <td className="px-4 py-3">{e.terkumpul}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${e.persen >= 100 ? 'bg-emerald-500' : e.persen < 50 ? 'bg-red-400' : 'bg-primary'}`}
                                                            style={{ width: `${Math.min(e.persen, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-semibold ${e.persen >= 100 ? 'text-emerald-600' : e.persen < 50 ? 'text-red-500' : ''}`}>
                                                        {e.persen}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
