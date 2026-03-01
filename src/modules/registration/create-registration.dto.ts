import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';
import { UserRole } from '../users/user.schema';

class UserLanguageDto {
  @IsString()
  language: string;

  @IsString()
  level: string;
}

export class CreateRegistrationDto {
  @IsString()
  arabicName: string;

  @IsString()
  englishName: string;

  @IsString()
  phone: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserLanguageDto)
  languages: UserLanguageDto[];

  @IsString()
  branchId: string;
}
