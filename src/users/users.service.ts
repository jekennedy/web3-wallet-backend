import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists to prevent duplicates
    const existingUser = await this.repository.findOne({
      where: { externalId: createUserDto.userId },
    });

    if (existingUser) {
      throw new BadRequestException(
        `User with ID ${createUserDto.userId} already exists.`,
      );
    }

    // Create a new user entity and save it
    const newUser = this.repository.create({
      externalId: createUserDto.userId,
    });

    this.logger.debug('Created user: ', newUser.id);
    return await this.repository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    const users = await this.repository.find({
      relations: ['wallets', 'transactions'],
    });
    return users;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.repository.findOne({
      where: { id },
      relations: ['wallets', 'transactions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    this.logger.debug('Found user by internal id: ', user.id);
    return user;
  }

  async findOneByExternalId(externalId: string): Promise<User> {
    const user = await this.repository.findOne({
      where: { externalId: externalId },
      relations: ['wallets', 'transactions'],
    });

    if (!user) {
      throw new NotFoundException(
        `User with external ID ${externalId} not found.`,
      );
    }

    this.logger.debug('Found user by external id: ', user.externalId);
    return user;
  }

  /*
  async checkDatabaseAndSchema() {
    // Fetch current database
    const currentDatabase = await this.repository.query(
      'SELECT current_database();',
    );
    console.log('Current Database:', currentDatabase[0].current_database);

    // Fetch current schema
    const currentSchema = await this.repository.query(
      'SELECT current_schema();',
    );
    console.log('Current Schema:', currentSchema[0].current_schema);

    // Fetch current schema
    const allUsers = await this.repository.query('SELECT * from users;');
    console.log('All users:', allUsers[0]);
  }
  */

  // TODO other methods like update(), delete()
}
