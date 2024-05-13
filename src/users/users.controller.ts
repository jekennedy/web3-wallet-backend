import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
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

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('/me')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Req() req: Request): Promise<User> {
    return this.usersService.findOneByExternalId(req.user.userId);
  }

  //TODO should this be inverted?
  @Get(':id/internal')
  @UseGuards(AuthGuard('jwt'))
  async findOneByInternalId(@Param('id') userId: number): Promise<User> {
    return this.usersService.findOne(userId);
  }

  /*
  //TODO
  // Testing method
  @Get('/test-auth')
  @UseGuards(AuthGuard('jwt'))
  async testAuth(@Req() req: Request): Promise<string> {
    this.logger.debug(`Auth Endpoint Reached ${req.user.userId}`);
    return 'You are authenticated!'; // This should only be reachable if validation passes
  }

  //TODO consider adding other admin functions
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
  */
}
