import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus, Headers, UnauthorizedException, InternalServerErrorException, GatewayTimeoutException, BadGatewayException, Header, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-user.dto';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.list(
      query.page,
      query.limit,
      query.sortBy,
      query.order,
      query.filterField,
      query.filterValue
    );
  }
  @Get('secure-data')
  getSecureData(
    @Headers('auth-key') apiKey: string,
    @Headers('role') role: string
  ) {

    if (apiKey !== 'my-secret-key') {
      throw new UnauthorizedException('Missing or invalid Auth Key');
    }
    if (role !== 'admin') {
      throw new ForbiddenException('Not have admin level permissions to access this data');
    }
    return { data: 'Secret info' };
  }
  @Get('isr')
  throwError() {
    throw new InternalServerErrorException('Something went wrong!.')
  }
  @Get('timeout')
  async timeout() {
    return await this.usersService.timeout()
  }
  @Get('badgateway')
  async badGateway() {
    try {
      return await this.timeout()
    } catch (err) {
      if (err instanceof GatewayTimeoutException) {
        throw new BadGatewayException(`Gateway received atimeout from upstream server`)
      }
      throw new InternalServerErrorException('Somewthisg went wrong')
    }
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}