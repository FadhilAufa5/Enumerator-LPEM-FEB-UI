import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';
import { toast } from 'sonner';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Kode Pemulihan',
                description: 'Konfirmasi akses akun menggunakan salah satu kode pemulihan darurat Anda.',
                toggleText: 'gunakan kode autentikasi',
            };
        }

        return {
            title: 'Kode Autentikasi',
            description: 'Masukkan kode 6 digit dari aplikasi autentikator Anda.',
            toggleText: 'gunakan kode pemulihan',
        };
    }, [showRecoveryInput]);

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title="Autentikasi Dua Faktor" />

            <div className="space-y-5">
                <Form
                    {...store.form()}
                    className="space-y-4"
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                    onSuccess={() =>
                        toast.success('Autentikasi berhasil!', {
                            description: 'Selamat datang kembali.',
                        })
                    }
                    onError={() =>
                        toast.error('Kode tidak valid.', {
                            description: 'Periksa kode Anda dan coba lagi.',
                        })
                    }
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <div className="grid gap-1.5">
                                    <Input
                                        name="recovery_code"
                                        type="text"
                                        placeholder="Masukkan kode pemulihan"
                                        autoFocus={showRecoveryInput}
                                        required
                                        className="h-10 font-mono tracking-widest"
                                    />
                                    <InputError message={errors.recovery_code} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <InputOTP
                                        name="code"
                                        maxLength={OTP_MAX_LENGTH}
                                        value={code}
                                        onChange={(value) => setCode(value)}
                                        disabled={processing}
                                        pattern={REGEXP_ONLY_DIGITS}
                                    >
                                        <InputOTPGroup>
                                            {Array.from(
                                                { length: OTP_MAX_LENGTH },
                                                (_, index) => (
                                                    <InputOTPSlot key={index} index={index} />
                                                ),
                                            )}
                                        </InputOTPGroup>
                                    </InputOTP>
                                    <InputError message={errors.code} />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="h-10 w-full font-semibold"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="mr-2 h-4 w-4" />
                                        Memverifikasi...
                                    </>
                                ) : (
                                    'Verifikasi'
                                )}
                            </Button>

                            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                                atau{' '}
                                <button
                                    type="button"
                                    className="cursor-pointer font-medium text-blue-600 underline-offset-4 transition-colors hover:text-blue-500 hover:underline dark:text-blue-400"
                                    onClick={() => toggleRecoveryMode(clearErrors)}
                                >
                                    {authConfigContent.toggleText}
                                </button>
                            </p>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
