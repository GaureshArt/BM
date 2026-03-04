import { BadRequestException, GatewayTimeoutException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idCounter = 1;

  create(createUserDto: CreateUserDto): User {
    const isEmailExist = this.users.find(u => u.email == createUserDto.email);
    if (isEmailExist) {
      throw new UnprocessableEntityException('This is email is already exist')
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
        throw new BadRequestException(`Invalid filter field: ${filterField}`);
      }
      result = result.filter((user) => {
        const value = user[filterField as keyof User];
        return String(value).toLowerCase().includes(filterValue.toLowerCase());
      });
    }
    if (sortBy) {
      if (this.users.length > 0 && !(sortBy in this.users[0])) {
        throw new BadRequestException(`Invalid sort field: ${sortBy}`);
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
    const p = page || 1;
    const l = limit || 10;
    const total_pages = Math.ceil(total_records / l);
    const startIndex = (p - 1) * l;

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
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  update(id: number, updateUserDto: UpdateUserDto): User {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.users[userIndex] = { ...this.users[userIndex], ...updateUserDto };
    return this.users[userIndex];
  }
  remove(id: number): void {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
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
          })
        }
        else {
          rej(new GatewayTimeoutException(`Tiem exceed the timeout threshold: ${timeTaken}`))
        }
      }, timeTaken)
    })
  }
}