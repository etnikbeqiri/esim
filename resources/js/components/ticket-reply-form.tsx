import AlertError from '@/components/alert-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTrans } from '@/hooks/use-trans';
import { useForm } from '@inertiajs/react';

interface TicketReplyFormProps {
    ticketUuid: string;
    email?: string;
    replyRoute: string;
    isInternal?: boolean;
    onTrackFocus?: (fieldName: string) => void;
    onTrackComplete?: (fieldName: string) => void;
    onTrackSubmit?: () => void;
    onTrackError?: (errorMessage: string) => void;
    onTrackFileUpload?: (fileName: string, fileSize: number) => void;
}

export function TicketReplyForm({
    ticketUuid,
    email,
    replyRoute,
    isInternal = false,
    onTrackFocus,
    onTrackComplete,
    onTrackSubmit,
    onTrackError,
    onTrackFileUpload,
}: TicketReplyFormProps) {
    const { trans } = useTrans();
    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
        is_internal: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onTrackSubmit?.();
        post(replyRoute, {
            onSuccess: () => {
                reset('message');
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).join(', ');
                onTrackError?.(errorMessages);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Textarea
                    rows={4}
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                    onFocus={() => onTrackFocus?.('message')}
                    onBlur={() => data.message && onTrackComplete?.('message')}
                    placeholder={
                        isInternal
                            ? trans('ticket.messages.internal_placeholder')
                            : trans('ticket.messages.reply_placeholder')
                    }
                />
                {errors.message && <AlertError errors={[errors.message]} />}
            </div>

            {isInternal && (
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="is_internal"
                        checked={data.is_internal}
                        onChange={(e) =>
                            setData('is_internal', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <Label htmlFor="is_internal" className="text-sm">
                        {trans('ticket.internal_note')}
                    </Label>
                </div>
            )}

            <Button type="submit" disabled={processing}>
                {processing
                    ? trans('nav.sending') || 'Sending...'
                    : trans('ticket.reply')}
            </Button>
        </form>
    );
}
