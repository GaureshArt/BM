import { UserRoleEnum } from "../dto/create-user.dto";

export class User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    createdAt: Date;
    role: UserRoleEnum;
}