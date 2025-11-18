/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProductCategory {
  ONEWEEK = 'oneweek',
  ONEMONTH = 'onemonth',
  ONEYEAR = 'oneyear',
  OTHER = 'other',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  image?: string;

  @Column({
    type: 'enum',
    enum: ProductCategory,
    default: ProductCategory.OTHER,
  })
  category: ProductCategory;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  quantity: number;

  @Column({ nullable: true })
  distributor?: string;

  @Column({ type: 'date', nullable: true })
  entryDate?: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate?: Date;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  purchasePrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  salePrice: number;

  @Column({ nullable: true })
  barcode?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
