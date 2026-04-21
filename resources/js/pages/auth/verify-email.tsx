import { Form, Head } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { toast } from 'sonner';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Verifikasi Email" />

            {/* Status link sent */}
            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-center text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Link verifikasi baru telah dikirim ke email Anda.
                </div>
            )}

            {/* Icon dan keterangan */}
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <MailCheck className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Kami telah mengirimkan link verifikasi ke email Anda. Silakan klik link tersebut untuk mengaktifkan akun.
                </p>
            </div>

            <Form
                {...send.form()}
                onSuccess={() =>
                    toast.success('Link verifikasi dikirim ulang!', {
                        description: 'Periksa inbox atau folder spam email Anda.',
                    })
                }
                onError={() =>
                    toast.error('Gagal mengirim ulang.', {
                        description: 'Coba beberapa saat lagi.',
                    })
                }
                className="flex flex-col gap-4"
            >
                {({ processing }) => (
                    <>
                        <Button
                            type="submit"
                            variant="secondary"
                            className="h-10 w-full font-semibold"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Mengirim...
                                </>
                            ) : (
                                'Kirim Ulang Email Verifikasi'
                            )}
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                            Keluar dari akun
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verifikasi Email',
    description: 'Silakan verifikasi alamat email Anda sebelum melanjutkan.',
};
