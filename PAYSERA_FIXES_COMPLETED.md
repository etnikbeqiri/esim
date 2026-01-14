# Paysera Requirements - Completed Fixes

## Requirements from Paysera Review

### ✅ 1. Company Contact Details on Website
**Requirement:** Add company name, address, and contact details (email and phone) on the website.

**Completed:**
- Added company details configuration in `config/contact.php`
- Company information now displays on the contact/tickets page
- Shows: Company name, full address, VAT number, and registration number

**Environment Variables Added:**
```env
CONTACT_COMPANY_NAME="MerrSim"
CONTACT_COMPANY_ADDRESS="Your Street Address"
CONTACT_COMPANY_CITY="Your City"
CONTACT_COMPANY_POSTAL_CODE="Postal Code"
CONTACT_COMPANY_COUNTRY="Your Country"
CONTACT_COMPANY_VAT="VAT Number"
CONTACT_COMPANY_REGISTRATION="Registration Number"
```

**Where to View:** `/tickets` page (bottom section "Get in Touch")

---

### ✅ 2. Terms and Conditions Page
**Requirement:** Add Terms and Conditions page accessible for review.

**Completed:**
- Terms of Service page already exists at `/terms`
- Contains comprehensive terms covering:
  - Service description
  - Eligibility requirements
  - Purchase and payment terms
  - eSIM delivery and activation
  - Data plans and usage
  - Refund policy summary
  - Acceptable use policy
  - Limitation of liability
  - Governing law

**Where to View:** `/terms` (link in footer under "Legal")

---

### ✅ 3. Refund Policy Page
**Requirement:** Add Refund Policy page accessible for review.

**Completed:**
- Created new dedicated Refund Policy page at `/refund`
- Comprehensive policy covering:
  - Overview of refund policy
  - Digital nature of eSIM products
  - **Refund Eligible Cases:**
    - Technical failure (system doesn't deliver QR code)
    - Incorrect product delivered
    - Defective eSIM (can't activate due to our error)
    - Duplicate charges
  - **Non-Refundable Cases:**
    - Changed mind after QR code viewed
    - Incompatible device
    - Used/activated eSIM
    - Wrong country purchased
    - Network-locked device
    - After QR code accessed
  - 24-hour refund request timeframe
  - Step-by-step refund request process
  - Partial refund conditions
  - 5-7 business day processing time
  - Contact information for support

**Where to View:** `/refund` (link in footer under "Legal")

---

### ⚠️ 4. Remove Test Payments
**Requirement:** Remove test payments from website for integration verification.

**Action Required:**
- Switch from Paysera test mode to production mode
- Update `.env` file:
  ```env
  PAYSERA_ENVIRONMENT=production  # Change from 'sandbox'
  PAYSERA_PROJECT_ID=your_live_project_id
  PAYSERA_SIGN_PASSWORD=your_live_sign_password
  ```
- Test the payment flow with real (small amount) transaction
- Verify order creation and eSIM delivery workflow

---

### 📋 5. Technical Integration Review
**Requirement:** Present technical integration before submitting project for review.

**Current Implementation:**
- ✅ Paysera Checkout integration complete
- ✅ Payment webhook handling implemented
- ✅ Order status tracking (pending, processing, completed, failed)
- ✅ Automated eSIM delivery after successful payment
- ✅ Email notifications with QR codes
- ✅ Customer dashboard with order history
- ✅ Refund handling capability

**Integration Details:**
- Framework: Laravel 11
- Payment Provider: Paysera Checkout
- Payment Flow:
  1. Customer selects eSIM package
  2. Checkout page with Paysera payment options
  3. Redirect to Paysera payment gateway
  4. Webhook receives payment confirmation
  5. Order processed automatically
  6. eSIM QR code delivered via email + dashboard
- Webhook endpoint: `/api/payments/paysera/callback`
- Supported payment methods: Credit cards, bank transfers (via Paysera)

---

## Approval Process Notes

### Phase 1: Paysera Checkout Review
- Focus on integration implementation
- Verify payment flow and webhook handling
- Check order processing automation

### Phase 2: Card Payment Review (e-COMM Department)
- Higher-level approval for VISA, Mastercard, Apple Pay, Google Pay
- Not guaranteed approval
- May require additional documentation or changes
- Will be notified if approved to proceed with implementation

---

## Pages to Show Paysera for Review

1. **Homepage:** https://yoursite.com/
2. **Destinations:** https://yoursite.com/destinations
3. **Package Selection:** https://yoursite.com/destinations/{country}
4. **Checkout Page:** https://yoursite.com/checkout (with test order)
5. **Terms of Service:** https://yoursite.com/terms
6. **Refund Policy:** https://yoursite.com/refund
7. **Privacy Policy:** https://yoursite.com/privacy
8. **Contact Page:** https://yoursite.com/tickets (shows company details)

---

## Files Modified

### Configuration
- `config/contact.php` - Added company details fields

### Routes
- `routes/web.php` - Added `/refund` route

### Pages Created/Modified
- `resources/js/pages/public/refund.tsx` - New refund policy page
- `resources/js/pages/public/tickets/index.tsx` - Added company details display

### Layouts
- `resources/js/layouts/guest-layout.tsx` - Added refund policy link to footer

### Translations (English only - needs DE/SQ)
- `lang/en/messages.php` - Added refund_page translations and footer link

### Type Definitions
- `resources/js/types/index.d.ts` - Added company fields to ContactInfo interface

### Middleware
- `app/Http/Middleware/HandleInertiaRequests.php` - Share company details globally

---

## Next Steps

1. **Add company details to `.env`:**
   ```env
   CONTACT_COMPANY_NAME="MerrSim"
   CONTACT_COMPANY_ADDRESS="Your Company Address"
   CONTACT_COMPANY_CITY="Your City"
   CONTACT_COMPANY_POSTAL_CODE="1234"
   CONTACT_COMPANY_COUNTRY="Albania"
   CONTACT_COMPANY_VAT="AL123456789"
   CONTACT_COMPANY_REGISTRATION="NUIS-123456"
   CONTACT_SUPPORT_EMAIL="support@merrsim.com"
   CONTACT_LEGAL_EMAIL="legal@merrsim.com"
   CONTACT_PHONE="+355 XX XXX XXX"
   ```

2. **Switch to production Paysera:**
   - Change `PAYSERA_ENVIRONMENT` to `production`
   - Update project ID and sign password with live credentials

3. **Add German and Albanian translations:**
   - Currently only English translations added for refund_page
   - Need to translate to German (DE) and Albanian (SQ)

4. **Test payment flow:**
   - Make a small real purchase
   - Verify webhook receives payment
   - Confirm eSIM delivery
   - Check email notifications

5. **Submit to Paysera:**
   - Inform them all changes are complete
   - Provide URLs for review
   - Wait for Phase 1 approval
   - Be ready for Phase 2 (card payments) review

---

## Questions for Paysera

If you have any questions after implementing these changes:
- Email: (their support email)
- Reference: Your project/merchant ID
- Mention: "Ready for review - all requirements completed"

---

**Date Completed:** January 14, 2026
**Status:** ✅ Ready for Paysera review (after switching to production mode)
