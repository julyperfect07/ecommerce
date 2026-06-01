import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // --- EXISTING METHODS ---
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.password)
      throw new UnauthorizedException('Please sign in with Google');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return { access_token, refresh_token };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user || !user.refreshToken) throw new UnauthorizedException();

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

      const newPayload = { sub: user.id, email: user.email, role: user.role };
      return this.jwtService.sign(newPayload, { expiresIn: '15m' });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.prisma.user.create({
      data: { email, password: hashedPassword },
    });

    return { message: 'Registration successful', userId: newUser.id };
  }

  async findOrCreateGoogleUser(googleUser: any) {
    const { email, name } = googleUser;
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { email, name, password: '', role: 'USER' },
      });
    }
    return user;
  }

  // --- NEW TOKEN EXCHANGE METHODS ---
  async generateTempOAuthToken(userId: string): Promise<string> {
    const payload = { tempSub: userId };
    // This token self-destructs in 60 seconds and cannot log into normal routes
    return this.jwtService.sign(payload, { expiresIn: '60s' });
  }

  async verifyTempOAuthToken(token: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(token);
      if (!payload.tempSub) {
        throw new UnauthorizedException('Invalid token structure');
      }
      return payload.tempSub;
    } catch {
      throw new UnauthorizedException(
        'OAuth context expired. Please log in again.',
      );
    }
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}
