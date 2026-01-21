import { NextRequest, NextResponse } from 'next/server';
import { getMaintenanceScheduler } from '../../../../lib/maintenance/maintenance-scheduler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const status = searchParams.get('status');
    const deviceId = searchParams.get('deviceId');
    const technicianId = searchParams.get('technicianId');
    const weekStart = searchParams.get('weekStart');
    const action = searchParams.get('action');
    
    const scheduler = getMaintenanceScheduler();
    
    switch (action) {
      case 'summary':
        const summary = await scheduler.getScheduleSummary();
        return NextResponse.json({
          success: true,
          data: summary
        });
        
      case 'task':
        if (!taskId) {
          return NextResponse.json(
            { success: false, error: 'Task ID is required for task details' },
            { status: 400 }
          );
        }
        
        const task = await scheduler.getTask(taskId);
        if (!task) {
          return NextResponse.json(
            { success: false, error: 'Task not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: task
        });
        
      case 'by-status':
        if (!status) {
          return NextResponse.json(
            { success: false, error: 'Status is required for status filter' },
            { status: 400 }
          );
        }
        
        const tasksByStatus = await scheduler.getTasksByStatus(status as any);
        return NextResponse.json({
          success: true,
          data: tasksByStatus
        });
        
      case 'by-device':
        if (!deviceId) {
          return NextResponse.json(
            { success: false, error: 'Device ID is required for device filter' },
            { status: 400 }
          );
        }
        
        const tasksByDevice = await scheduler.getTasksByDevice(deviceId);
        return NextResponse.json({
          success: true,
          data: tasksByDevice
        });
        
      case 'technician':
        if (!technicianId) {
          return NextResponse.json(
            { success: false, error: 'Technician ID is required for technician details' },
            { status: 400 }
          );
        }
        
        const technician = await scheduler.getTechnician(technicianId);
        if (!technician) {
          return NextResponse.json(
            { success: false, error: 'Technician not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: technician
        });
        
      case 'technicians':
        const technicians = await scheduler.getAllTechnicians();
        return NextResponse.json({
          success: true,
          data: technicians
        });
        
      case 'weekly-schedule':
        if (!weekStart) {
          return NextResponse.json(
            { success: false, error: 'Week start date is required for weekly schedule' },
            { status: 400 }
          );
        }
        
        const weekStartDate = new Date(weekStart);
        if (isNaN(weekStartDate.getTime())) {
          return NextResponse.json(
            { success: false, error: 'Invalid week start date format' },
            { status: 400 }
          );
        }
        
        const weeklySchedule = await scheduler.generateWeeklySchedule(weekStartDate);
        return NextResponse.json({
          success: true,
          data: weeklySchedule
        });
        
      default:
        // Get all tasks if no specific action
        const allTasks = await scheduler.getAllTasks();
        return NextResponse.json({
          success: true,
          data: allTasks
        });
    }
  } catch (error) {
    console.error('Error fetching maintenance schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance schedule' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, taskId, status, notes, taskData } = body;
    
    const scheduler = getMaintenanceScheduler();
    
    switch (action) {
      case 'schedule':
        if (!taskData) {
          return NextResponse.json(
            { success: false, error: 'Task data is required for scheduling' },
            { status: 400 }
          );
        }
        
        const scheduledTask = await scheduler.scheduleMaintenance(taskData);
        return NextResponse.json({
          success: true,
          data: scheduledTask,
          message: 'Maintenance task scheduled successfully'
        });
        
      case 'update-status':
        if (!taskId || !status) {
          return NextResponse.json(
            { success: false, error: 'Task ID and status are required for status update' },
            { status: 400 }
          );
        }
        
        const updatedTask = await scheduler.updateTaskStatus(taskId, status, notes);
        if (!updatedTask) {
          return NextResponse.json(
            { success: false, error: 'Task not found or update failed' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: updatedTask,
          message: 'Task status updated successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: schedule, update-status' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating maintenance schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update maintenance schedule' },
      { status: 500 }
    );
  }
}
