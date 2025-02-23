import { Injectable } from "@nestjs/common";

@Injectable()
export class SmsService {
  async sendOtp(phone: string, otp: string) {
    console.log(`Envoi d'un SMS à ${phone} avec OTP : ${otp}`);
    // Implémente ici l'envoi d'SMS avec Twilio, Firebase, etc.
  }
}
