import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from './news.schema';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name)
    private newsModel: Model<NewsDocument>,
  ) {}

  async getLatest() {
    return this.newsModel.find().sort({ publishedAt: -1 }).lean();
  }

  async create(news: Partial<News>) {
    const created = await this.newsModel.create(news);
    return created.toObject();
  }

  async deleteById(id: string) {
    const deleted = await this.newsModel.findOneAndDelete({ id }).lean();
    if (!deleted) {
      throw new NotFoundException('News item not found');
    }

    return { success: true };
  }
}
