export interface MaintenanceTask {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'AC' | 'Washer' | 'Light' | 'Geyser' | 'Solar Panel' | 'Battery' | 'EV Charger';
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue';
  scheduledDate: Date;
  estimatedDuration: number; // minutes
  estimatedCost: number;
  assignedTo?: string;
  technician?: TechnicianInfo;
  parts: MaintenancePart[];
  tools: string[];
  safetyPrecautions: string[];
  prerequisites: string[];
  followUpTasks: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  actualCost?: number;
  actualDuration?: number;
  notes?: string;
  rating?: number; // 1-5 stars
}

export interface TechnicianInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  rating: number;
  completedJobs: number;
  availability: TimeSlot[];
}

export interface MaintenancePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  inStock: boolean;
  supplier: string;
  estimatedDelivery?: Date;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface MaintenanceSchedule {
  id: string;
  weekOf: Date;
  tasks: MaintenanceTask[];
  technicianAssignments: TechnicianAssignment[];
  resourceUtilization: ResourceUtilization;
  conflicts: ScheduleConflict[];
}

export interface TechnicianAssignment {
  technicianId: string;
  technicianName: string;
  assignedTasks: string[]; // task IDs
  totalHours: number;
  utilizationRate: number; // 0-100
}

export interface ResourceUtilization {
  totalScheduledHours: number;
  availableTechnicianHours: number;
  partsAvailability: Record<string, number>; // part ID -> availability percentage
  toolUtilization: Record<string, number>; // tool -> utilization percentage
  budgetUtilization: number; // 0-100
}

export interface ScheduleConflict {
  id: string;
  type: 'Technician' | 'Parts' | 'Tools' | 'Time' | 'Budget';
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  affectedTasks: string[];
  suggestedResolution: string;
}

export interface RecurringMaintenance {
  id: string;
  deviceId: string;
  deviceType: string;
  title: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  interval: number; // e.g., every 2 weeks
  nextDue: Date;
  template: Partial<MaintenanceTask>;
  active: boolean;
  lastCompleted?: Date;
}

export class MaintenanceScheduler {
  private tasks: Map<string, MaintenanceTask> = new Map();
  private technicians: Map<string, TechnicianInfo> = new Map();
  private recurringTasks: Map<string, RecurringMaintenance> = new Map();
  private schedules: Map<string, MaintenanceSchedule> = new Map();

  constructor() {
    this.initializeTechnicians();
    this.initializeRecurringTasks();
  }

  private initializeTechnicians() {
    const technicians: TechnicianInfo[] = [
      {
        id: 'TECH001',
        name: 'John Smith',
        email: 'john.smith@urjasync.com',
        phone: '+1-555-0101',
        specialization: ['AC', 'HVAC', 'General'],
        rating: 4.7,
        completedJobs: 156,
        availability: this.generateAvailabilityForWeek()
      },
      {
        id: 'TECH002',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@urjasync.com',
        phone: '+1-555-0102',
        specialization: ['Solar Panel', 'Battery', 'EV Charger'],
        rating: 4.9,
        completedJobs: 203,
        availability: this.generateAvailabilityForWeek()
      },
      {
        id: 'TECH003',
        name: 'Mike Wilson',
        email: 'mike.wilson@urjasync.com',
        phone: '+1-555-0103',
        specialization: ['Washer', 'Geyser', 'Light'],
        rating: 4.5,
        completedJobs: 128,
        availability: this.generateAvailabilityForWeek()
      }
    ];

    technicians.forEach(tech => {
      this.technicians.set(tech.id, tech);
    });
  }

  private generateAvailabilityForWeek(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + day);
      
      // Working hours: 8 AM to 6 PM with lunch break
      slots.push(
        {
          start: new Date(currentDate.setHours(8, 0, 0, 0)),
          end: new Date(currentDate.setHours(12, 0, 0, 0)),
          available: true
        },
        {
          start: new Date(currentDate.setHours(13, 0, 0, 0)),
          end: new Date(currentDate.setHours(18, 0, 0, 0)),
          available: true
        }
      );
    }
    
    return slots;
  }

  private initializeRecurringTasks() {
    const recurringTasks: RecurringMaintenance[] = [
      {
        id: 'RECUR001',
        deviceId: 'AC001',
        deviceType: 'AC',
        title: 'AC Filter Cleaning',
        frequency: 'Monthly',
        interval: 1,
        nextDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        template: {
          title: 'AC Filter Cleaning and Inspection',
          description: 'Clean or replace AC filters and inspect overall system',
          priority: 'Medium',
          estimatedDuration: 45,
          estimatedCost: 80,
          parts: [
            {
              id: 'PART001',
              name: 'AC Filter',
              partNumber: 'AF-2024',
              quantity: 1,
              unitCost: 25,
              inStock: true,
              supplier: 'HVAC Supplies Inc'
            }
          ],
          tools: ['Screwdriver set', 'Vacuum cleaner', 'Cleaning solution'],
          safetyPrecautions: ['Turn off power', 'Wear gloves and mask'],
          prerequisites: ['Access to outdoor unit', 'Power availability']
        },
        active: true
      },
      {
        id: 'RECUR002',
        deviceId: 'SOLAR003',
        deviceType: 'Solar Panel',
        title: 'Solar Panel Inspection',
        frequency: 'Quarterly',
        interval: 3,
        nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next month
        template: {
          title: 'Solar Panel System Inspection',
          description: 'Comprehensive inspection of solar panels and inverter',
          priority: 'Medium',
          estimatedDuration: 120,
          estimatedCost: 200,
          parts: [],
          tools: ['Multimeter', 'Infrared camera', 'Cleaning tools'],
          safetyPrecautions: ['Turn off DC disconnect', 'Use fall protection', 'Wear insulated gloves'],
          prerequisites: ['Clear weather', 'Access to roof', 'Safety harness']
        },
        active: true
      }
    ];

    recurringTasks.forEach(task => {
      this.recurringTasks.set(task.id, task);
    });
  }

  async scheduleMaintenance(taskData: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceTask> {
    const task: MaintenanceTask = {
      ...taskData,
      id: `TASK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check for conflicts
    const conflicts = await this.checkScheduleConflicts(task);
    if (conflicts.length > 0) {
      task.status = 'Scheduled'; // Still schedule but flag conflicts
    }

    // Auto-assign technician if not specified
    if (!task.assignedTo) {
      const technician = await this.findBestTechnician(task);
      if (technician) {
        task.assignedTo = technician.id;
        task.technician = technician;
      }
    }

    this.tasks.set(task.id, task);
    return task;
  }

  async checkScheduleConflicts(task: MaintenanceTask): Promise<ScheduleConflict[]> {
    const conflicts: ScheduleConflict[] = [];

    // Check technician availability
    if (task.assignedTo && task.technician) {
      const technicianTasks = Array.from(this.tasks.values())
        .filter(t => t.assignedTo === task.assignedTo && 
                    t.status !== 'Completed' && 
                    t.status !== 'Cancelled' &&
                    this.isTimeOverlap(t.scheduledDate, t.estimatedDuration, task.scheduledDate, task.estimatedDuration));

      if (technicianTasks.length > 0) {
        conflicts.push({
          id: `CONF_TECH_${Date.now()}`,
          type: 'Technician',
          description: `Technician ${task.technician.name} is already assigned during this time`,
          severity: 'High',
          affectedTasks: [task.id, ...technicianTasks.map(t => t.id)],
          suggestedResolution: 'Reschedule task or assign different technician'
        });
      }
    }

    // Check parts availability
    const outOfStockParts = task.parts.filter(part => !part.inStock);
    if (outOfStockParts.length > 0) {
      conflicts.push({
        id: `CONF_PARTS_${Date.now()}`,
        type: 'Parts',
        description: `Required parts are out of stock: ${outOfStockParts.map(p => p.name).join(', ')}`,
        severity: 'Medium',
        affectedTasks: [task.id],
        suggestedResolution: 'Order parts in advance or reschedule'
      });
    }

    return conflicts;
  }

  private isTimeOverlap(date1: Date, duration1: number, date2: Date, duration2: number): boolean {
    const end1 = new Date(date1.getTime() + duration1 * 60 * 1000);
    const end2 = new Date(date2.getTime() + duration2 * 60 * 1000);
    
    return date1 < end2 && date2 < end1;
  }

  async findBestTechnician(task: MaintenanceTask): Promise<TechnicianInfo | null> {
    const availableTechnicians = Array.from(this.technicians.values())
      .filter(tech => 
        tech.specialization.includes(task.deviceType) || 
        tech.specialization.includes('General')
      );

    if (availableTechnicians.length === 0) return null;

    // Score technicians based on multiple factors
    const scoredTechnicians = availableTechnicians.map(tech => {
      let score = tech.rating * 20; // Base score from rating

      // Check availability during scheduled time
      const isAvailable = this.isTechnicianAvailable(tech, task.scheduledDate, task.estimatedDuration);
      if (isAvailable) score += 30;

      // Bonus for specialization
      if (tech.specialization.includes(task.deviceType)) score += 25;

      // Bonus for experience (completed jobs)
      score += Math.min(25, tech.completedJobs / 10);

      return { technician: tech, score };
    });

    return scoredTechnicians.reduce((best, current) => 
      current.score > best.score ? current : best
    ).technician;
  }

  private isTechnicianAvailable(technician: TechnicianInfo, startTime: Date, duration: number): boolean {
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    return technician.availability.some(slot => 
      slot.available && 
      startTime >= slot.start && 
      endTime <= slot.end
    );
  }

  async updateTaskStatus(taskId: string, status: MaintenanceTask['status'], notes?: string): Promise<MaintenanceTask | null> {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = status;
    task.updatedAt = new Date();
    
    if (notes) {
      task.notes = notes;
    }

    if (status === 'Completed') {
      task.completedAt = new Date();
      
      // Update recurring task if applicable
      await this.updateRecurringTask(task.deviceId);
    }

    this.tasks.set(taskId, task);
    return task;
  }

  private async updateRecurringTask(deviceId: string): Promise<void> {
    const recurringTask = Array.from(this.recurringTasks.values())
      .find(rt => rt.deviceId === deviceId && rt.active);
    
    if (recurringTask) {
      recurringTask.lastCompleted = new Date();
      
      // Calculate next due date
      const intervalMs = this.getIntervalInMs(recurringTask.frequency, recurringTask.interval);
      recurringTask.nextDue = new Date(recurringTask.nextDue.getTime() + intervalMs);
      
      this.recurringTasks.set(recurringTask.id, recurringTask);
    }
  }

  private getIntervalInMs(frequency: string, interval: number): number {
    const baseIntervals = {
      'Daily': 24 * 60 * 60 * 1000,
      'Weekly': 7 * 24 * 60 * 60 * 1000,
      'Monthly': 30 * 24 * 60 * 60 * 1000,
      'Quarterly': 90 * 24 * 60 * 60 * 1000,
      'Annually': 365 * 24 * 60 * 60 * 1000
    };
    
    return (baseIntervals[frequency as keyof typeof baseIntervals] || baseIntervals['Monthly']) * interval;
  }

  async generateWeeklySchedule(weekStart: Date): Promise<MaintenanceSchedule> {
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Get tasks for the week
    const weekTasks = Array.from(this.tasks.values())
      .filter(task => task.scheduledDate >= weekStart && task.scheduledDate < weekEnd);

    // Generate recurring tasks that are due
    const dueRecurringTasks = Array.from(this.recurringTasks.values())
      .filter(rt => rt.active && rt.nextDue >= weekStart && rt.nextDue < weekEnd);

    // Convert recurring tasks to actual tasks
    for (const recurringTask of dueRecurringTasks) {
      const task = await this.scheduleMaintenance({
        deviceId: recurringTask.deviceId,
        deviceName: `Device ${recurringTask.deviceId}`,
        deviceType: recurringTask.deviceType as any,
        title: recurringTask.title,
        description: recurringTask.template.description || '',
        priority: recurringTask.template.priority || 'Medium',
        status: 'Scheduled',
        scheduledDate: recurringTask.nextDue,
        estimatedDuration: recurringTask.template.estimatedDuration || 60,
        estimatedCost: recurringTask.template.estimatedCost || 100,
        parts: recurringTask.template.parts || [],
        tools: recurringTask.template.tools || [],
        safetyPrecautions: recurringTask.template.safetyPrecautions || [],
        prerequisites: recurringTask.template.prerequisites || [],
        followUpTasks: []
      });
      weekTasks.push(task);
    }

    // Generate technician assignments
    const technicianAssignments = this.generateTechnicianAssignments(weekTasks);

    // Calculate resource utilization
    const resourceUtilization = this.calculateResourceUtilization(weekTasks, technicianAssignments);

    // Check for conflicts
    const conflicts = await this.checkWeekConflicts(weekTasks);

    const schedule: MaintenanceSchedule = {
      id: `SCHEDULE_${weekStart.getTime()}`,
      weekOf: weekStart,
      tasks: weekTasks,
      technicianAssignments,
      resourceUtilization,
      conflicts
    };

    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  private generateTechnicianAssignments(tasks: MaintenanceTask[]): TechnicianAssignment[] {
    const assignments: Map<string, TechnicianAssignment> = new Map();

    tasks.forEach(task => {
      if (task.assignedTo && task.technician) {
        const existing = assignments.get(task.assignedTo);
        if (existing) {
          existing.assignedTasks.push(task.id);
          existing.totalHours += task.estimatedDuration / 60;
        } else {
          assignments.set(task.assignedTo, {
            technicianId: task.assignedTo,
            technicianName: task.technician.name,
            assignedTasks: [task.id],
            totalHours: task.estimatedDuration / 60,
            utilizationRate: 0
          });
        }
      }
    });

    // Calculate utilization rates
    assignments.forEach(assignment => {
      const technician = this.technicians.get(assignment.technicianId);
      if (technician) {
        const availableHours = 40; // Standard work week
        assignment.utilizationRate = Math.min(100, (assignment.totalHours / availableHours) * 100);
      }
    });

    return Array.from(assignments.values());
  }

  private calculateResourceUtilization(tasks: MaintenanceTask[], assignments: TechnicianAssignment[]): ResourceUtilization {
    const totalScheduledHours = tasks.reduce((sum, task) => sum + task.estimatedDuration / 60, 0);
    const availableTechnicianHours = assignments.reduce((sum, assignment) => {
      const technician = this.technicians.get(assignment.technicianId);
      return sum + (technician ? 40 : 0); // 40 hours per technician per week
    }, 0);

    const totalEstimatedCost = tasks.reduce((sum, task) => sum + task.estimatedCost, 0);
    const weeklyBudget = 5000; // Example weekly budget

    return {
      totalScheduledHours,
      availableTechnicianHours,
      partsAvailability: {}, // Would be populated from inventory system
      toolUtilization: {}, // Would be populated from tool management system
      budgetUtilization: Math.min(100, (totalEstimatedCost / weeklyBudget) * 100)
    };
  }

  private async checkWeekConflicts(tasks: MaintenanceTask[]): Promise<ScheduleConflict[]> {
    const conflicts: ScheduleConflict[] = [];

    // Check for overlapping tasks with same technician
    const technicianTasks = new Map<string, MaintenanceTask[]>();
    tasks.forEach(task => {
      if (task.assignedTo) {
        if (!technicianTasks.has(task.assignedTo)) {
          technicianTasks.set(task.assignedTo, []);
        }
        technicianTasks.get(task.assignedTo)!.push(task);
      }
    });

    technicianTasks.forEach((techTasks, technicianId) => {
      for (let i = 0; i < techTasks.length; i++) {
        for (let j = i + 1; j < techTasks.length; j++) {
          const task1 = techTasks[i];
          const task2 = techTasks[j];
          
          if (this.isTimeOverlap(
            task1.scheduledDate, task1.estimatedDuration,
            task2.scheduledDate, task2.estimatedDuration
          )) {
            conflicts.push({
              id: `CONF_OVERLAP_${Date.now()}_${i}_${j}`,
              type: 'Technician',
              description: `Overlapping tasks for technician ${technicianId}`,
              severity: 'High',
              affectedTasks: [task1.id, task2.id],
              suggestedResolution: 'Reschedule one of the overlapping tasks'
            });
          }
        }
      }
    });

    return conflicts;
  }

  async getTask(taskId: string): Promise<MaintenanceTask | null> {
    return this.tasks.get(taskId) || null;
  }

  async getAllTasks(): Promise<MaintenanceTask[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByStatus(status: MaintenanceTask['status']): Promise<MaintenanceTask[]> {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  async getTasksByDevice(deviceId: string): Promise<MaintenanceTask[]> {
    return Array.from(this.tasks.values()).filter(task => task.deviceId === deviceId);
  }

  async getTechnician(technicianId: string): Promise<TechnicianInfo | null> {
    return this.technicians.get(technicianId) || null;
  }

  async getAllTechnicians(): Promise<TechnicianInfo[]> {
    return Array.from(this.technicians.values());
  }

  async getScheduleSummary(): Promise<{
    totalTasks: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    overdue: number;
    totalEstimatedCost: number;
    averageCompletionTime: number;
    technicianUtilization: number;
  }> {
    const tasks = Array.from(this.tasks.values());
    const now = new Date();
    
    const totalTasks = tasks.length;
    const scheduled = tasks.filter(t => t.status === 'Scheduled').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const overdue = tasks.filter(t => t.status === 'Scheduled' && t.scheduledDate < now).length;
    
    const totalEstimatedCost = tasks.reduce((sum, task) => sum + task.estimatedCost, 0);
    
    const completedTasksWithDuration = tasks.filter(t => t.status === 'Completed' && t.actualDuration);
    const averageCompletionTime = completedTasksWithDuration.length > 0
      ? completedTasksWithDuration.reduce((sum, task) => sum + (task.actualDuration || 0), 0) / completedTasksWithDuration.length
      : 0;

    const assignments = this.generateTechnicianAssignments(tasks);
    const technicianUtilization = assignments.length > 0
      ? assignments.reduce((sum, assignment) => sum + assignment.utilizationRate, 0) / assignments.length
      : 0;

    return {
      totalTasks,
      scheduled,
      inProgress,
      completed,
      overdue,
      totalEstimatedCost,
      averageCompletionTime: Math.round(averageCompletionTime),
      technicianUtilization: Math.round(technicianUtilization)
    };
  }
}

let maintenanceSchedulerInstance: MaintenanceScheduler | null = null;

export function getMaintenanceScheduler(): MaintenanceScheduler {
  if (!maintenanceSchedulerInstance) {
    maintenanceSchedulerInstance = new MaintenanceScheduler();
  }
  return maintenanceSchedulerInstance;
}
