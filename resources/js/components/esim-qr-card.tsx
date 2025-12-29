import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Copy, QrCode } from 'lucide-react';
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
}

export function EsimQrCard({
    esim,
    title = 'Your eSIM',
    description = 'Scan the QR code with your phone to install the eSIM',
    showDetails = true,
    compact = false,
}: EsimQrCardProps) {
    const [copied, setCopied] = useState<string | null>(null);

    function copyToClipboard(text: string, field: string) {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    }

    const qrValue = esim.lpa_string || esim.qr_code_data;

    if (!qrValue) {
        return null;
    }

    return (
        <Card>
            <CardHeader className={compact ? 'pb-2' : undefined}>
                <CardTitle className="flex items-center gap-2 text-base">
                    <QrCode className="h-5 w-5" />
                    {title}
                </CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className={compact ? 'space-y-4' : 'space-y-6'}>
                {/* QR Code */}
                <div className="flex justify-center">
                    <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 bg-white p-4">
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
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Activation Code</label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7"
                                onClick={() => copyToClipboard(esim.lpa_string!, 'lpa')}
                            >
                                {copied === 'lpa' ? (
                                    <span className="text-green-600">Copied!</span>
                                ) : (
                                    <>
                                        <Copy className="mr-1 h-3 w-3" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="rounded-lg bg-muted p-3">
                            <code className="text-xs break-all font-mono">
                                {esim.lpa_string}
                            </code>
                        </div>
                    </div>
                )}

                {showDetails && (
                    <>
                        <Separator />

                        {/* ICCID */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">ICCID</span>
                            <div className="flex items-center gap-2">
                                <code className="font-mono text-xs">{esim.iccid}</code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => copyToClipboard(esim.iccid, 'iccid')}
                                >
                                    {copied === 'iccid' ? (
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <Copy className="h-3 w-3" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* SM-DP+ Address */}
                        {esim.smdp_address && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">SM-DP+ Address</span>
                                <div className="flex items-center gap-2">
                                    <code className="font-mono text-xs">{esim.smdp_address}</code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(esim.smdp_address!, 'smdp')}
                                    >
                                        {copied === 'smdp' ? (
                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* PIN/PUK/APN */}
                        {(esim.pin || esim.puk || esim.apn) && (
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                {esim.pin && (
                                    <div>
                                        <span className="text-muted-foreground text-xs">PIN</span>
                                        <p className="font-mono">{esim.pin}</p>
                                    </div>
                                )}
                                {esim.puk && (
                                    <div>
                                        <span className="text-muted-foreground text-xs">PUK</span>
                                        <p className="font-mono">{esim.puk}</p>
                                    </div>
                                )}
                                {esim.apn && (
                                    <div>
                                        <span className="text-muted-foreground text-xs">APN</span>
                                        <p className="font-mono">{esim.apn}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
