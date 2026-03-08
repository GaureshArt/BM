import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, UserRoleEnum } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idCounter = 1;

  create(createUserDto: CreateUserDto): User {
    const isEmailExist = this.users.find(u => u.email == createUserDto.email);
    if (isEmailExist) {
      throw new HttpException({
        error_code: 'USER_ALREADY_EXISTS',
        message: 'An account with this email address already exists.',
        context: { field: 'email' }
      }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const newUser = {
      id: this.idCounter++,
      ...createUserDto,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  list(
    page?: number,
    limit?: number,
    sortBy?: string,
    order: 'ASC' | 'DESC' = 'ASC',
    filterField?: string,
    filterValue?: string,
  ) {
    let result = [...this.users];
    if (filterField && filterValue) {
      if (this.users.length > 0 && !(filterField in this.users[0])) {
        throw new HttpException({
          error_code: 'INVALID_FILTER_FIELD',
          message: `The field '${filterField}' does not exist.`,
          context: { available_fields: Object.keys(this.users[0]) }
        }, HttpStatus.BAD_REQUEST);
      }
      result = result.filter((user) => {
        const value = user[filterField as keyof User];
        return String(value).toLowerCase().includes(filterValue.toLowerCase());
      });
    }

    if (sortBy) {
      if (this.users.length > 0 && !(sortBy in this.users[0])) {
        throw new HttpException({
          error_code: 'INVALID_SORT_FIELD',
          message: `The sort field '${sortBy}' does not exist.`,
          context: { available_fields: Object.keys(this.users[0]) }
        }, HttpStatus.BAD_REQUEST);
      }
      result.sort((a, b) => {
        const fieldA = a[sortBy as keyof User];
        const fieldB = b[sortBy as keyof User];

        if (fieldA < fieldB) return order === 'ASC' ? -1 : 1;
        if (fieldA > fieldB) return order === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    const total_records = result.length;

    if (!page && !limit) {
      return {
        success: true,
        data: result,
        pagination: {
          total_records,
          current_page: 1,
          total_pages: 1,
          next_page: null,
          prev_page: null,
        },
      };
    }

    const p = page && page > 0 ? page : 1;
    const l = limit && limit > 0 ? limit : 10;
    const total_pages = Math.max(Math.ceil(total_records / l), 1);
    const startIndex = (p - 1) * l;

    if (p > total_pages && total_records > 0) {
      throw new HttpException({
        error_code: 'INVALID_PAGINATION_OFFSET',
        message: "The requested page exceeds the total available pages.",
        context: {
          requested_page: p,
          total_pages,
          limit: l,
          total_records
        }
      }, HttpStatus.BAD_REQUEST);
    }

    const items = result.slice(startIndex, startIndex + l);

    return {
      success: true,
      data: items,
      pagination: {
        total_records,
        current_page: p,
        total_pages,
        next_page: p < total_pages ? p + 1 : null,
        prev_page: p > 1 ? p - 1 : null,
      },
    };
  }

  findOne(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new HttpException({
        error_code: 'RESOURCE_NOT_FOUND',
        message: `User with ID ${id} not found.`,
        context: { resource_id: id }
      }, HttpStatus.NOT_FOUND);
    }
    return user;
  }

  update(userId: number, id: number, updateUserDto: UpdateUserDto): User {
    console.log(userId);
    const user = this.users.find(u => u.id === +userId)
    const userRole = user?.role
    // console.log("role: ", user)
    // console.log("role: ", userRole)
    if (!userRole) {
      throw new HttpException({
        error_code: 'INVALID_CREDENTIALS',
        message: 'The account associated with this session no longer exists.',
      }, HttpStatus.UNAUTHORIZED)
    }
    // console.log(userRole)
    // console.log(UserRoleEnum[1])
    if (userRole === UserRoleEnum.staff && (+userId) !== id) {
      throw new HttpException({
        error_code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have the required permissions to perform this action.',
        context: {
          reason: 'You can only modified your data or need admin level permissions',
          current_role: userRole
        }
      }, HttpStatus.FORBIDDEN)
    }
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new HttpException({
        error_code: 'RESOURCE_NOT_FOUND',
        message: `User with ID ${id} not found.`,
        context: { resource_id: id }
      }, HttpStatus.NOT_FOUND);
    }
    this.users[userIndex] = { ...this.users[userIndex], ...updateUserDto };
    return this.users[userIndex];
  }

  remove(userId: number, id: number): void {

    const user = this.users.find(u => u.id === +userId);
    const userRole = user?.role;
    if (!userRole) {
      throw new HttpException({
        error_code: 'INVALID_CREDENTIALS',
        message: 'The account associated with this session no longer exists.',
      }, HttpStatus.UNAUTHORIZED)
    }
    if (userRole === UserRoleEnum.staff && +(userId) !== id) {
      throw new HttpException({
        error_code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have the required permissions to perform this action.',
        context: {
          reason: 'You can only modified your data or need admin level permissions',
          current_role: userRole
        }
      }, HttpStatus.FORBIDDEN)
    }
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new HttpException({
        error_code: 'RESOURCE_NOT_FOUND',
        message: `User with ID ${id} not found.`,
        context: { resource_id: id }
      }, HttpStatus.NOT_FOUND);
    }
    this.users.splice(userIndex, 1);
  }

  async timeout() {
    const TIMEOUT_THRESHOLD = 200;
    const timeTaken = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    return new Promise((res, rej) => {
      setTimeout(() => {
        if (timeTaken <= TIMEOUT_THRESHOLD) {
          res({
            success: true,
            message: 'request processed successfully',
            time: timeTaken
          });
        } else {
          rej(new HttpException({
            error_code: 'GATEWAY_TIMEOUT',
            message: `Time exceeded the timeout threshold.`,
            context: { timeTaken, threshold: TIMEOUT_THRESHOLD }
          }, HttpStatus.GATEWAY_TIMEOUT));
        }
      }, timeTaken);
    });
  }
}