import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QrService } from 'src/modules/qr/qr.service';
import { ScanDto } from 'src/modules/devices/scan.dto';
import { User, UserStatus } from 'src/modules/users/user.schema';
import { AttendanceEvent, AttendanceType } from './attendance.schema';
@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(AttendanceEvent.name)
    private attendanceModel: Model<AttendanceEvent>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private qrService: QrService,
  ) {}

  async handleScan(scanDto: ScanDto, branchId: string) {
    const { userId, ts } = scanDto;
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('المستخدم غير موجود');
    }

    if (user.status !== UserStatus.APPROVED) {
      throw new BadRequestException('المستخدم غير معتمد');
    }

    if (!this.qrService.isTimestampValid(ts)) {
      throw new BadRequestException('رمز QR منتهي الصلاحية');
    }

    const lastEvent = await this.attendanceModel
      .findOne({ userId })
      .sort({ scannedAt: -1 });

    const now = new Date();

    if (lastEvent) {
      const diff = now.getTime() - new Date(lastEvent.scannedAt).getTime();
      if (diff < 600000) {
        throw new BadRequestException('محاوله دخول مكرره');
      }
    }

    const type =
      !lastEvent || lastEvent.type === AttendanceType.OUT
        ? AttendanceType.IN
        : AttendanceType.OUT;

    if (user.branchId.toString() !== branchId) {
      throw new BadRequestException('الفرع غير صحيح');
    }

    await this.attendanceModel.create({
      userId,
      branchId,
      type,
      scannedAt: now,
    });

    return {
      success: true,
      type,
      time: now,
      userName: user.arabicName,
    };
  }
}
