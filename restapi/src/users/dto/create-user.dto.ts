import { IsEmail, IsNotEmpty, IsString, IsPhoneNumber, MinLength, IsEnum } from 'class-validator';

export enum UserRoleEnum {
    admin = 'admin',
    staff = 'staff'
}

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

    @IsNotEmpty()
    @IsEnum(UserRoleEnum, { message: 'Role must be either admin or staff' })
    role: UserRoleEnum
}