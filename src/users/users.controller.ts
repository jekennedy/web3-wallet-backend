import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Logger,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { UsersService } from './users.service';
import { CreateUserDto } from './users.dto';
import { User } from './users.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  private readonly logger = new Logger(UsersController.name);

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.debug(
      'POST create() - Creating user with data:',
      createUserDto,
    );
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(): Promise<User[]> {
    this.logger.debug('GET findAll() - Searching for all users');
    return this.usersService.findAll();
  }

  @Get('/me')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Req() req: Request): Promise<User> {
    this.logger.debug('GET findOne() - Searching for user:', req.user.userId);
    return this.usersService.findOneByExternalId(req.user.userId);
  }

  //TODO should this be inverted?
  @Get('/internal/:id')
  @UseGuards(AuthGuard('jwt'))
  async findOneByInternalId(@Param('id') userId: number): Promise<User> {
    this.logger.debug(
      'GET findOneByInternalId() - Searching for user:',
      userId,
    );
    return this.usersService.findOne(userId);
  }

  //TODO
  @Get('/test-auth')
  @UseGuards(AuthGuard('jwt'))
  async testAuth(@Req() req: Request): Promise<string> {
    this.logger.debug(`Auth Endpoint Reached ${req.user.userId}`);
    return 'You are authenticated!'; // This should only be reachable if validation passes
  }

  /*
  //TODO
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
  */
}
