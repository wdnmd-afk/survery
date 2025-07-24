export interface InternalWhitelistConfig {
  allowedIPs: string[];
  enabled: boolean;
}

export const getInternalWhitelistConfig = (): InternalWhitelistConfig => {
  const allowedIPs = process.env.INTERNAL_ALLOWED_IPS?.split(',') || [
    '127.0.0.1',
    '::1',
    'localhost'
  ];

  return {
    allowedIPs: allowedIPs.map(ip => ip.trim()),
    enabled: process.env.INTERNAL_IP_WHITELIST_ENABLED !== 'false'
  };
};