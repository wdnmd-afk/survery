import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from 'src/modules/auth/services/auth-redis.service';

@Injectable()
export class OptionalAuthInterceptor implements NestInterceptor {
  constructor(private readonly authService: AuthService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const user = await this.authService.verifyToken(token);
        request.user = user;
      } catch (error) {
        // JWT解析失败时，不抛出错误，user保持undefined
        console.log('JWT解析失败，但不影响请求继续:', error.message);
      }
    }

    return next.handle();
  }
}