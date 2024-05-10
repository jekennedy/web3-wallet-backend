import { User } from '../src/users/users.entity';
import { Wallet } from '../src/wallets/wallets.entity';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<any, any[]>;
};

export function createMockUser(): User {
  const user = new User();
  user.id = 1;
  user.externalId = '123';
  user.wallets = []; // Initialize with an empty array, or mock data as needed

  return user;
}

export function createMockWallet(): Wallet {
  const wallet = new Wallet();
  wallet.address = '0xAEF1AAb50e8B2Cd896bD8CACcFA7516c8EcB95aB';
  wallet.id = 1;
  wallet.privateKey = '199dfhf9f3';
  wallet.user = createMockUser();
  return wallet;
}
