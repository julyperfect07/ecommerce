import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { LocalGuard } from './guards/local.guard';
import { AuthDto } from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtGuard } from './guards/jwt.guard';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Helper utility to safely configure cookie properties dynamically based on environment
  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieSameSite = isProd ? 'none' : 'lax';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: cookieSameSite as any,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: cookieSameSite as any,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Req() req: Request, @Res() res: Response) {
    const { access_token, refresh_token } = await this.authService.login(
      req.user,
    );
    this.setAuthCookies(res, access_token, refresh_token);
    return res.json({ message: 'Login successful' });
  }

  @Post('register')
  register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto.email, authDto.password);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  async logout(@CurrentUser('id') userId: string, @Res() res: Response) {
    await this.authService.logout(userId);
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as any,
    };

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);
    return res.json({ message: 'Logout successful' });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('No refresh token');
    const newAccessToken = await this.authService.refreshToken(refreshToken);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as any,
      maxAge: 15 * 60 * 1000,
    });
    return res.json({ message: 'Token refreshed successfully' });
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getMe(@CurrentUser() user) {
    return user;
  }

  // --- GOOGLE OAUTH ROUTES ---

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Triggers passport redirect to Google Auth Engine
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const googleUser = req.user as any;
    const dbUser = await this.authService.findOrCreateGoogleUser(googleUser);

    // Generate standard 60-second string token
    const tempToken = await this.authService.generateTempOAuthToken(dbUser.id);

    const frontendUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://ecommerce-ten-tau-32.vercel.app'
        : 'http://localhost:3001';

    // Redirect user to Next.js route with string parameters
    return res.redirect(`${frontendUrl}/auth/callback?token=${tempToken}`);
  }

  @Post('google/exchange')
  async exchangeToken(@Body('token') token: string, @Res() res: Response) {
    const userId = await this.authService.verifyTempOAuthToken(token);
    const dbUser = await this.authService.findUserById(userId);

    const { access_token, refresh_token } =
      await this.authService.login(dbUser);

    // Drop clean HTTP-Only production cookies directly onto client context
    this.setAuthCookies(res, access_token, refresh_token);

    return res.json({ message: 'OAuth exchange successful' });
  }
}
