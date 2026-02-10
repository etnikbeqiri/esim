import { useTrans } from '@/hooks/use-trans';
import { CheckCircle2, Copy, KeyRound, QrCode, Server, Smartphone } from 'lucide-react';
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

    const displayTitle = title || trans('esim_qr.title');
    const displayDescription = description || trans('esim_qr.description');

    function copyToClipboard(text: string, field: string) {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
        onCopy?.(field);
    }

    const qrValue = esim.lpa_string || esim.qr_code_data;

    if (!qrValue) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50/30 px-4 py-4 md:px-6 md:py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-500 shadow-sm ring-1 ring-primary-100 md:h-10 md:w-10">
                        <QrCode className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-bold text-primary-900 md:text-base">
                            {displayTitle}
                        </h3>
                        {displayDescription && (
                            <p className="text-[11px] text-primary-500 md:text-xs">
                                {displayDescription}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* QR Code */}
            <div className={`px-4 ${compact ? 'py-4' : 'py-5'} md:px-6`}>
                <div className="flex justify-center">
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-primary-100">
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

                {/* LPA String / Activation Code */}
                {esim.lpa_string && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-semibold tracking-wider text-primary-400 uppercase md:text-[11px]">
                                {trans('esim_qr.activation_code')}
                            </p>
                            <button
                                onClick={() =>
                                    copyToClipboard(esim.lpa_string!, 'lpa')
                                }
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-primary-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
                            >
                                {copied === 'lpa' ? (
                                    <span className="flex items-center gap-1 text-accent-600">
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
                        <div className="mt-1.5 rounded-lg bg-primary-50/50 px-3 py-2.5 ring-1 ring-primary-100">
                            <code className="font-mono text-[11px] break-all text-primary-800 md:text-xs">
                                {esim.lpa_string}
                            </code>
                        </div>
                    </div>
                )}

                {showDetails && (
                    <>
                        {/* ICCID & SM-DP+ as pills */}
                        <div className="mt-4 space-y-2">
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
                                        <CheckCircle2 className="h-3.5 w-3.5 text-accent-600" />
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
                                                {trans('esim_qr.smdp_address')}
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
                                            <CheckCircle2 className="h-3.5 w-3.5 text-accent-600" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* PIN/PUK/APN as inline pills */}
                        {(esim.pin || esim.puk || esim.apn) && (
                            <div className="mt-3 flex gap-2">
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
                    </>
                )}
            </div>
        </div>
    );
}
