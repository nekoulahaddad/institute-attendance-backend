import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.schema';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Get('monthly/:userId')
  async monthly(
    @Param('userId') userId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.reportsService.getMonthlySessions(
      userId,
      Number(year),
      Number(month),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Get('monthly-duration/:userId')
  async monthlyDuration(
    @Param('userId') userId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.reportsService.getMonthlyDuration(
      userId,
      Number(year),
      Number(month),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Get('branch/monthly/:branchId')
  async branchMonthlySessions(
    @Req() req,
    @Param('branchId') branchId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    if (
      req.user.role === UserRole.ADMIN &&
      req.user.branchId.toString() !== branchId
    ) {
      throw new ForbiddenException(
        'Admins can only access reports for their branch',
      );
    }

    return this.reportsService.getMonthlySessionsForBranch(
      branchId,
      Number(year),
      Number(month),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Get('branch/monthly-duration/:branchId')
  async branchMonthlyDuration(
    @Req() req,
    @Param('branchId') branchId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    if (
      req.user.role === UserRole.ADMIN &&
      req.user.branchId.toString() !== branchId
    ) {
      throw new ForbiddenException(
        'Admins can only access reports for their branch',
      );
    }

    return this.reportsService.getBranchMonthlyDuration(
      branchId,
      Number(year),
      Number(month),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Get('active-now')
  async activeNow(@Req() req, @Query('branchId') branchId?: string) {
    const effectiveBranchId =
      req.user.role === UserRole.ADMIN
        ? req.user.branchId.toString()
        : branchId;

    if (
      req.user.role === UserRole.ADMIN &&
      branchId &&
      branchId !== req.user.branchId.toString()
    ) {
      throw new ForbiddenException(
        'Admins can only access reports for their branch',
      );
    }

    return this.reportsService.getActiveUsersByRole(effectiveBranchId);
  }
}
