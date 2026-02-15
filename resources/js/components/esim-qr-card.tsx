import { useTrans } from '@/hooks/use-trans';
import {
    CheckCircle2,
    ChevronDown,
    Copy,
    KeyRound,
    Server,
    Smartphone,
} from 'lucide-react';
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
    const [detailsOpen, setDetailsOpen] = useState(false);

    const displayTitle = title || trans('esim_qr.install_title');
    const displayDescription =
        description || trans('esim_qr.install_description');

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

    const hasManualDetails =
        showDetails &&
        (esim.lpa_string ||
            esim.iccid ||
            esim.smdp_address ||
            esim.pin ||
            esim.puk ||
            esim.apn);

    return (
        <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
            {/* Card body */}
            <div className={`px-4 ${compact ? 'py-5' : 'py-6'} md:px-6`}>
                {/* Title area */}
                <div className="mb-5 text-center">
                    <h3 className="text-base font-bold text-primary-900 md:text-lg">
                        {displayTitle}
                    </h3>
                    {displayDescription && (
                        <p className="mt-1 text-xs text-primary-500 md:text-sm">
                            {displayDescription}
                        </p>
                    )}
                </div>

                {/* QR Code - Hero element */}
                <div className="flex justify-center">
                    <div className="relative rounded-2xl border-2 border-dashed border-primary-200 bg-white p-5">
                        {esim.qr_code_data ? (
                            <img
                                src={esim.qr_code_data}
                                alt="eSIM QR Code"
                                className={
                                    compact
                                        ? 'h-44 w-44 md:h-48 md:w-48'
                                        : 'h-48 w-48 md:h-56 md:w-56'
                                }
                            />
                        ) : (
                            <QRCodeSVG
                                value={esim.lpa_string || ''}
                                size={compact ? 176 : 192}
                                level="M"
                                className="md:h-56 md:w-56"
                            />
                        )}
                    </div>
                </div>

                {/* Scan instruction */}
                <p className="mt-3 text-center text-[11px] text-primary-400 md:text-xs">
                    {trans('esim_qr.scan_instruction', {
                        fallback:
                            "Scan this QR code with your phone's camera to install",
                    })}
                </p>

                {/* Deeplink buttons - secondary */}
                {(iosDeeplink || androidDeeplink) && (
                    <div className="mt-5">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-x-0 h-px bg-primary-100" />
                            <span className="relative bg-white px-3 text-[10px] font-medium tracking-wider text-primary-400 uppercase">
                                {trans('esim_qr.or_install_directly', {
                                    fallback: 'Or install directly on your device',
                                })}
                            </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                            {iosDeeplink && (
                                <a
                                    href={iosDeeplink}
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary-200 bg-white px-3 py-2.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-50"
                                >
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 384 512" fill="currentColor">
                                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                    </svg>
                                    iPhone
                                </a>
                            )}
                            {androidDeeplink && (
                                <a
                                    href={androidDeeplink}
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary-200 bg-white px-3 py-2.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-50"
                                >
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 576 512" fill="currentColor">
                                        <path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.27-10h0l-48.54,84.07a301.25,301.25,0,0,0-246.56,0L116.18,64.45a10,10,0,1,0-17.27,10h0l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55" />
                                    </svg>
                                    Android
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Manual Details - Collapsible */}
            {hasManualDetails && (
                <div className="border-t border-primary-100">
                    <button
                        onClick={() => setDetailsOpen(!detailsOpen)}
                        className="flex w-full items-center justify-between px-4 py-3 text-xs font-medium text-primary-500 transition-colors hover:bg-primary-50/50 md:px-6"
                    >
                        <span>
                            {trans('esim_qr.manual_details', {
                                fallback: 'Manual installation details',
                            })}
                        </span>
                        <ChevronDown
                            className={`h-4 w-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {detailsOpen && (
                        <div className="space-y-3 px-4 pb-4 md:px-6 md:pb-5">
                            {/* Activation Code */}
                            {esim.lpa_string && (
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <p className="text-[10px] font-semibold tracking-wider text-primary-400 uppercase md:text-[11px]">
                                            {trans('esim_qr.activation_code')}
                                        </p>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    esim.lpa_string!,
                                                    'lpa',
                                                )
                                            }
                                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-primary-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
                                        >
                                            {copied === 'lpa' ? (
                                                <span className="flex items-center gap-1 text-green-600">
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
                                    <div className="rounded-lg bg-primary-50/50 px-3 py-2.5 ring-1 ring-primary-100">
                                        <code className="font-mono text-[11px] break-all text-primary-800 md:text-xs">
                                            {esim.lpa_string}
                                        </code>
                                    </div>
                                </div>
                            )}

                            {/* ICCID */}
                            <div className="flex items-center justify-between rounded-lg bg-primary-50/50 px-3 py-2.5 ring-1 ring-primary-100">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Smartphone className="h-3.5 w-3.5 shrink-0 text-primary-400" />
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
                                    onClick={() =>
                                        copyToClipboard(esim.iccid, 'iccid')
                                    }
                                    className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-primary-400 transition-colors hover:bg-white hover:text-primary-700"
                                >
                                    {copied === 'iccid' ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </button>
                            </div>

                            {/* SM-DP+ Address */}
                            {esim.smdp_address && (
                                <div className="flex items-center justify-between rounded-lg bg-primary-50/50 px-3 py-2.5 ring-1 ring-primary-100">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Server className="h-3.5 w-3.5 shrink-0 text-primary-400" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] leading-tight text-primary-400 md:text-[11px]">
                                                {trans(
                                                    'esim_qr.smdp_address',
                                                )}
                                            </p>
                                            <code className="font-mono text-[11px] font-bold text-primary-900 md:text-xs break-all">
                                                {esim.smdp_address}
                                            </code>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            copyToClipboard(
                                                esim.smdp_address!,
                                                'smdp',
                                            )
                                        }
                                        className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-primary-400 transition-colors hover:bg-white hover:text-primary-700"
                                    >
                                        {copied === 'smdp' ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* PIN/PUK/APN */}
                            {(esim.pin || esim.puk || esim.apn) && (
                                <div className="flex gap-2">
                                    {esim.pin && (
                                        <div className="flex flex-1 items-center gap-2 rounded-lg bg-primary-50/50 px-3 py-2 ring-1 ring-primary-100">
                                            <KeyRound className="h-3.5 w-3.5 shrink-0 text-primary-400" />
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
                                        <div className="flex flex-1 items-center gap-2 rounded-lg bg-primary-50/50 px-3 py-2 ring-1 ring-primary-100">
                                            <KeyRound className="h-3.5 w-3.5 shrink-0 text-primary-400" />
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
                                        <div className="flex flex-1 items-center gap-2 rounded-lg bg-primary-50/50 px-3 py-2 ring-1 ring-primary-100">
                                            <Server className="h-3.5 w-3.5 shrink-0 text-primary-400" />
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
                    )}
                </div>
            )}
        </div>
    );
}
