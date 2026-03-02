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

  async validateAdmin(phone: string, password: string) {
    console.log(
      `Attempting to validate admin with phone: ${phone} and password: ${password}`,
    );
    const hashedCode = await bcrypt.hash(password, 10);
    console.log(`Generated hash for password: ${hashedCode}`);
    const user = await this.userModel.findOne({ phone });

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

  async createAdminUser(body: {
    phone: string;
    password: string;
    role?: UserRole;
    branchId: string;
    englishName?: string;
    arabicName?: string;
  }) {
    const { phone, password, branchId } = body;
    const role = body.role || UserRole.ADMIN;

    if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Role must be admin or super_admin');
    }

    const existing = await this.userModel.findOne({ phone });
    if (existing) {
      throw new BadRequestException('Phone is already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      phone,
      passwordHash,
      role,
      status: 'approved',
      branchId,
      englishName: body.englishName || phone,
      arabicName: body.arabicName || phone,
      languages: [],
    });

    return {
      message: 'Admin created successfully',
      user,
    };
  }
}
