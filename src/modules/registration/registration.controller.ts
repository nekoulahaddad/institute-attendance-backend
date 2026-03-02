import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './create-registration.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('registration')
export class RegistrationController {
  constructor(private registrationService: RegistrationService) {}

  @Post()
  async register(@Body() dto: CreateRegistrationDto) {
    return this.registrationService.createRegistration(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.registrationService.updateRegistration(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Post(':id/approve')
  async approve(@Param('id') id: string, @Req() req) {
    return this.registrationService.approveUser(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Post(':id/reject')
  async reject(@Param('id') id: string, @Req() req) {
    return this.registrationService.rejectUser(req.user._id, id);
  }
}
