/**
 * Subdomain Router Middleware
 * Routes requests to different content based on subdomain
 */

export interface SubdomainConfig {
  subdomain: string;
  component: string;
  title: string;
  description: string;
  redirectUrl?: string;
}

export const subdomainConfigs: SubdomainConfig[] = [
  {
    subdomain: 'joromi',
    component: 'joromi',
    title: 'JoRoMi - AI-Powered Communication Platform',
    description: 'Advanced AI communication tools for modern businesses',
    redirectUrl: 'https://joromi.ai'
  },
  {
    subdomain: 'code-academy',
    component: 'code-academy', 
    title: 'Code Academy - Learn to Code',
    description: 'Master programming with our comprehensive courses',
    redirectUrl: 'https://poisonedreligion.ai'
  }
];

export function getSubdomainFromHost(host: string): string | null {
  // Remove port if present
  const cleanHost = host.split(':')[0];
  
  // Split by dots
  const parts = cleanHost.split('.');
  
  // If we have at least 3 parts and the last two are 'tetrixcorp.com'
  if (parts.length >= 3 && parts.slice(-2).join('.') === 'tetrixcorp.com') {
    return parts[0];
  }
  
  return null;
}

export function getSubdomainConfig(host: string): SubdomainConfig | null {
  const subdomain = getSubdomainFromHost(host);
  if (!subdomain) return null;
  
  return subdomainConfigs.find(config => config.subdomain === subdomain) || null;
}

export function shouldRedirectToExternal(subdomain: string): boolean {
  const config = subdomainConfigs.find(c => c.subdomain === subdomain);
  return config?.redirectUrl ? true : false;
}

export function getExternalRedirectUrl(subdomain: string): string | null {
  const config = subdomainConfigs.find(c => c.subdomain === subdomain);
  return config?.redirectUrl || null;
}
