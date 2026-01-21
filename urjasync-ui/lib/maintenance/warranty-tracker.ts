export interface Warranty {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'AC' | 'Washer' | 'Light' | 'Geyser' | 'Solar Panel' | 'Battery' | 'EV Charger';
  warrantyProvider: WarrantyProvider;
  warrantyType: WarrantyType;
  coverage: WarrantyCoverage;
  purchaseInfo: PurchaseInfo;
  activationDate: Date;
  expirationDate: Date;
  status: 'Active' | 'Expired' | 'Void' | 'Pending' | 'Claimed';
  remainingCoverage: number; // percentage
  claims: WarrantyClaim[];
  documents: WarrantyDocument[];
  maintenanceRequirements: MaintenanceRequirement[];
  autoRenewal: AutoRenewalSettings;
  notifications: NotificationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarrantyProvider {
  id: string;
  name: string;
  type: 'Manufacturer' | 'Extended' | 'Service Provider' | 'Insurance';
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  supportHours: {
    weekdays: string;
    weekends: string;
    emergency?: string;
  };
  rating: number; // 1-5
  certified: boolean;
}

export interface WarrantyType {
  id: string;
  name: string;
  category: 'Standard' | 'Extended' | 'Premium' | 'Comprehensive';
  duration: number; // months
  terms: WarrantyTerms;
  exclusions: string[];
  deductibles: DeductibleInfo;
  transferability: TransferabilityInfo;
}

export interface WarrantyTerms {
  partsCoverage: number; // percentage or years
  laborCoverage: number; // percentage or years
  serviceCallCoverage: boolean;
  accidentalDamageCoverage: boolean;
  powerSurgeProtection: boolean;
  environmentalCoverage: boolean;
  wearAndTearCoverage: boolean;
  depreciationPolicy: string;
}

export interface DeductibleInfo {
  hasDeductible: boolean;
  amount: number;
  perClaim?: boolean;
  waivedConditions?: string[];
}

export interface TransferabilityInfo {
  transferable: boolean;
  transferFee: number;
  requirements: string[];
  restrictions: string[];
}

export interface WarrantyCoverage {
  coveredComponents: CoveredComponent[];
  coverageLimits: CoverageLimit[];
  serviceTypes: ServiceType[];
  geographicalLimits: string[];
  conditions: string[];
}

export interface CoveredComponent {
  name: string;
  covered: boolean;
  coveragePercentage: number;
  conditions?: string[];
  exclusions?: string[];
}

export interface CoverageLimit {
  type: 'Annual' | 'Per Claim' | 'Lifetime';
  amount: number;
  currency: string;
  appliesTo: string[];
}

export interface ServiceType {
  type: 'Repair' | 'Replacement' | 'Maintenance' | 'Inspection';
  covered: boolean;
  conditions?: string[];
  limitations?: string[];
}

export interface PurchaseInfo {
  purchaseDate: Date;
  purchasePrice: number;
  currency: string;
  retailer: string;
  receiptNumber?: string;
  invoiceNumber?: string;
  paymentMethod: string;
  extendedWarrantyPurchased: boolean;
  extendedWarrantyCost?: number;
}

export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  claimDate: Date;
  issueDescription: string;
  issueCategory: string;
  diagnosis: string;
  resolution: string;
  status: 'Filed' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed' | 'Under Review';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedCost: number;
  approvedAmount?: number;
  actualCost?: number;
  deductible?: number;
  serviceProvider?: string;
  technician?: string;
  partsUsed: ClaimPart[];
  laborHours: number;
  laborRate: number;
  documents: ClaimDocument[];
  timeline: ClaimTimelineEntry[];
  customerFeedback?: {
    rating: number; // 1-5
    comments: string;
    date: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface ClaimPart {
  name: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  covered: boolean;
  warrantyCoverage: number; // percentage
}

export interface ClaimDocument {
  id: string;
  type: 'Invoice' | 'Receipt' | 'Photo' | 'Diagnostic Report' | 'Technician Report' | 'Communication';
  name: string;
  url: string;
  uploadDate: Date;
  fileSize: number;
  mimeType: string;
}

export interface ClaimTimelineEntry {
  date: Date;
  action: string;
  description: string;
  performedBy: string;
  status: string;
}

export interface WarrantyDocument {
  id: string;
  type: 'Warranty Certificate' | 'Purchase Receipt' | 'Extended Warranty' | 'Terms & Conditions' | 'Service Record';
  name: string;
  url: string;
  uploadDate: Date;
  fileSize: number;
  mimeType: string;
  expiryDate?: Date;
  verified: boolean;
}

export interface MaintenanceRequirement {
  id: string;
  requirement: string;
  frequency: 'Monthly' | 'Quarterly' | 'Semi-Annually' | 'Annually';
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
  provider?: string;
  cost?: number;
  proofDocument?: string;
}

export interface AutoRenewalSettings {
  enabled: boolean;
  renewalPeriod: number; // days before expiration
  autoCharge: boolean;
  paymentMethod?: string;
  renewalPrice?: number;
  lastRenewalDate?: Date;
  nextRenewalDate?: Date;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  expirationReminder: number; // days before
  maintenanceReminder: number; // days before
  claimUpdates: boolean;
  renewalReminder: boolean;
  emailAddress?: string;
  phoneNumber?: string;
}

export interface WarrantyAnalytics {
  totalWarranties: number;
  activeWarranties: number;
  expiredWarranties: number;
  totalClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  totalClaimValue: number;
  averageClaimValue: number;
  warrantyProviders: ProviderStats[];
  deviceTypeStats: DeviceTypeStats[];
  upcomingExpirations: Warranty[];
  claimsByMonth: MonthlyClaimData[];
}

export interface ProviderStats {
  providerName: string;
  warrantyCount: number;
  claimCount: number;
  approvalRate: number;
  averageClaimValue: number;
  customerRating: number;
}

export interface DeviceTypeStats {
  deviceType: string;
  warrantyCount: number;
  claimCount: number;
  failureRate: number;
  averageClaimValue: number;
  mostCommonIssues: string[];
}

export interface MonthlyClaimData {
  month: string;
  year: number;
  claimCount: number;
  totalValue: number;
  approvedCount: number;
}

export class WarrantyTracker {
  private warranties: Map<string, Warranty> = new Map();
  private claims: Map<string, WarrantyClaim> = new Map();
  private providers: Map<string, WarrantyProvider> = new Map();

  constructor() {
    this.initializeProviders();
    this.initializeSampleWarranties();
  }

  private initializeProviders() {
    const providers: WarrantyProvider[] = [
      {
        id: 'PROV001',
        name: 'CoolAir Manufacturing',
        type: 'Manufacturer',
        contactInfo: {
          phone: '+1-800-COOLAIR',
          email: 'warranty@coolair.com',
          website: 'https://coolair.com/warranty',
          address: {
            street: '123 Manufacturing Blvd',
            city: 'Dallas',
            state: 'TX',
            zipCode: '75201',
            country: 'USA'
          }
        },
        supportHours: {
          weekdays: '8:00 AM - 8:00 PM EST',
          weekends: '9:00 AM - 5:00 PM EST',
          emergency: '24/7 for emergency repairs'
        },
        rating: 4.3,
        certified: true
      },
      {
        id: 'PROV002',
        name: 'ShieldGuard Extended Warranty',
        type: 'Extended',
        contactInfo: {
          phone: '+1-800-SHIELD',
          email: 'claims@shieldguard.com',
          website: 'https://shieldguard.com',
          address: {
            street: '456 Insurance Ave',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          }
        },
        supportHours: {
          weekdays: '7:00 AM - 9:00 PM CST',
          weekends: '8:00 AM - 6:00 PM CST'
        },
        rating: 4.1,
        certified: true
      },
      {
        id: 'PROV003',
        name: 'SolarTech Industries',
        type: 'Manufacturer',
        contactInfo: {
          phone: '+1-800-SOLARTECH',
          email: 'warranty@solartech.com',
          website: 'https://solartech.com/support',
          address: {
            street: '789 Renewable Way',
            city: 'Phoenix',
            state: 'AZ',
            zipCode: '85001',
            country: 'USA'
          }
        },
        supportHours: {
          weekdays: '6:00 AM - 7:00 PM MST',
          weekends: '7:00 AM - 4:00 PM MST',
          emergency: '24/7 for system failures'
        },
        rating: 4.6,
        certified: true
      }
    ];

    providers.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
  }

  private initializeSampleWarranties() {
    const sampleWarranties: Warranty[] = [
      {
        id: 'WARR001',
        deviceId: 'AC001',
        deviceName: 'Living Room AC',
        deviceType: 'AC',
        warrantyProvider: this.providers.get('PROV001')!,
        warrantyType: {
          id: 'TYPE001',
          name: 'Standard Manufacturer Warranty',
          category: 'Standard',
          duration: 60, // 5 years
          terms: {
            partsCoverage: 100,
            laborCoverage: 100,
            serviceCallCoverage: true,
            accidentalDamageCoverage: false,
            powerSurgeProtection: true,
            environmentalCoverage: false,
            wearAndTearCoverage: true,
            depreciationPolicy: 'No depreciation for first 3 years'
          },
          exclusions: ['Cosmetic damage', 'Damage from misuse', 'Natural disasters'],
          deductibles: {
            hasDeductible: false,
            amount: 0
          },
          transferability: {
            transferable: true,
            transferFee: 50,
            requirements: ['Original proof of purchase', 'Transfer form'],
            restrictions: ['Only within original country of purchase']
          }
        },
        coverage: {
          coveredComponents: [
            { name: 'Compressor', covered: true, coveragePercentage: 100 },
            { name: 'Condenser Coils', covered: true, coveragePercentage: 100 },
            { name: 'Evaporator Coils', covered: true, coveragePercentage: 100 },
            { name: 'Fan Motor', covered: true, coveragePercentage: 100 },
            { name: 'Thermostat', covered: true, coveragePercentage: 100 },
            { name: 'Filters', covered: false, coveragePercentage: 0, exclusions: ['Considered consumable'] }
          ],
          coverageLimits: [
            { type: 'Annual', amount: 2000, currency: 'USD', appliesTo: ['All components'] },
            { type: 'Lifetime', amount: 5000, currency: 'USD', appliesTo: ['Compressor'] }
          ],
          serviceTypes: [
            { type: 'Repair', covered: true },
            { type: 'Replacement', covered: true },
            { type: 'Maintenance', covered: false, limitations: ['Only covered under preventive maintenance plan'] },
            { type: 'Inspection', covered: false }
          ],
          geographicalLimits: ['USA', 'Canada'],
          conditions: ['Must be installed by certified technician', 'Regular maintenance required']
        },
        purchaseInfo: {
          purchaseDate: new Date('2022-03-15'),
          purchasePrice: 2500,
          currency: 'USD',
          retailer: 'Home Depot',
          receiptNumber: 'HD-2022-0315-001',
          paymentMethod: 'Credit Card',
          extendedWarrantyPurchased: false
        },
        activationDate: new Date('2022-03-15'),
        expirationDate: new Date('2027-03-15'),
        status: 'Active',
        remainingCoverage: 65, // 65% of warranty period remaining
        claims: [],
        documents: [
          {
            id: 'DOC001',
            type: 'Warranty Certificate',
            name: 'CoolAir_Warranty_Certificate_AC001.pdf',
            url: '/documents/warranties/COOLAIR_WARR001.pdf',
            uploadDate: new Date('2022-03-15'),
            fileSize: 245678,
            mimeType: 'application/pdf',
            verified: true
          }
        ],
        maintenanceRequirements: [
          {
            id: 'MAINT001',
            requirement: 'Annual professional inspection',
            frequency: 'Annually',
            dueDate: new Date('2024-03-15'),
            completed: false
          },
          {
            id: 'MAINT002',
            requirement: 'Filter cleaning/replacement',
            frequency: 'Monthly',
            dueDate: new Date('2024-02-01'),
            completed: true,
            completedDate: new Date('2024-02-01'),
            provider: 'Self',
            cost: 25
          }
        ],
        autoRenewal: {
          enabled: false,
          renewalPeriod: 30,
          autoCharge: false
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true,
          expirationReminder: 90,
          maintenanceReminder: 30,
          claimUpdates: true,
          renewalReminder: false,
          emailAddress: 'user@example.com',
          phoneNumber: '+1-555-0123'
        },
        createdAt: new Date('2022-03-15'),
        updatedAt: new Date('2024-02-01')
      },
      {
        id: 'WARR002',
        deviceId: 'SOLAR003',
        deviceName: 'Rooftop Solar Panel System',
        deviceType: 'Solar Panel',
        warrantyProvider: this.providers.get('PROV003')!,
        warrantyType: {
          id: 'TYPE002',
          name: 'Premium Solar Warranty',
          category: 'Premium',
          duration: 300, // 25 years
          terms: {
            partsCoverage: 100,
            laborCoverage: 100,
            serviceCallCoverage: true,
            accidentalDamageCoverage: true,
            powerSurgeProtection: true,
            environmentalCoverage: true,
            wearAndTearCoverage: true,
            depreciationPolicy: 'No depreciation for entire warranty period'
          },
          exclusions: ['Damage from improper installation', 'Vandalism'],
          deductibles: {
            hasDeductible: true,
            amount: 100,
            perClaim: true,
            waivedConditions: ['Manufacturing defects']
          },
          transferability: {
            transferable: true,
            transferFee: 150,
            requirements: ['Transfer registration', 'Property ownership proof'],
            restrictions: ['Must be transferred within 30 days of property sale']
          }
        },
        coverage: {
          coveredComponents: [
            { name: 'Solar Panels', covered: true, coveragePercentage: 100 },
            { name: 'Inverter', covered: true, coveragePercentage: 100 },
            { name: 'Mounting Hardware', covered: true, coveragePercentage: 100 },
            { name: 'Wiring', covered: true, coveragePercentage: 100 },
            { name: 'Monitoring System', covered: true, coveragePercentage: 100 }
          ],
          coverageLimits: [
            { type: 'Per Claim', amount: 10000, currency: 'USD', appliesTo: ['All components'] },
            { type: 'Annual', amount: 25000, currency: 'USD', appliesTo: ['All components'] }
          ],
          serviceTypes: [
            { type: 'Repair', covered: true },
            { type: 'Replacement', covered: true },
            { type: 'Maintenance', covered: true, limitations: ['Only preventive maintenance'] },
            { type: 'Inspection', covered: true }
          ],
          geographicalLimits: ['USA'],
          conditions: ['Professional installation required', 'Regular monitoring required']
        },
        purchaseInfo: {
          purchaseDate: new Date('2021-06-20'),
          purchasePrice: 15000,
          currency: 'USD',
          retailer: 'SolarTech Direct',
          invoiceNumber: 'ST-2021-0620-001',
          paymentMethod: 'Bank Transfer',
          extendedWarrantyPurchased: false
        },
        activationDate: new Date('2021-06-20'),
        expirationDate: new Date('2046-06-20'),
        status: 'Active',
        remainingCoverage: 90, // 90% of warranty period remaining
        claims: [],
        documents: [
          {
            id: 'DOC002',
            type: 'Warranty Certificate',
            name: 'SolarTech_Premium_Warranty_Solar003.pdf',
            url: '/documents/warranties/SOLARTECH_WARR002.pdf',
            uploadDate: new Date('2021-06-20'),
            fileSize: 456789,
            mimeType: 'application/pdf',
            verified: true
          }
        ],
        maintenanceRequirements: [
          {
            id: 'MAINT003',
            requirement: 'Annual system inspection',
            frequency: 'Annually',
            dueDate: new Date('2024-06-20'),
            completed: false
          },
          {
            id: 'MAINT004',
            requirement: 'Panel cleaning',
            frequency: 'Semi-Annually',
            dueDate: new Date('2024-03-20'),
            completed: true,
            completedDate: new Date('2024-03-18'),
            provider: 'SolarTech Services',
            cost: 200
          }
        ],
        autoRenewal: {
          enabled: false,
          renewalPeriod: 90,
          autoCharge: false
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          expirationReminder: 365,
          maintenanceReminder: 60,
          claimUpdates: true,
          renewalReminder: false,
          emailAddress: 'user@example.com'
        },
        createdAt: new Date('2021-06-20'),
        updatedAt: new Date('2024-03-18')
      }
    ];

    sampleWarranties.forEach(warranty => {
      this.warranties.set(warranty.id, warranty);
    });
  }

  async addWarranty(warrantyData: Omit<Warranty, 'id' | 'createdAt' | 'updatedAt' | 'remainingCoverage'>): Promise<Warranty> {
    const warranty: Warranty = {
      ...warrantyData,
      id: `WARR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      remainingCoverage: this.calculateRemainingCoverage(warrantyData.activationDate, warrantyData.expirationDate),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.warranties.set(warranty.id, warranty);
    return warranty;
  }

  private calculateRemainingCoverage(activationDate: Date, expirationDate: Date): number {
    const now = new Date();
    const totalDuration = expirationDate.getTime() - activationDate.getTime();
    const elapsed = now.getTime() - activationDate.getTime();
    
    if (elapsed >= totalDuration) return 0;
    if (elapsed <= 0) return 100;
    
    return Math.round(((totalDuration - elapsed) / totalDuration) * 100);
  }

  async fileClaim(claimData: Omit<WarrantyClaim, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<WarrantyClaim> {
    const claim: WarrantyClaim = {
      ...claimData,
      id: `CLAIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'Filed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add initial timeline entry
    claim.timeline.push({
      date: new Date(),
      action: 'Claim Filed',
      description: 'Claim has been filed and is under initial review',
      performedBy: 'Customer',
      status: 'Filed'
    });

    this.claims.set(claim.id, claim);

    // Update warranty with new claim
    const warranty = this.warranties.get(claim.warrantyId);
    if (warranty) {
      warranty.claims.push(claim);
      warranty.updatedAt = new Date();
      this.warranties.set(warranty.id, warranty);
    }

    return claim;
  }

  async updateClaimStatus(claimId: string, status: WarrantyClaim['status'], notes?: string): Promise<WarrantyClaim | null> {
    const claim = this.claims.get(claimId);
    if (!claim) return null;

    claim.status = status;
    claim.updatedAt = new Date();

    // Add timeline entry
    claim.timeline.push({
      date: new Date(),
      action: `Status Updated to ${status}`,
      description: notes || `Claim status has been updated to ${status}`,
      performedBy: 'System',
      status
    });

    if (status === 'Completed') {
      claim.resolvedAt = new Date();
    }

    this.claims.set(claimId, claim);
    return claim;
  }

  async getWarranty(warrantyId: string): Promise<Warranty | null> {
    const warranty = this.warranties.get(warrantyId);
    if (warranty) {
      // Update remaining coverage
      warranty.remainingCoverage = this.calculateRemainingCoverage(warranty.activationDate, warranty.expirationDate);
      
      // Update status if expired
      if (warranty.remainingCoverage === 0 && warranty.status === 'Active') {
        warranty.status = 'Expired';
        warranty.updatedAt = new Date();
      }
    }
    return warranty || null;
  }

  async getWarrantiesByDevice(deviceId: string): Promise<Warranty[]> {
    return Array.from(this.warranties.values()).filter(warranty => warranty.deviceId === deviceId);
  }

  async getAllWarranties(): Promise<Warranty[]> {
    return Array.from(this.warranties.values());
  }

  async getActiveWarranties(): Promise<Warranty[]> {
    return Array.from(this.warranties.values()).filter(warranty => warranty.status === 'Active');
  }

  async getExpiringWarranties(daysThreshold: number = 90): Promise<Warranty[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);
    
    return Array.from(this.warranties.values())
      .filter(warranty => 
        warranty.status === 'Active' && 
        warranty.expirationDate <= threshold
      )
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
  }

  async getClaim(claimId: string): Promise<WarrantyClaim | null> {
    return this.claims.get(claimId) || null;
  }

  async getClaimsByWarranty(warrantyId: string): Promise<WarrantyClaim[]> {
    return Array.from(this.claims.values()).filter(claim => claim.warrantyId === warrantyId);
  }

  async getAllClaims(): Promise<WarrantyClaim[]> {
    return Array.from(this.claims.values());
  }

  async getClaimsByStatus(status: WarrantyClaim['status']): Promise<WarrantyClaim[]> {
    return Array.from(this.claims.values()).filter(claim => claim.status === status);
  }

  async updateMaintenanceRequirement(warrantyId: string, requirementId: string, completed: boolean, completedDate?: Date, provider?: string, cost?: number): Promise<Warranty | null> {
    const warranty = this.warranties.get(warrantyId);
    if (!warranty) return null;

    const requirement = warranty.maintenanceRequirements.find(req => req.id === requirementId);
    if (requirement) {
      requirement.completed = completed;
      if (completed) {
        requirement.completedDate = completedDate || new Date();
        requirement.provider = provider;
        requirement.cost = cost;
        
        // Calculate next due date
        const frequencies = {
          'Monthly': 30,
          'Quarterly': 90,
          'Semi-Annually': 180,
          'Annually': 365
        };
        const days = frequencies[requirement.frequency] || 365;
        requirement.dueDate = new Date(requirement.completedDate.getTime() + days * 24 * 60 * 60 * 1000);
      }
      
      warranty.updatedAt = new Date();
      this.warranties.set(warrantyId, warranty);
    }

    return warranty;
  }

  async getWarrantyAnalytics(_startDate?: Date, _endDate?: Date): Promise<WarrantyAnalytics> {
    const warranties = Array.from(this.warranties.values());
    const claims = Array.from(this.claims.values());

    const totalWarranties = warranties.length;
    const activeWarranties = warranties.filter(w => w.status === 'Active').length;
    const expiredWarranties = warranties.filter(w => w.status === 'Expired').length;
    
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(c => c.status === 'Approved' || c.status === 'Completed').length;
    const rejectedClaims = claims.filter(c => c.status === 'Rejected').length;
    
    const totalClaimValue = claims.reduce((sum, claim) => sum + (claim.actualCost || claim.estimatedCost), 0);
    const averageClaimValue = totalClaims > 0 ? totalClaimValue / totalClaims : 0;

    // Provider statistics
    const providerStats = Array.from(this.providers.values()).map(provider => {
      const providerWarranties = warranties.filter(w => w.warrantyProvider.id === provider.id);
      const providerClaims = claims.filter(c => {
        const warranty = warranties.find(w => w.id === c.warrantyId);
        return warranty?.warrantyProvider.id === provider.id;
      });
      
      const approvedProviderClaims = providerClaims.filter(c => c.status === 'Approved' || c.status === 'Completed');
      const providerClaimValue = approvedProviderClaims.reduce((sum, claim) => sum + (claim.actualCost || claim.approvedAmount || 0), 0);
      
      return {
        providerName: provider.name,
        warrantyCount: providerWarranties.length,
        claimCount: providerClaims.length,
        approvalRate: providerClaims.length > 0 ? (approvedProviderClaims.length / providerClaims.length) * 100 : 0,
        averageClaimValue: approvedProviderClaims.length > 0 ? providerClaimValue / approvedProviderClaims.length : 0,
        customerRating: provider.rating
      };
    });

    // Device type statistics
    const deviceTypeMap = new Map<string, { count: number; claims: number; totalValue: number; issues: string[] }>();
    
    warranties.forEach(warranty => {
      const existing = deviceTypeMap.get(warranty.deviceType) || { count: 0, claims: 0, totalValue: 0, issues: [] };
      existing.count++;
      deviceTypeMap.set(warranty.deviceType, existing);
    });

    claims.forEach(claim => {
      const warranty = warranties.find(w => w.id === claim.warrantyId);
      if (warranty) {
        const existing = deviceTypeMap.get(warranty.deviceType) || { count: 0, claims: 0, totalValue: 0, issues: [] };
        existing.claims++;
        existing.totalValue += claim.actualCost || claim.estimatedCost;
        if (!existing.issues.includes(claim.issueCategory)) {
          existing.issues.push(claim.issueCategory);
        }
        deviceTypeMap.set(warranty.deviceType, existing);
      }
    });

    const deviceTypeStats = Array.from(deviceTypeMap.entries()).map(([deviceType, stats]) => ({
      deviceType,
      warrantyCount: stats.count,
      claimCount: stats.claims,
      failureRate: stats.count > 0 ? (stats.claims / stats.count) * 100 : 0,
      averageClaimValue: stats.claims > 0 ? stats.totalValue / stats.claims : 0,
      mostCommonIssues: stats.issues
    }));

    // Upcoming expirations
    const upcomingExpirations = await this.getExpiringWarranties(90);

    // Monthly claims data (simplified)
    const monthlyClaimData = this.generateMonthlyClaimData(claims);

    return {
      totalWarranties,
      activeWarranties,
      expiredWarranties,
      totalClaims,
      approvedClaims,
      rejectedClaims,
      totalClaimValue,
      averageClaimValue: Math.round(averageClaimValue * 100) / 100,
      warrantyProviders: providerStats,
      deviceTypeStats,
      upcomingExpirations,
      claimsByMonth: monthlyClaimData
    };
  }

  private generateMonthlyClaimData(claims: WarrantyClaim[]): MonthlyClaimData[] {
    const monthlyData = new Map<string, MonthlyClaimData>();
    const now = new Date();
    
    // Generate data for last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      
      monthlyData.set(key, {
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        claimCount: 0,
        totalValue: 0,
        approvedCount: 0
      });
    }

    claims.forEach(claim => {
      const claimDate = claim.createdAt;
      const key = `${claimDate.getFullYear()}-${claimDate.getMonth()}`;
      const data = monthlyData.get(key);
      
      if (data) {
        data.claimCount++;
        data.totalValue += claim.actualCost || claim.estimatedCost;
        if (claim.status === 'Approved' || claim.status === 'Completed') {
          data.approvedCount++;
        }
      }
    });

    return Array.from(monthlyData.values());
  }
}

let warrantyTrackerInstance: WarrantyTracker | null = null;

export function getWarrantyTracker(): WarrantyTracker {
  if (!warrantyTrackerInstance) {
    warrantyTrackerInstance = new WarrantyTracker();
  }
  return warrantyTrackerInstance;
}
