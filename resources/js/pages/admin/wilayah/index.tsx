import { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    MapPin,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Pencil,
    Trash2,
    Building2,
    Map,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Wilayah } from '@/types';
import WilayahFormModal from './form-modal';
import DeleteConfirmDialog from '@/components/admin/delete-confirm-dialog';

const mockWilayah: Wilayah[] = [
    { id: 1, kode: 'WLY-001', nama: 'Kelurahan Sukamaju', provinsi: 'Jawa Barat', kabupaten: 'Bogor', kecamatan: 'Ciawi', kelurahan: 'Sukamaju', target_responden: 150, luas_wilayah: 12.5, keterangan: 'Zona urban padat penduduk', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 2, kode: 'WLY-002', nama: 'Kelurahan Mekarjaya', provinsi: 'Jawa Barat', kabupaten: 'Bogor', kecamatan: 'Dramaga', kelurahan: 'Mekarjaya', target_responden: 200, luas_wilayah: 18.2, keterangan: 'Zona semi-urban', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 3, kode: 'WLY-003', nama: 'Desa Cibadak', provinsi: 'Jawa Barat', kabupaten: 'Sukabumi', kecamatan: 'Cibadak', kelurahan: 'Cibadak', target_responden: 120, luas_wilayah: 25.8, keterangan: 'Zona rural', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 4, kode: 'WLY-004', nama: 'Kelurahan Margahayu', provinsi: 'Jawa Barat', kabupaten: 'Bandung', kecamatan: 'Margahayu', kelurahan: 'Margahayu', target_responden: 180, luas_wilayah: 9.1, keterangan: 'Zona suburban', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 5, kode: 'WLY-005', nama: 'Desa Karanganyar', provinsi: 'Jawa Tengah', kabupaten: 'Karanganyar', kecamatan: 'Tasikmadu', kelurahan: 'Karanganyar', target_responden: 90, luas_wilayah: 32.4, keterangan: 'Zona pedesaan', created_at: '2024-01-01', updated_at: '2024-01-01' },
];

export default function WilayahIndex() {
    const [items, setItems] = useState<Wilayah[]>(mockWilayah);
    const [search, setSearch] = useState('');
    const [provinsiFilter, setProvinsiFilter] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Wilayah | null>(null);
    const [deletingItem, setDeletingItem] = useState<Wilayah | null>(null);

    const provinsiList = [...new Set(items.map((w) => w.provinsi))];

    const filtered = items.filter((w) => {
        const matchSearch =
            w.nama.toLowerCase().includes(search.toLowerCase()) ||
            w.kode.toLowerCase().includes(search.toLowerCase()) ||
            w.kabupaten.toLowerCase().includes(search.toLowerCase());
        const matchProvinsi = provinsiFilter === 'all' || w.provinsi === provinsiFilter;
        return matchSearch && matchProvinsi;
    });

    const totalTarget = items.reduce((sum, w) => sum + w.target_responden, 0);

    const handleSave = (data: Partial<Wilayah>) => {
        if (editingItem) {
            setItems((prev) => prev.map((w) => (w.id === editingItem.id ? { ...w, ...data } : w)));
        } else {
            setItems((prev) => [...prev, { ...data, id: Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Wilayah]);
        }
        setIsFormOpen(false);
        setEditingItem(null);
    };

    return (
        <>
            <Head title="Manajemen Wilayah" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900/30 p-2">
                                <MapPin className="h-6 w-6 text-emerald-600" />
                            </div>
                            Manajemen Wilayah
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Kelola wilayah penugasan enumerator</p>
                    </div>
                    <Button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" /> Tambah Wilayah
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Total Wilayah', value: items.length, icon: Map, bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: 'text-emerald-600' },
                        { label: 'Total Target', value: totalTarget.toLocaleString('id-ID'), icon: Building2, bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-600' },
                        { label: 'Provinsi', value: provinsiList.length, icon: MapPin, bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-600' },
                        { label: 'Kabupaten', value: [...new Set(items.map((w) => w.kabupaten))].length, icon: Building2, bg: 'bg-orange-50 dark:bg-orange-900/20', color: 'text-orange-600' },
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

                {/* Filters */}
                <Card>
                    <CardContent className="p-4 flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama, kode, atau kabupaten..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                            <Select value={provinsiFilter} onValueChange={setProvinsiFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter Provinsi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Provinsi</SelectItem>
                                    {provinsiList.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Grid Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((wilayah) => (
                        <Card key={wilayah.id} className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2">
                                            <MapPin className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm">{wilayah.nama}</CardTitle>
                                            <CardDescription className="text-xs font-mono">{wilayah.kode}</CardDescription>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="gap-2" onClick={() => { setEditingItem(wilayah); setIsFormOpen(true); }}>
                                                <Pencil className="h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => setDeletingItem(wilayah)}>
                                                <Trash2 className="h-4 w-4" /> Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap gap-1">
                                    <Badge variant="outline" className="text-xs">{wilayah.provinsi}</Badge>
                                    <Badge variant="secondary" className="text-xs">{wilayah.kabupaten}</Badge>
                                    <Badge variant="secondary" className="text-xs">{wilayah.kecamatan}</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="rounded-lg bg-muted/50 p-2">
                                        <p className="text-muted-foreground">Target Responden</p>
                                        <p className="font-semibold text-sm">{wilayah.target_responden.toLocaleString('id-ID')}</p>
                                    </div>
                                    {wilayah.luas_wilayah && (
                                        <div className="rounded-lg bg-muted/50 p-2">
                                            <p className="text-muted-foreground">Luas Wilayah</p>
                                            <p className="font-semibold text-sm">{wilayah.luas_wilayah} km²</p>
                                        </div>
                                    )}
                                </div>
                                {wilayah.keterangan && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 italic">{wilayah.keterangan}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <MapPin className="h-12 w-12 opacity-20 mb-3" />
                        <p>Tidak ada wilayah yang ditemukan</p>
                    </div>
                )}
            </div>

            <WilayahFormModal
                open={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
                onSave={handleSave}
                initialData={editingItem}
            />
            <DeleteConfirmDialog
                open={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                onConfirm={() => { setItems((prev) => prev.filter((w) => w.id !== deletingItem?.id)); setDeletingItem(null); }}
                title="Hapus Wilayah"
                description={`Hapus wilayah "${deletingItem?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </>
    );
}
