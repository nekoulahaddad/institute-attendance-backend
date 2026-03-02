import { Injectable, NotFoundException } from '@nestjs/common';
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

    if (filters.status) query.status = filters.status;
    if (filters.role) query.role = filters.role;
    if (filters.branchId && Types.ObjectId.isValid(filters.branchId)) {
      query.branchId = new Types.ObjectId(filters.branchId);
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { arabicName: searchRegex },
        { englishName: searchRegex },
        { phone: searchRegex },
      ];
    }

    return this.userModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('branchId')
      .lean();
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
}
