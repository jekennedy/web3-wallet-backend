import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  // The userId is the identifier in the third party system (Dynamic)
  // In our repo layer this maps to externalId
  userId: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  email?: string;
}
