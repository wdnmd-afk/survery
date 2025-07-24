import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InternalWhitelistGuard } from '../internal-whitelist.guard';

describe('InternalWhitelistGuard', () => {
  let guard: InternalWhitelistGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InternalWhitelistGuard],
    }).compile();

    guard = module.get<InternalWhitelistGuard>(InternalWhitelistGuard);
  });

  const createMockContext = (ip: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          ip,
          headers: {},
          connection: { remoteAddress: ip },
        }),
      }),
    } as ExecutionContext;
  };

  describe('canActivate', () => {
    beforeEach(() => {
      process.env.INTERNAL_IP_WHITELIST_ENABLED = 'true';
      process.env.INTERNAL_ALLOWED_IPS = '127.0.0.1,192.168.1.100';
    });

    afterEach(() => {
      delete process.env.INTERNAL_IP_WHITELIST_ENABLED;
      delete process.env.INTERNAL_ALLOWED_IPS;
    });

    it('should allow access for whitelisted IP', () => {
      const context = createMockContext('127.0.0.1');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access for another whitelisted IP', () => {
      const context = createMockContext('192.168.1.100');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access for non-whitelisted IP', () => {
      const context = createMockContext('192.168.1.200');
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow access when whitelist is disabled', () => {
      process.env.INTERNAL_IP_WHITELIST_ENABLED = 'false';
      const context = createMockContext('192.168.1.200');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should normalize IPv6 localhost', () => {
      const context = createMockContext('::1');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should normalize IPv4-mapped IPv6 addresses', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            ip: '::ffff:127.0.0.1',
            headers: {},
            connection: { remoteAddress: '::ffff:127.0.0.1' },
          }),
        }),
      } as ExecutionContext;
      
      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });
});