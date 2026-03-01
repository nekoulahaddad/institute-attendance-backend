import { IsString, IsNumber } from 'class-validator';

export class ScanDto {
  @IsString()
  userId: string;

  @IsNumber()
  ts: number;
}
