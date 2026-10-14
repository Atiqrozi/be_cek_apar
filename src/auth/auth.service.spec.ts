import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  it('returns an access token and never exposes the password hash', async () => {
    const users = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 'user-id',
        email: 'admin@example.com',
        role: 'admin',
        isActive: true,
        passwordHash: await argon2.hash('correct-password'),
      }),
      toPublic: jest.fn().mockReturnValue({ id: 'user-id', email: 'admin@example.com' }),
    };
    const jwt = { signAsync: jest.fn().mockResolvedValue('access-token') };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    })
      .overrideProvider(JwtService)
      .useValue(jwt)
      .compile();
    const service = module.get(AuthService);

    await expect(service.login({ email: 'admin@example.com', password: 'correct-password' })).resolves.toEqual({
      accessToken: 'access-token',
      user: { id: 'user-id', email: 'admin@example.com' },
    });
  });

  it('uses the same error for unknown users and invalid passwords', async () => {
    const users = { findByEmail: jest.fn().mockResolvedValue(null) };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
      ],
    }).compile();

    await expect(module.get(AuthService).login({ email: 'unknown@example.com', password: 'wrong-password' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
  });
});
