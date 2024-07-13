import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NurseModule } from './nurse/nurse.module';
import { ShiftModule } from './shift/shift.module';
import { ScheduleModule } from './schedule/schedule.module';
import { NurseController } from './nurse/nurse.controller';
import { ScheduleController } from './schedule/schedule.controller';
import { ShiftController } from './shift/shift.controller';
import { NurseService } from './nurse/nurse.service';
import { ScheduleService } from './schedule/schedule.service';
import { ShiftService } from './shift/shift.service';
import { typeOrmMySQLConfig } from './ormconfig';

const controllers = [
  NurseController,
  ScheduleController,
  ShiftController
];

const modules = [
  NurseModule,
  ScheduleModule,
  ShiftModule
];

const services = [
  NurseService,
  ScheduleService,
  ShiftService
];

@Module({
  imports: [
    TypeOrmModule.forRoot({... typeOrmMySQLConfig, autoLoadEntities: true}),
    ... modules
  ],
  controllers: [AppController, ... controllers],
  providers: [AppService, ... services],
})
export class AppModule {}
