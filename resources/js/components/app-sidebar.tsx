import { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    MapPin,
    ClipboardList,
    ClipboardCheck,
    Briefcase,
    BarChart3,
    FolderGit2,
    BookOpen,
    Activity,
    ChevronDown,
    Database,
    ShieldCheck,
    UserCog,
    Navigation,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

// ── Group: Umum ────────────────────────────────────────────
const generalNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
];

// ── Group: Manajemen Data (collapsible children) ───────────
const dataNavItems: NavItem[] = [
    { title: 'Enumerator',     href: '/admin/enumerator',  icon: Users },
    { title: 'Wilayah',        href: '/admin/wilayah',     icon: MapPin },
    { title: 'Survey',         href: '/admin/survey',      icon: ClipboardList },
    { title: 'Penugasan',      href: '/admin/assignment',  icon: Briefcase },
    { title: 'Pemantauan GPS', href: '/admin/tracking',    icon: Navigation },
];

// ── Group: Analitik ────────────────────────────────────────
const analyticsNavItems: NavItem[] = [
    { title: 'Penilaian',  href: '/admin/penilaian', icon: ClipboardCheck },
    { title: 'Laporan',    href: '/admin/laporan',   icon: BarChart3 },
];

// ── Group: Administrasi ────────────────────────────────────
const administrasiNavItems: NavItem[] = [
    { title: 'Manajemen User',      href: '/admin/users', icon: UserCog      },
    { title: 'Role & Permissions',  href: '/admin/roles', icon: ShieldCheck  },
];

// ── Footer ─────────────────────────────────────────────────
const footerNavItems: NavItem[] = [
    { title: 'Repository',    href: 'https://github.com/laravel/react-starter-kit', icon: FolderGit2 },
    { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits#react',  icon: BookOpen   },
];

// ── Collapsible "Manajemen Data" group ─────────────────────
function NavDataManagement({ items }: { items: NavItem[] }) {
    const { isCurrentOrParentUrl, isCurrentUrl } = useCurrentUrl();

    // Otomatis buka jika salah satu child sedang aktif
    const anyChildActive = items.some((item) => isCurrentOrParentUrl(item.href));
    const [open, setOpen] = useState(anyChildActive);

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Manajemen Data</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible w-full">

                            {/* ── Trigger – mirip combobox ── */}
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                    tooltip="Manajemen Data"
                                    isActive={anyChildActive}
                                    className="w-full justify-between gap-2 pr-2"
                                >
                                    <span className="flex items-center gap-2">
                                        <Database className="h-4 w-4 shrink-0" />
                                        <span>Manajemen Data</span>
                                    </span>

                                    <span className="flex items-center gap-1.5 ml-auto">
                                        {/* Badge jumlah item */}
                                        <span className={`
                                            flex h-5 min-w-5 items-center justify-center rounded-full
                                            px-1.5 text-[10px] font-semibold tabular-nums leading-none
                                            transition-colors duration-200
                                            ${anyChildActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground group-hover/collapsible:bg-accent'}
                                        `}>
                                            {items.length}
                                        </span>

                                        {/* Chevron berotasi */}
                                        <ChevronDown
                                            className={`
                                                h-3.5 w-3.5 shrink-0 text-muted-foreground
                                                transition-transform duration-300 ease-in-out
                                                ${open ? 'rotate-180' : 'rotate-0'}
                                            `}
                                        />
                                    </span>
                                </SidebarMenuButton>
                            </CollapsibleTrigger>

                            {/* ── Dropdown children ── */}
                            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                <SidebarMenuSub className="mt-1 border-l border-sidebar-border ml-3.5">
                                    {items.map((item) => {
                                        const active = isCurrentOrParentUrl(item.href);
                                        return (
                                            <SidebarMenuSubItem key={item.title}>
                                                <SidebarMenuSubButton asChild isActive={active}>
                                                    <Link href={item.href} prefetch>
                                                        <span className={`
                                                            flex h-5 w-5 shrink-0 items-center justify-center
                                                            rounded-md transition-colors duration-150
                                                            ${active
                                                                ? 'bg-primary/15 text-primary'
                                                                : 'text-muted-foreground group-hover/subitem:text-foreground'}
                                                        `}>
                                                            {item.icon && <item.icon className="h-3.5 w-3.5" />}
                                                        </span>
                                                        <span className="flex-1">{item.title}</span>

                                                        {/* Dot aktif */}
                                                        {active && (
                                                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                                        )}
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        );
                                    })}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </Collapsible>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

// ── Simple group (non-collapsible) ─────────────────────────
function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={isCurrentOrParentUrl(item.href)}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

// ── Sidebar utama ──────────────────────────────────────────
export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* ── Branding ── */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <div className="flex aspect-square h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                    <Activity className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-bold text-sm">EnumApp</span>
                                    <span className="text-xs text-muted-foreground">Sistem Enumerator</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ── Navigasi ── */}
            <SidebarContent>
                {/* Umum */}
                <NavGroup label="Umum" items={generalNavItems} />

                {/* Manajemen Data – collapsible combobox style */}
                <NavDataManagement items={dataNavItems} />

                {/* Analitik */}
                <NavGroup label="Analitik" items={analyticsNavItems} />

                {/* Administrasi */}
                <NavGroup label="Administrasi" items={administrasiNavItems} />
            </SidebarContent>

            {/* ── Footer ── */}
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
