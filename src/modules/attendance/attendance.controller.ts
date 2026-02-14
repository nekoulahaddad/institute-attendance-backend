import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { DeviceGuard } from 'src/modules/devices/device.guard';
import { ScanDto } from 'src/modules/devices/scan.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('scan')
  @UseGuards(DeviceGuard)
  async scan(@Body() scanDto: ScanDto, @Req() req) {
    return this.attendanceService.handleScan(scanDto, req.device);
  }
}
