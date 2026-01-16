import AlertError from '@/components/alert-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTrans } from '@/hooks/use-trans';
import { useForm } from '@inertiajs/react';

interface TicketCreateFormProps {
    storeRoute?: string;
}

export function TicketCreateForm({ storeRoute }: TicketCreateFormProps = {}) {
    const { trans } = useTrans();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const routeName = storeRoute || '/tickets';
        post(routeName, {
            onSuccess: () => {
                reset();
                // Client route: redirect to client tickets list
                if (storeRoute?.includes('client')) {
                    window.location.href = '/client/tickets';
                }
                // Public route (/tickets): server handles redirect to ticket show page
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">{trans('ticket.name')} *</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={
                            trans('ticket.placeholder.name') || 'Your name'
                        }
                        error={errors.name}
                    />
                    {errors.name && <AlertError message={errors.name} />}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">{trans('ticket.email')} *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="your@email.com"
                        error={errors.email}
                    />
                    {errors.email && <AlertError message={errors.email} />}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="subject">{trans('ticket.subject')} *</Label>
                <Input
                    id="subject"
                    value={data.subject}
                    onChange={(e) => setData('subject', e.target.value)}
                    placeholder={
                        trans('ticket.placeholder.subject') ||
                        'Brief summary...'
                    }
                    error={errors.subject}
                />
                {errors.subject && <AlertError message={errors.subject} />}
            </div>

            <div className="space-y-2">
                <Label htmlFor="priority">{trans('ticket.priority')}</Label>
                <select
                    id="priority"
                    value={data.priority}
                    onChange={(e) => setData('priority', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                >
                    <option value="low">
                        {trans('ticket.priorities.low')}
                    </option>
                    <option value="medium">
                        {trans('ticket.priorities.medium')}
                    </option>
                    <option value="high">
                        {trans('ticket.priorities.high')}
                    </option>
                    <option value="urgent">
                        {trans('ticket.priorities.urgent')}
                    </option>
                </select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">{trans('ticket.message')} *</Label>
                <Textarea
                    id="message"
                    rows={6}
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                    placeholder={
                        trans('ticket.placeholder.message') ||
                        'Describe your issue...'
                    }
                    error={errors.message}
                />
                {errors.message && <AlertError message={errors.message} />}
            </div>

            <Button type="submit" disabled={processing} className="w-full">
                {processing
                    ? trans('nav.sending') || 'Sending...'
                    : trans('ticket.submit')}
            </Button>
        </form>
    );
}
