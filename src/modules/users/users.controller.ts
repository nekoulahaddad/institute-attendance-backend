import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { UserRole, UserStatus } from './user.schema';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('find-by-phone/:phone')
  async findByPhone(@Param('phone') phone: string) {
    return this.usersService.findByPhone({ phone });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Get()
  async listUsers(
    @Req() req,
    @Query('status') status?: UserStatus,
    @Query('branchId') branchId?: string,
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
  ) {
    const currentUser = req.user;
    const effectiveBranchId =
      currentUser.role === UserRole.ADMIN
        ? currentUser.branchId.toString()
        : branchId;

    return this.usersService.listUsers({
      status,
      branchId: effectiveBranchId,
      role,
      search,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Get(':id')
  async findById(@Req() req, @Param('id') id: string) {
    const currentUser = req.user;
    const user = await this.usersService.findById(id);

    if (
      currentUser.role === UserRole.ADMIN &&
      currentUser.branchId.toString() !== user.branchId.toString()
    ) {
      throw new ForbiddenException('Admins can only access their branch users');
    }

    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Patch(':id/status')
  async updateStatus(
    @Req() req,
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    const currentUser = req.user;
    const existingUser = await this.usersService.findById(id);

    if (
      currentUser.role === UserRole.ADMIN &&
      currentUser.branchId.toString() !== existingUser.branchId.toString()
    ) {
      throw new ForbiddenException('Admins can only update their branch users');
    }

    return this.usersService.updateStatus(id, status);
  }
}
