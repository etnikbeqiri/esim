// Components
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useTrans } from '@/hooks/use-trans';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head } from '@inertiajs/react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { trans } = useTrans();

    return (
        <AuthLayout
            title={trans('verify_email_page.title')}
            description={trans('verify_email_page.description')}
        >
            <Head title={trans('verify_email_page.meta_title')} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {trans('verify_email_page.success_message')}
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            {trans('verify_email_page.resend_button')}
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            {trans('verify_email_page.logout_button')}
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
