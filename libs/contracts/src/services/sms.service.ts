import { Injectable } from "@nestjs/common";
import * as Brevo from '@getbrevo/brevo';

@Injectable()
export class SmsService {
  private apiInstance: Brevo.TransactionalSMSApi;
  private readonly BREVO_API_KEY = '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';
  private readonly SENDER_NAME = 'Smart Farm';

  constructor() {
    this.apiInstance = new Brevo.TransactionalSMSApi();
    this.apiInstance.setApiKey(Brevo.TransactionalSMSApiApiKeys.apiKey, this.BREVO_API_KEY);
  }

  async sendOtp(phonenumber: string, otp: string) {
    try {
      const smsData: Brevo.SendTransacSms = {
        sender: this.SENDER_NAME,
        recipient: phonenumber,
        content: `Votre code OTP est : ${otp}`,
        type: Brevo.SendTransacSms.TypeEnum.Transactional
      };

      const response = await this.apiInstance.sendTransacSms(smsData);
      return { message: 'SMS envoyé avec succès', otp };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS:', error);
      throw new Error('Erreur lors de l\'envoi du SMS');
    }
  }
}
