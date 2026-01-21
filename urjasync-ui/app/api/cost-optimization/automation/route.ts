import { NextRequest, NextResponse } from 'next/server';
import { getAutomationEngine } from '@/lib/cost-optimization/automation-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const ruleId = searchParams.get('ruleId');
    
    const automationEngine = getAutomationEngine();
    
    switch (action) {
      case 'rules':
        const rules = automationEngine.getAllRules();
        return NextResponse.json({
          success: true,
          data: rules
        });
        
      case 'rule':
        if (!ruleId) {
          return NextResponse.json(
            { success: false, error: 'Missing ruleId' },
            { status: 400 }
          );
        }
        const rule = automationEngine.getRule(ruleId);
        if (!rule) {
          return NextResponse.json(
            { success: false, error: 'Rule not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: rule
        });
        
      case 'executions':
        const limit = parseInt(searchParams.get('limit') || '100');
        const executions = automationEngine.getExecutions(ruleId || undefined, limit);
        return NextResponse.json({
          success: true,
          data: executions
        });
        
      case 'statistics':
        const statistics = automationEngine.getStatistics();
        return NextResponse.json({
          success: true,
          data: statistics
        });
        
      case 'status':
        const enabledRules = automationEngine.getEnabledRules();
        return NextResponse.json({
          success: true,
          data: {
            running: true, // TODO: Get actual running status
            enabledRulesCount: enabledRules.length,
            totalRulesCount: automationEngine.getAllRules().length
          }
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: rules, rule, executions, statistics, status' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in automation endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process automation request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, rule } = body;
    
    const automationEngine = getAutomationEngine();
    
    switch (action) {
      case 'add_rule':
        if (!rule) {
          return NextResponse.json(
            { success: false, error: 'Missing rule data' },
            { status: 400 }
          );
        }
        automationEngine.addRule(rule);
        return NextResponse.json({
          success: true,
          message: 'Rule added successfully',
          data: rule
        });
        
      case 'update_rule':
        if (!rule || !rule.id) {
          return NextResponse.json(
            { success: false, error: 'Missing rule data or rule ID' },
            { status: 400 }
          );
        }
        const updated = automationEngine.updateRule(rule.id, rule);
        if (!updated) {
          return NextResponse.json(
            { success: false, error: 'Rule not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          message: 'Rule updated successfully',
          data: rule
        });
        
      case 'remove_rule':
        if (!rule || !rule.id) {
          return NextResponse.json(
            { success: false, error: 'Missing rule ID' },
            { status: 400 }
          );
        }
        const removed = automationEngine.removeRule(rule.id);
        if (!removed) {
          return NextResponse.json(
            { success: false, error: 'Rule not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          message: 'Rule removed successfully'
        });
        
      case 'start_engine':
        automationEngine.start();
        return NextResponse.json({
          success: true,
          message: 'Automation engine started'
        });
        
      case 'stop_engine':
        automationEngine.stop();
        return NextResponse.json({
          success: true,
          message: 'Automation engine stopped'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: add_rule, update_rule, remove_rule, start_engine, stop_engine' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing automation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage automation' },
      { status: 500 }
    );
  }
}
