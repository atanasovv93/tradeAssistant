/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('forex_rates')
export class ForexRate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    base: string;

    @Column('jsonb') // PostgreSQL JSON column за rates
    rates: Record<string, number>;

    @Column({ type: 'bigint', nullable: false, default: () => 'EXTRACT(EPOCH FROM NOW())' })
    timestamp: number;

    @CreateDateColumn()
    createdAt: Date; // автоматски пополнува при insert
}
