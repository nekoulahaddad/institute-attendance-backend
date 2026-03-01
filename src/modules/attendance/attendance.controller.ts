import { Body, Controller, Param, Post } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ScanDto } from 'src/modules/devices/scan.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('scan/:branchId')
  async scan(@Param('branchId') branchId: string, @Body() scanDto: ScanDto) {
    return this.attendanceService.handleScan(scanDto, branchId);
  }
}
