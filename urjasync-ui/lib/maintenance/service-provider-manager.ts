export interface ServiceProvider {
  id: string;
  name: string;
  type: 'HVAC' | 'Electrical' | 'Plumbing' | 'Solar' | 'General' | 'Emergency';
  contactInfo: ContactInfo;
  services: ServiceOffering[];
  coverage: GeographicCoverage;
  ratings: ProviderRatings;
  certifications: Certification[];
  availability: AvailabilitySchedule;
  pricing: PricingStructure;
  responseTime: ResponseTimeMetrics;
  specialties: string[];
  insurance: InsuranceInfo;
  contractTerms: ContractTerms;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
  address: Address;
  emergencyContact?: string;
  bookingPortal?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ServiceOffering {
  id: string;
  name: string;
  description: string;
  category: 'Repair' | 'Installation' | 'Maintenance' | 'Inspection' | 'Emergency';
  deviceTypes: string[];
  basePrice: number;
  estimatedDuration: number; // minutes
  requiresParts: boolean;
  warrantyPeriod: number; // days
}

export interface GeographicCoverage {
  serviceAreas: ServiceArea[];
  travelRadius: number; // kilometers
  travelFee: number;
  minimumServiceCharge: number;
}

export interface ServiceArea {
  city: string;
  state: string;
  zipCodes: string[];
  additionalFee?: number;
}

export interface ProviderRatings {
  overall: number; // 1-5
  quality: number; // 1-5
  timeliness: number; // 1-5
  professionalism: number; // 1-5
  value: number; // 1-5
  totalReviews: number;
  recentReviews: Review[];
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  serviceDate: Date;
  serviceType: string;
  verified: boolean;
  response?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate: Date;
  credentialNumber: string;
  verified: boolean;
}

export interface AvailabilitySchedule {
  regularHours: WeeklySchedule;
  emergencyAvailability: EmergencySchedule;
  holidays: Holiday[];
  leadTime: number; // days for regular booking
  emergencyLeadTime: number; // hours for emergency service
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  breaks: TimeBreak[];
}

export interface TimeBreak {
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface EmergencySchedule {
  available24_7: boolean;
  afterHours: AfterHoursSchedule;
  weekendService: boolean;
  holidayService: boolean;
}

export interface AfterHoursSchedule {
  available: boolean;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  additionalFee: number;
}

export interface Holiday {
  date: Date;
  name: string;
  closed: boolean;
  specialHours?: DaySchedule;
}

export interface PricingStructure {
  hourlyRate: number;
  callOutFee: number;
  emergencyFee: number;
  weekendFee: number;
  holidayFee: number;
  paymentMethods: PaymentMethod[];
  billingCycle: 'Per Visit' | 'Monthly' | 'Per Project';
  depositRequired: boolean;
  depositAmount?: number;
}

export interface PaymentMethod {
  type: 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Digital Wallet' | 'Insurance';
  accepted: boolean;
  processingFee?: number;
}

export interface ResponseTimeMetrics {
  averageResponseTime: number; // minutes
  emergencyResponseTime: number; // minutes
  onTimeArrivalRate: number; // percentage
  firstCallResolution: number; // percentage
}

export interface InsuranceInfo {
  liabilityInsurance: boolean;
  liabilityCoverage: number;
  workersCompensation: boolean;
  bondRequired: boolean;
  bondAmount?: number;
  certificateOfInsurance?: string;
}

export interface ContractTerms {
  serviceLevelAgreement: SLA[];
  cancellationPolicy: CancellationPolicy;
  warrantyTerms: WarrantyTerms;
  paymentTerms: PaymentTerms;
}

export interface SLA {
  metric: string;
  target: number;
  unit: string;
  penalty: string;
}

export interface CancellationPolicy {
  noticePeriod: number; // hours
  cancellationFee: number; // percentage or fixed amount
  freeCancellationWindow: number; // hours
  emergencyExceptions: boolean;
}

export interface WarrantyTerms {
  workmanshipWarranty: number; // days
  partsWarranty: number; // days
  laborWarranty: number; // days
  coverageDetails: string;
}

export interface PaymentTerms {
  dueDate: number; // days after service
  lateFee: number; // percentage or fixed amount
  gracePeriod: number; // days
  earlyPaymentDiscount?: number; // percentage
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  providerId: string;
  deviceId?: string;
  deviceType?: string;
  serviceType: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  description: string;
  requestedDate: Date;
  preferredTimeSlots: TimeSlot[];
  status: 'Pending' | 'Accepted' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  estimatedCost: number;
  actualCost?: number;
  duration: number; // minutes
  providerNotes?: string;
  customerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface ProviderPerformance {
  providerId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalRequests: number;
    completedRequests: number;
    averageResponseTime: number;
    averageRating: number;
    revenue: number;
    onTimeCompletion: number;
    customerSatisfaction: number;
  };
}

export class ServiceProviderManager {
  private providers: Map<string, ServiceProvider> = new Map();
  private serviceRequests: Map<string, ServiceRequest> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    const providers: ServiceProvider[] = [
      {
        id: 'PROV001',
        name: 'CoolAir HVAC Services',
        type: 'HVAC',
        contactInfo: {
          phone: '+1-555-0101',
          email: 'service@coolair.com',
          website: 'https://coolair.com',
          address: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            country: 'USA',
            coordinates: { latitude: 37.7749, longitude: -122.4194 }
          },
          emergencyContact: '+1-555-9999',
          bookingPortal: 'https://book.coolair.com'
        },
        services: [
          {
            id: 'SVC001',
            name: 'AC Repair',
            description: 'Diagnosis and repair of air conditioning units',
            category: 'Repair',
            deviceTypes: ['AC'],
            basePrice: 150,
            estimatedDuration: 120,
            requiresParts: true,
            warrantyPeriod: 90
          },
          {
            id: 'SVC002',
            name: 'AC Maintenance',
            description: 'Regular maintenance and cleaning of AC units',
            category: 'Maintenance',
            deviceTypes: ['AC'],
            basePrice: 80,
            estimatedDuration: 60,
            requiresParts: false,
            warrantyPeriod: 30
          }
        ],
        coverage: {
          serviceAreas: [
            {
              city: 'San Francisco',
              state: 'CA',
              zipCodes: ['94102', '94103', '94107', '94108'],
              additionalFee: 0
            },
            {
              city: 'Oakland',
              state: 'CA',
              zipCodes: ['94601', '94602', '94607'],
              additionalFee: 25
            }
          ],
          travelRadius: 50,
          travelFee: 0.75,
          minimumServiceCharge: 75
        },
        ratings: {
          overall: 4.6,
          quality: 4.7,
          timeliness: 4.5,
          professionalism: 4.8,
          value: 4.4,
          totalReviews: 234,
          recentReviews: [
            {
              id: 'REV001',
              customerId: 'CUST001',
              customerName: 'John Doe',
              rating: 5,
              comment: 'Excellent service! Technician was professional and fixed the issue quickly.',
              serviceDate: new Date('2024-01-15'),
              serviceType: 'AC Repair',
              verified: true
            }
          ]
        },
        certifications: [
          {
            id: 'CERT001',
            name: 'EPA Certified HVAC Technician',
            issuingOrganization: 'EPA',
            issueDate: new Date('2020-06-01'),
            expiryDate: new Date('2025-06-01'),
            credentialNumber: 'EPA-HVAC-2020-001',
            verified: true
          }
        ],
        availability: {
          regularHours: {
            monday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breaks: [] },
            tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breaks: [] },
            wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breaks: [] },
            thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breaks: [] },
            friday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breaks: [] },
            saturday: { isOpen: true, openTime: '09:00', closeTime: '16:00', breaks: [] },
            sunday: { isOpen: false, openTime: '00:00', closeTime: '00:00', breaks: [] }
          },
          emergencyAvailability: {
            available24_7: true,
            afterHours: {
              available: true,
              startTime: '18:00',
              endTime: '08:00',
              additionalFee: 100
            },
            weekendService: true,
            holidayService: true
          },
          holidays: [],
          leadTime: 2,
          emergencyLeadTime: 2
        },
        pricing: {
          hourlyRate: 125,
          callOutFee: 75,
          emergencyFee: 100,
          weekendFee: 50,
          holidayFee: 75,
          paymentMethods: [
            { type: 'Credit Card', accepted: true, processingFee: 3 },
            { type: 'Bank Transfer', accepted: true },
            { type: 'Cash', accepted: true },
            { type: 'Insurance', accepted: true }
          ],
          billingCycle: 'Per Visit',
          depositRequired: false
        },
        responseTime: {
          averageResponseTime: 45,
          emergencyResponseTime: 30,
          onTimeArrivalRate: 94,
          firstCallResolution: 87
        },
        specialties: ['AC Repair', 'AC Installation', 'AC Maintenance', 'Heat Pumps'],
        insurance: {
          liabilityInsurance: true,
          liabilityCoverage: 1000000,
          workersCompensation: true,
          bondRequired: false
        },
        contractTerms: {
          serviceLevelAgreement: [
            { metric: 'Response Time', target: 60, unit: 'minutes', penalty: '10% discount' },
            { metric: 'On Time Arrival', target: 95, unit: '%', penalty: '20% discount' }
          ],
          cancellationPolicy: {
            noticePeriod: 24,
            cancellationFee: 25,
            freeCancellationWindow: 4,
            emergencyExceptions: true
          },
          warrantyTerms: {
            workmanshipWarranty: 90,
            partsWarranty: 365,
            laborWarranty: 90,
            coverageDetails: 'Full warranty on parts and labor for specified periods'
          },
          paymentTerms: {
            dueDate: 30,
            lateFee: 1.5,
            gracePeriod: 7,
            earlyPaymentDiscount: 5
          }
        },
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'PROV002',
        name: 'SolarTech Solutions',
        type: 'Solar',
        contactInfo: {
          phone: '+1-555-0102',
          email: 'info@solartech.com',
          website: 'https://solartech.com',
          address: {
            street: '456 Solar Ave',
            city: 'San Jose',
            state: 'CA',
            zipCode: '95110',
            country: 'USA'
          },
          emergencyContact: '+1-555-9998'
        },
        services: [
          {
            id: 'SVC003',
            name: 'Solar Panel Inspection',
            description: 'Comprehensive solar panel system inspection',
            category: 'Inspection',
            deviceTypes: ['Solar Panel'],
            basePrice: 200,
            estimatedDuration: 120,
            requiresParts: false,
            warrantyPeriod: 30
          },
          {
            id: 'SVC004',
            name: 'Inverter Repair',
            description: 'Diagnosis and repair of solar inverters',
            category: 'Repair',
            deviceTypes: ['Solar Panel'],
            basePrice: 350,
            estimatedDuration: 180,
            requiresParts: true,
            warrantyPeriod: 180
          }
        ],
        coverage: {
          serviceAreas: [
            {
              city: 'San Jose',
              state: 'CA',
              zipCodes: ['95110', '95112', '95113', '95117'],
              additionalFee: 0
            },
            {
              city: 'Palo Alto',
              state: 'CA',
              zipCodes: ['94301', '94304', '94306'],
              additionalFee: 40
            }
          ],
          travelRadius: 75,
          travelFee: 0.85,
          minimumServiceCharge: 150
        },
        ratings: {
          overall: 4.8,
          quality: 4.9,
          timeliness: 4.6,
          professionalism: 4.8,
          value: 4.7,
          totalReviews: 156,
          recentReviews: []
        },
        certifications: [
          {
            id: 'CERT002',
            name: 'NABCEP Certified Solar Installer',
            issuingOrganization: 'NABCEP',
            issueDate: new Date('2019-03-15'),
            expiryDate: new Date('2024-03-15'),
            credentialNumber: 'NABCEP-2019-045',
            verified: true
          }
        ],
        availability: {
          regularHours: {
            monday: { isOpen: true, openTime: '07:00', closeTime: '17:00', breaks: [] },
            tuesday: { isOpen: true, openTime: '07:00', closeTime: '17:00', breaks: [] },
            wednesday: { isOpen: true, openTime: '07:00', closeTime: '17:00', breaks: [] },
            thursday: { isOpen: true, openTime: '07:00', closeTime: '17:00', breaks: [] },
            friday: { isOpen: true, openTime: '07:00', closeTime: '17:00', breaks: [] },
            saturday: { isOpen: false, openTime: '00:00', closeTime: '00:00', breaks: [] },
            sunday: { isOpen: false, openTime: '00:00', closeTime: '00:00', breaks: [] }
          },
          emergencyAvailability: {
            available24_7: false,
            afterHours: {
              available: true,
              startTime: '17:00',
              endTime: '21:00',
              additionalFee: 150
            },
            weekendService: false,
            holidayService: false
          },
          holidays: [],
          leadTime: 5,
          emergencyLeadTime: 24
        },
        pricing: {
          hourlyRate: 150,
          callOutFee: 100,
          emergencyFee: 150,
          weekendFee: 75,
          holidayFee: 100,
          paymentMethods: [
            { type: 'Credit Card', accepted: true, processingFee: 2.5 },
            { type: 'Bank Transfer', accepted: true },
            { type: 'Insurance', accepted: true }
          ],
          billingCycle: 'Per Project',
          depositRequired: true,
          depositAmount: 200
        },
        responseTime: {
          averageResponseTime: 120,
          emergencyResponseTime: 240,
          onTimeArrivalRate: 92,
          firstCallResolution: 82
        },
        specialties: ['Solar Panel Installation', 'Solar Panel Repair', 'Inverter Service', 'Battery Storage'],
        insurance: {
          liabilityInsurance: true,
          liabilityCoverage: 2000000,
          workersCompensation: true,
          bondRequired: true,
          bondAmount: 50000
        },
        contractTerms: {
          serviceLevelAgreement: [
            { metric: 'Response Time', target: 180, unit: 'minutes', penalty: '15% discount' }
          ],
          cancellationPolicy: {
            noticePeriod: 48,
            cancellationFee: 50,
            freeCancellationWindow: 24,
            emergencyExceptions: false
          },
          warrantyTerms: {
            workmanshipWarranty: 365,
            partsWarranty: 1825,
            laborWarranty: 365,
            coverageDetails: 'Extended warranty on solar components'
          },
          paymentTerms: {
            dueDate: 15,
            lateFee: 2,
            gracePeriod: 5
          }
        },
        isActive: true,
        createdAt: new Date('2023-03-01'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    providers.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
  }

  async searchProviders(criteria: {
    serviceType?: string;
    deviceType?: string;
    location?: string;
    urgency?: 'Low' | 'Medium' | 'High' | 'Emergency';
    maxDistance?: number;
    minRating?: number;
    availableDate?: Date;
  }): Promise<ServiceProvider[]> {
    let filteredProviders = Array.from(this.providers.values())
      .filter(provider => provider.isActive);

    // Filter by service type and device type
    if (criteria.serviceType || criteria.deviceType) {
      filteredProviders = filteredProviders.filter(provider =>
        provider.services.some(service =>
          (!criteria.serviceType || service.category.toLowerCase().includes(criteria.serviceType!.toLowerCase())) &&
          (!criteria.deviceType || service.deviceTypes.some(dt => dt.toLowerCase().includes(criteria.deviceType!.toLowerCase())))
        )
      );
    }

    // Filter by location
    if (criteria.location) {
      filteredProviders = filteredProviders.filter(provider =>
        provider.coverage.serviceAreas.some(area =>
          area.city.toLowerCase().includes(criteria.location!.toLowerCase()) ||
          area.zipCodes.some(zip => zip.includes(criteria.location!))
        )
      );
    }

    // Filter by rating
    if (criteria.minRating) {
      filteredProviders = filteredProviders.filter(provider =>
        provider.ratings.overall >= criteria.minRating!
      );
    }

    // Sort by rating and response time
    filteredProviders.sort((a, b) => {
      const ratingDiff = b.ratings.overall - a.ratings.overall;
      if (ratingDiff !== 0) return ratingDiff;
      return a.responseTime.averageResponseTime - b.responseTime.averageResponseTime;
    });

    return filteredProviders;
  }

  async getProvider(providerId: string): Promise<ServiceProvider | null> {
    return this.providers.get(providerId) || null;
  }

  async createServiceRequest(requestData: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ServiceRequest> {
    const request: ServiceRequest = {
      ...requestData,
      id: `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Calculate estimated cost
    const provider = this.providers.get(requestData.providerId);
    if (provider) {
      const service = provider.services.find(s => s.name === requestData.serviceType);
      if (service) {
        request.estimatedCost = service.basePrice;
        request.duration = service.estimatedDuration;
      }
    }

    this.serviceRequests.set(request.id, request);
    return request;
  }

  async updateServiceRequest(requestId: string, updates: Partial<ServiceRequest>): Promise<ServiceRequest | null> {
    const request = this.serviceRequests.get(requestId);
    if (!request) return null;

    const updatedRequest = {
      ...request,
      ...updates,
      updatedAt: new Date()
    };

    this.serviceRequests.set(requestId, updatedRequest);
    return updatedRequest;
  }

  async getServiceRequest(requestId: string): Promise<ServiceRequest | null> {
    return this.serviceRequests.get(requestId) || null;
  }

  async getServiceRequestsByCustomer(customerId: string): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values())
      .filter(request => request.customerId === customerId);
  }

  async getServiceRequestsByProvider(providerId: string): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values())
      .filter(request => request.providerId === providerId);
  }

  async getProviderPerformance(providerId: string, startDate: Date, endDate: Date): Promise<ProviderPerformance | null> {
    const providerRequests = Array.from(this.serviceRequests.values())
      .filter(request => 
        request.providerId === providerId &&
        request.createdAt >= startDate &&
        request.createdAt <= endDate
      );

    if (providerRequests.length === 0) return null;

    const completedRequests = providerRequests.filter(r => r.status === 'Completed');
    const totalRevenue = completedRequests.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost), 0);
    const averageRating = completedRequests.length > 0 
      ? completedRequests.reduce((_sum, _r) => 4.5, 0) / completedRequests.length // Simplified rating
      : 0;

    return {
      providerId,
      period: { start: startDate, end: endDate },
      metrics: {
        totalRequests: providerRequests.length,
        completedRequests: completedRequests.length,
        averageResponseTime: 45, // Simplified
        averageRating: Math.round(averageRating * 10) / 10,
        revenue: totalRevenue,
        onTimeCompletion: 92, // Simplified
        customerSatisfaction: 89 // Simplified
      }
    };
  }

  async addReview(providerId: string, review: Omit<Review, 'id' | 'verified'>): Promise<Review | null> {
    const provider = this.providers.get(providerId);
    if (!provider) return null;

    const newReview: Review = {
      ...review,
      id: `REV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      verified: true
    };

    provider.ratings.recentReviews.push(newReview);
    provider.ratings.totalReviews++;

    // Update overall rating (simplified calculation)
    const totalRating = provider.ratings.recentReviews.reduce((sum, r) => sum + r.rating, 0);
    provider.ratings.overall = Math.round((totalRating / provider.ratings.recentReviews.length) * 10) / 10;

    this.providers.set(providerId, provider);
    return newReview;
  }

  async getProviderSummary(): Promise<{
    totalProviders: number;
    activeProviders: number;
    averageRating: number;
    totalServiceRequests: number;
    completedRequests: number;
    emergencyProviders: number;
    providersByType: Record<string, number>;
  }> {
    const providers = Array.from(this.providers.values());
    const requests = Array.from(this.serviceRequests.values());

    const activeProviders = providers.filter(p => p.isActive).length;
    const averageRating = providers.length > 0 
      ? providers.reduce((sum, p) => sum + p.ratings.overall, 0) / providers.length 
      : 0;
    const completedRequests = requests.filter(r => r.status === 'Completed').length;
    const emergencyProviders = providers.filter(p => p.type === 'Emergency').length;

    const providersByType = providers.reduce((counts, provider) => {
      counts[provider.type] = (counts[provider.type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalProviders: providers.length,
      activeProviders,
      averageRating: Math.round(averageRating * 10) / 10,
      totalServiceRequests: requests.length,
      completedRequests,
      emergencyProviders,
      providersByType
    };
  }
}

let serviceProviderManagerInstance: ServiceProviderManager | null = null;

export function getServiceProviderManager(): ServiceProviderManager {
  if (!serviceProviderManagerInstance) {
    serviceProviderManagerInstance = new ServiceProviderManager();
  }
  return serviceProviderManagerInstance;
}
