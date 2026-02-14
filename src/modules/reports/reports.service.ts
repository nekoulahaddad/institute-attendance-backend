import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AttendanceEvent,
  AttendanceType,
} from '../attendance/attendance.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(AttendanceEvent.name)
    private attendanceModel: Model<AttendanceEvent>,
  ) {}

  async getMonthlySessions(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const events = await this.attendanceModel
      .find({
        userId,
        scannedAt: { $gte: start, $lt: end },
      })
      .sort({ scannedAt: 1 });

    let sessions = 0;
    let lastIn: Date | null = null;

    for (const event of events) {
      if (event.type === AttendanceType.IN) {
        lastIn = event.scannedAt;
      }

      if (event.type === AttendanceType.OUT && lastIn) {
        sessions++;
        lastIn = null;
      }
    }

    return {
      userId,
      year,
      month,
      totalSessions: sessions,
    };
  }

  async getMonthlySessionsForBranch(
    branchId: string,
    year: number,
    month: number,
  ) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const events = await this.attendanceModel
      .find({
        branchId,
        scannedAt: { $gte: start, $lt: end },
      })
      .sort({ userId: 1, scannedAt: 1 });

    const result = {};
    const lastInMap = {};

    for (const event of events) {
      const uid = event.userId.toString();

      if (!result[uid]) {
        result[uid] = 0;
        lastInMap[uid] = null;
      }

      if (event.type === AttendanceType.IN) {
        lastInMap[uid] = event.scannedAt;
      }

      if (event.type === AttendanceType.OUT && lastInMap[uid]) {
        result[uid]++;
        lastInMap[uid] = null;
      }
    }

    return result;
  }

  async getMonthlyDuration(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const events = await this.attendanceModel
      .find({
        userId,
        scannedAt: { $gte: start, $lt: end },
      })
      .sort({ scannedAt: 1 });

    let totalMilliseconds = 0;
    let lastIn: Date | null = null;
    let sessions = 0;

    for (const event of events) {
      if (event.type === AttendanceType.IN) {
        lastIn = event.scannedAt;
      }

      if (event.type === AttendanceType.OUT && lastIn) {
        const diff = event.scannedAt.getTime() - lastIn.getTime();

        if (diff > 0) {
          totalMilliseconds += diff;
          sessions++;
        }

        lastIn = null;
      }
    }

    const totalHours = totalMilliseconds / (1000 * 60 * 60);

    return {
      userId,
      year,
      month,
      totalSessions: sessions,
      totalHours: Number(totalHours.toFixed(2)),
    };
  }

  async getBranchMonthlyDuration(
    branchId: string,
    year: number,
    month: number,
  ) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const events = await this.attendanceModel
      .find({
        branchId,
        scannedAt: { $gte: start, $lt: end },
      })
      .sort({ userId: 1, scannedAt: 1 });

    const result = {};
    const lastInMap = {};

    for (const event of events) {
      const uid = event.userId.toString();

      if (!result[uid]) {
        result[uid] = {
          sessions: 0,
          totalMilliseconds: 0,
        };
        lastInMap[uid] = null;
      }

      if (event.type === AttendanceType.IN) {
        lastInMap[uid] = event.scannedAt;
      }

      if (event.type === AttendanceType.OUT && lastInMap[uid]) {
        const diff = event.scannedAt.getTime() - lastInMap[uid].getTime();

        if (diff > 0) {
          result[uid].totalMilliseconds += diff;
          result[uid].sessions++;
        }

        lastInMap[uid] = null;
      }
    }

    // تحويل الميلي ثانية إلى ساعات
    for (const uid in result) {
      result[uid].totalHours = Number(
        (result[uid].totalMilliseconds / (1000 * 60 * 60)).toFixed(2),
      );
      delete result[uid].totalMilliseconds;
    }

    return result;
  }
}
