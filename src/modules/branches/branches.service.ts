import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Branch } from './branches.schema';

@Injectable()
export class BranchesService {
  constructor(
    @InjectModel(Branch.name)
    private branchModel: Model<Branch>,
  ) {}

  async getAll() {
    return this.branchModel.find().sort({ createdAt: -1 }).lean();
  }

  async create(data: Partial<Branch>) {
    const created = await this.branchModel.create(data);
    return created.toObject();
  }

  async update(id: string, data: Partial<Branch>) {
    const updated = await this.branchModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean();

    if (!updated) {
      throw new NotFoundException('Branch not found');
    }

    return updated;
  }

  async delete(id: string) {
    const deleted = await this.branchModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      throw new NotFoundException('Branch not found');
    }

    return { success: true };
  }
}
