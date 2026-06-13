import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { NewsLanguage } from '../enums/news-language.enum';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  title!: string;

  @Column('text')
  content!: string;

  @Column('text', { nullable: true })
  fixedMorningMessage?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  author?: string;

  @Column({ type: 'date', nullable: true })
  publishDate?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  category?: string;

  @Column({
    type: 'enum',
    enum: NewsLanguage,
    default: NewsLanguage.EN,
  })
  language!: NewsLanguage;
}
