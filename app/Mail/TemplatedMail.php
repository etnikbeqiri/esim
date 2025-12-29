<?php

namespace App\Mail;

use App\Enums\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TemplatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public EmailTemplate $template,
        public array $templateData = [],
        public ?string $customSubject = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->customSubject ?? $this->template->subject(),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: $this->template->viewName(),
            with: $this->prepareData(),
        );
    }

    protected function prepareData(): array
    {
        return array_merge([
            'currency' => config('services.currency.symbol', '€'),
            'appName' => config('app.name'),
            'appUrl' => config('app.url'),
            'supportEmail' => config('contact.support_email'),
        ], $this->templateData);
    }
}
