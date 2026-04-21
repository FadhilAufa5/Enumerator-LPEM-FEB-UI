import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
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
import { login } from '@/routes';
import { store } from '@/routes/register';
import { toast } from 'sonner';

export default function Register() {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <Head title="Daftar Akun" />

            <Form
                {...store.form()}
                id="register-form"
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                onSuccess={() =>
                    toast.success('Akun berhasil dibuat!', {
                        description: 'Selamat datang, silakan masuk ke dashboard Anda.',
                    })
                }
                onError={() =>
                    toast.error('Pendaftaran gagal.', {
                        description: 'Periksa kembali data yang Anda masukkan.',
                    })
                }
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Name */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nama lengkap Anda"
                                    className="h-10"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="email">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@contoh.com"
                                    className="h-10"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Minimal 8 karakter"
                                    className="h-10"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Confirm Password */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Ulangi password"
                                    className="h-10"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>
                        </div>

                        {/* Dialog konfirmasi sebelum register */}
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    className="mt-2 h-10 w-full font-semibold"
                                    tabIndex={5}
                                    data-test="register-user-button"
                                    disabled={processing}
                                >
                                    Buat Akun
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Konfirmasi Pendaftaran</DialogTitle>
                                    <DialogDescription className="leading-relaxed">
                                        Apakah data yang Anda masukkan sudah benar? Akun akan dibuat setelah Anda mengkonfirmasi.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2 sm:gap-2">
                                    <DialogClose asChild>
                                        <Button variant="outline" disabled={processing}>
                                            Periksa Lagi
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        form="register-form"
                                        disabled={processing}
                                        onClick={() => {
                                            setDialogOpen(false);
                                            toast.loading('Membuat akun Anda...', { duration: 3000 });
                                        }}
                                        className="gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner className="h-4 w-4" />
                                                Memproses...
                                            </>
                                        ) : (
                                            'Ya, Daftarkan'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            Sudah punya akun?{' '}
                            <TextLink href={login()} tabIndex={6} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                Masuk di sini
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Buat Akun Baru',
    description: 'Isi data di bawah untuk mendaftar sebagai enumerator',
};
