import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';  
import { getInternalWhitelistConfig } from 'src/config/internal-whitelist';

@Injectable()
export class InternalWhitelistGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const config = getInternalWhitelistConfig();
    
    if (!config.enabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const clientIP = this.getClientIP(request);
    
    if (!this.isIPAllowed(clientIP, config.allowedIPs)) {
      throw new ForbiddenException(`Access denied for IP: ${clientIP}`);
    }

    return true;
  }

  private getClientIP(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      '0.0.0.0'
    );
  }

  private isIPAllowed(clientIP: string, allowedIPs: string[]): boolean {
    const normalizedClientIP = this.normalizeIP(clientIP);
    
    return allowedIPs.some(allowedIP => {
      const normalizedAllowedIP = this.normalizeIP(allowedIP);
      return normalizedClientIP === normalizedAllowedIP;
    });
  }

  private normalizeIP(ip: string): string {
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
      return '127.0.0.1';
    }
    
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    
    return ip;
  }
}