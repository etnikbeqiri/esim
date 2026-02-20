import { index as ticketsIndex } from '@/actions/App/Http/Controllers/Client/TicketController';
import { TicketCreateForm } from '@/components/ticket-create-form';
import { useTrans } from '@/hooks/use-trans';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function TicketCreate() {
    const { trans } = useTrans();

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6">
                <Link
                    href={ticketsIndex.url()}
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {trans('ticket.my_tickets')}
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {trans('ticket.create_title')}
                </h1>
                <p className="mt-2 text-gray-600">
                    Fill out the form below and our support team will get back
                    to you within 24 hours.
                </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <TicketCreateForm storeRoute="/client/tickets" />
            </div>
        </div>
    );
}
