import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { WhatsAppService } from './whatsapp.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private whatsappService: WhatsAppService,
  ) {}

  async validateAdmin(email: string, password: string) {
    const user = await this.userModel.findOne({ englishName: email });

    if (!user) throw new UnauthorizedException();

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new UnauthorizedException();
    }

    const valid = await bcrypt.compare(password, user.passwordHash || '');
    if (!valid) throw new UnauthorizedException();

    return user;
  }

  login(user: UserDocument) {
    const payload = {
      sub: user._id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async sendCode(phone: string) {
    let user = await this.userModel.findOne({ phone });

    if (!user) {
      user = await this.userModel.create({ phone });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(code, 10);
    console.log(`Generated code for ${phone}: ${code}`);
    user.verificationCodeHash = hashedCode;
    user.verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // await this.whatsappService.sendCode(phone, code);

    return { success: true };
  }

  async verifyCode(phone: string, code: string) {
    const user = await this.userModel.findOne({ phone });

    if (!user || !user.verificationCodeHash) {
      throw new BadRequestException('Invalid phone or code');
    }

    if (
      !user.verificationCodeExpiresAt ||
      user.verificationCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('Code expired');
    }

    const isMatch = await bcrypt.compare(code, user.verificationCodeHash);

    if (!isMatch) {
      throw new BadRequestException('Invalid phone or code');
    }

    // Invalidate after successful use
    user.verificationCodeHash = undefined;
    user.verificationCodeExpiresAt = undefined;

    await user.save();

    return { user };
  }
}
