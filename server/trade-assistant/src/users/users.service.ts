/* eslint-disable prettier/prettier */
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from './user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  async update(userId: number, body: any) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Update user properties
    Object.assign(user, body);
    return this.usersRepo.save(user);
  }
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
  return this.usersRepo.find();
}

  async findById(id: number): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(
    name: string,
    email: string,
    password: string,
    phone?: string,
    role?: UserRole,
  ): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) throw new ConflictException('User with this email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({ name, email, password: hashedPassword, phone, role });
    return this.usersRepo.save(user);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.usersRepo.delete(id);
    return { message: 'User deleted successfully' };
  }
}
