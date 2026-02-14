import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Device } from './devices.schema';

@Injectable()
export class DeviceGuard implements CanActivate {
  constructor(
    @InjectModel(Device.name)
    private deviceModel: Model<Device>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) throw new UnauthorizedException('No API key');

    const apiKey = authHeader.replace('Bearer ', '');

    const devices = await this.deviceModel.find({ isActive: true });

    for (const device of devices) {
      const match = await bcrypt.compare(apiKey, device.apiKeyHash);
      if (match) {
        request.device = device;
        return true;
      }
    }

    throw new UnauthorizedException('Invalid device key');
  }
}
