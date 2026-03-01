import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Branch } from './branches.schema';

@Controller('branches')
export class BranchesController {
  constructor(private branchesService: BranchesService) {}

  @Get()
  async getAll() {
    return this.branchesService.getAll();
  }

  @Post()
  async create(@Body() body: Partial<Branch>) {
    return this.branchesService.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Branch>) {
    return this.branchesService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.branchesService.delete(id);
  }
}
