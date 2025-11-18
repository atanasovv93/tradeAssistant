/* eslint-disable prettier/prettier */
import { IsEnum, IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { UserRole } from '../../users/user-role.enum';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
