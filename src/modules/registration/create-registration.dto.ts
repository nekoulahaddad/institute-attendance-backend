import { IsString, IsEnum } from 'class-validator';
import { UserRole } from '../users/user.schema';

export class CreateRegistrationDto {
  @IsString()
  arabicName: string;

  @IsString()
  englishName: string;

  @IsString()
  phone: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  language: string;

  @IsString()
  level: string;

  @IsString()
  branchId: string;
}
