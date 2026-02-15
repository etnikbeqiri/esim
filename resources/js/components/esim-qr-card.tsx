import { useTrans } from '@/hooks/use-trans';
import { GoldButton } from '@/components/ui/gold-button';
import { CheckCircle2, Copy, KeyRound, QrCode, Server, Smartphone, Apple, SmartphoneIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

interface EsimData {
    iccid: string;
    lpa_string?: string | null;
    qr_code_data?: string | null;
    smdp_address?: string | null;
    activation_code?: string | null;
    pin?: string | null;
    puk?: string | null;
    apn?: string | null;
}

interface EsimQrCardProps {
    esim: EsimData;
    title?: string;
    description?: string;
    showDetails?: boolean;
    compact?: boolean;
    onCopy?: (field: string) => void;
}

export function EsimQrCard({
    esim,
    title,
    description,
    showDetails = true,
    compact = false,
    onCopy,
}: EsimQrCardProps) {
    const { trans } = useTrans();
    const [copied, setCopied] = useState<string | null>(null);
    const [showQr, setShowQr] = useState(false);

    const displayTitle = title || trans('esim_qr.install_title');
    const displayDescription = description || trans('esim_qr.install_description');

    function copyToClipboard(text: string, field: string) {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
        onCopy?.(field);
    }

    const qrValue = esim.lpa_string || esim.qr_code_data;

    // Generate deeplinks
    const iosDeeplink = esim.lpa_string 
        ? `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(esim.lpa_string)}`
        : null;
    
    const androidDeeplink = esim.lpa_string
        ? `https://lpa.ds/?${encodeURIComponent(esim.lpa_string.replace('LPA:1$', ''))}`
        : null;

    if (!qrValue) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-lg">
            {/* Header - Gold Gradient */}
            <div className="bg-gradient-to-br from-accent-300 via-accent-400 to-accent-500 px-4 py-5 md:px-6 md:py-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-accent-600 shadow-md md:h-12 md:w-12">
                        <Smartphone className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-accent-950 md:text-xl">
                            {displayTitle}
                        </h3>
                        {displayDescription && (
                            <p className="text-xs text-accent-800/80 md:text-sm">
                                {displayDescription}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className={`px-4 ${compact ? 'py-4' : 'py-5'} md:px-6`}>
                {/* Install Buttons - Primary Actions */}
                <div className="space-y-3">
                    {/* iOS Install Button */}
                    {iosDeeplink && (
                        <a
                            href={iosDeeplink}
                            className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 text-white shadow-lg transition-all hover:from-gray-700 hover:to-gray-800 hover:shadow-xl active:scale-[0.98]"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                                <Apple className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold md:text-base">
                                    {trans('esim_qr.install_ios', { fallback: 'Install on iPhone' })}
                                </p>
                                <p className="text-xs text-white/70">
                                    {trans('esim_qr.install_ios_sub', { fallback: 'One-click setup' })}
                                </p>
                            </div>
                            <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </a>
                    )}

                    {/* Android Install Button */}
                    {androidDeeplink && (
                        <a
                            href={androidDeeplink}
                            className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-white shadow-lg transition-all hover:from-emerald-500 hover:to-emerald-600 hover:shadow-xl active:scale-[0.98]"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                                <SmartphoneIcon className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold md:text-base">
                                    {trans('esim_qr.install_android', { fallback: 'Install on Android' })}
                                </p>
                                <p className="text-xs text-white/70">
                                    {trans('esim_qr.install_android_sub', { fallback: 'Quick setup' })}
                                </p>
                            </div>
                            <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </a>
                    )}
                </div>

                {/* Divider with "Or" */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-primary-100" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-xs font-medium text-primary-400">
                            {trans('esim_qr.or_scan', { fallback: 'Or scan QR code' })}
                        </span>
                    </div>
                </div>

                {/* QR Code Toggle */}
                {!showQr ? (
                    <button
                        onClick={() => setShowQr(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50/50 py-3 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                    >
                        <QrCode className="h-5 w-5" />
                        {trans('esim_qr.show_qr', { fallback: 'Show QR Code' })}
                    </button>
                ) : (
                    <div className="flex justify-center">
                        <div className="rounded-2xl bg-white p-4 shadow-md ring-2 ring-accent-200">
                            {esim.qr_code_data ? (
                                <img
                                    src={esim.qr_code_data}
                                    alt="eSIM QR Code"
                                    className={compact ? 'h-40 w-40' : 'h-48 w-48'}
                                />
                            ) : (
                                <QRCodeSVG
                                    value={esim.lpa_string || ''}
                                    size={compact ? 160 : 192}
                                    level="M"
                                />
                            )}
                        </div>
                    </div>
                )}

                {showDetails && (
                    <>
                        {/* Manual Setup Section */}
                        <div className="mt-6 rounded-xl bg-gradient-to-br from-primary-50 via-white to-accent-50/30 p-4 ring-1 ring-primary-100">
                            <p className="mb-3 text-xs font-bold tracking-wider text-primary-500 uppercase">
                                {trans('esim_qr.manual_setup', { fallback: 'Manual Setup' })}
                            </p>

                            {/* Activation Code */}
                            {esim.lpa_string && (
                                <div className="mb-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-semibold tracking-wider text-primary-400 uppercase md:text-[11px]">
                                            {trans('esim_qr.activation_code')}
                                        </p>
                                        <button
                                            onClick={() => copyToClipboard(esim.lpa_string!, 'lpa')}
                                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-accent-600 transition-colors hover:bg-accent-50"
                                        >
                                            {copied === 'lpa' ? (
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {trans('esim_qr.copied')}
                                                </span>
                                            ) : (
                                                <>
                                                    <Copy className="h-3 w-3" />
                                                    {trans('esim_qr.copy')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="mt-1.5 rounded-lg bg-white px-3 py-2.5 shadow-sm ring-1 ring-primary-100">
                                        <code className="block break-all font-mono text-[11px] text-primary-800 md:text-xs">
                                            {esim.lpa_string}
                                        </code>
                                    </div>
                                </div>
                            )}

                            {/* ICCID & SM-DP+ */}
                            <div className="space-y-2">
                                {/* ICCID */}
                                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-sm ring-1 ring-primary-100">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Smartphone className="h-3.5 w-3.5 shrink-0 text-accent-500" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] leading-tight text-primary-400 md:text-[11px]">
                                                {trans('esim_qr.iccid')}
                                            </p>
                                            <code className="font-mono text-[11px] font-bold text-primary-900 md:text-xs">
                                                {esim.iccid}
                                            </code>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(esim.iccid, 'iccid')}
                                        className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-accent-500 transition-colors hover:bg-accent-50"
                                    >
                                        {copied === 'iccid' ? (
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                </div>

                                {/* SM-DP+ Address */}
                                {esim.smdp_address && (
                                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-sm ring-1 ring-primary-100">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Server className="h-3.5 w-3.5 shrink-0 text-accent-500" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] leading-tight text-primary-400 md:text-[11px]">
                                                    {trans('esim_qr.smdp_address')}
                                                </p>
                                                <code className="font-mono text-[11px] font-bold text-primary-900 md:text-xs break-all">
                                                    {esim.smdp_address}
                                                </code>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(esim.smdp_address!, 'smdp')}
                                            className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-accent-500 transition-colors hover:bg-accent-50"
                                        >
                                            {copied === 'smdp' ? (
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* PIN/PUK/APN */}
                            {(esim.pin || esim.puk || esim.apn) && (
                                <div className="mt-3 flex gap-2">
                                    {esim.pin && (
                                        <div className="flex flex-1 items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-primary-100">
                                            <KeyRound className="h-3.5 w-3.5 shrink-0 text-accent-500" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] leading-tight text-primary-400 md:text-[11px]">
                                                    {trans('esim_qr.pin')}
                                                </p>
                                                <p className="font-mono text-xs font-bold text-primary-900 md:text-sm">
                                                    {esim.pin}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {esim.puk && (
                                        <div className="flex flex-1 items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-primary-100">
                                            <KeyRound className="h-3.5 w-3.5 shrink-0 text-accent-500" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] leading-tight text-primary-400 md:text-[11px]">
                                                    {trans('esim_qr.puk')}
                                                </p>
                                                <p className="font-mono text-xs font-bold text-primary-900 md:text-sm">
                                                    {esim.puk}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {esim.apn && (
                                        <div className="flex flex-1 items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-primary-100">
                                            <Server className="h-3.5 w-3.5 shrink-0 text-accent-500" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] leading-tight text-primary-400 md:text-[11px]">
                                                    {trans('esim_qr.apn')}
                                                </p>
                                                <p className="font-mono text-xs font-bold text-primary-900 md:text-sm">
                                                    {esim.apn}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
