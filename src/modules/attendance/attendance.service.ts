import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QrService } from 'src/modules/qr/qr.service';
import { ScanDto } from 'src/modules/devices/scan.dto';
import { User, UserStatus } from 'src/modules/users/user.schema';
import { AttendanceEvent, AttendanceType } from './attendance.schema';

function timeConverter(UNIX_timestamp: any) {
  const a = new Date(UNIX_timestamp * 1000);
  const hour = a.getHours();
  const min = a.getMinutes();
  const sec = a.getSeconds();
  const time = hour + ':' + min + ':' + sec;
  return time;
}

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
    console.log(timeConverter(ts), timeConverter(Date.now() / 1000));
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
      if (diff < 5000) {
        throw new BadRequestException('تم المسح بسرعة كبيرة');
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
