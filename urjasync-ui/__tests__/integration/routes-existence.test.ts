import { describe, it, expect } from '@jest/globals';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const projectRoot = join(__dirname, '../../..');

describe('API Routes Structure Tests', () => {
  
  describe('Authentication Routes', () => {
    it('should have login route file', () => {
      const routePath = join(projectRoot, 'app/api/auth/login/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have register route file', () => {
      const routePath = join(projectRoot, 'app/api/auth/register/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have forgot-password route file', () => {
      const routePath = join(projectRoot, 'app/api/auth/forgot-password/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });
  });

  describe('Energy Routes', () => {
    it('should have consumption route file', () => {
      const routePath = join(projectRoot, 'app/api/energy/consumption/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have live route file', () => {
      const routePath = join(projectRoot, 'app/api/energy/live/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have forecasting route file', () => {
      const routePath = join(projectRoot, 'app/api/energy/forecasting/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });
  });

  describe('Device Routes', () => {
    it('should have devices route file', () => {
      const routePath = join(projectRoot, 'app/api/devices/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have device control route file', () => {
      const routePath = join(projectRoot, 'app/api/devices/control/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have device discovery route file', () => {
      const routePath = join(projectRoot, 'app/api/devices/discovery/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });
  });

  describe('Billing Routes', () => {
    it('should have bills route file', () => {
      const routePath = join(projectRoot, 'app/api/billing/bills/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have invoices route file', () => {
      const routePath = join(projectRoot, 'app/api/billing/invoices/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have payments route file', () => {
      const routePath = join(projectRoot, 'app/api/billing/payments/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });
  });

  describe('Notification Routes', () => {
    it('should have alerts route file', () => {
      const routePath = join(projectRoot, 'app/api/notifications/alerts/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have preferences route file', () => {
      const routePath = join(projectRoot, 'app/api/notifications/preferences/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have push route file', () => {
      const routePath = join(projectRoot, 'app/api/notifications/push/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });
  });

  describe('Analytics Routes', () => {
    it('should have enhanced analytics route file', () => {
      const routePath = join(projectRoot, 'app/api/analytics/enhanced/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have predictions route file', () => {
      const routePath = join(projectRoot, 'app/api/analytics/predictions/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have recommendations route file', () => {
      const routePath = join(projectRoot, 'app/api/analytics/recommendations/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });
  });

  describe('Maintenance Routes', () => {
    it('should have health route file', () => {
      const routePath = join(projectRoot, 'app/api/maintenance/health/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have predictions route file', () => {
      const routePath = join(projectRoot, 'app/api/maintenance/predictions/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have schedule route file', () => {
      const routePath = join(projectRoot, 'app/api/maintenance/schedule/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });
  });

  describe('Cost Optimization Routes', () => {
    it('should have budget route file', () => {
      const routePath = join(projectRoot, 'app/api/cost-optimization/budget/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have savings route file', () => {
      const routePath = join(projectRoot, 'app/api/cost-optimization/savings/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have tariff route file', () => {
      const routePath = join(projectRoot, 'app/api/cost-optimization/tariff/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });
  });

  describe('Microgrid Routes', () => {
    it('should have microgrid route file', () => {
      const routePath = join(projectRoot, 'app/api/microgrid/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have communities route file', () => {
      const routePath = join(projectRoot, 'app/api/microgrid/communities/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });

    it('should have trading route file', () => {
      const routePath = join(projectRoot, 'app/api/microgrid/trading/route.ts');
      expect(existsSync(routePath)).toBe(true);
    });
  });
});

describe('Page Routes Structure Tests', () => {
  
  describe('Authentication Pages', () => {
    it('should have login page', () => {
      const pagePath = join(projectRoot, 'app/auth/login/page.tsx');
      expect(existsSync(pagePath)).toBe(true);
    });

    it('should have register page', () => {
      const pagePath = join(projectRoot, 'app/auth/register/page.tsx');
      expect(existsSync(pagePath)).toBe(true);
    });

    it('should have forgot-password page', () => {
      const pagePath = join(projectRoot, 'app/auth/forgot-password/page.tsx');
      expect(existsSync(pagePath)).toBe(true);
    });

    it('should have reset-password page', () => {
      const pagePath = join(projectRoot, 'app/auth/reset-password/page.tsx');
      expect(existsSync(pagePath)).toBe(true);
    });

    it('should have verify-email page', () => {
      const pagePath = join(projectRoot, 'app/auth/verify-email/page.tsx');
      expect(existsSync(pagePath)).toBe(true);
    });
  });

  describe('Main Pages', () => {
    it('should have home page', () => {
      const pagePath = join(projectRoot, 'app/page.tsx');
      expect(existsSync(pagePath)).toBe(true);
    });

    it('should have dashboard page', () => {
      const pagePath = join(projectRoot, 'app/dashboard/page.tsx');
      expect(existsSync(pagePath)).toBe(true);
    });
  });
});

describe('Total Routes Count', () => {
  it('should have expected number of API routes', () => {
    const apiDir = join(projectRoot, 'app/api');
    let routeCount = 0;
    
    function countRoutes(dir: string) {
      try {
        const items = readdirSync(dir);
        for (const item of items) {
          const itemPath = join(dir, item);
          const stat = require('fs').statSync(itemPath);
          
          if (stat.isDirectory()) {
            countRoutes(itemPath);
          } else if (item === 'route.ts') {
            routeCount++;
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
      }
    }
    
    countRoutes(apiDir);
    
    // We expect at least 40 API routes based on our earlier discovery
    expect(routeCount).toBeGreaterThan(40);
    console.log(`Total API routes found: ${routeCount}`);
  });

  it('should have expected number of page routes', () => {
    const appDir = join(projectRoot, 'app');
    let pageCount = 0;
    
    function countPages(dir: string) {
      try {
        const items = readdirSync(dir);
        for (const item of items) {
          const itemPath = join(dir, item);
          const stat = require('fs').statSync(itemPath);
          
          if (stat.isDirectory()) {
            countPages(itemPath);
          } else if (item === 'page.tsx') {
            pageCount++;
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
      }
    }
    
    countPages(appDir);
    
    // We expect at least 7 page routes
    expect(pageCount).toBeGreaterThanOrEqual(7);
    console.log(`Total page routes found: ${pageCount}`);
  });
});
