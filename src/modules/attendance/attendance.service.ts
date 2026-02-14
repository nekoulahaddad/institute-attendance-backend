import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AttendanceEvent, AttendanceType } from './attendance.schema';
import { User, UserStatus } from 'src/modules/users/user.schema';
import { Model } from 'mongoose';
import { QrService } from 'src/modules/qr/qr.service';
import { ScanDto } from 'src/modules/devices/scan.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(AttendanceEvent.name)
    private attendanceModel: Model<AttendanceEvent>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private qrService: QrService,
  ) {}

  async handleScan(scanDto: ScanDto, device: any) {
    const { userId, timestamp, signature } = scanDto;

    // 1️⃣ جلب المستخدم
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    if (user.status !== UserStatus.APPROVED)
      throw new BadRequestException('User not approved');

    // 2️⃣ التحقق من التوقيع
    const validSignature = this.qrService.verifySignature(
      userId,
      timestamp,
      signature,
      user.publicKey,
    );

    if (!validSignature) throw new BadRequestException('Invalid QR signature');

    // 3️⃣ التحقق من الوقت
    if (!this.qrService.isTimestampValid(timestamp))
      throw new BadRequestException('QR expired');

    // 4️⃣ منع double scan خلال 5 ثواني
    const lastEvent = await this.attendanceModel
      .findOne({ userId })
      .sort({ scannedAt: -1 });

    const now = new Date();

    if (lastEvent) {
      const diff = now.getTime() - new Date(lastEvent.scannedAt).getTime();
      if (diff < 5000) {
        throw new BadRequestException('Scan too fast');
      }
    }

    // 5️⃣ تحديد IN أو OUT
    let type: AttendanceType;

    if (!lastEvent || lastEvent.type === AttendanceType.OUT) {
      type = AttendanceType.IN;
    } else {
      type = AttendanceType.OUT;
    }

    // 6️⃣ التأكد أن الجهاز من نفس الفرع
    if (user.branchId.toString() !== device.branchId.toString()) {
      throw new BadRequestException('Wrong branch device');
    }

    // 7️⃣ حفظ الحدث
    await this.attendanceModel.create({
      userId,
      branchId: user.branchId,
      deviceId: device._id,
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
