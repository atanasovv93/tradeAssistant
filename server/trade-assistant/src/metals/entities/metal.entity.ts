/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('metals')
export class Metal {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  symbol!: string;

  @Column()
  name!: string;

  @Column('decimal', {
    precision: 12,
    scale: 4,
  })
  value!: number;

  @Column('decimal', {
    precision: 12,
    scale: 4,
    default: 0,
  })
  change!: number;

  @Column('decimal', {
    precision: 12,
    scale: 4,
    default: 0,
  })
  changePercent!: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  timestamp!: Date;
}