import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    try {
      const user = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY, // Validate using the secret key
      });
      request.user = user; // Attach decoded user info to the request
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token', error.message); // Enhanced error message
    }
  }
}