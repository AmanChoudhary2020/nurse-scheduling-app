import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NurseService } from './nurse.service';
import { NurseEntity } from './nurse.entity';

@Controller('nurses')
export class NurseController {
  constructor(private readonly nurseService: NurseService) { }

  @Get()
  async getNurses(): Promise<NurseEntity[]> {
    return this.nurseService.getNurses();
  }

  @Get(':id')
  async getNurseById(@Param('id') id: number): Promise<any> {
    return this.nurseService.getNurseById(id);
  }

  @Post('preferences')
  async setPreferences(@Body('id') id: number, @Body('preferences') preferences: string): Promise<any> {
    const parsedPreferences = JSON.parse(preferences);
    return this.nurseService.setPreferences(id, parsedPreferences);
  }
}
