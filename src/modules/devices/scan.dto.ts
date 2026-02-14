import { IsString, IsNumber } from 'class-validator';

export class ScanDto {
  @IsString()
  userId: string;

  @IsNumber()
  timestamp: number;

  @IsString()
  signature: string;
}
