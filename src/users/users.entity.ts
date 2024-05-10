import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Wallet } from '../wallets/wallets.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'external_id', unique: true })
  externalId: string;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];
}
