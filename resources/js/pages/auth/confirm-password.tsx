import { Form, Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';
import { toast } from 'sonner';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Konfirmasi Password" />

            {/* Security icon */}
            <div className="mb-4 flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                    <ShieldCheck className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                onSuccess={() =>
                    toast.success('Identitas dikonfirmasi!', {
                        description: 'Anda sekarang dapat mengakses area yang dilindungi.',
                    })
                }
                onError={() =>
                    toast.error('Password salah.', {
                        description: 'Masukkan password akun Anda yang benar.',
                    })
                }
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-1.5">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Password akun Anda"
                                autoComplete="current-password"
                                autoFocus
                                className="h-10"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button
                            type="submit"
                            className="h-10 w-full font-semibold"
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Memverifikasi...
                                </>
                            ) : (
                                'Konfirmasi Password'
                            )}
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Konfirmasi Password Anda',
    description: 'Area ini memerlukan verifikasi ulang identitas Anda sebelum melanjutkan.',
};
