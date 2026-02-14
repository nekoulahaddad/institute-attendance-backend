import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RegistrationVersion,
  RegistrationVersionSchema,
} from './registration-version.schema';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { User, UserSchema } from '../users/user.schema';
import { AuditLog, AuditLogSchema } from '../audit/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RegistrationVersion.name, schema: RegistrationVersionSchema },
      { name: User.name, schema: UserSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
