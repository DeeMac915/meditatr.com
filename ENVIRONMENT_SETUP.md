# Environment Setup Guide

## 🔧 **Required Environment Variables**

Create a `.env` file in the `server` directory with the following variables:

### **Core Application**

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/meditation-mvp

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **AWS S3 (Required for Audio Storage)**

```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

### **ElevenLabs (Required for Voice Generation)**

```bash
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

### **Payment Gateways (Optional - for real payments)**

```bash
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

### **Communication Services (Optional)**

```bash
# SendGrid (Email)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=your-verified-email@domain.com

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🚀 **Quick Start (Minimal Setup)**

For basic functionality, you only need:

```bash
# server/.env
MONGODB_URI=mongodb://localhost:27017/meditation-mvp
JWT_SECRET=your-super-secret-jwt-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

**Note:** Email and SMS delivery will be automatically skipped if not configured.

## 📧 **SendGrid Setup (Optional)**

1. **Sign up at SendGrid** → https://sendgrid.com/
2. **Get API Key** → Settings → API Keys → Create API Key
3. **Verify Sender Identity** → Settings → Sender Authentication → Verify a Single Sender
4. **Add your email** and verify it
5. **Set in .env:**
    ```bash
    SENDGRID_API_KEY=SG.your-api-key-here
    SENDGRID_FROM_EMAIL=your-verified-email@domain.com
    ```

## 📱 **Twilio Setup (Optional)**

1. **Sign up at Twilio** → https://www.twilio.com/
2. **Get credentials** from Console Dashboard
3. **Buy a phone number** for SMS
4. **Set in .env:**
    ```bash
    TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    TWILIO_AUTH_TOKEN=your-auth-token
    TWILIO_PHONE_NUMBER=+1234567890
    ```

## 💳 **Payment Setup (Optional)**

### **Stripe:**

1. **Sign up at Stripe** → https://stripe.com/
2. **Get API keys** from Dashboard → Developers → API Keys
3. **Set in .env:**
    ```bash
    STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_SECRET_KEY=sk_test_...
    ```

### **PayPal:**

1. **Sign up at PayPal Developer** → https://developer.paypal.com/
2. **Create app** and get credentials
3. **Set in .env:**
    ```bash
    PAYPAL_CLIENT_ID=your-client-id
    PAYPAL_CLIENT_SECRET=your-client-secret
    ```

## ✅ **Testing the Setup**

1. **Start the server:**

    ```bash
    cd server
    npm start
    ```

2. **Start the client:**

    ```bash
    cd client
    npm run dev
    ```

3. **Check logs** for any missing environment variables
4. **Create a meditation** to test the full flow

## 🛠️ **Troubleshooting**

### **SendGrid "Forbidden" Error:**

-   ✅ Verify your sender email in SendGrid dashboard
-   ✅ Check that `SENDGRID_FROM_EMAIL` matches verified email
-   ✅ Ensure API key has "Mail Send" permissions

### **Twilio SMS Errors:**

-   ✅ Verify phone number is purchased and active
-   ✅ Check account balance
-   ✅ Ensure phone number format includes country code (+1)

### **AWS S3 Errors:**

-   ✅ Verify IAM user has `s3:PutObject` and `s3:GetObject` permissions
-   ✅ Check bucket exists and is accessible
-   ✅ Verify region matches your bucket region

### **ElevenLabs Errors:**

-   ✅ Check API key is valid and has credits
-   ✅ Verify voice ID exists
-   ✅ Check rate limits

## 📝 **Notes**

-   **All services are optional** except AWS S3 and ElevenLabs
-   **Email/SMS will be skipped** if not configured
-   **Payments work in test mode** without real API keys
-   **Use test credentials** for development
-   **Never commit .env file** to version control
