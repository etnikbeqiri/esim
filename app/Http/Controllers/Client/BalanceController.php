<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Services\BalanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BalanceController extends Controller
{
    public function __construct(
        private readonly BalanceService $balanceService,
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $customer = $request->user()->customer;

        if (!$customer || !$this->balanceService->canAccessBalance($customer)) {
            return redirect()->route('client.dashboard')
                ->with('error', 'Balance is only available for B2B accounts.');
        }

        $transactions = $this->balanceService->getTransactions($customer);

        return Inertia::render('client/balance/index', [
            'balance' => $this->balanceService->getBalanceSummary($customer),
            'transactions' => $this->balanceService->transformTransactions($transactions),
            'customer' => [
                'display_name' => $customer->display_name,
                'discount_percentage' => $customer->discount_percentage,
            ],
            'currency' => $this->balanceService->getCurrencyData(),
            'paymentProviders' => $this->balanceService->getPaymentProviders(),
            'defaultProvider' => $this->balanceService->getDefaultProvider(),
        ]);
    }

    public function topUp(Request $request): RedirectResponse|Response
    {
        $customer = $request->user()->customer;

        if (!$customer || !$this->balanceService->canAccessBalance($customer)) {
            return back()->with('error', 'Balance top-up is only available for B2B accounts.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:10|max:10000',
            'payment_provider' => 'required|string|in:stripe,payrexx',
        ]);

        $result = $this->balanceService->initiateTopUp(
            customer: $customer,
            amount: (float) $validated['amount'],
            providerValue: $validated['payment_provider'],
        );

        if (!$result['success']) {
            return back()->with('error', $result['error']);
        }

        return Inertia::render('client/checkout/redirect', [
            'checkoutUrl' => $result['result']->checkoutUrl,
        ]);
    }

    public function topUpCallback(Request $request): RedirectResponse
    {
        $result = $this->balanceService->processTopUpCallback(
            paymentId: $request->query('payment_id'),
            status: $request->query('status'),
        );

        return redirect()->route('client.balance.index')
            ->with($result['type'], $result['message']);
    }
}
