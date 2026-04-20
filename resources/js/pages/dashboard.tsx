import { Head } from '@inertiajs/react';
import {
    Users,
    MapPin,
    ClipboardList,
    TrendingUp,
    Activity,
    CheckCircle2,
    Clock,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Target,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { BreadcrumbItem, DashboardStats } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const mockStats: DashboardStats = {
    total_enumerator: 124,
    enumerator_aktif: 98,
    total_wilayah: 48,
    total_survey: 12,
    total_assignment: 342,
    assignment_ongoing: 87,
    total_responden: 4821,
    progress_percentage: 67,
    monthly_data: [
        { month: 'Jan', target: 800, collected: 650 },
        { month: 'Feb', target: 800, collected: 720 },
        { month: 'Mar', target: 900, collected: 850 },
        { month: 'Apr', target: 900, collected: 600 },
        { month: 'Mei', target: 1000, collected: 920 },
        { month: 'Jun', target: 1000, collected: 880 },
    ],
    recent_activities: [
        { id: 1, type: 'assignment', message: 'Ahmad Fauzi menyelesaikan survei di Kelurahan Sukamaju', created_at: '5 menit lalu' },
        { id: 2, type: 'enumerator', message: 'Siti Rahayu bergabung sebagai enumerator baru', created_at: '1 jam lalu' },
        { id: 3, type: 'survey', message: 'Survei Kesehatan Masyarakat 2025 dimulai', created_at: '2 jam lalu' },
        { id: 4, type: 'assignment', message: 'Budi Santoso ditugaskan ke Kecamatan Ciawi', created_at: '3 jam lalu' },
        { id: 5, type: 'assignment', message: 'Dewi Lestari menyelesaikan 45 responden', created_at: '5 jam lalu' },
    ],
    top_enumerators: [
        { id: 1, name: 'Ahmad Fauzi', completed: 142, percentage: 94 },
        { id: 2, name: 'Siti Rahayu', completed: 136, percentage: 91 },
        { id: 3, name: 'Budi Santoso', completed: 128, percentage: 85 },
        { id: 4, name: 'Dewi Lestari', completed: 119, percentage: 79 },
        { id: 5, name: 'Rizki Pratama', completed: 108, percentage: 72 },
    ],
};

interface StatCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    trend?: 'up' | 'down';
    trendValue?: string;
    color: string;
    bgColor: string;
}

function StatCard({ title, value, description, icon: Icon, trend, trendValue, color, bgColor }: StatCardProps) {
    return (
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={`rounded-xl p-2.5 ${bgColor}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <div className="mt-1 flex items-center gap-1.5">
                    {trend && trendValue && (
                        <span className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {trendValue}
                        </span>
                    )}
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </CardContent>
            <div className={`absolute -right-4 -bottom-4 h-20 w-20 rounded-full opacity-10 ${bgColor}`} />
        </Card>
    );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
    const percentage = Math.round((value / max) * 100);
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span>{value} terkumpul</span>
                <span className="text-muted-foreground">{max} target</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    );
}

function SimpleBarChart({ data }: { data: { month: string; target: number; collected: number }[] }) {
    const maxValue = Math.max(...data.map((d) => d.target));
    return (
        <div className="flex items-end gap-2 h-40 w-full mt-4">
            {data.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex flex-col items-center gap-0.5 w-full justify-end" style={{ height: '128px' }}>
                        <div className="relative w-full flex gap-0.5 items-end justify-center h-full">
                            <div
                                className="flex-1 bg-primary/20 rounded-t-sm transition-all duration-700"
                                style={{ height: `${(item.target / maxValue) * 100}%` }}
                                title={`Target: ${item.target}`}
                            />
                            <div
                                className="flex-1 bg-primary rounded-t-sm transition-all duration-700"
                                style={{ height: `${(item.collected / maxValue) * 100}%` }}
                                title={`Terkumpul: ${item.collected}`}
                            />
                        </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
            ))}
        </div>
    );
}

export default function Dashboard() {
    const stats = mockStats;

    const activityIcons: Record<string, { icon: React.ElementType; color: string }> = {
        assignment: { icon: ClipboardList, color: 'text-blue-500' },
        enumerator: { icon: Users, color: 'text-emerald-500' },
        survey: { icon: BarChart3, color: 'text-purple-500' },
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Selamat datang di Sistem Manajemen Enumerator
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                        <Calendar className="h-4 w-4" />
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Enumerator"
                        value={stats.total_enumerator}
                        description={`${stats.enumerator_aktif} aktif saat ini`}
                        icon={Users}
                        trend="up"
                        trendValue="+12%"
                        color="text-blue-600"
                        bgColor="bg-blue-100 dark:bg-blue-900/30"
                    />
                    <StatCard
                        title="Total Wilayah"
                        value={stats.total_wilayah}
                        description="Wilayah penugasan"
                        icon={MapPin}
                        trend="up"
                        trendValue="+3"
                        color="text-emerald-600"
                        bgColor="bg-emerald-100 dark:bg-emerald-900/30"
                    />
                    <StatCard
                        title="Survey Aktif"
                        value={stats.total_survey}
                        description={`${stats.assignment_ongoing} penugasan berjalan`}
                        icon={ClipboardList}
                        color="text-purple-600"
                        bgColor="bg-purple-100 dark:bg-purple-900/30"
                    />
                    <StatCard
                        title="Total Responden"
                        value={stats.total_responden.toLocaleString('id-ID')}
                        description="Data terkumpul"
                        icon={TrendingUp}
                        trend="up"
                        trendValue="+8%"
                        color="text-orange-600"
                        bgColor="bg-orange-100 dark:bg-orange-900/30"
                    />
                </div>

                {/* Progress Overview */}
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Progress Keseluruhan</CardTitle>
                                <CardDescription>Capaian pengumpulan data bulan ini</CardDescription>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-primary">{stats.progress_percentage}%</span>
                                <p className="text-xs text-muted-foreground">dari target</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000"
                                    style={{ width: `${stats.progress_percentage}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{stats.total_responden.toLocaleString('id-ID')} responden terkumpul</span>
                                <span>{Math.round(stats.total_responden / (stats.progress_percentage / 100)).toLocaleString('id-ID')} target total</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Charts & Tables Row */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Monthly Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Grafik Pengumpulan Data</CardTitle>
                                    <CardDescription>Target vs Terkumpul per bulan</CardDescription>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded-sm bg-primary/20" />
                                        <span className="text-muted-foreground">Target</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded-sm bg-primary" />
                                        <span className="text-muted-foreground">Terkumpul</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <SimpleBarChart data={stats.monthly_data} />
                        </CardContent>
                    </Card>

                    {/* Recent Activities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Aktivitas Terbaru
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {stats.recent_activities.map((activity) => {
                                const actIcon = activityIcons[activity.type] || activityIcons.assignment;
                                const ActivityIcon = actIcon.icon;
                                return (
                                    <div key={activity.id} className="flex gap-3 group">
                                        <div className={`mt-0.5 shrink-0 rounded-full p-1.5 bg-muted ${actIcon.color}`}>
                                            <ActivityIcon className="h-3 w-3" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                                                {activity.message}
                                            </p>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                {activity.created_at}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Top Enumerators */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Top Enumerator Bulan Ini
                            </CardTitle>
                            <CardDescription>Berdasarkan jumlah responden terkumpul</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {stats.top_enumerators.map((enumerator, index) => (
                                <div key={enumerator.id} className="flex items-center gap-3">
                                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold
                                        ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                          index === 1 ? 'bg-slate-100 text-slate-600' :
                                          index === 2 ? 'bg-orange-100 text-orange-700' :
                                          'bg-muted text-muted-foreground'}`}>
                                        {index + 1}
                                    </div>
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                            {enumerator.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">{enumerator.name}</p>
                                        <ProgressBar
                                            value={enumerator.completed}
                                            max={150}
                                            color={index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : 'bg-primary'}
                                        />
                                    </div>
                                    <Badge variant={enumerator.percentage >= 90 ? 'default' : 'secondary'} className="shrink-0">
                                        {enumerator.percentage}%
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quick Stats Grid */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Ringkasan Status
                            </CardTitle>
                            <CardDescription>Status penugasan saat ini</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Selesai', value: 198, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                    { label: 'Berjalan', value: 87, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                                    { label: 'Menunggu', value: 43, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                                    { label: 'Dibatalkan', value: 14, icon: ArrowDownRight, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
                                ].map((item) => (
                                    <div key={item.label} className={`rounded-xl p-4 ${item.bg} transition-all duration-200 hover:scale-105`}>
                                        <item.icon className={`h-5 w-5 ${item.color} mb-2`} />
                                        <p className="text-2xl font-bold">{item.value}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
