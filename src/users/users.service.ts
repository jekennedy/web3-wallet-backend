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
    let existingUser: User;
    try {
      // Check if user already exists to prevent duplicates
      existingUser = await this.repository.findOne({
        where: { externalId: createUserDto.userId },
      });
    } catch (error) {
      this.logger.error(`Error checking existing user: ${error.message}`);
      throw new BadRequestException('Error checking existing user');
    }

    if (existingUser) {
      throw new BadRequestException(
        `User with ID ${createUserDto.userId} already exists.`,
      );
    }

    try {
      // Create a new user entity and save it
      const newUser = this.repository.create({
        externalId: createUserDto.userId,
      });

      const savedUser = await this.repository.save(newUser);
      this.logger.debug(`Created user: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.repository.find({
        relations: ['wallets', 'transactions'],
      });
      return users;
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw new BadRequestException('Failed to fetch users');
    }
  }

  async findOne(id: number): Promise<User> {
    let user: User;
    try {
      user = await this.repository.findOne({
        where: { id },
        relations: ['wallets', 'transactions'],
      });
    } catch (error) {
      this.logger.error(`Error fetching user by ID ${id}: ${error.message}`);
      throw new BadRequestException('Failed to fetch user');
    }

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    this.logger.debug(`Found user by internal ID: ${user.id}`);
    return user;
  }

  async findOneByExternalId(externalId: string): Promise<User> {
    let user: User;
    try {
      user = await this.repository.findOne({
        where: { externalId },
        relations: ['wallets', 'transactions'],
      });
    } catch (error) {
      this.logger.error(
        `Error fetching user by external ID ${externalId}: ${error.message}`,
      );
      throw new BadRequestException('Failed to fetch user');
    }

    if (!user) {
      throw new NotFoundException(
        `User with external ID ${externalId} not found.`,
      );
    }

    this.logger.debug(`Found user by external ID: ${user.externalId}`);
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
