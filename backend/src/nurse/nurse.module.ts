import { Module } from '@nestjs/common';  
import { TypeOrmModule } from '@nestjs/typeorm';  
import { NurseEntity } from './nurse.entity';  
import { NurseController } from './nurse.controller';  
import { NurseService } from './nurse.service';  

@Module({  
  imports: [TypeOrmModule.forFeature([NurseEntity])],  
  exports: [TypeOrmModule, NurseService],
  providers: [NurseService],  
  controllers: [NurseController]  
})  
export class NurseModule {}
