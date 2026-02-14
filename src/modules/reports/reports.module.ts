import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import {
  AttendanceEvent,
  AttendanceEventSchema,
} from '../attendance/attendance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AttendanceEvent.name, schema: AttendanceEventSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
