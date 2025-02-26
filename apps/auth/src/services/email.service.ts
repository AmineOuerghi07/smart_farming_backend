import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
  async sendOtp(email: string, otp: string) {
    console.log(`Envoi d'un email à ${email} avec OTP : ${otp}`);
    // Implémente ici l'envoi d'email avec Nodemailer, SendGrid, etc.
  }
}
