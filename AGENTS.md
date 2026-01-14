# AGENTS.md

This document helps agents work effectively in this eSIM backend Laravel application.

## Project Overview

This is a Laravel 12 backend application with a React/TypeScript frontend using Inertia.js. It provides an eSIM sales platform supporting B2C (direct sales) and B2B (reseller) models with multiple payment gateways.

**Tech Stack:**
- Backend: Laravel 12 (PHP 8.2+)
- Frontend: React 19 + TypeScript + Inertia.js
- Testing: Pest for PHP, Vitest for JS (not configured yet)
- Build Tool: Vite
- Database: SQLite (default), MySQL/PostgreSQL supported
- Queue: Database queue
- Email: Resend
- State Management: Thunk\Verbs (event sourcing/state machines)

---

## Essential Commands

### Development
```bash
# Full development environment (server, queue, logs, vite)
composer dev

# Development with SSR
composer dev:ssr

# Individual services
php artisan serve                          # Backend server
php artisan queue:listen --tries=1        # Queue worker
php artisan pail --timeout=0               # Real-time logs
npm run dev                               # Frontend dev server
```

### Setup
```bash
# Fresh installation (installs dependencies, generates key, runs migrations, builds frontend)
composer setup
```

### Backend Testing
```bash
# Run all tests
composer test

# Run tests directly
./vendor/bin/pest

# Run specific test file
./vendor/bin/pest tests/Feature/DashboardTest.php
```

### Frontend
```bash
# Build production assets
npm run build

# Build for SSR
npm run build:ssr

# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Type checking
npm run types
```

### Code Quality
```bash
# PHP formatting (Laravel Pint)
vendor/bin/pint

# Run linters (from GitHub workflow)
vendor/bin/pint
npm run format
npm run lint
```

### Docker
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app
```

---

## Code Organization

### Backend Structure
```
app/
├── Actions/Fortify/          # Laravel Fortify authentication actions
├── Contracts/                # Interfaces (ProviderContract, PaymentGatewayContract)
├── DTOs/                     # Data Transfer Objects
├── Enums/                    # PHP 8.1 enums for type-safe constants
├── Events/                   # Event definitions (using Verbs)
│   ├── Balance/              # Balance-related events
│   ├── EsimProfile/          # eSIM profile events
│   ├── Order/                # Order lifecycle events
│   ├── Payment/              # Payment events
│   └── Sync/                 # Sync job events
├── Http/
│   ├── Controllers/
│   │   ├── Admin/           # Admin panel controllers
│   │   ├── Api/             # REST API endpoints
│   │   │   ├── V1/          # Version 1 API
│   │   │   └── Webhooks/    # Payment gateway webhooks
│   │   ├── Client/          # Customer-facing controllers
│   │   ├── Public/          # Public/guest-accessible routes
│   │   └── Settings/        # User settings (profile, password, 2FA)
│   ├── Middleware/          # Auth, role checks
│   └── Requests/            # Form request validation
├── Jobs/
│   ├── Email/               # Email queue processing
│   ├── Order/               # Order processing jobs
│   └── Sync/                # Provider sync jobs
├── Mail/                    # Email templates (TemplatedMail base class)
├── Models/                  # Eloquent models with relationships
├── Observers/               # Model observers
├── Providers/               # Service providers
├── Services/
│   ├── Payment/             # Payment gateway implementations
│   └── Providers/           # eSIM provider implementations
└── States/                  # Verbs state classes (event-sourced state)
```

### Frontend Structure
```
resources/js/
├── components/
│   ├── ui/                  # Reusable UI components (Radix-based)
│   ├── app-*.tsx            # App shell components
│   ├── country-flag.tsx     # Country flag component
│   └── [other components]
├── hooks/                   # Custom React hooks
├── layouts/                 # Inertia layouts
├── pages/                   # Inertia pages (grouped by route)
│   ├── admin/
│   ├── auth/
│   ├── client/
│   ├── public/
│   └── settings/
├── routes/                  # Route definitions (auto-imported via Wayfinder)
├── lib/                     # Utility functions
└── app.tsx                  # Entry point
```

---

## Code Patterns & Conventions

### Backend

#### Models
- Use UUIDs for route keys: `public function getRouteKeyName(): string { return 'uuid'; }`
- Define `$fillable` and `$hidden` explicitly
- Use PHP 8.1 enums in `casts()` method for type safety
- Use static `booted()` for model events (creating, updating, etc.)
- Define scopes for common queries (e.g., `scopePending()`)
- Use relationships with explicit return types

Example:
```php
protected function casts(): array
{
    return [
        'status' => OrderStatus::class,
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'completed_at' => 'datetime',
    ];
}
```

#### Enums
- Use PHP 8.1 backed enums with string values
- Include methods for common logic:
  - `label()`: Localized label via `trans()`
  - `color()`: UI color mapping
  - `canTransitionTo()`: State transition validation
  - `isTerminal()`, `canRetry()`: Status checks

Example:
```php
public function label(): string
{
    return trans('messages.statuses.' . $this->value);
}

public function canTransitionTo(self $new): bool
{
    return match ($this) {
        self::Pending => in_array($new, [self::AwaitingPayment, self::Processing]),
        default => false,
    };
}
```

#### State Machines (Verbs)
- Event sourcing using `hirethunk/verbs`
- State classes in `app/States/` extend `Thunk\Verbs\State`
- Events fire state changes via static methods:
  - `EventName::commit()`: Fire event (not during replay)
  - `EventName::fire()`: Always fire (even during replay)
- Use `Verbs::unlessReplaying()` for side effects in events

Example:
```php
// In event handler
Verbs::unlessReplaying(function () use ($state) {
    // Side effects (send emails, dispatch jobs) go here
    // Won't run during state replay
});
```

#### Controllers
- Return Inertia responses for frontend pages
- Use `->with()` for eager loading relationships
- Transform data using `->through()` for API responses
- Hide sensitive data from responses

Example:
```php
$orders = Order::with(['package', 'esimProfile'])
    ->latest()
    ->paginate(15)
    ->through(fn($order) => [
        'uuid' => $order->uuid,
        'order_number' => $order->order_number,
        'status' => $order->status->value,
        'status_label' => $order->status->label(),
    ]);

return Inertia::render('client/orders/index', [
    'orders' => $orders,
]);
```

#### Jobs
- Implement `ShouldQueue` and use standard job traits
- Set `$tries`, `$timeout`, `$maxExceptions` appropriately
- Use logging extensively with context
- Handle failures gracefully with retry logic

Example:
```php
public int $tries = 1;
public int $timeout = 120;
public int $maxExceptions = 1;

public function handle(ProviderFactory $providerFactory): void
{
    try {
        // Job logic
    } catch (\Exception $e) {
        Log::error('Job failed', ['order_id' => $this->orderId, 'error' => $e->getMessage()]);
    }
}
```

#### Services
- Use service classes for complex business logic
- Implement contracts for swappable implementations
- Use factory pattern for gateway/provider selection

Example:
```php
public function make(PaymentProvider $provider): PaymentGatewayContract
{
    return match ($provider) {
        PaymentProvider::Stripe => app(StripeGateway::class),
        PaymentProvider::Payrexx => app(PayrexxGateway::class),
        PaymentProvider::Balance => app(BalanceGateway::class),
    };
}
```

### Frontend

#### Components
- Functional components with TypeScript
- Interface definitions for props
- Use `useTrans()` hook for translations
- Use Inertia `Link` for navigation
- Tailwind CSS for styling with custom design tokens

Example:
```typescript
interface DestinationCardProps {
    id: number;
    name: string;
    iso_code: string;
    package_count: number;
    min_price: number | null;
}

export function DestinationCard({ name, iso_code, package_count, min_price }: DestinationCardProps) {
    const { trans } = useTrans();

    return (
        <Link href={`/destinations/${iso_code.toLowerCase()}`}>
            {/* Component content */}
        </Link>
    );
}
```

#### Type Safety
- All components must have TypeScript interfaces for props
- Use strict mode in `tsconfig.json`
- Import types from `@inertiajs/react` for Inertia-specific types

#### Styling
- Tailwind CSS v4 via Vite plugin
- Custom color scheme: `primary-*`, `accent-*` (gold)
- Responsive design with mobile-first approach
- Use Radix UI primitives for accessibility

---

## Routing

### Web Routes (Inertia)
- Routes defined in `routes/web.php`
- Grouped by middleware and prefix:
  - Public: No authentication required
  - `auth` + `verified`: Authenticated users
  - `client.*`: Customer dashboard
  - `admin.*`: Admin panel (protected by `admin` middleware)
  - `b2b`: B2B-specific routes

### API Routes
- Prefix `/api/v1` in `routes/api.php`
- `auth:sanctum` middleware for authenticated endpoints
- Public endpoints for packages, countries
- Separate webhook routes (no auth)

### Route Key Names
- Most models use UUIDs: `getRouteKeyName()` returns `'uuid'`
- Route model binding: `Route::get('orders/{order}', ...)`
- Explicit parameter for non-UUID models: `Route::get('articles/{article:id}', ...)`

---

## Authentication & Authorization

### Middleware
- `auth`: Standard Laravel authentication
- `verified`: Email verification required
- `admin`: `EnsureUserIsAdmin` - restricts to admins
- `b2b`: `EnsureUserIsB2B` - restricts to B2B customers

### User Roles
- **Admin**: Can access admin panel, manage all resources
- **B2B Customer**: Reseller with balance system, invoices
- **B2C Customer**: Regular customer, pays via payment gateways

### Impersonation
- Admins can impersonate customers
- Middleware handles session management
- Stop impersonation via `POST /stop-impersonating`

---

## Testing

### Pest Configuration
- Located in `tests/Pest.php`
- Feature tests use `RefreshDatabase` trait
- Test files in `tests/Feature/` and `tests/Unit/`

### Test Patterns
- Use Pest's expressive syntax: `test('description', function () { ... })`
- Use `actingAs()` for authenticated users
- Chain assertions for clarity

Example:
```php
test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());
    $this->get(route('dashboard'))->assertOk();
});
```

---

## Payment System

### Supported Gateways
- Stripe (`App\Services\Payment\StripeGateway`)
- Payrexx (`App\Services\Payment\PayrexxGateway`)
- Paysera (`App\Services\Payment\PayseraGateway`)
- Balance (`App\Services\Payment\BalanceGateway` - B2B only)

### Payment Flow
1. User initiates checkout
2. `CheckoutService` creates order and payment records
3. Redirect to payment gateway
4. Webhook receives callback
5. Webhook controller fires `PaymentSucceeded` or `PaymentFailed` event
6. Events update state and trigger downstream actions (emails, provider purchase)

### Webhooks
- Located in `app/Http/Controllers/Api/Webhooks/`
- No authentication (verify signature inside)
- Route prefixes: `/api/v1/webhooks/{gateway}`

---

## Email System

### Architecture
- Event-driven: Events → `EmailService` → `EmailQueue` → `SendQueuedEmail` job
- Email templates in `resources/views/emails/`
- Use Resend for delivery (configurable via `.env`)

### Critical Gotcha: Email Priority
**Current issue:** Email service prioritizes `$order->customer_email` over `$order->payment->customer_email`.

**Correct priority:**
```php
$email = $order->payment?->customer_email
    ?? $order->customer_email
    ?? $order->customer?->user?->email;
```

See `EMAIL_SYSTEM_DOCUMENTATION.md` for detailed analysis.

---

## Provider Integration

### eSIM Providers
- Base provider contract: `App\Contracts\ProviderContract`
- Implementations in `app/Services/Providers/`
- Currently: `SmsPoolProvider`

### Provider Factory
- `App\Providers\ProviderFactory` creates provider instances
- Sync jobs in `app/Jobs/Sync/` handle data synchronization
- Stock checks, package fetching, pricing updates

---

## Important Gotchas

### State Machine Replay
- Events fire multiple times during state replay
- Use `Verbs::unlessReplaying()` for side effects (emails, API calls)
- Never perform side effects outside this wrapper in event handlers

### UUID Route Keys
- Most models use UUIDs but `id` is still auto-increment integer
- Always use `uuid` in route bindings
- Check `getRouteKeyName()` in models

### Payment Email Priority
- Payment records have their own `customer_email` field
- This should be prioritized over order `customer_email`
- See `EMAIL_SYSTEM_DOCUMENTATION.md` for details

### Queue Processing
- Jobs must be idempotent (handle being run multiple times)
- Use `Verbs::unlessReplaying()` in event handlers to prevent duplicate side effects
- Check for terminal states before processing (e.g., order already completed)

### Localization
- All user-facing strings use `trans()` or `__()` helpers
- Language files in `lang/{locale}/messages.php`
- Frontend uses `useTrans()` hook
- Supported locales: `en`, `de`, `sq` (Albanian)

### B2B vs B2C
- B2B customers use balance for payments (no external gateway)
- B2B customers get invoices, have balance management
- B2C customers pay via external gateways, get payment receipts
- Check `$customer->isB2B()` to determine type

### Two-Factor Authentication
- Laravel Fortify handles 2FA
- Two-factor routes in `routes/two-factor.php`
- Verification routes in `routes/verification.php`

### SSR (Server-Side Rendering)
- SSR entry point: `resources/js/ssr.tsx`
- Enabled with `composer dev:ssr` or `php artisan inertia:start-ssr`
- Requires additional build step: `npm run build:ssr`

---

## Environment Configuration

### Key Environment Variables
```bash
# Database
DB_CONNECTION=sqlite

# Payment Gateways
PAYMENT_PROVIDER=stripe
STRIPE_SECRET=...
PAYREXX_PAYMENT_PROVIDER_SECRET=...
PAYSERA_PROJECT_ID=...
PAYSERA_PASSWORD=...

# Email
MAIL_MAILER=resend
RESEND_API_KEY=...
ADMIN_EMAIL=admin@example.com

# Invoice Settings (B2B)
INVOICE_COMPANY_NAME="Company Name"
INVOICE_VAT_NUMBER=...
```

### Testing Environment
- PHPUnit config in `phpunit.xml`
- Uses in-memory SQLite for tests
- Queues set to sync mode
- All cache/drivers use array for isolation

---

## Dependencies

### Composer (PHP)
- `laravel/framework`: ^12.0
- `inertiajs/inertia-laravel`: ^2.0
- `laravel/fortify`: ^1.30
- `laravel/sanctum`: ^4.2
- `hirethunk/verbs`: ^0.7.0 (event sourcing)
- `dedoc/scramble`: ^0.13.8 (API documentation)
- `payrexx/payrexx`, `stripe/stripe-php`, `resend/resend-laravel`

### NPM (Frontend)
- `react`: ^19.2.0
- `@inertiajs/react`: ^2.1.4
- `@radix-ui/*`: UI component library
- `@tiptap/*`: Rich text editor
- `lucide-react`: Icons
- `tailwindcss`: ^4.0.0
- `vite`: ^7.0.4

---

## Code Quality Tools

### PHP
- **Laravel Pint**: Auto-formatting (`vendor/bin/pint`)
- **Pest PHP**: Testing framework (`./vendor/bin/pest`)

### JavaScript/TypeScript
- **ESLint**: Linting (`npm run lint`)
- **Prettier**: Formatting (`npm run format`)
  - Configured with Tailwind CSS plugin
  - Organizes imports automatically
- **TypeScript**: Type checking (`npm run types`)

---

## Deployment

### Docker
- `Dockerfile` uses production PHP configuration
- `docker-compose.yml` defines app service on port 6698
- Uses external shared network
- Volumes for storage and logs

### Build Process
```bash
# Production build
npm run build

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Optimize
php artisan optimize
php artisan config:cache
php artisan route:cache
```

---

## API Documentation

- Scramble API docs available at `/docs/api` (in production/scramble enabled)
- Route definitions auto-documented via Scramble
- Webhook endpoints documented in code

---

## Common Tasks

### Adding a New Payment Gateway
1. Create enum value in `PaymentProvider`
2. Implement `PaymentGatewayContract` in `app/Services/Payment/`
3. Add to `PaymentGatewayFactory::make()` match statement
4. Create webhook controller in `app/Http/Controllers/Api/Webhooks/`
5. Add route in `routes/api.php` webhook section
6. Update `.env.example` with required credentials

### Adding a New Email Template
1. Create blade template in `resources/views/emails/`
2. Add enum value to `EmailTemplate` (if not exists)
3. Add method in `EmailService` for queueing
4. Add data builder method in `SendQueuedEmail` job
5. Call from appropriate event handler with `Verbs::unlessReplaying()`

### Creating a New Inertia Page
1. Create page component in `resources/js/pages/{category}/{page}.tsx`
2. Add route in appropriate routes file (`routes/web.php` or sub-file)
3. Wayfinder auto-imports route helpers

### Adding a New eSIM Provider
1. Implement `ProviderContract` in `app/Services/Providers/`
2. Add to `ProviderFactory` match statement
3. Create sync jobs as needed in `app/Jobs/Sync/`

---

## File Naming Conventions

### Backend
- Models: PascalCase, singular (`Order.php`)
- Controllers: PascalCase, singular (`OrderController.php`)
- Events: PascalCase, singular (`OrderCreated.php`)
- Jobs: PascalCase, singular (`ProcessProviderPurchase.php`)
- Services: PascalCase, singular (`PaymentGatewayFactory.php`)
- Enums: PascalCase, singular (`OrderStatus.php`)
- States: PascalCase, singular with "State" suffix (`OrderState.php`)

### Frontend
- Components: kebab-case.tsx (`destination-card.tsx`)
- Pages: kebab-case.tsx (`orders/index.tsx`)
- Hooks: camel-case.ts (`use-trans.ts`)
- Layouts: kebab-case.tsx (`app-sidebar-layout.tsx`)

---

## Database Migrations

- Timestamp prefix format: `YYYY_MM_DD_HHMMSS_description.php`
- Use `unsignedBigInteger` for foreign keys
- Index frequently queried columns
- Use `foreignIdFor()` for type-safe foreign keys

---

## Error Handling

- Use `Log::error()`, `Log::warning()` with context arrays
- Custom exceptions for specific domain errors
- Validation via Form Request classes
- HTTP status codes:
  - 200/201: Success
  - 400: Validation errors
  - 401: Unauthenticated
  - 403: Unauthorized (permission denied)
  - 404: Not found
  - 422: Unprocessable entity
  - 500: Server error

---

## Security Considerations

- Never log sensitive data (passwords, API keys, payment details)
- Use Laravel's built-in encryption for sensitive config values
- Validate all user inputs via Form Requests
- Use `$hidden` in models to exclude sensitive fields from API responses
- Payment webhook signatures verified inside controllers
- CSRF protection enabled for web routes
- Rate limiting on API endpoints (configure as needed)
