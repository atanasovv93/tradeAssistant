/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../users/user-role.enum';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
    phone?: string,
    role?: UserRole,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.create(name, email, password, phone, role);
    const { password: _, ...result } = user;
    return result;
  }

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }
}
