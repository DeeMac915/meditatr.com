import sgMail from "@sendgrid/mail";
import twilio from "twilio";

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configure Twilio
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send meditation via email
 */
const sendEmail = async (email, meditation) => {
    try {
        const msg = {
            to: email,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL,
                name: "Meditation MVP",
            },
            subject: `Your Personalized Meditation: ${meditation.title}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Personalized Meditation</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #0ea5e9;
              margin-bottom: 10px;
            }
            .title {
              font-size: 20px;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .meditation-info {
              background-color: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              color: #374151;
            }
            .audio-player {
              text-align: center;
              margin: 30px 0;
            }
            .download-btn {
              display: inline-block;
              background-color: #0ea5e9;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 10px;
            }
            .download-btn:hover {
              background-color: #0284c7;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🧘‍♀️ Meditation MVP</div>
              <h1 class="title">Your Personalized Meditation is Ready!</h1>
            </div>
            
            <div class="meditation-info">
              <h3>Meditation Details</h3>
              <div class="info-item">
                <span class="info-label">Title:</span> ${meditation.title}
              </div>
              <div class="info-item">
                <span class="info-label">Duration:</span> ${meditation.inputData.duration} minutes
              </div>
              <div class="info-item">
                <span class="info-label">Voice:</span> ${meditation.inputData.voicePreference}
              </div>
              <div class="info-item">
                <span class="info-label">Background:</span> ${meditation.inputData.backgroundAudio}
              </div>
              <div class="info-item">
                <span class="info-label">Goal:</span> ${meditation.inputData.goal}
              </div>
            </div>
            
            <div class="audio-player">
              <h3>Listen to Your Meditation</h3>
              <audio controls style="width: 100%; margin: 20px 0;">
                <source src="${meditation.audio.finalAudioUrl}" type="audio/mpeg">
                Your browser does not support the audio element.
              </audio>
              
              <div>
                <a href="${meditation.audio.finalAudioUrl}" class="download-btn" download>
                  📥 Download Meditation
                </a>
              </div>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <strong>💡 Tip:</strong> Find a quiet, comfortable space to enjoy your meditation. 
              Use headphones for the best experience.
            </div>
            
            <div class="footer">
              <p>Thank you for using Meditation MVP!</p>
              <p>This meditation was created specifically for you based on your personal needs and preferences.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
        };

        await sgMail.send(msg);
        console.log("Email sent successfully to:", email);
        return true;
    } catch (error) {
        console.error("Email sending error:", error);
        console.error("SendGrid error details:", error.response?.body);

        // Don't throw error - log it and continue
        // This allows meditation processing to complete even if email fails
        console.warn(
            "Email delivery failed but meditation was processed successfully"
        );
        return false;
    }
};

/**
 * Send meditation via SMS
 */
const sendSMS = async (phoneNumber, meditation) => {
    try {
        const message = `🧘‍♀️ Your personalized meditation "${meditation.title}" is ready! 

Listen: ${meditation.audio.finalAudioUrl}

Duration: ${meditation.inputData.duration} minutes
Voice: ${meditation.inputData.voicePreference}
Background: ${meditation.inputData.backgroundAudio}

Find a quiet space and enjoy your meditation! 

- Meditation MVP Team`;

        const sms = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });

        console.log("SMS sent successfully to:", phoneNumber);
        return sms.sid;
    } catch (error) {
        console.error("SMS sending error:", error);

        // Don't throw error - log it and continue
        // This allows meditation processing to complete even if SMS fails
        console.warn(
            "SMS delivery failed but meditation was processed successfully"
        );
        return false;
    }
};

/**
 * Send welcome email to new users
 */
const sendWelcomeEmail = async (email, name) => {
    try {
        const msg = {
            to: email,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL,
                name: "Meditation MVP",
            },
            subject: "Welcome to Meditation MVP! 🧘‍♀️",
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Meditation MVP</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #0ea5e9;
              margin-bottom: 10px;
            }
            .welcome-text {
              font-size: 18px;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .features {
              background-color: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .feature-item {
              margin-bottom: 15px;
              padding-left: 20px;
            }
            .cta-btn {
              display: inline-block;
              background-color: #0ea5e9;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
            .cta-btn:hover {
              background-color: #0284c7;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🧘‍♀️ Meditation MVP</div>
              <h1 class="welcome-text">Welcome, ${name}!</h1>
            </div>
            
            <p>Thank you for joining Meditation MVP! We're excited to help you create personalized, AI-generated meditations tailored to your specific needs.</p>
            
            <div class="features">
              <h3>What you can do:</h3>
              <div class="feature-item">✨ Create personalized meditation scripts based on your goals and challenges</div>
              <div class="feature-item">🎙️ Generate realistic voice narration using AI</div>
              <div class="feature-item">🎵 Choose from various background audio options</div>
              <div class="feature-item">📱 Receive your meditations via email and SMS</div>
              <div class="feature-item">💾 Save all your meditations in your personal library</div>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_API_URL}/create-meditation" class="cta-btn">
                Create Your First Meditation
              </a>
            </div>
            
            <div class="footer">
              <p>Ready to start your meditation journey?</p>
              <p>If you have any questions, feel free to reach out to our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
        };

        await sgMail.send(msg);
        console.log("Welcome email sent successfully to:", email);
        return true;
    } catch (error) {
        console.error("Welcome email sending error:", error);
        console.error("SendGrid error details:", error.response?.body);

        // Don't throw error - log it and continue
        console.warn("Welcome email delivery failed");
        return false;
    }
};

export { sendEmail, sendSMS, sendWelcomeEmail };
