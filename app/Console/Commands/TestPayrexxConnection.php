<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Payrexx\Models\Request\SignatureCheck;
use Payrexx\Payrexx;
use Payrexx\PayrexxException;

class TestPayrexxConnection extends Command
{
    protected $signature = 'payrexx:test';
    protected $description = 'Test Payrexx API connection';

    public function handle(): int
    {
        $instance = config('services.payrexx.instance');
        $secret = config('services.payrexx.secret');

        $this->info("Testing Payrexx connection...");
        $this->line("Instance: {$instance}");
        $this->line("Secret: " . substr($secret, 0, 4) . '***');

        try {
            $payrexx = new Payrexx($instance, $secret);

            // Test signature check (validates API credentials)
            $signatureCheck = new SignatureCheck();
            $response = $payrexx->getOne($signatureCheck);

            $this->newLine();
            $this->info("Connection successful!");
            $this->line("Response received - API credentials are valid.");

            return Command::SUCCESS;
        } catch (PayrexxException $e) {
            $this->newLine();
            $this->error("Connection failed!");
            $this->error("Error: " . $e->getMessage());

            return Command::FAILURE;
        }
    }
}
