import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { LocalGuard } from './guards/local.guard';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Req() req: Request, @Res() res: Response) {
    const user = req.user;

    const { access_token } = await this.authService.login(user);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    return res.json({ message: 'Login successful' });
  }

  @Post('register')
  register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto.email, authDto.password);
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.json({ message: 'Logout successful' });
  }
}
