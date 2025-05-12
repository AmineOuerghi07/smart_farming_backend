import { Injectable } from '@nestjs/common';
import * as Brevo from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private apiInstance: Brevo.TransactionalEmailsApi;
  private readonly BREVO_API_KEY: string;
  private readonly EMAIL_FROM: string;

  constructor() {
    console.log('📧 Initializing EmailService...');
    
    // Récupération des variables d'environnement
    this.BREVO_API_KEY = process.env.BREVO_API_KEY || '';
    this.EMAIL_FROM = process.env.EMAIL_FROM || '';

    if (!this.BREVO_API_KEY) {
      console.error('❌ BREVO_API_KEY is not defined in environment variables');
      throw new Error('BREVO_API_KEY is required');
    }

    if (!this.EMAIL_FROM) {
      console.error('❌ EMAIL_FROM is not defined in environment variables');
      throw new Error('EMAIL_FROM is required');
    }

    console.log('EMAIL_FROM:', this.EMAIL_FROM);
  
    console.log('BREVO_API_KEY:', this.BREVO_API_KEY ? '✅ Loaded' : ' Not Loaded');

    // Initialisation de l'API Brevo avec la clé API
    try {
      this.apiInstance = new Brevo.TransactionalEmailsApi();
      this.apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, this.BREVO_API_KEY);
      console.log('✅ Brevo API initialized successfully.');
    } catch (error) {
      console.error('❌ Error initializing Brevo API:', error);
      throw error;
    }
  }

  async sendOtp(email: string, otp: string) {
    console.log(`📩 Sending OTP email to: ${email} | OTP: ${otp}`);

    if (!this.apiInstance) {
      console.error('❌ Brevo API instance is not initialized');
      throw new Error('Brevo API instance is not initialized');
    }

    const emailData: Brevo.SendSmtpEmail = {
      sender: { email: this.EMAIL_FROM, name: 'Smart Farm' },
      to: [{ email }],
      subject: 'Reset Your Password',
      htmlContent: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
    };

    try {
      const response = await this.apiInstance.sendTransacEmail(emailData);
      console.log(`✅ Email sent to ${email} | Message ID: ${response.body.messageId}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }
}
