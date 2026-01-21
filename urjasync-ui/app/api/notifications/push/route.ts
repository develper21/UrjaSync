import { NextRequest, NextResponse } from 'next/server';
import { getPushNotificationService } from '@/lib/notifications/push-notification-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const notificationId = searchParams.get('notificationId');
    const action = searchParams.get('action');
    
    const pushService = getPushNotificationService();
    
    switch (action) {
      case 'stats':
        const stats = await pushService.getStats();
        return NextResponse.json({
          success: true,
          data: stats
        });
        
      case 'notification':
        if (!notificationId) {
          return NextResponse.json(
            { success: false, error: 'Notification ID is required' },
            { status: 400 }
          );
        }
        
        const notification = await pushService.getNotification(notificationId);
        if (!notification) {
          return NextResponse.json(
            { success: false, error: 'Notification not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: notification
        });
        
      case 'user-notifications':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'User ID is required' },
            { status: 400 }
          );
        }
        
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
        
        const userNotifications = await pushService.getUserNotifications(userId, limit, offset);
        return NextResponse.json({
          success: true,
          data: userNotifications
        });
        
      case 'campaign':
        const campaignId = searchParams.get('campaignId');
        if (!campaignId) {
          return NextResponse.json(
            { success: false, error: 'Campaign ID is required' },
            { status: 400 }
          );
        }
        
        const campaign = await pushService.getCampaign(campaignId);
        if (!campaign) {
          return NextResponse.json(
            { success: false, error: 'Campaign not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: campaign
        });
        
      case 'campaigns':
        const campaigns = await pushService.getAllCampaigns();
        return NextResponse.json({
          success: true,
          data: campaigns
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: stats, notification, user-notifications, campaign, campaigns' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching push notification data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch push notification data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, notificationId, templateId, userId, variables, notificationData, tokenData, campaignData } = body;
    
    const pushService = getPushNotificationService();
    
    switch (action) {
      case 'send':
        if (!notificationData) {
          return NextResponse.json(
            { success: false, error: 'Notification data is required' },
            { status: 400 }
          );
        }
        
        const notification = await pushService.sendNotification(notificationData);
        return NextResponse.json({
          success: true,
          data: notification,
          message: 'Push notification sent successfully'
        });
        
      case 'send-template':
        if (!templateId || !userId || !variables) {
          return NextResponse.json(
            { success: false, error: 'Template ID, user ID, and variables are required' },
            { status: 400 }
          );
        }
        
        const templateNotification = await pushService.sendFromTemplate(templateId, userId, variables, notificationData);
        return NextResponse.json({
          success: true,
          data: templateNotification,
          message: 'Template notification sent successfully'
        });
        
      case 'mark-read':
        if (!notificationId) {
          return NextResponse.json(
            { success: false, error: 'Notification ID is required' },
            { status: 400 }
          );
        }
        
        const readSuccess = await pushService.markAsRead(notificationId);
        if (!readSuccess) {
          return NextResponse.json(
            { success: false, error: 'Failed to mark notification as read' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Notification marked as read'
        });
        
      case 'mark-clicked':
        if (!notificationId) {
          return NextResponse.json(
            { success: false, error: 'Notification ID is required' },
            { status: 400 }
          );
        }
        
        const clickedSuccess = await pushService.markAsClicked(notificationId);
        if (!clickedSuccess) {
          return NextResponse.json(
            { success: false, error: 'Failed to mark notification as clicked' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Notification marked as clicked'
        });
        
      case 'register-token':
        if (!tokenData) {
          return NextResponse.json(
            { success: false, error: 'Token data is required' },
            { status: 400 }
          );
        }
        
        const deviceToken = await pushService.registerDeviceToken(tokenData);
        return NextResponse.json({
          success: true,
          data: deviceToken,
          message: 'Device token registered successfully'
        });
        
      case 'unregister-token':
        const tokenId = body.tokenId;
        if (!tokenId) {
          return NextResponse.json(
            { success: false, error: 'Token ID is required' },
            { status: 400 }
          );
        }
        
        const unregisterSuccess = await pushService.unregisterDeviceToken(tokenId);
        if (!unregisterSuccess) {
          return NextResponse.json(
            { success: false, error: 'Failed to unregister device token' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Device token unregistered successfully'
        });
        
      case 'create-campaign':
        if (!campaignData) {
          return NextResponse.json(
            { success: false, error: 'Campaign data is required' },
            { status: 400 }
          );
        }
        
        const campaign = await pushService.createCampaign(campaignData);
        return NextResponse.json({
          success: true,
          data: campaign,
          message: 'Campaign created successfully'
        });
        
      case 'launch-campaign':
        const campaignIdToLaunch = body.campaignId;
        if (!campaignIdToLaunch) {
          return NextResponse.json(
            { success: false, error: 'Campaign ID is required' },
            { status: 400 }
          );
        }
        
        const launchSuccess = await pushService.launchCampaign(campaignIdToLaunch);
        if (!launchSuccess) {
          return NextResponse.json(
            { success: false, error: 'Failed to launch campaign' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Campaign launched successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: send, send-template, mark-read, mark-clicked, register-token, unregister-token, create-campaign, launch-campaign' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing push notification request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process push notification request' },
      { status: 500 }
    );
  }
}
