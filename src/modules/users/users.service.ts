import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole, UserStatus } from './user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid user id');
    }

    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByPhone({ phone }: { phone: string }) {
    return this.userModel.findOne({ phone });
  }

  async listUsers(filters: {
    status?: UserStatus;
    branchId?: string;
    role?: UserRole;
    search?: string;
  }) {
    const query: Record<string, any> = {};
    const andClauses: Record<string, any>[] = [];

    if (filters.status) query.status = filters.status;
    if (filters.role) query.role = filters.role;
    if (filters.branchId) {
      if (!Types.ObjectId.isValid(filters.branchId)) {
        throw new BadRequestException('Invalid branch id');
      }

      andClauses.push({
        $or: [
          { branchId: filters.branchId },
          { branchId: new Types.ObjectId(filters.branchId) },
        ],
      });
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      andClauses.push({
        $or: [
          { arabicName: searchRegex },
          { englishName: searchRegex },
          { phone: searchRegex },
        ],
      });
    }

    if (andClauses.length > 0) {
      query.$and = andClauses;
    }

    const users = await this.userModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('branchId')
      .lean();

    if (!filters.branchId) {
      return users;
    }

    // Extra safety: enforce exact branch match after populate for legacy data shapes.
    return users.filter((user: any) => {
      const branchValue = user?.branchId;
      const normalizedBranchId =
        typeof branchValue === 'string'
          ? branchValue
          : branchValue?._id?.toString?.() || branchValue?.toString?.();
      return normalizedBranchId === filters.branchId;
    });
  }

  async create(data: Partial<User>) {
    const user = new this.userModel(data);
    return user.save();
  }

  async update(id: string, updateData: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updateStatus(id: string, status: UserStatus) {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('branchId')
      .lean();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }

  async updateAdminMessage(id: string, adminMessage?: string | null) {
    const normalizedMessage = adminMessage?.trim() || null;

    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          adminMessage: normalizedMessage,
        },
        { new: true },
      )
      .populate('branchId')
      .lean();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }
}
