import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { LocalGuard } from './guards/local.guard';
import { AuthDto } from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtGuard } from './guards/jwt.guard';
import { CurrentUser } from '../common/decorators/currentuser.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    const { access_token, refresh_token } = await this.authService.login(user);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ message: 'Login successful' });
  }

  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('register')
  register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto.email, authDto.password);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  async logout(@CurrentUser('id') userId: string, @Res() res: Response) {
    await this.authService.logout(userId);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.json({ message: 'Logout successful' });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    const newAccessToken = await this.authService.refreshToken(refreshToken);

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.json({ message: 'Token refreshed successfully' });
  }
}
