import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';
import { toast } from 'sonner';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa Password" />

            {status && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-center text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {status}
                </div>
            )}

            <Form
                {...email.form()}
                onSuccess={() =>
                    toast.success('Link reset dikirim!', {
                        description: 'Periksa inbox email Anda dan ikuti petunjuknya.',
                    })
                }
                onError={() =>
                    toast.error('Gagal mengirim link.', {
                        description: 'Pastikan email yang dimasukkan sudah terdaftar.',
                    })
                }
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-1.5">
                            <Label htmlFor="email">Alamat Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="off"
                                autoFocus
                                placeholder="email@contoh.com"
                                className="h-10"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <Button
                            type="submit"
                            className="h-10 w-full font-semibold"
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                'Kirim Link Reset Password'
                            )}
                        </Button>

                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            Ingat password Anda?{' '}
                            <TextLink href={login()} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                Kembali masuk
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa Password',
    description: 'Masukkan email Anda untuk menerima link reset password',
};
