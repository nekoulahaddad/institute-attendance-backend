import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserStatus } from '../users/user.schema';
import { RegistrationVersion } from './registration-version.schema';
import { AuditLog } from '../audit/audit-log.schema';
import { CreateRegistrationDto } from './create-registration.dto';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(RegistrationVersion.name)
    private versionModel: Model<RegistrationVersion>,
    @InjectModel(AuditLog.name)
    private auditModel: Model<AuditLog>,
  ) {}

  async createRegistration(dto: CreateRegistrationDto) {
    const user = await this.userModel.create({
      ...dto,
      status: 'pending',
    });

    await this.versionModel.create({
      userId: user._id,
      version: 1,
      snapshot: user.toObject(),
      modifiedFields: Object.keys(dto),
      modifiedBy: null,
    });

    await this.auditModel.create({
      entityType: 'user',
      entityId: user._id,
      action: 'REGISTERED',
      changes: dto,
      performedBy: user._id,
    });

    return {
      message: 'Registration submitted',
      userId: user._id,
    };
  }

  async updateRegistration(userId: string, dto: any) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    // const previousData = user.toObject();

    Object.assign(user, dto);
    await user.save();

    const latestVersion = await this.versionModel
      .findOne({ userId })
      .sort({ version: -1 });

    const modifiedFields = Object.keys(dto);

    await this.versionModel.create({
      userId,
      version: (latestVersion?.version || 0) + 1,
      snapshot: user.toObject(),
      modifiedFields,
      modifiedBy: userId,
    });

    await this.auditModel.create({
      entityType: 'user',
      entityId: user._id,
      action: 'UPDATED',
      changes: dto,
      performedBy: userId,
    });

    return { message: 'Updated successfully' };
  }

  async approveUser(adminId: string, userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    user.status = UserStatus.APPROVED;
    await user.save();

    await this.auditModel.create({
      entityType: 'user',
      entityId: user._id,
      action: 'APPROVED',
      changes: { status: 'approved' },
      performedBy: adminId,
    });

    return { message: 'User approved' };
  }

  async rejectUser(adminId: string, userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    user.status = UserStatus.CANCELED;
    await user.save();

    await this.auditModel.create({
      entityType: 'user',
      entityId: user._id,
      action: 'REJECTED',
      changes: { status: 'canceled' },
      performedBy: adminId,
    });

    return { message: 'User rejected' };
  }
}
