import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
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
import { update } from '@/routes/password';
import { toast } from 'sonner';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <Head title="Reset Password" />

            <Form
                {...update.form()}
                id="reset-password-form"
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                onSuccess={() =>
                    toast.success('Password berhasil direset!', {
                        description: 'Silakan masuk dengan password baru Anda.',
                    })
                }
                onError={() =>
                    toast.error('Reset password gagal.', {
                        description: 'Pastikan password memenuhi syarat keamanan.',
                    })
                }
            >
                {({ processing, errors }) => (
                    <div className="grid gap-5">
                        {/* Email (readonly) */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                readOnly
                                className="h-10 bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            />
                            <InputError message={errors.email} />
                        </div>

                        {/* New Password */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="password">Password Baru</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                autoFocus
                                placeholder="Minimal 8 karakter"
                                className="h-10"
                            />
                            <InputError message={errors.password} />
                        </div>

                        {/* Confirm Password */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                placeholder="Ulangi password baru"
                                className="h-10"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        {/* Dialog konfirmasi sebelum reset */}
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    className="mt-2 h-10 w-full font-semibold"
                                    disabled={processing}
                                    data-test="reset-password-button"
                                >
                                    Reset Password
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Konfirmasi Reset Password</DialogTitle>
                                    <DialogDescription className="leading-relaxed">
                                        Password Anda akan diubah secara permanen. Pastikan Anda sudah mengingat password baru sebelum melanjutkan.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2 sm:gap-2">
                                    <DialogClose asChild>
                                        <Button variant="outline" disabled={processing}>
                                            Batal
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        form="reset-password-form"
                                        disabled={processing}
                                        onClick={() => {
                                            setDialogOpen(false);
                                            toast.loading('Mereset password...', { duration: 3000 });
                                        }}
                                        className="gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner className="h-4 w-4" />
                                                Memproses...
                                            </>
                                        ) : (
                                            'Ya, Reset Sekarang'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Reset Password',
    description: 'Masukkan password baru untuk akun Anda',
};
