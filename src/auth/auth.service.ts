import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { LoginDto } from './login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Email atau password tidak valid');
    }
    return {
      accessToken: await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      user: this.usersService.toPublic(user),
    };
  }

  me(id: string) {
    return this.usersService.findPublicById(id);
  }
}
