import jwt from 'jsonwebtoken';
import { UserPayload } from '@shared/contracts';
import { env } from '../config/env.js';

export class TokenService {
  constructor(
    private secret: string = env.JWT_SECRET,
    private expiresIn: jwt.SignOptions['expiresIn'] = env.JWT_EXPIRATION as jwt.SignOptions['expiresIn']
  ) {}

  generateToken(payload: UserPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn
    });
  }

  verifyToken(token: string): UserPayload {
    return jwt.verify(token, this.secret) as UserPayload;
  }
}
