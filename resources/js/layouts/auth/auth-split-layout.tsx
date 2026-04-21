import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 lg:p-0">
            <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
                <div className="relative hidden w-full lg:block">
                    <img
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                        alt="Background"
                        className="absolute inset-0 h-full w-full object-cover shadow-2xl dark:brightness-[0.3]"
                    />
                    <div className="absolute inset-0 bg-blue-600/20 mix-blend-multiply" />
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-b from-transparent to-blue-900/90" />
                    
                    <Link
                        href={home()}
                        className="absolute left-8 top-8 z-20 flex items-center text-lg font-bold tracking-tight text-white drop-shadow-md"
                    >
                        <AppLogoIcon className="mr-2 size-8 text-white drop-shadow-md" />
                        {name}
                    </Link>

                    <div className="absolute bottom-12 left-12 z-20 max-w-xl text-white">
                        <h2 className="mb-2 text-3xl font-medium tracking-tight">Welcome to {name}</h2>
                        <p className="text-lg font-light text-slate-200">
                            Centralized system for managing enumerators and streamlining field data collection.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 lg:bg-slate-50 dark:lg:bg-slate-950 lg:p-8">
                    <Link
                        href={home()}
                        className="mb-8 flex items-center justify-center space-x-2 text-xl font-bold tracking-tight lg:hidden dark:text-white"
                    >
                        <AppLogoIcon className="size-8" />
                        <span>{name}</span>
                    </Link>

                    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5 sm:w-[420px] dark:bg-slate-900 dark:ring-slate-800">
                        <div className="mb-8 flex flex-col items-center text-center">
                            <h1 className="text-2xl font-semibold tracking-tight dark:text-white">{title}</h1>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
