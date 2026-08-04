import {
  IsEmail,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
 @IsString()
  @Length(2, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 50)
  @MinLength(6, {
    message : "Password must be at least 6 characters"
  })
  password: string;
}
