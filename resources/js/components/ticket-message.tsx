import { Badge } from '@/components/ui/badge';
import { useTrans } from '@/hooks/use-trans';

interface TicketMessageProps {
    message: {
        uuid: string;
        message: string;
        is_internal: boolean;
        sender_name: string;
        sender_email: string;
        is_admin: boolean;
        created_at: string;
    };
}

export function TicketMessage({ message }: TicketMessageProps) {
    const { trans } = useTrans();

    if (message.is_internal) {
        return (
            <div className="mb-4 flex justify-start">
                <div className="max-w-[80%] rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="mb-2 flex items-center space-x-2">
                        <span className="text-sm font-semibold text-amber-800">
                            {message.sender_name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                            {trans('ticket.internal_note')}
                        </Badge>
                    </div>
                    <p className="whitespace-pre-wrap text-gray-700">
                        {message.message}
                    </p>
                    <span className="mt-2 text-xs text-gray-500">
                        {message.created_at}
                    </span>
                </div>
            </div>
        );
    }

    const isAdmin = message.is_admin;

    return (
        <div
            className={`flex ${isAdmin ? 'justify-start' : 'justify-end'} mb-4`}
        >
            <div
                className={`max-w-[80%] rounded-lg p-4 ${
                    isAdmin
                        ? 'border border-primary-200 bg-primary-50'
                        : 'border border-green-200 bg-green-50'
                }`}
            >
                <div className="mb-2 flex items-center space-x-2">
                    <span
                        className={`text-sm font-semibold ${
                            isAdmin ? 'text-primary-800' : 'text-green-800'
                        }`}
                    >
                        {message.sender_name}
                    </span>
                    {isAdmin && (
                        <Badge variant="secondary" className="text-xs">
                            {trans('ticket.messages.admin')}
                        </Badge>
                    )}
                </div>
                <p className="whitespace-pre-wrap text-gray-700">
                    {message.message}
                </p>
                <span className="mt-2 text-xs text-gray-500">
                    {message.created_at}
                </span>
            </div>
        </div>
    );
}
