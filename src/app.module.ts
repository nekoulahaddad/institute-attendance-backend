import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { UsersModule } from './modules/users/users.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NewsModule } from './modules/news/news.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRoot(process.env.MONGO_URI || '', {
      autoIndex: true,
    }),
    UsersModule,
    AuthModule,
    RegistrationModule,
    AttendanceModule,
    ReportsModule,
    NewsModule,
  ],
})
export class AppModule {}
