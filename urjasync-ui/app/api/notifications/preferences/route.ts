import { NextRequest, NextResponse } from 'next/server';
import { getNotificationPreferences } from '@/lib/notifications/notification-preferences';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    
    const preferencesService = getNotificationPreferences();
    
    switch (action) {
      case 'user-preferences':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'User ID is required' },
            { status: 400 }
          );
        }
        
        const userPreferences = await preferencesService.getUserPreferences(userId);
        return NextResponse.json({
          success: true,
          data: userPreferences
        });
        
      case 'templates':
        const templates = await preferencesService.getAllTemplates();
        return NextResponse.json({
          success: true,
          data: templates
        });
        
      case 'template':
        const templateId = searchParams.get('templateId');
        if (!templateId) {
          return NextResponse.json(
            { success: false, error: 'Template ID is required' },
            { status: 400 }
          );
        }
        
        const template = await preferencesService.getTemplate(templateId);
        if (!template) {
          return NextResponse.json(
            { success: false, error: 'Template not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: template
        });
        
      case 'quiet-hours':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'User ID is required' },
            { status: 400 }
          );
        }
        
        const userPrefs = await preferencesService.getUserPreferences(userId);
        const isQuiet = await preferencesService.isQuietHours(userId);
        return NextResponse.json({
          success: true,
          data: {
            quietHours: userPrefs.quietHours,
            isCurrentlyQuiet: isQuiet
          }
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: user-preferences, templates, template, quiet-hours' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, updates, channel, category, quietHours, templateData } = body;
    
    const preferencesService = getNotificationPreferences();
    
    switch (action) {
      case 'update-preferences':
        if (!userId || !updates) {
          return NextResponse.json(
            { success: false, error: 'User ID and updates are required' },
            { status: 400 }
          );
        }
        
        const updatedPreferences = await preferencesService.updatePreferences(userId, updates);
        return NextResponse.json({
          success: true,
          data: updatedPreferences,
          message: 'Preferences updated successfully'
        });
        
      case 'update-channel':
        if (!userId || !channel || !updates) {
          return NextResponse.json(
            { success: false, error: 'User ID, channel, and updates are required' },
            { status: 400 }
          );
        }
        
        const updatedChannelPrefs = await preferencesService.updateChannelPreferences(userId, channel, updates);
        return NextResponse.json({
          success: true,
          data: updatedChannelPrefs,
          message: 'Channel preferences updated successfully'
        });
        
      case 'update-category':
        if (!userId || !category || !updates) {
          return NextResponse.json(
            { success: false, error: 'User ID, category, and updates are required' },
            { status: 400 }
          );
        }
        
        const updatedCategoryPrefs = await preferencesService.updateCategoryPreferences(userId, category, updates);
        return NextResponse.json({
          success: true,
          data: updatedCategoryPrefs,
          message: 'Category preferences updated successfully'
        });
        
      case 'update-quiet-hours':
        if (!userId || !quietHours) {
          return NextResponse.json(
            { success: false, error: 'User ID and quiet hours data are required' },
            { status: 400 }
          );
        }
        
        const updatedQuietHours = await preferencesService.updateQuietHours(userId, quietHours);
        return NextResponse.json({
          success: true,
          data: updatedQuietHours,
          message: 'Quiet hours updated successfully'
        });
        
      case 'create-template':
        if (!templateData) {
          return NextResponse.json(
            { success: false, error: 'Template data is required' },
            { status: 400 }
          );
        }
        
        const newTemplate = await preferencesService.createTemplate(templateData);
        return NextResponse.json({
          success: true,
          data: newTemplate,
          message: 'Template created successfully'
        });
        
      case 'update-template':
        const templateId = body.templateId;
        if (!templateId || !updates) {
          return NextResponse.json(
            { success: false, error: 'Template ID and updates are required' },
            { status: 400 }
          );
        }
        
        const updatedTemplate = await preferencesService.updateTemplate(templateId, updates);
        if (!updatedTemplate) {
          return NextResponse.json(
            { success: false, error: 'Template not found or update failed' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: updatedTemplate,
          message: 'Template updated successfully'
        });
        
      case 'delete-template':
        const templateIdToDelete = body.templateId;
        if (!templateIdToDelete) {
          return NextResponse.json(
            { success: false, error: 'Template ID is required' },
            { status: 400 }
          );
        }
        
        const deleteSuccess = await preferencesService.deleteTemplate(templateIdToDelete);
        if (!deleteSuccess) {
          return NextResponse.json(
            { success: false, error: 'Template not found or delete failed' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Template deleted successfully'
        });
        
      case 'reset-to-defaults':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'User ID is required' },
            { status: 400 }
          );
        }
        
        const defaultPreferences = await preferencesService.resetToDefaults(userId);
        return NextResponse.json({
          success: true,
          data: defaultPreferences,
          message: 'Preferences reset to defaults successfully'
        });
        
      case 'import-preferences':
        if (!userId || !body.preferencesJson) {
          return NextResponse.json(
            { success: false, error: 'User ID and preferences JSON are required' },
            { status: 400 }
          );
        }
        
        try {
          const importedPreferences = await preferencesService.importPreferences(userId, body.preferencesJson);
          return NextResponse.json({
            success: true,
            data: importedPreferences,
            message: 'Preferences imported successfully'
          });
        } catch (importError) {
          return NextResponse.json(
            { success: false, error: 'Invalid preferences format' },
            { status: 400 }
          );
        }
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: update-preferences, update-channel, update-category, update-quiet-hours, create-template, update-template, delete-template, reset-to-defaults, import-preferences' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
