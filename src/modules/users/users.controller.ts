import { Body, Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('find-by-phone/:phone')
  async findByPhone(@Param('phone') phone: string) {
    return this.usersService.findByPhone({ phone });
  }
}
