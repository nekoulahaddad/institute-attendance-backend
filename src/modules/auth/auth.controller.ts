import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('admin/login')
  async login(@Body() body: any) {
    const user = await this.authService.validateAdmin(
      body.email,
      body.password,
    );

    return this.authService.login(user);
  }

  @Post('send-code')
  async sendCode(@Body('phone') phone: string) {
    return this.authService.sendCode(phone);
  }

  @Post('verify-code')
  async verifyCode(@Body('phone') phone: string, @Body('code') code: string) {
    return this.authService.verifyCode(phone, code);
  }
}
