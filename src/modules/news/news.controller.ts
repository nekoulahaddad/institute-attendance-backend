import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { NewsService } from './news.service';
import { News } from './news.schema';

@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Get('latest')
  async getLatest() {
    return this.newsService.getLatest();
  }

  @Post()
  async create(@Body() body: Partial<News>) {
    return this.newsService.create(body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newsService.deleteById(id);
  }
}
