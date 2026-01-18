import nodemailer from 'nodemailer';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { otpVerifications } from '@/lib/db/schema';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'UrjaSync'}" <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  static async sendOTP(email: string, otp: string, usage: 'registration' | 'password_reset' | 'email_verification'): Promise<void> {
    const subject = this.getOTPEmailSubject(usage);
    const html = this.getOTPEmailTemplate(otp, usage);
    
    await this.sendEmail(email, subject, html);
  }

  private static getOTPEmailSubject(usage: string): string {
    switch (usage) {
      case 'registration':
        return 'UrjaSync - Verify Your Email Address';
      case 'password_reset':
        return 'UrjaSync - Reset Your Password';
      case 'email_verification':
        return 'UrjaSync - Email Verification';
      default:
        return 'UrjaSync - Verification Code';
    }
  }

  private static getOTPEmailTemplate(otp: string, usage: string): string {
    const title = this.getOTPTitle(usage);
    const instructions = this.getOTPInstructions(usage);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UrjaSync Verification</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 40px 30px;
            border-radius: 0 0 10px 10px;
          }
          .otp {
            background: #fff;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 5px;
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚡ UrjaSync</h1>
          <p>Smart Home Energy Management</p>
        </div>
        
        <div class="content">
          <h2>${title}</h2>
          <p>${instructions}</p>
          
          <div class="otp">
            <p>Your verification code is:</p>
            <div class="otp-code">${otp}</div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            • This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes<br>
            • Never share this code with anyone<br>
            • UrjaSync will never ask for your password via email
          </div>
          
          <p>If you didn't request this code, please ignore this email or contact our support team.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 UrjaSync. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
  }

  private static getOTPTitle(usage: string): string {
    switch (usage) {
      case 'registration':
        return 'Welcome to UrjaSync! 🎉';
      case 'password_reset':
        return 'Password Reset Request';
      case 'email_verification':
        return 'Email Verification';
      default:
        return 'Verification Required';
    }
  }

  private static getOTPInstructions(usage: string): string {
    switch (usage) {
      case 'registration':
        return 'Thank you for signing up! Please use the verification code below to complete your registration and start managing your smart home energy.';
      case 'password_reset':
        return 'We received a request to reset your password. Use the verification code below to proceed with creating a new password.';
      case 'email_verification':
        return 'Please use the verification code below to verify your email address and secure your account.';
      default:
        return 'Please use the verification code below to proceed.';
    }
  }

  static async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to UrjaSync</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 40px 30px;
            border-radius: 0 0 10px 10px;
          }
          .feature {
            background: #fff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 15px 0;
            border-radius: 0 5px 5px 0;
          }
          .cta-button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚡ Welcome to UrjaSync!</h1>
          <p>Smart Home Energy Management</p>
        </div>
        
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>Welcome aboard! We're excited to have you join our community of smart home energy enthusiasts.</p>
          
          <h3>🚀 Get Started with UrjaSync:</h3>
          
          <div class="feature">
            <h4>📊 Energy Monitoring</h4>
            <p>Track your real-time energy consumption and identify opportunities to save.</p>
          </div>
          
          <div class="feature">
            <h4>🏠 Smart Appliance Control</h4>
            <p>Control and automate all your smart appliances from one central dashboard.</p>
          </div>
          
          <div class="feature">
            <h4>💰 Cost Optimization</h4>
            <p>Take advantage of time-of-day tariffs and reduce your energy bills.</p>
          </div>
          
          <div class="feature">
            <h4>🔄 Microgrid Integration</h4>
            <p>Connect with your local microgrid community and share energy resources.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="cta-button">
              Go to Dashboard
            </a>
          </div>
          
          <p>Need help? Check out our <a href="#">help center</a> or contact our support team.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 UrjaSync. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
    
    await this.sendEmail(email, 'Welcome to UrjaSync! 🎉', html);
  }
}

export class OTPService {
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async createOTP(email: string, usage: 'registration' | 'password_reset' | 'email_verification'): Promise<string> {
    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(process.env.OTP_EXPIRY_MINUTES || '10'));

    // Delete any existing OTP for this email and usage
    await db
      .delete(otpVerifications)
      .where(eq(otpVerifications.email, email));

    // Create new OTP
    await db.insert(otpVerifications).values({
      email,
      otp,
      usage,
      expiresAt,
    });

    return otp;
  }

  static async verifyOTP(email: string, otp: string, usage: 'registration' | 'password_reset' | 'email_verification'): Promise<boolean> {
    const [record] = await db
      .select()
      .from(otpVerifications)
      .where(eq(otpVerifications.email, email))
      .limit(1);

    if (!record) {
      return false;
    }

    // Check if OTP is expired
    if (record.expiresAt < new Date()) {
      return false;
    }

    // Check if OTP is already used
    if (record.isUsed) {
      return false;
    }

    // Check if usage matches
    if (record.usage !== usage) {
      return false;
    }

    // Check if max attempts reached
    const maxAttempts = parseInt(process.env.MAX_OTP_ATTEMPTS || '3');
    if (record.attempts >= maxAttempts) {
      return false;
    }

    // Increment attempts
    await db
      .update(otpVerifications)
      .set({ attempts: record.attempts + 1 })
      .where(eq(otpVerifications.id, record.id));

    // Verify OTP
    if (record.otp !== otp) {
      return false;
    }

    // Mark OTP as used
    await db
      .update(otpVerifications)
      .set({ isUsed: true })
      .where(eq(otpVerifications.id, record.id));

    return true;
  }
}
