# Email System Documentation

## Overview

The email system uses an event-driven architecture with queue-based processing. Events trigger emails which are queued in `EmailQueue` and processed by `SendQueuedEmail` job.

---

## Architecture Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Event Fires   │────▶│  EmailService   │────▶│   EmailQueue     │
│ (e.g. Payment   │     │  queues email   │     │   (database)     │
│  Succeeded)     │     │                 │     │                  │
└─────────────────┘     └─────────────────┘     └────────┬─────────┘
                                                        │
                                                        ▼
                                              ┌──────────────────┐
                                              │ SendQueuedEmail  │
                                              │  (Job)           │
                                              │  - builds data   │
                                              │  - renders view  │
                                              │  - sends via SMTP│
                                              └──────────────────┘
```

---

## Email Triggers

### Customer Emails

| Trigger | Event | Template | Method |
|---------|-------|----------|--------|
| New customer registered | `CustomerCreated` | `Welcome` | `EmailService::sendWelcome()` |
| Order confirmation | `CheckoutCreated` | `OrderConfirmation` | `EmailService::sendOrderConfirmation()` |
| **Payment successful** | **`PaymentSucceeded`** | **`PaymentReceipt`** | **`EmailService::sendPaymentReceipt()`** |
| **Payment successful** | **`PaymentSucceeded`** | **`OrderConfirmation`** | **`EmailService::sendOrderConfirmation()`** |
| eSIM delivered | `EsimProfileCreated` | `EsimDelivery` | `EmailService::sendEsimDelivery()` |
| Payment failed | `PaymentFailed` | `PaymentFailed` | `EmailService::sendPaymentFailed()` |
| Order failed | `OrderFailed` | `OrderFailed` | `EmailService::sendOrderFailed()` |
| Refund issued | `RefundIssued` | `RefundNotification` | `EmailService::sendRefundNotification()` |
| Balance topped up | `BalanceToppedUp` | `BalanceTopUp` | `EmailService::sendBalanceTopUp()` |
| Low balance | (Scheduled check) | `LowBalance` | `EmailService::sendLowBalanceWarning()` |

### Admin Emails

| Trigger | Template | Method |
|---------|----------|--------|
| New order | `AdminNewOrder` | `EmailService::notifyAdminNewOrder()` |
| Order failed | `AdminOrderFailed` | `EmailService::notifyAdminOrderFailed()` |
| Payment failed | `AdminPaymentFailed` | `EmailService::notifyAdminPaymentFailed()` |
| New B2B customer | `AdminNewB2BCustomer` | `EmailService::notifyAdminNewB2BCustomer()` |
| Balance topped up | `AdminBalanceTopUp` | `EmailService::notifyAdminBalanceTopUp()` |
| Low stock | `AdminLowStock` | `EmailService::notifyAdminLowStock()` |

---

## Critical Issue Found: Email Priority Logic

### Current Problem

In `EmailService.php`, email address priority is:

```php
$email = $order->customer_email ?? $order->customer?->user?->email;
$name = $order->customer_name ?? $order->customer?->user?->name;
```

**Issue:** This uses `order.customer_email` (from database) as PRIMARY, falling back to `customer.user.email`.

**Why this is wrong:**
- For **guest checkout**, `customer_email` is set from the form
- But if user is **logged in**, the form may have a different email
- The payment record has its own `customer_email` field which should be used

### Recommended Fix

Change priority to use the payment email first (most recent):

```php
// Payment email is most accurate (from payment form)
$email = $order->payment?->customer_email
    ?? $order->customer_email
    ?? $order->customer?->user?->email;
$name = $order->customer_name
    ?? $order->customer?->user?->name;
```

---

## Payment Email Flow (Specific Analysis)

### Current Implementation

**PaymentSucceeded Event** (`app/Events/Payment/PaymentSucceeded.php:70-86`):

```php
// Send payment receipt email
Verbs::unlessReplaying(function () use ($state) {
    if (!$state->order_id) {
        return;
    }

    $order = Order::with(['customer.user', 'package', 'payments'])->find($state->order_id);

    if ($order) {
        $emailService = app(EmailService::class);

        // Send order confirmation email
        $emailService->sendOrderConfirmation($order);

        // Send payment receipt
        $emailService->sendPaymentReceipt($order);
    }
});
```

**EmailService::sendPaymentReceipt** (`app/Services/EmailService.php:176-195`):

```php
public function sendPaymentReceipt(Order $order): ?EmailQueue
{
    $email = $order->customer_email ?? $order->customer?->user?->email;
    $name = $order->customer_name ?? $order->customer?->user?->email;

    if (!$email) {
        return null;
    }

    return $this->queueUnlessReplaying(
        EmailTemplate::PaymentReceipt,
        $email,
        $name,
        $order->customer_id,
        $order->id,
        ['order_number' => $order->order_number]
    );
}
```

### Issue: Data Passed to Template

In `SendQueuedEmail.php:151-165`, the payment receipt data building:

```php
private function buildPaymentReceiptData(EmailQueue $emailQueue, array $data): array
{
    $order = Order::with(['package', 'payment'])->find($emailQueue->order_id);

    if (!$order) {
        throw new \Exception('Order not found for payment receipt email');
    }

    return [
        'customerName' => $emailQueue->to_name,
        'order' => $order,
        'package' => $order->package,
        'payment' => $order->payment,  // Uses HasOne relationship
    ];
}
```

**Potential Issue:** `$order->payment` relies on `latestOfMany()` relationship. If multiple payments exist, this could return wrong one.

---

## Checkout Flow with Email Addresses

### Guest Checkout (Public/CheckoutController)

**Step 1: Form Submission**
```php
$validated = $request->validate([
    'email' => 'required|email',
    'name' => 'required|string',
    'phone' => 'nullable|string',
]);
```

**Step 2: Create Order (CheckoutService.php:427-440)**
```php
$customer = $this->findOrCreateGuestCustomer($email, $name, $phone);

$order = OrderCreated::commit(
    customer_id: $customer->id,
    // ...
    customer_email: $email,  // From form
    customer_name: $name,    // From form
    // ...
);
```

**Step 3: Create Payment (CheckoutService.php:459-470)**
```php
$payment = CheckoutCreated::commit(
    // ...
    customer_email: $email,  // From form (same as order)
    // ...
);
```

### Problem: Logged-in User Override

If user is logged in:
1. Form is pre-filled with user's email
2. User enters different email
3. Form submits with different email
4. `findOrCreateGuestCustomer()` finds existing user
5. Order is created with FORM email (correct)
6. But `customer_id` is from existing user

**Result:** Email goes to form email, but is linked to wrong customer account.

---

## Templates & Data Requirements

### Payment Receipt (`payment-receipt.blade.php`)

Required variables:
```php
$customerName      // From emailQueue.to_name
$order             // Order model with package relationship
$package           // $order->package
$payment           // $order->payment (HasOne latestOfMany)
$currency          // From config (auto-added by email builder)
```

### Order Confirmation (`order-confirmation.blade.php`)

Required variables:
```php
$customerName      // From emailQueue.to_name
$order             // Order model
$package           // $order->package
$currency          // From config
```

---

## Known Issues & Fixes Needed

### Issue 1: Email Priority

**Status:** ❌ BROKEN

**Location:** `EmailService.php` all send methods

**Fix:**
```php
// Current (WRONG)
$email = $order->customer_email ?? $order->customer?->user?->email;

// Fixed (CORRECT)
$email = $order->payment?->customer_email
    ?? $order->customer_email
    ?? $order->customer?->user?->email;
```

### Issue 2: Payment Relationship in Email Builder

**Status:** ⚠️ RISKY

**Location:** `SendQueuedEmail.php:163`

**Current:**
```php
'payment' => $order->payment,  // HasOne relationship
```

**Better:**
```php
'payment' => $order->payments()->latest()->first(),
```

### Issue 3: Duplicate Email Sends

**Status:** ⚠️ POTENTIAL

**Location:** `PaymentSucceeded.php:80-84`

**Current:** Sends TWO emails on payment success:
```php
$emailService->sendOrderConfirmation($order);  // Email 1
$emailService->sendPaymentReceipt($order);     // Email 2
```

**Issue:** Order confirmation may have already been sent at checkout creation.

**Fix:** Check if order confirmation was already sent before sending again.

---

## Event Listeners

### WebhookReceived Event

Fired for all payment callbacks BEFORE payment status events.

**Location:** `app/Events/Payment/WebhookReceived.php`

**Used by:**
- Paysera webhooks
- Stripe webhooks
- Payrexx webhooks

### PaymentSucceeded Event

**Triggers:**
1. Updates payment status to Completed
2. Fires `OrderPaymentCompleted` event
3. Sends `OrderConfirmation` email
4. Sends `PaymentReceipt` email

**Location:** `app/Events/Payment/PaymentSucceeded.php:52-87`

---

## Testing Checklist

- [ ] Guest checkout sends to form email
- [ ] Logged-in user checkout sends to account email
- [ ] B2B checkout sends to account email
- [ ] Payment receipt includes correct payment details
- [ ] Order confirmation includes correct order details
- [ ] eSIM delivery email includes QR code
- [ ] Admin notifications are sent
- [ ] Failed payments trigger correct emails
- [ ] Refund notifications work

---

## Configuration

**Queue Worker:**
```bash
php artisan queue:work
```

**Email Configuration:** `.env`
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@merrsim.com
MAIL_FROM_NAME="${APP_NAME}"
```
