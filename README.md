# For the better communication

Hello, how are you?

Can we keep the communication via Microsoft Teams, Discord, Telegram, Email and so on?
I'm sure it would be more convenient for the future development.

Here is my contact info.

-   Microsoft Teams: https://teams.live.com/l/invite/FEAPNqm1GingmetOwQ?v=g1
-   Discord: angeldev_79815
-   Telegram: @afoxtech
-   Email: afox.tech999@gmail.com

Could you please send me a DM?
I look forward to hearing from you soon.
Thanks!

# Meditation MVP - AI-Created Guided Meditation Platform

A full-stack web application that allows users to create deeply personalized guided meditations using AI. Users submit detailed inputs describing their mental and emotional needs, and the platform generates tailored meditation scripts, converts them to realistic audio using ElevenLabs, overlays calming background music, and delivers the final audio via email, SMS, and in-browser playback.

## 🚀 Features

### Core MVP Features

-   **User Account System**: Sign-up/login with email & password using Firebase Auth
-   **Detailed Meditation Input Form**: Collect goal, mood, challenges, affirmations, duration, voice preference, and background audio
-   **AI Script Generation**: OpenAI GPT API generates tailored meditation scripts
-   **Script Editing & AI Rewrite**: Users can edit scripts with AI-powered rewrite options
-   **Voice Generation**: ElevenLabs for ultra-realistic voice generation
-   **Background Audio**: Multiple calming sound options (nature, ocean, 528 Hz, etc.)
-   **Audio Mixing**: FFMPEG to mix TTS voice with background tracks
-   **Multi-Channel Delivery**: Email (SendGrid), SMS (Twilio), and in-browser playback
-   **Meditation Library**: Save and replay all meditations
-   **Pay-Per-Meditation**: Stripe and PayPal integration ($4.99 per meditation)
-   **Admin Dashboard**: Track usage, delivery stats, API usage, and payments

## 🛠 Technology Stack

### Frontend

-   **Framework**: Next.js 14 with App Router
-   **Styling**: Tailwind CSS
-   **UI Components**: Lucide React icons
-   **State Management**: React Context API
-   **Authentication**: Firebase Auth
-   **HTTP Client**: Axios
-   **Notifications**: React Hot Toast

### Backend

-   **Runtime**: Node.js with Express
-   **Database**: MongoDB with Mongoose
-   **Authentication**: Firebase Admin SDK
-   **AI Script Generation**: OpenAI GPT-4 API
-   **Voice Generation**: ElevenLabs API
-   **Audio Processing**: FFMPEG
-   **Email Delivery**: SendGrid
-   **SMS Delivery**: Twilio
-   **Payments**: Stripe & PayPal
-   **File Storage**: AWS S3
-   **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
meditation-mvp/
├── client/                 # Next.js frontend
│   ├── app/               # App Router pages
│   │   ├── auth/         # Authentication pages
│   │   ├── create/       # Meditation creation
│   │   ├── dashboard/    # User dashboard
│   │   └── meditation/   # Meditation management
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts
│   ├── lib/             # Utilities and configs
│   └── styles/          # Global styles
├── server/              # Express backend
│   ├── config/         # Database and service configs
│   ├── middleware/     # Custom middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   └── services/       # Business logic services
└── package.json        # Root package.json
```

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   MongoDB
-   Firebase project
-   OpenAI API key
-   ElevenLabs API key
-   Stripe account
-   PayPal account
-   SendGrid account
-   Twilio account
-   AWS S3 bucket

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd meditation-mvp
    ```

2. **Install dependencies**

    ```bash
    npm run install-all
    ```

3. **Environment Setup**

    ```bash
    cp env.example .env
    ```

    Fill in your environment variables in `.env`:

    ```env
    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

    # Server Configuration
    NEXT_PUBLIC_API_URL=http://localhost:5000
    SERVER_PORT=5000

    # OpenAI Configuration
    OPENAI_API_KEY=your_openai_api_key

    # ElevenLabs Configuration
    ELEVENLABS_API_KEY=your_elevenlabs_api_key

    # Stripe Configuration
    STRIPE_SECRET_KEY=your_stripe_secret_key
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

    # PayPal Configuration
    PAYPAL_CLIENT_ID=your_paypal_client_id
    PAYPAL_CLIENT_SECRET=your_paypal_client_secret

    # SendGrid Configuration
    SENDGRID_API_KEY=your_sendgrid_api_key
    SENDGRID_FROM_EMAIL=noreply@yourdomain.com

    # Twilio Configuration
    TWILIO_ACCOUNT_SID=your_twilio_account_sid
    TWILIO_AUTH_TOKEN=your_twilio_auth_token
    TWILIO_PHONE_NUMBER=your_twilio_phone_number

    # AWS Configuration
    AWS_ACCESS_KEY_ID=your_aws_access_key
    AWS_SECRET_ACCESS_KEY=your_aws_secret_key
    AWS_REGION=us-east-1
    AWS_S3_BUCKET=your_meditation_bucket

    # MongoDB Configuration
    MONGODB_URI=mongodb://localhost:27017/meditation_mvp

    # JWT Secret
    JWT_SECRET=your_jwt_secret_key
    ```

4. **Start the development servers**

    ```bash
    npm run dev
    ```

    This will start:

    - Frontend: http://localhost:3000
    - Backend: http://localhost:5000

## 🔧 API Endpoints

### Authentication

-   `POST /api/auth/sync` - Sync user with backend
-   `GET /api/auth/profile` - Get user profile
-   `PUT /api/auth/profile` - Update user profile

### Meditations

-   `POST /api/meditation/generate-script` - Generate AI meditation script
-   `PUT /api/meditation/:id/script` - Update meditation script
-   `POST /api/meditation/:id/rewrite` - Rewrite script with AI
-   `POST /api/meditation/:id/process` - Process meditation (voice + audio)
-   `GET /api/meditation` - Get user's meditations
-   `GET /api/meditation/:id` - Get single meditation

### Payments

-   `POST /api/payment/stripe/create-intent` - Create Stripe payment intent
-   `POST /api/payment/stripe/confirm` - Confirm Stripe payment
-   `POST /api/payment/paypal/create` - Create PayPal payment
-   `POST /api/payment/paypal/execute` - Execute PayPal payment
-   `GET /api/payment/history` - Get payment history

### Admin

-   `GET /api/admin/dashboard` - Get dashboard statistics
-   `GET /api/admin/users` - Get all users
-   `GET /api/admin/meditations` - Get all meditations
-   `GET /api/admin/payments` - Get all payments

## 🎯 User Flow

1. **Sign Up/Login**: User creates account or signs in
2. **Create Meditation**: Fill out detailed form with goals, mood, challenges, etc.
3. **AI Script Generation**: System generates personalized meditation script
4. **Edit & Customize**: User can edit script or request AI rewrites
5. **Payment**: Pay $4.99 for meditation processing
6. **Audio Generation**: Script converted to voice using ElevenLabs
7. **Audio Mixing**: Voice mixed with selected background audio
8. **Delivery**: Final audio sent via email, SMS, and available in browser
9. **Library**: Meditation saved to user's personal library

## 🔐 Security Features

-   Firebase Authentication for secure user management
-   JWT token validation
-   Rate limiting to prevent abuse
-   CORS protection
-   Helmet for security headers
-   Input validation and sanitization
-   Secure payment processing with Stripe/PayPal

## 📱 Responsive Design

-   Mobile-first approach
-   Responsive navigation
-   Touch-friendly interfaces
-   Optimized for all device sizes

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (AWS/Heroku)

1. Set up MongoDB Atlas for production database
2. Configure environment variables
3. Deploy to your preferred hosting platform

## 📊 Monitoring & Analytics

-   Admin dashboard for usage tracking
-   Payment analytics
-   User engagement metrics
-   API usage monitoring
-   Error tracking and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

© 2025 Eco Tek Pty Ltd. All rights reserved.

This project is proprietary software developed under contract. All intellectual property rights, including but not limited to the source code, design, and documentation, are owned exclusively by Eco Tek Pty Ltd.

No part of this project may be copied, modified, distributed, or used for any purpose without prior written permission from Eco Tek Pty Ltd.

Third-party libraries and frameworks used in this project remain subject to their original open-source licenses.

---

**Built with ❤️ for better mental wellness**
