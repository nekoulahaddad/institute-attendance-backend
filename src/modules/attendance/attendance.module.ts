import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceEvent, AttendanceEventSchema } from './attendance.schema';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/user.schema';
import { QrService } from '../qr/qr.service';
import { Device, DeviceSchema } from '../devices/devices.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AttendanceEvent.name, schema: AttendanceEventSchema },
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
    UsersModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, QrService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
