import { NextRequest, NextResponse } from 'next/server';
import { getServiceProviderManager } from '../../../../lib/maintenance/service-provider-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const customerId = searchParams.get('customerId');
    const requestId = searchParams.get('requestId');
    const action = searchParams.get('action');
    
    const providerManager = getServiceProviderManager();
    
    switch (action) {
      case 'summary':
        const summary = await providerManager.getProviderSummary();
        return NextResponse.json({
          success: true,
          data: summary
        });
        
      case 'provider':
        if (!providerId) {
          return NextResponse.json(
            { success: false, error: 'Provider ID is required for provider details' },
            { status: 400 }
          );
        }
        
        const provider = await providerManager.getProvider(providerId);
        if (!provider) {
          return NextResponse.json(
            { success: false, error: 'Provider not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: provider
        });
        
      case 'search':
        const searchCriteria = {
          serviceType: searchParams.get('serviceType') || undefined,
          deviceType: searchParams.get('deviceType') || undefined,
          location: searchParams.get('location') || undefined,
          urgency: searchParams.get('urgency') as any || undefined,
          maxDistance: searchParams.get('maxDistance') ? parseInt(searchParams.get('maxDistance')!) : undefined,
          minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
          availableDate: searchParams.get('availableDate') ? new Date(searchParams.get('availableDate')!) : undefined
        };
        
        const searchResults = await providerManager.searchProviders(searchCriteria);
        return NextResponse.json({
          success: true,
          data: searchResults
        });
        
      case 'request':
        if (!requestId) {
          return NextResponse.json(
            { success: false, error: 'Request ID is required for service request details' },
            { status: 400 }
          );
        }
        
        const serviceRequest = await providerManager.getServiceRequest(requestId);
        if (!serviceRequest) {
          return NextResponse.json(
            { success: false, error: 'Service request not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: serviceRequest
        });
        
      case 'customer-requests':
        if (!customerId) {
          return NextResponse.json(
            { success: false, error: 'Customer ID is required for customer requests' },
            { status: 400 }
          );
        }
        
        const customerRequests = await providerManager.getServiceRequestsByCustomer(customerId);
        return NextResponse.json({
          success: true,
          data: customerRequests
        });
        
      case 'provider-requests':
        if (!providerId) {
          return NextResponse.json(
            { success: false, error: 'Provider ID is required for provider requests' },
            { status: 400 }
          );
        }
        
        const providerRequests = await providerManager.getServiceRequestsByProvider(providerId);
        return NextResponse.json({
          success: true,
          data: providerRequests
        });
        
      case 'performance':
        if (!providerId) {
          return NextResponse.json(
            { success: false, error: 'Provider ID is required for performance data' },
            { status: 400 }
          );
        }
        
        const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date();
        
        const performance = await providerManager.getProviderPerformance(providerId, startDate, endDate);
        if (!performance) {
          return NextResponse.json(
            { success: false, error: 'Performance data not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: performance
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: summary, provider, search, request, customer-requests, provider-requests, performance' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching service provider data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service provider data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, providerId, requestData, reviewData } = body;
    
    const providerManager = getServiceProviderManager();
    
    switch (action) {
      case 'create-request':
        if (!requestData) {
          return NextResponse.json(
            { success: false, error: 'Request data is required for creating service request' },
            { status: 400 }
          );
        }
        
        const serviceRequest = await providerManager.createServiceRequest(requestData);
        return NextResponse.json({
          success: true,
          data: serviceRequest,
          message: 'Service request created successfully'
        });
        
      case 'update-request':
        if (!requestData || !requestData.id) {
          return NextResponse.json(
            { success: false, error: 'Request ID and update data are required' },
            { status: 400 }
          );
        }
        
        const updatedRequest = await providerManager.updateServiceRequest(requestData.id, requestData);
        if (!updatedRequest) {
          return NextResponse.json(
            { success: false, error: 'Service request not found or update failed' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: updatedRequest,
          message: 'Service request updated successfully'
        });
        
      case 'add-review':
        if (!providerId || !reviewData) {
          return NextResponse.json(
            { success: false, error: 'Provider ID and review data are required for adding review' },
            { status: 400 }
          );
        }
        
        const review = await providerManager.addReview(providerId, reviewData);
        if (!review) {
          return NextResponse.json(
            { success: false, error: 'Provider not found or review creation failed' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: review,
          message: 'Review added successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: create-request, update-request, add-review' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing service provider request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process service provider request' },
      { status: 500 }
    );
  }
}
