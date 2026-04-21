import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { toast } from 'sonner';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({ status, canResetPassword, canRegister }: Props) {
    const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
    const [redirectingGoogle, setRedirectingGoogle] = useState(false);

    const handleGoogleLogin = () => {
        setRedirectingGoogle(true);
        const toastId = toast.loading('Mengarahkan ke Google...', {
            description: 'Mohon tunggu, Anda akan dialihkan secara aman.',
        });
        setTimeout(() => {
            toast.dismiss(toastId);
            window.location.href = '/auth/google';
        }, 800);
    };

    return (
        <>
            <Head title="Log in" />

            {/* Status message (e.g. after logout) */}
            {status && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-center text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                id="login-form"
                resetOnSuccess={['password']}
                onSuccess={() =>
                    toast.success('Login berhasil!', {
                        description: 'Selamat datang kembali.',
                    })
                }
                onError={() =>
                    toast.error('Login gagal.', {
                        description: 'Periksa kembali email dan password Anda.',
                    })
                }
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Email */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="email">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@contoh.com"
                                    className="h-10"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                            tabIndex={5}
                                        >
                                            Lupa password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="h-10"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2.5">
                                <Checkbox id="remember" name="remember" tabIndex={3} />
                                <Label htmlFor="remember" className="cursor-pointer font-normal text-slate-600 dark:text-slate-400">
                                    Ingat saya
                                </Label>
                            </div>

                            {/* Submit button — langsung submit, toast muncul via onSuccess/onError */}
                            <Button
                                type="submit"
                                className="mt-2 h-10 w-full font-semibold tracking-wide"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Masuk...
                                    </>
                                ) : (
                                    'Masuk'
                                )}
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                <span className="bg-white px-3 text-slate-400 dark:bg-slate-900">
                                    atau lanjutkan dengan
                                </span>
                            </div>
                        </div>

                        {/* Google SSO — dengan Dialog konfirmasi */}
                        <Dialog open={googleDialogOpen} onOpenChange={setGoogleDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="h-10 w-full gap-2 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                >
                                    {/* Google Icon (full-color via brand colors) */}
                                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    Masuk dengan Google
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-lg">
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                        </svg>
                                        Masuk dengan Google
                                    </DialogTitle>
                                    <DialogDescription className="pt-1 leading-relaxed">
                                        Anda akan dialihkan ke halaman autentikasi Google secara aman. Akun akan dibuat otomatis jika belum terdaftar. Lanjutkan?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="mt-2 gap-2 sm:gap-2">
                                    <DialogClose asChild>
                                        <Button variant="outline" disabled={redirectingGoogle}>
                                            Batal
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        disabled={redirectingGoogle}
                                        className="gap-2"
                                    >
                                        {redirectingGoogle ? (
                                            <>
                                                <Spinner className="h-4 w-4" />
                                                Mengalihkan...
                                            </>
                                        ) : (
                                            'Ya, Lanjutkan'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {canRegister && (
                            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                                Belum punya akun?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={6}
                                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                >
                                    Daftar sekarang
                                </TextLink>
                            </p>
                        )}
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke akun Anda',
    description: 'Masukkan email dan password untuk mengakses dashboard',
};
