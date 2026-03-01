import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Language, LanguageDocument } from './language.schema';
import { Level, LevelDocument } from './level.schema';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectModel(Language.name)
    private languageModel: Model<LanguageDocument>,
    @InjectModel(Level.name)
    private levelModel: Model<LevelDocument>,
  ) {}

  async getAllLanguages() {
    return this.languageModel
      .find()
      .populate('levels')
      .sort({ createdAt: -1 })
      .lean();
  }

  async createLanguage(data: Partial<Language>) {
    const created = await this.languageModel.create(data);
    return created.toObject();
  }

  async updateLanguage(id: string, data: Partial<Language>) {
    const updated = await this.languageModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('levels')
      .lean();

    if (!updated) {
      throw new NotFoundException('Language not found');
    }

    return updated;
  }

  async deleteLanguage(id: string) {
    const deleted = await this.languageModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      throw new NotFoundException('Language not found');
    }

    return { success: true };
  }

  async getAllLevels() {
    return this.levelModel.find().sort({ createdAt: -1 }).lean();
  }

  async createLevel(data: Partial<Level>) {
    const created = await this.levelModel.create(data);
    return created.toObject();
  }

  async updateLevel(id: string, data: Partial<Level>) {
    const updated = await this.levelModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean();

    if (!updated) {
      throw new NotFoundException('Level not found');
    }

    return updated;
  }

  async deleteLevel(id: string) {
    const isUsed = await this.languageModel.countDocuments({ levels: id });
    if (isUsed > 0) {
      throw new BadRequestException('Cannot delete level that is used by a language');
    }

    const deleted = await this.levelModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      throw new NotFoundException('Level not found');
    }

    return { success: true };
  }
}
