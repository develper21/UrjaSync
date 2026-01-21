import { NextRequest, NextResponse } from 'next/server';
import { getWarrantyTracker } from '../../../../lib/maintenance/warranty-tracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const warrantyId = searchParams.get('warrantyId');
    const deviceId = searchParams.get('deviceId');
    const claimId = searchParams.get('claimId');
    const status = searchParams.get('status');
    const daysThreshold = searchParams.get('daysThreshold');
    const action = searchParams.get('action');
    
    const warrantyTracker = getWarrantyTracker();
    
    switch (action) {
      case 'analytics':
        const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
        const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
        
        const analytics = await warrantyTracker.getWarrantyAnalytics(startDate, endDate);
        return NextResponse.json({
          success: true,
          data: analytics
        });
        
      case 'warranty':
        if (!warrantyId) {
          return NextResponse.json(
            { success: false, error: 'Warranty ID is required for warranty details' },
            { status: 400 }
          );
        }
        
        const warranty = await warrantyTracker.getWarranty(warrantyId);
        if (!warranty) {
          return NextResponse.json(
            { success: false, error: 'Warranty not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: warranty
        });
        
      case 'by-device':
        if (!deviceId) {
          return NextResponse.json(
            { success: false, error: 'Device ID is required for device warranties' },
            { status: 400 }
          );
        }
        
        const deviceWarranties = await warrantyTracker.getWarrantiesByDevice(deviceId);
        return NextResponse.json({
          success: true,
          data: deviceWarranties
        });
        
      case 'active':
        const activeWarranties = await warrantyTracker.getActiveWarranties();
        return NextResponse.json({
          success: true,
          data: activeWarranties
        });
        
      case 'expiring':
        const threshold = daysThreshold ? parseInt(daysThreshold) : 90;
        const expiringWarranties = await warrantyTracker.getExpiringWarranties(threshold);
        return NextResponse.json({
          success: true,
          data: expiringWarranties
        });
        
      case 'claim':
        if (!claimId) {
          return NextResponse.json(
            { success: false, error: 'Claim ID is required for claim details' },
            { status: 400 }
          );
        }
        
        const claim = await warrantyTracker.getClaim(claimId);
        if (!claim) {
          return NextResponse.json(
            { success: false, error: 'Claim not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: claim
        });
        
      case 'claims-by-warranty':
        if (!warrantyId) {
          return NextResponse.json(
            { success: false, error: 'Warranty ID is required for warranty claims' },
            { status: 400 }
          );
        }
        
        const warrantyClaims = await warrantyTracker.getClaimsByWarranty(warrantyId);
        return NextResponse.json({
          success: true,
          data: warrantyClaims
        });
        
      case 'claims-by-status':
        if (!status) {
          return NextResponse.json(
            { success: false, error: 'Status is required for status filter' },
            { status: 400 }
          );
        }
        
        const claimsByStatus = await warrantyTracker.getClaimsByStatus(status as any);
        return NextResponse.json({
          success: true,
          data: claimsByStatus
        });
        
      default:
        // Get all warranties if no specific action
        const allWarranties = await warrantyTracker.getAllWarranties();
        return NextResponse.json({
          success: true,
          data: allWarranties
        });
    }
  } catch (error) {
    console.error('Error fetching warranty data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch warranty data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, warrantyId, claimId, warrantyData, claimData, requirementId, maintenanceData } = body;
    
    const warrantyTracker = getWarrantyTracker();
    
    switch (action) {
      case 'add-warranty':
        if (!warrantyData) {
          return NextResponse.json(
            { success: false, error: 'Warranty data is required for adding warranty' },
            { status: 400 }
          );
        }
        
        const newWarranty = await warrantyTracker.addWarranty(warrantyData);
        return NextResponse.json({
          success: true,
          data: newWarranty,
          message: 'Warranty added successfully'
        });
        
      case 'file-claim':
        if (!claimData) {
          return NextResponse.json(
            { success: false, error: 'Claim data is required for filing claim' },
            { status: 400 }
          );
        }
        
        const newClaim = await warrantyTracker.fileClaim(claimData);
        return NextResponse.json({
          success: true,
          data: newClaim,
          message: 'Claim filed successfully'
        });
        
      case 'update-claim':
        if (!claimId || !claimData || !claimData.status) {
          return NextResponse.json(
            { success: false, error: 'Claim ID and status are required for claim update' },
            { status: 400 }
          );
        }
        
        const updatedClaim = await warrantyTracker.updateClaimStatus(claimId, claimData.status, claimData.notes);
        if (!updatedClaim) {
          return NextResponse.json(
            { success: false, error: 'Claim not found or update failed' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: updatedClaim,
          message: 'Claim status updated successfully'
        });
        
      case 'update-maintenance':
        if (!warrantyId || !requirementId || maintenanceData === undefined) {
          return NextResponse.json(
            { success: false, error: 'Warranty ID, requirement ID, and maintenance data are required' },
            { status: 400 }
          );
        }
        
        const updatedWarranty = await warrantyTracker.updateMaintenanceRequirement(
          warrantyId,
          requirementId,
          maintenanceData.completed,
          maintenanceData.completedDate,
          maintenanceData.provider,
          maintenanceData.cost
        );
        
        if (!updatedWarranty) {
          return NextResponse.json(
            { success: false, error: 'Warranty not found or maintenance update failed' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: updatedWarranty,
          message: 'Maintenance requirement updated successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: add-warranty, file-claim, update-claim, update-maintenance' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing warranty request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process warranty request' },
      { status: 500 }
    );
  }
}
