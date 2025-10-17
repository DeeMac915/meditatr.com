# Payment Integration Setup

## Required Environment Variables

Add these to your `server/.env` file:

### Stripe Configuration

```env
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

### PayPal Configuration

```env
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

### Frontend URLs

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

### 1. Stripe Setup

1. **Create a Stripe Account**: Go to [stripe.com](https://stripe.com)
2. **Get API Keys**:
    - Dashboard → Developers → API Keys
    - Copy the **Publishable key** (starts with `pk_test_`)
    - Copy the **Secret key** (starts with `sk_test_`)
3. **Add to .env**:
    ```env
    STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
    ```

### 2. PayPal Setup

1. **Create PayPal Developer Account**: Go to [developer.paypal.com](https://developer.paypal.com)
2. **Create App**:
    - Dashboard → My Apps & Credentials
    - Create App → Select "Default Application"
    - Copy **Client ID** and **Client Secret**
3. **Add to .env**:
    ```env
    PAYPAL_CLIENT_ID=your_actual_client_id
    PAYPAL_CLIENT_SECRET=your_actual_client_secret
    ```

### 3. Test Payments

#### Stripe Test Cards

-   **Success**: `4242 4242 4242 4242`
-   **Declined**: `4000 0000 0000 0002`
-   **Requires 3D Secure**: `4000 0025 0000 3155`
-   Use any future expiry date and any 3-digit CVC

#### PayPal Test

-   PayPal sandbox will redirect to a test PayPal page
-   Use test buyer accounts provided in PayPal Developer Dashboard

## Features Implemented

### Stripe Integration

-   ✅ Real Stripe Elements card form
-   ✅ Secure payment processing
-   ✅ Payment intent creation and confirmation
-   ✅ Error handling and user feedback

### PayPal Integration

-   ✅ Real PayPal redirect flow
-   ✅ Payment creation and execution
-   ✅ Success and cancel pages
-   ✅ Secure payment confirmation

### Security Features

-   ✅ Server-side payment validation
-   ✅ User authentication required
-   ✅ Payment status tracking
-   ✅ Secure API endpoints

## Testing

1. **Start your servers**:

    ```bash
    npm run dev  # Root directory
    ```

2. **Create a meditation** and proceed to payment

3. **Test Stripe**:

    - Select "Credit/Debit Card"
    - Use test card: `4242 4242 4242 4242`
    - Complete payment

4. **Test PayPal**:
    - Select "PayPal"
    - Click "Pay with PayPal"
    - Complete payment on PayPal site

## Production Deployment

### Stripe Production

-   Replace test keys with live keys from Stripe Dashboard
-   Update `NODE_ENV=production`

### PayPal Production

-   Switch PayPal app to "Live" mode
-   Update credentials in production environment

### Security Checklist

-   ✅ HTTPS enabled
-   ✅ Environment variables secured
-   ✅ Payment validation on server
-   ✅ User authentication required
-   ✅ Error handling implemented
