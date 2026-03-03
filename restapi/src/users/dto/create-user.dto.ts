import { IsEmail, IsNotEmpty, IsString, IsPhoneNumber, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail({}, { message: 'Please provide a valid email address' })
    email: string;

    @IsPhoneNumber('IN')
    phoneNumber: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;
}