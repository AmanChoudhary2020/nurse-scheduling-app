import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { ShiftEntity } from './shift.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShiftEntity])],
  exports: [TypeOrmModule, ShiftService],
  providers: [ShiftService],
  controllers: [ShiftController],
})
export class ShiftModule {}
