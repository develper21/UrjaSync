import { NextRequest, NextResponse } from 'next/server';
import { getSMSService } from '@/lib/notifications/sms-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const messageId = searchParams.get('messageId');
    const action = searchParams.get('action');
    
    const smsService = getSMSService();
    
    switch (action) {
      case 'stats':
        const stats = await smsService.getStats();
        return NextResponse.json({
          success: true,
          data: stats
        });
        
      case 'message':
        if (!messageId) {
          return NextResponse.json(
            { success: false, error: 'Message ID is required' },
            { status: 400 }
          );
        }
        
        const message = await smsService.getMessage(messageId);
        if (!message) {
          return NextResponse.json(
            { success: false, error: 'SMS message not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: message
        });
        
      case 'user-messages':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'User ID is required' },
            { status: 400 }
          );
        }
        
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
        
        const userMessages = await smsService.getUserMessages(userId, limit, offset);
        return NextResponse.json({
          success: true,
          data: userMessages
        });
        
      case 'campaign':
        const campaignId = searchParams.get('campaignId');
        if (!campaignId) {
          return NextResponse.json(
            { success: false, error: 'Campaign ID is required' },
            { status: 400 }
          );
        }
        
        const campaign = await smsService.getCampaign(campaignId);
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
        const campaigns = await smsService.getAllCampaigns();
        return NextResponse.json({
          success: true,
          data: campaigns
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: stats, message, user-messages, campaign, campaigns' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching SMS data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SMS data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, templateId, userId, phoneNumber, variables, messageData, campaignData } = body;
    
    const smsService = getSMSService();
    
    switch (action) {
      case 'send':
        if (!messageData) {
          return NextResponse.json(
            { success: false, error: 'Message data is required' },
            { status: 400 }
          );
        }
        
        const message = await smsService.sendMessage(messageData);
        return NextResponse.json({
          success: true,
          data: message,
          message: 'SMS sent successfully'
        });
        
      case 'send-template':
        if (!templateId || !userId || !phoneNumber || !variables) {
          return NextResponse.json(
            { success: false, error: 'Template ID, user ID, phone number, and variables are required' },
            { status: 400 }
          );
        }
        
        const templateMessage = await smsService.sendFromTemplate(templateId, userId, phoneNumber, variables, messageData);
        return NextResponse.json({
          success: true,
          data: templateMessage,
          message: 'Template SMS sent successfully'
        });
        
      case 'validate-phone':
        const phoneToValidate = body.phoneNumber;
        if (!phoneToValidate) {
          return NextResponse.json(
            { success: false, error: 'Phone number is required' },
            { status: 400 }
          );
        }
        
        const validation = await smsService.validatePhoneNumber(phoneToValidate);
        return NextResponse.json({
          success: true,
          data: validation,
          message: 'Phone number validation completed'
        });
        
      case 'create-campaign':
        if (!campaignData) {
          return NextResponse.json(
            { success: false, error: 'Campaign data is required' },
            { status: 400 }
          );
        }
        
        const campaign = await smsService.createCampaign(campaignData);
        return NextResponse.json({
          success: true,
          data: campaign,
          message: 'SMS campaign created successfully'
        });
        
      case 'launch-campaign':
        const campaignIdToLaunch = body.campaignId;
        if (!campaignIdToLaunch) {
          return NextResponse.json(
            { success: false, error: 'Campaign ID is required' },
            { status: 400 }
          );
        }
        
        const launchSuccess = await smsService.launchCampaign(campaignIdToLaunch);
        if (!launchSuccess) {
          return NextResponse.json(
            { success: false, error: 'Failed to launch campaign' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'SMS campaign launched successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: send, send-template, validate-phone, create-campaign, launch-campaign' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing SMS request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process SMS request' },
      { status: 500 }
    );
  }
}
