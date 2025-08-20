import { sendEmail } from './emailService';
import { sendSMS } from './smsService';
import { storage } from './storage';
import { randomInt } from 'crypto';

export class VerificationService {
  // Generate 6-digit verification code
  generateCode(): string {
    return randomInt(100000, 999999).toString();
  }

  // Send email verification code
  async sendEmailVerification(email: string, purpose: 'registration' | 'password_reset' = 'registration'): Promise<boolean> {
    try {
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store verification code in database
      await storage.createVerificationCode({
        email,
        phone: null,
        code,
        type: 'email',
        purpose,
        expiresAt,
        usedAt: null
      });

      // Send email
      const subject = purpose === 'registration' 
        ? 'Welcome to FireBuild.ai - Verify Your Email'
        : 'FireBuild.ai - Password Reset Code';
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">FireBuild.ai</h1>
          <h2>${purpose === 'registration' ? 'Verify Your Email Address' : 'Password Reset Request'}</h2>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e40af; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr>
          <p style="color: #6b7280; font-size: 14px;">FireBuild.ai - Professional Contractor Management</p>
        </div>
      `;

      return await sendEmail({
        to: email,
        from: 'noreply@firebuild.ai',
        subject,
        html: htmlContent
      });
    } catch (error) {
      console.error('Error sending email verification:', error);
      return false;
    }
  }

  // Send SMS verification code
  async sendSMSVerification(phone: string, purpose: 'registration' | 'password_reset' = 'registration'): Promise<boolean> {
    try {
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store verification code in database
      await storage.createVerificationCode({
        email: null,
        phone,
        code,
        type: 'sms',
        purpose,
        expiresAt,
        usedAt: null
      });

      // Send SMS
      const message = purpose === 'registration'
        ? `Welcome to FireBuild.ai! Your verification code is: ${code}. This code expires in 15 minutes.`
        : `FireBuild.ai password reset code: ${code}. This code expires in 15 minutes.`;

      return await sendSMS(phone, message);
    } catch (error) {
      console.error('Error sending SMS verification:', error);
      return false;
    }
  }

  // Verify email code
  async verifyEmailCode(email: string, code: string, purpose: 'registration' | 'password_reset' = 'registration'): Promise<boolean> {
    try {
      const verification = await storage.getValidVerificationCode(email, null, code, 'email', purpose);
      
      if (!verification) {
        return false;
      }

      // Mark as used
      await storage.markVerificationCodeAsUsed(verification.id);
      
      // If registration verification, mark email as verified
      if (purpose === 'registration') {
        await storage.markEmailAsVerified(email);
      }

      return true;
    } catch (error) {
      console.error('Error verifying email code:', error);
      return false;
    }
  }

  // Verify SMS code
  async verifySMSCode(phone: string, code: string, purpose: 'registration' | 'password_reset' = 'registration'): Promise<boolean> {
    try {
      const verification = await storage.getValidVerificationCode(null, phone, code, 'sms', purpose);
      
      if (!verification) {
        return false;
      }

      // Mark as used
      await storage.markVerificationCodeAsUsed(verification.id);
      
      // If registration verification, mark phone as verified
      if (purpose === 'registration') {
        await storage.markPhoneAsVerified(phone);
      }

      return true;
    } catch (error) {
      console.error('Error verifying SMS code:', error);
      return false;
    }
  }

  // Check if both email and phone are verified for a user
  async isUserFullyVerified(email: string, phone?: string): Promise<boolean> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) return false;

      // Email must always be verified
      if (!user.emailVerified) return false;

      // If phone is provided, it must also be verified
      if (phone && user.phone === phone && !user.phoneVerified) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking user verification status:', error);
      return false;
    }
  }

  // Activate user account after full verification
  async activateUserAccount(email: string): Promise<boolean> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) return false;

      // Check if fully verified
      const fullyVerified = await this.isUserFullyVerified(email, user.phone || undefined);
      if (!fullyVerified) return false;

      // Activate account
      await storage.activateUser(user.id);
      return true;
    } catch (error) {
      console.error('Error activating user account:', error);
      return false;
    }
  }
}

export const verificationService = new VerificationService();