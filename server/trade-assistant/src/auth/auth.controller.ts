/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { 
  Controller, Post, Body, UnauthorizedException, UsePipes, ValidationPipe, 
  UseGuards, ForbiddenException, Delete, Param, Request 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { LoginDto } from '../dto/user/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../users/user-role.enum';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // ----------------------------
  // PUBLIC REGISTER (frontend)
  // ----------------------------
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(
      dto.name,
      dto.email,
      dto.password,
      dto.phone,
      UserRole.USER
    );
  }

  // ----------------------------
  // ADMIN CREATE ADMIN
  // ----------------------------
  @Post('create-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createAdmin(@Body() dto: CreateUserDto) {
    return this.authService.register(
      dto.name,
      dto.email,
      dto.password,
      dto.phone,
      UserRole.ADMIN
    );
  }

  // ----------------------------
  // ADMIN/MODERATOR CREATE MODERATOR
  // ----------------------------
  @Post('create-moderator')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async createModerator(@Body() dto: CreateUserDto, @Request() req: any) {

    // Moderator cannot create admins
    if (req.user.role === UserRole.MODERATOR) {
      return this.authService.register(
        dto.name,
        dto.email,
        dto.password,
        dto.phone,
        UserRole.MODERATOR
      );
    }

    // Admin can set any role, but default to moderator
    const finalRole = dto.role || UserRole.MODERATOR;

    return this.authService.register(
      dto.name,
      dto.email,
      dto.password,
      dto.phone,
      finalRole
    );
  }

  // ----------------------------
  // LOGIN
  // ----------------------------
  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(user);
  }

  // ----------------------------
  // DELETE USER
  // ----------------------------
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)
  async deleteUser(@Param('id') id: number, @Request() req: any) {
    const user = await this.usersService.findById(id);

    if (req.user.role === UserRole.USER && req.user.id !== user.id) {
      throw new ForbiddenException("You can delete only your own profile");
    }

    if (req.user.role === UserRole.MODERATOR && user.role === UserRole.ADMIN) {
      throw new ForbiddenException("Moderator cannot delete admin users");
    }

    return this.usersService.remove(id);
  }
}
