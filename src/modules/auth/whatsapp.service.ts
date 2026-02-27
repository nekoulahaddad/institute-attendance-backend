import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class WhatsAppService {
  private client: Twilio;

  constructor() {
    this.client = new Twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  async sendCode(phone: string, code: string) {
    await this.client.messages.create({
      body: `Your verification code is: ${code}`,
      from: 'whatsapp:+14155238886', // Twilio sandbox number
      to: `whatsapp:${phone}`,
    });
  }
}
