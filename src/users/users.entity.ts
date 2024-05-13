import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Wallet } from '../wallets/wallets.entity';
import { Transaction } from '../wallets/transactions.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // The externalId is the identifier in the third party system (e.g. Dynamic)
  // It's taken from the 'sub' claim of the JWT
  @Column({ name: 'external_id', unique: true })
  externalId: string;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @OneToMany(() => Transaction, (transaction) => transaction.fromUser)
  transactions: Transaction[];
}
