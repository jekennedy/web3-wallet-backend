import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWalletDto {
  // leaving out validators as the AuthGuard sets the userId (from the jwt)
  //TODO add more fields for creating a wallet (like wallet name?)
  userId: string;
}

export class SignMessageDto {
  userId: string;
  address: string;

  @IsString()
  @IsNotEmpty()
  readonly message: string;
}

export class GetBalanceDto {
  userId: string;
  address: string;
}

export class WalletDto {
  readonly id: number;
  readonly address: string;
  readonly userId: string;
  // Exclude privateKey property from serialization
}
