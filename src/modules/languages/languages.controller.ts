import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { Language } from './language.schema';
import { Level } from './level.schema';

@Controller('languages')
export class LanguagesController {
  constructor(private languagesService: LanguagesService) {}

  @Get('levels')
  async getAllLevels() {
    return this.languagesService.getAllLevels();
  }

  @Post('levels')
  async createLevel(@Body() body: Partial<Level>) {
    return this.languagesService.createLevel(body);
  }

  @Patch('levels/:id')
  async updateLevel(@Param('id') id: string, @Body() body: Partial<Level>) {
    return this.languagesService.updateLevel(id, body);
  }

  @Delete('levels/:id')
  async deleteLevel(@Param('id') id: string) {
    return this.languagesService.deleteLevel(id);
  }

  @Get()
  async getAllLanguages() {
    return this.languagesService.getAllLanguages();
  }

  @Post()
  async createLanguage(@Body() body: Partial<Language>) {
    return this.languagesService.createLanguage(body);
  }

  @Patch(':id')
  async updateLanguage(
    @Param('id') id: string,
    @Body() body: Partial<Language>,
  ) {
    return this.languagesService.updateLanguage(id, body);
  }

  @Delete(':id')
  async deleteLanguage(@Param('id') id: string) {
    return this.languagesService.deleteLanguage(id);
  }
}
