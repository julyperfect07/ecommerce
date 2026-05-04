import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.access_token,
      ignoreExpiration: false,
      secretOrKey: process.env.TOKEN_SECRET || 'default',
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}
