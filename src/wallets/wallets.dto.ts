import { IsNotEmpty, IsString } from 'class-validator';

export class SignMessageRequestDto {
  @IsString()
  @IsNotEmpty()
  readonly message: string;
}

export class SignMessageDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  readonly message: string;
}

export class GetBalanceDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsString()
  @IsNotEmpty()
  readonly address: string;
}

export class SendTransactionRequestDto {
  @IsString()
  @IsNotEmpty()
  readonly toAddress: string;

  @IsString()
  @IsNotEmpty()
  readonly amount: string;
}
export class SendTransactionDto {
  @IsString()
  userId: string;

  @IsString()
  @IsNotEmpty()
  fromAddress: string;

  @IsString()
  @IsNotEmpty()
  readonly toAddress: string;

  @IsString()
  @IsNotEmpty()
  readonly amount: string;
}
