import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(authDto: AuthDto) {
    const { email, password } = authDto;
    const findUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!findUser) {
      throw new NotFoundException('User not found with this email');
    }
    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: findUser.id, email: findUser.email };
    return {
      message: 'Login successful',
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(authDto: AuthDto) {
    const { email, password } = authDto;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.prisma.user.create({
      data: { email, password: hashedPassword },
    });
    return { message: 'Registration successful', userId: newUser.id };
  }
}
