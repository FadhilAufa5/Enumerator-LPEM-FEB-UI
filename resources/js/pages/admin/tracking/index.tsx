import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import {
    Map as MapIcon,
    Search,
    Filter,
    Battery,
    BatteryFull,
    BatteryMedium,
    BatteryLow,
    Signal,
    SignalHigh,
    SignalMedium,
    SignalLow,
    WifiOff,
    Navigation,
    Clock,
    Crosshair,
    MapPin,
    AlertCircle,
    UserCircle2,
    RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ── Mock Data ──────────────────────────────────────────────
interface TrackingData {
    id: number;
    name: string;
    wilayah: string;
    status: 'moving' | 'idle' | 'offline';
    last_update: string;
    battery: number;
    signal: 'high' | 'medium' | 'low' | 'none';
    coord: { x: number; y: number }; // Percentage for CSS positioning inside map container
}

const mockTrackings: TrackingData[] = [
    { id: 1, name: 'Ahmad Fauzi',   wilayah: 'Kel. Sukamaju',   status: 'moving',  last_update: 'Baru saja', battery: 85, signal: 'high',   coord: { x: 35, y: 42 } },
    { id: 2, name: 'Siti Rahayu',   wilayah: 'Kel. Mekarjaya',  status: 'idle',    last_update: '2 mnt lalu',battery: 62, signal: 'medium', coord: { x: 65, y: 28 } },
    { id: 3, name: 'Budi Santoso',  wilayah: 'Desa Cibadak',    status: 'moving',  last_update: '1 mnt lalu',battery: 91, signal: 'high',   coord: { x: 48, y: 65 } },
    { id: 4, name: 'Dewi Lestari',  wilayah: 'Kel. Margahayu',  status: 'offline', last_update: '1 jam lalu',battery: 15, signal: 'none',   coord: { x: 75, y: 72 } },
    { id: 5, name: 'Rizki Pratama', wilayah: 'Desa Karanganyar',status: 'moving',  last_update: 'Baru saja', battery: 43, signal: 'low',    coord: { x: 22, y: 78 } },
    { id: 6, name: 'Putri Amalia',  wilayah: 'Kel. Sukamaju',   status: 'idle',    last_update: '5 mnt lalu',battery: 78, signal: 'high',   coord: { x: 40, y: 38 } },
];

// Helper icon components based on status
const BatteryIcon = ({ level }: { level: number }) => {
    if (level > 70) return <BatteryFull className="h-3.5 w-3.5 text-emerald-500" />;
    if (level > 30) return <BatteryMedium className="h-3.5 w-3.5 text-orange-500" />;
    return <BatteryLow className="h-3.5 w-3.5 text-red-500" />;
};

const SignalIcon = ({ type }: { type: TrackingData['signal'] }) => {
    if (type === 'high') return <SignalHigh className="h-3.5 w-3.5 text-blue-500" />;
    if (type === 'medium') return <SignalMedium className="h-3.5 w-3.5 text-orange-500" />;
    if (type === 'low') return <SignalLow className="h-3.5 w-3.5 text-red-500" />;
    return <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />;
};

const statusConfig = {
    moving:  { label: 'Bergerak', color: 'text-emerald-500', bg: 'bg-emerald-500', icon: Navigation },
    idle:    { label: 'Diam',     color: 'text-orange-500',  bg: 'bg-orange-500',  icon: MapPin },
    offline: { label: 'Offline',  color: 'text-slate-500',   bg: 'bg-slate-500',   icon: AlertCircle },
};

export default function TrackingIndex() {
    const [trackings, setTrackings] = useState<TrackingData[]>(mockTrackings);
    const [search, setSearch]       = useState('');
    const [filterStatus, setFilter] = useState('all');
    const [selectedId, setSelected] = useState<number | null>(null);

    // Simulate real-time movement randomly
    useEffect(() => {
        const interval = setInterval(() => {
            setTrackings((prev) =>
                prev.map((t) => {
                    if (t.status !== 'moving') return t;
                    // Jitter coordinates naturally
                    const dx = (Math.random() - 0.5) * 1.5;
                    const dy = (Math.random() - 0.5) * 1.5;
                    return {
                        ...t,
                        coord: {
                            x: Math.min(Math.max(t.coord.x + dx, 5), 95),
                            y: Math.min(Math.max(t.coord.y + dy, 5), 95),
                        },
                    };
                })
            );
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const filtered = trackings.filter((t) => {
        const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.wilayah.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filterStatus === 'all' || t.status === filterStatus;
        return matchSearch && matchFilter;
    });

    const activeCount = trackings.filter(t => t.status !== 'offline').length;

    return (
        <>
            <Head title="Pemantauan GPS" />
            <div className="flex h-full flex-col gap-4 p-4 lg:flex-row">
                
                {/* ── Left Sidebar: List Enumerator ── */}
                <div className="flex w-full flex-col gap-4 lg:w-[380px] shrink-0">
                    {/* Header */}
                    <div>
                        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-1.5">
                                <MapIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            Pemantauan GPS
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            {activeCount} dari {trackings.length} enumerator terhubung
                        </p>
                    </div>

                    <Card className="flex-1 flex flex-col overflow-hidden max-h-[calc(100vh-140px)]">
                        <div className="p-3 border-b space-y-3 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input placeholder="Cari nama / wilayah..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-xs" />
                            </div>
                            <div className="flex gap-2">
                                <Select value={filterStatus} onValueChange={setFilter}>
                                    <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="moving">Bergerak</SelectItem>
                                        <SelectItem value="idle">Sedang Diam</SelectItem>
                                        <SelectItem value="offline">Offline</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                                    <Filter className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {filtered.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Crosshair className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs">Tidak ada data ditemukan</p>
                                </div>
                            ) : filtered.map((item) => {
                                const sc = statusConfig[item.status];
                                const isSelected = selectedId === item.id;
                                
                                return (
                                    <div key={item.id}
                                        onClick={() => setSelected(isSelected ? null : item.id)}
                                        className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md
                                            ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'bg-card hover:border-primary/50'}`}>
                                        
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                <div className="relative shrink-0">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                                            {item.name.split(' ').map(n=>n[0]).join('').substring(0,2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${sc.bg}`} />
                                                    {item.status === 'moving' && (
                                                        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${sc.bg} animate-ping opacity-75`} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm truncate">{item.name}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{item.wilayah}</p>
                                                </div>
                                            </div>
                                            
                                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 border shrink-0 ${sc.color} ${item.status==='moving'?'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30':''}`}>
                                                {sc.label}
                                            </Badge>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between border-t pt-2.5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground" title={`Baterai: ${item.battery}%`}>
                                                    <BatteryIcon level={item.battery} /> {item.battery}%
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground" title="Sinyal Seluler">
                                                    <SignalIcon type={item.signal} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Clock className="h-3 w-3" /> {item.last_update}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* ── Right Side: Map Visualization ── */}
                <Card className="flex-1 relative overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950/20 shadow-inner border-2">
                    {/* Header Tools */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
                        <div className="bg-background/80 backdrop-blur pointer-events-auto shadow-sm border rounded-lg p-2 px-3 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-semibold text-foreground/80">LIVE TRACKING</span>
                        </div>
                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md pointer-events-auto">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Fake Map Canvas / Radar */}
                    <div className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center">
                        {/* CSS Map Grid Background */}
                        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
                             style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        
                        {/* Radar sweeping effect */}
                        <div className="absolute w-[80vw] h-[80vw] sm:w-[600px] sm:h-[600px] rounded-full border border-primary/10 flex items-center justify-center pointer-events-none">
                            <div className="w-[70%] h-[70%] rounded-full border border-primary/10" />
                            <div className="absolute w-[40%] h-[40%] rounded-full border border-primary/20" />
                            <div className="absolute inset-0 rounded-full" 
                                 style={{ background: 'conic-gradient(from 0deg, transparent 0 340deg, rgba(var(--primary), 0.1) 360deg)', animation: 'spin 4s linear infinite' }} />
                        </div>

                        {/* Rendering Enumerator Nodes */}
                        {filtered.map((item) => {
                            const sc = statusConfig[item.status];
                            const isSelected = selectedId === item.id;
                            const zIndex = isSelected ? 50 : (item.status === 'moving' ? 40 : 10);
                            
                            return (
                                <div key={item.id}
                                     className={`absolute transition-all duration-1000 ease-linear cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group`}
                                     style={{ 
                                         left: `${item.coord.x}%`, 
                                         top: `${item.coord.y}%`, 
                                         zIndex 
                                     }}
                                     onClick={() => setSelected(isSelected ? null : item.id)}>
                                    
                                    {/* Tooltip on Map */}
                                    <div className={`mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-background border shadow-xl rounded-lg p-2 pointer-events-none
                                        ${isSelected ? 'opacity-100 scale-100' : 'scale-95'}`}>
                                        <p className="text-xs font-bold leading-none">{item.name}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.wilayah}</p>
                                    </div>

                                    {/* Pin */}
                                    <div className={`relative flex h-10 w-10 items-center justify-center rounded-full border-[3px] shadow-lg transition-transform ${isSelected ? 'scale-110 border-primary' : 'border-background hover:scale-105'}`}>
                                        <Avatar className="h-full w-full">
                                            <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                                                {item.name.split(' ').map(n=>n[0]).join('').substring(0,2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        {/* Status Dot */}
                                        <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background ${sc.bg} flex items-center justify-center`}>
                                            {item.status === 'moving' && <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-40 animate-ping" />}
                                        </span>
                                    </div>

                                    {/* Selected Ripple effect */}
                                    {isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
                                            <div className="absolute h-24 w-24 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
                                            <div className="absolute h-16 w-16 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </>
    );
}

// Add global styles for keyframes not in tailwind preset by default
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
}
