import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class FirebaseLoginDto {
  @IsString()
  @IsNotEmpty()
  id_token: string;
}
