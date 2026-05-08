import { useState, useEffect, useRef, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import {
    Map as MapIcon, Search, BatteryFull, BatteryMedium, BatteryLow,
    SignalHigh, SignalMedium, SignalLow, WifiOff, Navigation,
    Clock, Crosshair, MapPin, AlertCircle, RefreshCw,
    Users, Activity, Radio,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ── Types ──────────────────────────────────────────────────
interface TrackingData {
    id: number;
    name: string;
    wilayah: string;
    status: 'moving' | 'idle' | 'offline';
    last_update: string;
    battery: number;
    signal: 'high' | 'medium' | 'low' | 'none';
    lat: number;
    lng: number;
}

// ── Mock Data (coordinates around Jakarta) ─────────────────
const INITIAL_DATA: TrackingData[] = [
    { id: 1, name: 'Ahmad Fauzi',   wilayah: 'Kel. Sukamaju',    status: 'moving',  last_update: 'Baru saja',  battery: 85, signal: 'high',   lat: -6.2088, lng: 106.8456 },
    { id: 2, name: 'Siti Rahayu',   wilayah: 'Kel. Mekarjaya',   status: 'idle',    last_update: '2 mnt lalu', battery: 62, signal: 'medium', lat: -6.1944, lng: 106.8229 },
    { id: 3, name: 'Budi Santoso',  wilayah: 'Desa Cibadak',     status: 'moving',  last_update: '1 mnt lalu', battery: 91, signal: 'high',   lat: -6.2615, lng: 106.7811 },
    { id: 4, name: 'Dewi Lestari',  wilayah: 'Kel. Margahayu',   status: 'offline', last_update: '1 jam lalu', battery: 15, signal: 'none',   lat: -6.2297, lng: 106.9011 },
    { id: 5, name: 'Rizki Pratama', wilayah: 'Desa Karanganyar', status: 'moving',  last_update: 'Baru saja',  battery: 43, signal: 'low',    lat: -6.3004, lng: 106.8521 },
    { id: 6, name: 'Putri Amalia',  wilayah: 'Kel. Sukamaju',    status: 'idle',    last_update: '5 mnt lalu', battery: 78, signal: 'high',   lat: -6.1751, lng: 106.8650 },
];

const STATUS_CFG = {
    moving:  { label: 'Bergerak', color: '#10b981', ring: 'ring-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200' },
    idle:    { label: 'Diam',     color: '#f59e0b', ring: 'ring-amber-500',   text: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950/30',       border: 'border-amber-200'   },
    offline: { label: 'Offline',  color: '#94a3b8', ring: 'ring-slate-400',   text: 'text-slate-500',   bg: 'bg-slate-50 dark:bg-slate-900/30',       border: 'border-slate-200'   },
};

// ── Sub-components ─────────────────────────────────────────
const BatteryIcon = ({ level }: { level: number }) => {
    if (level > 70) return <BatteryFull className="h-3.5 w-3.5 text-emerald-500" />;
    if (level > 30) return <BatteryMedium className="h-3.5 w-3.5 text-orange-500" />;
    return <BatteryLow className="h-3.5 w-3.5 text-red-500" />;
};

const SignalIcon = ({ type }: { type: TrackingData['signal'] }) => {
    if (type === 'high')   return <SignalHigh   className="h-3.5 w-3.5 text-blue-500"            />;
    if (type === 'medium') return <SignalMedium className="h-3.5 w-3.5 text-orange-500"          />;
    if (type === 'low')    return <SignalLow    className="h-3.5 w-3.5 text-red-500"             />;
    return                        <WifiOff      className="h-3.5 w-3.5 text-muted-foreground"    />;
};

// ── LiveMap (loads Leaflet lazily, avoids SSR issues) ──────
function LiveMap({
    trackings,
    trails,
    selectedId,
    onSelect,
}: {
    trackings: TrackingData[];
    trails: Record<number, [number, number][]>;
    selectedId: number | null;
    onSelect: (id: number) => void;
}) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null);
    const markersRef = useRef<Map<number, any>>(new Map());
    const polylinesRef = useRef<Map<number, any>>(new Map());

    // Boot Leaflet once
    useEffect(() => {
        if (!mapRef.current || leafletMap.current) return;

        let L: typeof import('leaflet');

        (async () => {
            L = await import('leaflet');
            await import('leaflet/dist/leaflet.css');

            const map = L.map(mapRef.current!, {
                center: [-6.2300, 106.8300],
                zoom: 12,
                zoomControl: false,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            leafletMap.current = map;

            // Initial markers
            trackings.forEach((t) => {
                const marker = L.marker([t.lat, t.lng], {
                    icon: makeIcon(L, t),
                }).addTo(map);

                marker.on('click', () => onSelect(t.id));
                markersRef.current.set(t.id, marker);
            });
        })();

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
    }, []); // eslint-disable-line

    // Update marker positions
    useEffect(() => {
        if (!leafletMap.current) return;
        (async () => {
            const L = await import('leaflet');
            trackings.forEach((t) => {
                const marker = markersRef.current.get(t.id);
                if (marker) {
                    marker.setLatLng([t.lat, t.lng]);
                    marker.setIcon(makeIcon(L, t, selectedId === t.id));
                }
            });
        })();
    }, [trackings, selectedId]);

    // Draw trails
    useEffect(() => {
        if (!leafletMap.current) return;
        (async () => {
            const L = await import('leaflet');
            Object.entries(trails).forEach(([idStr, pts]) => {
                const id = Number(idStr);
                const existing = polylinesRef.current.get(id);
                if (existing) existing.remove();

                if (pts.length < 2) return;
                const track = trackings.find((t) => t.id === id);
                if (!track || track.status === 'offline') return;

                const line = L.polyline(pts, {
                    color: STATUS_CFG[track.status].color,
                    weight: 2.5,
                    opacity: 0.6,
                    dashArray: track.status === 'idle' ? '5,5' : undefined,
                    smoothFactor: 1.5,
                }).addTo(leafletMap.current!);

                polylinesRef.current.set(id, line);
            });
        })();
    }, [trails, trackings]);

    // FlyTo selected
    useEffect(() => {
        if (!leafletMap.current || selectedId === null) return;
        const t = trackings.find((x) => x.id === selectedId);
        if (t) leafletMap.current.flyTo([t.lat, t.lng], 15, { duration: 1.2 });
    }, [selectedId]); // eslint-disable-line

    return <div ref={mapRef} className="h-full w-full z-0" />;
}

function makeIcon(L: typeof import('leaflet'), t: TrackingData, selected = false) {
    const color = STATUS_CFG[t.status].color;
    const initials = t.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    const pulse = t.status === 'moving' ? `
        <span style="position:absolute;inset:-4px;border-radius:50%;background:${color};opacity:0.25;animation:trackPulse 1.8s ease-out infinite;"></span>` : '';

    const html = `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
            ${pulse}
            <div style="
                width:${selected ? 46 : 38}px;
                height:${selected ? 46 : 38}px;
                border-radius:50%;
                background:white;
                border:3px solid ${color};
                display:flex;align-items:center;justify-content:center;
                font-size:11px;font-weight:700;color:${color};
                box-shadow:0 2px 12px rgba(0,0,0,0.2);
                transition:all 0.3s;
                ${selected ? `box-shadow:0 0 0 4px ${color}40,0 4px 16px rgba(0,0,0,0.3)` : ''}
            ">${initials}</div>
            <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid ${color};margin-top:-1px;"></div>
        </div>`;

    return L.divIcon({
        html,
        className: '',
        iconSize: [selected ? 60 : 50, selected ? 70 : 60],
        iconAnchor: [selected ? 30 : 25, selected ? 70 : 60],
        popupAnchor: [0, -60],
    });
}

// ── Main Page ──────────────────────────────────────────────
export default function TrackingIndex() {
    const [trackings, setTrackings] = useState<TrackingData[]>(INITIAL_DATA);
    const [trails, setTrails]       = useState<Record<number, [number, number][]>>(() =>
        Object.fromEntries(INITIAL_DATA.map((t) => [t.id, [[t.lat, t.lng]]]))
    );
    const [search, setSearch]       = useState('');
    const [filterStatus, setFilter] = useState('all');
    const [selectedId, setSelected] = useState<number | null>(null);
    const [tick, setTick]           = useState(0);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const handleSelect = useCallback((id: number) => {
        setSelected((prev) => (prev === id ? null : id));
    }, []);

    // ── Simulate Real-time Movement ──────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            setTrackings((prev) =>
                prev.map((t) => {
                    if (t.status !== 'moving') return t;
                    // Move ~20-80m in a random direction
                    const dlat = (Math.random() - 0.5) * 0.0008;
                    const dlng = (Math.random() - 0.5) * 0.0008;
                    return {
                        ...t,
                        lat: t.lat + dlat,
                        lng: t.lng + dlng,
                        last_update: 'Baru saja',
                    };
                })
            );
            setTick((n) => n + 1);
            setLastRefresh(new Date());
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // ── Accumulate trail points ────────────────────────────
    useEffect(() => {
        if (tick === 0) return;
        setTrails((prev) => {
            const next = { ...prev };
            trackings.forEach((t) => {
                if (t.status !== 'moving') return;
                const history = prev[t.id] ?? [];
                const updated = [...history, [t.lat, t.lng] as [number, number]];
                next[t.id] = updated.slice(-30); // Keep last 30 points
            });
            return next;
        });
    }, [tick]); // eslint-disable-line

    const filtered = trackings.filter((t) => {
        const ms = t.name.toLowerCase().includes(search.toLowerCase()) ||
                   t.wilayah.toLowerCase().includes(search.toLowerCase());
        const mf = filterStatus === 'all' || t.status === filterStatus;
        return ms && mf;
    });

    const stats = {
        total:   trackings.length,
        moving:  trackings.filter((t) => t.status === 'moving').length,
        idle:    trackings.filter((t) => t.status === 'idle').length,
        offline: trackings.filter((t) => t.status === 'offline').length,
    };

    return (
        <>
            {/* Inject keyframe for pulse animation */}
            <style>{`
                @keyframes trackPulse {
                    0%   { transform: scale(1);   opacity: 0.5; }
                    100% { transform: scale(2.8); opacity: 0; }
                }
                .leaflet-container { font-family: inherit; }
            `}</style>

            <Head title="Live Tracking GPS" />
            <div className="flex h-[calc(100vh-4rem)] flex-col gap-0 overflow-hidden">

                {/* ── Top Bar ── */}
                <div className="flex items-center justify-between gap-4 px-4 py-2 border-b bg-background shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-1.5">
                            <MapIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold leading-none">Live Tracking GPS</h1>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                Update terakhir: {lastRefresh.toLocaleTimeString('id-ID')}
                            </p>
                        </div>
                    </div>

                    {/* Stat chips */}
                    <div className="hidden sm:flex items-center gap-2">
                        {[
                            { label: 'Total', value: stats.total,   icon: Users,    cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
                            { label: 'Bergerak', value: stats.moving, icon: Navigation, cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
                            { label: 'Diam',    value: stats.idle,   icon: MapPin,   cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
                            { label: 'Offline', value: stats.offline,icon: AlertCircle, cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400' },
                        ].map((s) => (
                            <div key={s.label} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
                                <s.icon className="h-3 w-3" />
                                {s.value} {s.label}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Live indicator */}
                        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">LIVE</span>
                        </div>
                    </div>
                </div>

                {/* ── Body: Sidebar + Map ── */}
                <div className="flex flex-1 overflow-hidden">

                    {/* ── Left Sidebar ── */}
                    <div className="flex w-[320px] shrink-0 flex-col border-r bg-background overflow-hidden">
                        {/* Filters */}
                        <div className="p-3 border-b space-y-2 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama / wilayah..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8 h-8 text-xs"
                                />
                            </div>
                            <Select value={filterStatus} onValueChange={setFilter}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="moving">Bergerak</SelectItem>
                                    <SelectItem value="idle">Sedang Diam</SelectItem>
                                    <SelectItem value="offline">Offline</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Enumerator list */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                            {filtered.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <Crosshair className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs">Tidak ada data</p>
                                </div>
                            ) : filtered.map((item) => {
                                const sc = STATUS_CFG[item.status];
                                const isSelected = selectedId === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSelect(item.id)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md
                                            ${isSelected
                                                ? `border-primary bg-primary/5 ring-1 ring-primary/30 shadow-md`
                                                : `bg-card hover:border-primary/40`
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            {/* Avatar with pulse */}
                                            <div className="relative shrink-0">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                                        {item.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {/* Status dot */}
                                                <span
                                                    className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background"
                                                    style={{ background: sc.color }}
                                                />
                                                {item.status === 'moving' && (
                                                    <span
                                                        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full animate-ping"
                                                        style={{ background: sc.color, opacity: 0.6 }}
                                                    />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <p className="font-semibold text-sm truncate leading-none">{item.name}</p>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${sc.bg} ${sc.text}`}>
                                                        {sc.label}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.wilayah}</p>
                                            </div>
                                        </div>

                                        {/* Details row */}
                                        <div className="mt-2.5 flex items-center justify-between border-t pt-2">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <BatteryIcon level={item.battery} /> {item.battery}%
                                                </span>
                                                <SignalIcon type={item.signal} />
                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <Radio className="h-3 w-3" />
                                                    {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                                                </span>
                                            </div>
                                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Clock className="h-3 w-3" /> {item.last_update}
                                            </span>
                                        </div>

                                        {/* Trail info for moving */}
                                        {item.status === 'moving' && (
                                            <div className="mt-1.5 flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400">
                                                <Activity className="h-2.5 w-2.5 animate-pulse" />
                                                <span>{(trails[item.id]?.length ?? 0)} titik jalur terekam</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Map Area ── */}
                    <div className="flex-1 relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <LiveMap
                            trackings={filtered}
                            trails={trails}
                            selectedId={selectedId}
                            onSelect={handleSelect}
                        />

                        {/* Selected Enumerator Info Overlay */}
                        {selectedId !== null && (() => {
                            const sel = trackings.find((t) => t.id === selectedId);
                            if (!sel) return null;
                            const sc = STATUS_CFG[sel.status];
                            return (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                                    <Card className="shadow-2xl border-2 pointer-events-auto min-w-[280px]">
                                        <CardContent className="p-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 shrink-0">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                        {sel.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-sm">{sel.name}</p>
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                                                            {sc.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{sel.wilayah}</p>
                                                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                                        {sel.lat.toFixed(6)}, {sel.lng.toFixed(6)}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <span className="flex items-center gap-1 text-[10px]">
                                                        <BatteryIcon level={sel.battery} /> {sel.battery}%
                                                    </span>
                                                    <SignalIcon type={sel.signal} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </>
    );
}
