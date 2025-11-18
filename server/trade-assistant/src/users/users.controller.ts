/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Param, UseGuards, Request, UseInterceptors, UnauthorizedException, Delete, Logger, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExcludePasswordInterceptor } from '../interceptors/exclude-password.interceptor';

@UseInterceptors(ExcludePasswordInterceptor)
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  // ✅ helper function за валидација на ID со логирање
  private validateId(id: string | number, context: string): number {
    const userId = typeof id === 'string' ? Number(id) : id;
    if (!userId || isNaN(userId)) {
      this.logger.warn(`Invalid ID detected in ${context}: ${id}`);
      throw new UnauthorizedException('Invalid user ID');
    }
    return userId;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const userId = this.validateId(id, 'getUser');
    return this.usersService.findById(userId);
  }
  @Put(':id')
  async updateUser(@Param('id') id: string, @Request() req) {
    const userId = this.validateId(id, 'updateUser');
    // Дополнителна логика за ажурирање на корисникот може да се додаде овде
    return this.usersService.update(userId, req.body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeUser(@Param('id') id: string) {
    const userId = this.validateId(id, 'removeUser');
    return this.usersService.remove(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/me')
  async getProfile(@Request() req) {
    const userId = this.validateId(req.user?.id, 'getProfile');
    return this.usersService.findById(userId);
  }
}
