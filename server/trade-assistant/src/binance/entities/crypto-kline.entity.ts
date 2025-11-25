/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('crypto_klines')
export class CryptoKline {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  symbol: string;

  @Column({ type: 'bigint' })
  openTime: number;

  @Column('decimal')
  open: number;

  @Column('decimal')
  high: number;

  @Column('decimal')
  low: number;

  @Column('decimal')
  close: number;

  @Column('decimal')
  volume: number;

  @Column('decimal')
  takerBuyVolume: number;

  @Column('decimal')
  quoteVolume: number;

  @Column({ type: 'bigint' })
  closeTime: number;

  @Column({ nullable: true })
  numberOfTrades?: number;
}
