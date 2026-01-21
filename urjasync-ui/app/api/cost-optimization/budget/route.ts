import { NextRequest, NextResponse } from 'next/server';
import { getBudgetManager } from '../../../../lib/cost-optimization/budget-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const budgetId = searchParams.get('budgetId');
    const goalId = searchParams.get('goalId');
    const days = parseInt(searchParams.get('days') || '30');
    
    const budgetManager = getBudgetManager();
    
    switch (type) {
      case 'budgets':
        const budgets = budgetManager.getAllBudgets();
        return NextResponse.json({
          success: true,
          data: budgets
        });
        
      case 'budget':
        if (!budgetId) {
          return NextResponse.json(
            { success: false, error: 'Missing budgetId' },
            { status: 400 }
          );
        }
        const budget = budgetManager.getBudget(budgetId);
        if (!budget) {
          return NextResponse.json(
            { success: false, error: 'Budget not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: budget
        });
        
      case 'report':
        if (!budgetId) {
          return NextResponse.json(
            { success: false, error: 'Missing budgetId' },
            { status: 400 }
          );
        }
        const report = budgetManager.generateBudgetReport(budgetId);
        if (!report) {
          return NextResponse.json(
            { success: false, error: 'Budget report not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: report
        });
        
      case 'insights':
        const insights = budgetManager.getBudgetInsights();
        return NextResponse.json({
          success: true,
          data: insights
        });
        
      case 'goals':
        const goals = budgetManager.getAllGoals();
        return NextResponse.json({
          success: true,
          data: goals
        });
        
      case 'goal':
        if (!goalId) {
          return NextResponse.json(
            { success: false, error: 'Missing goalId' },
            { status: 400 }
          );
        }
        const goal = budgetManager.getGoal(goalId);
        if (!goal) {
          return NextResponse.json(
            { success: false, error: 'Goal not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: goal
        });
        
      case 'expenses':
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        if (!startDate || !endDate) {
          return NextResponse.json(
            { success: false, error: 'Missing startDate or endDate' },
            { status: 400 }
          );
        }
        
        const expenses = budgetManager.getExpensesByDateRange(
          new Date(startDate),
          new Date(endDate)
        );
        return NextResponse.json({
          success: true,
          data: expenses
        });
        
      case 'category_expenses':
        const categoryId = searchParams.get('categoryId');
        if (!categoryId) {
          return NextResponse.json(
            { success: false, error: 'Missing categoryId' },
            { status: 400 }
          );
        }
        
        const categoryExpenses = budgetManager.getExpensesByCategory(categoryId, days);
        return NextResponse.json({
          success: true,
          data: categoryExpenses
        });
        
      case 'export':
        if (!budgetId) {
          return NextResponse.json(
            { success: false, error: 'Missing budgetId' },
            { status: 400 }
          );
        }
        
        const exportData = budgetManager.exportBudgetData(budgetId);
        if (!exportData) {
          return NextResponse.json(
            { success: false, error: 'Budget export data not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: exportData
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type. Use: budgets, budget, report, insights, goals, goal, expenses, category_expenses, export' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in budget endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process budget request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, budget, goal, expense } = body;
    
    const budgetManager = getBudgetManager();
    
    switch (action) {
      case 'create_budget':
        if (!budget) {
          return NextResponse.json(
            { success: false, error: 'Missing budget data' },
            { status: 400 }
          );
        }
        
        const newBudget = budgetManager.createBudget(budget);
        return NextResponse.json({
          success: true,
          message: 'Budget created successfully',
          data: newBudget
        });
        
      case 'update_budget':
        if (!budget || !budget.id) {
          return NextResponse.json(
            { success: false, error: 'Missing budget data or budget ID' },
            { status: 400 }
          );
        }
        
        const updated = budgetManager.updateBudget(budget.id, budget);
        if (!updated) {
          return NextResponse.json(
            { success: false, error: 'Budget not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Budget updated successfully'
        });
        
      case 'delete_budget':
        if (!budget || !budget.id) {
          return NextResponse.json(
            { success: false, error: 'Missing budget ID' },
            { status: 400 }
          );
        }
        
        const deleted = budgetManager.deleteBudget(budget.id);
        if (!deleted) {
          return NextResponse.json(
            { success: false, error: 'Budget not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Budget deleted successfully'
        });
        
      case 'create_goal':
        if (!goal) {
          return NextResponse.json(
            { success: false, error: 'Missing goal data' },
            { status: 400 }
          );
        }
        
        const newGoal = budgetManager.createGoal(goal);
        return NextResponse.json({
          success: true,
          message: 'Goal created successfully',
          data: newGoal
        });
        
      case 'update_goal':
        if (!goal || !goal.id) {
          return NextResponse.json(
            { success: false, error: 'Missing goal data or goal ID' },
            { status: 400 }
          );
        }
        
        const goalUpdated = budgetManager.updateGoal(goal.id, goal);
        if (!goalUpdated) {
          return NextResponse.json(
            { success: false, error: 'Goal not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Goal updated successfully'
        });
        
      case 'add_achievement':
        if (!goal || !goal.id || !expense) {
          return NextResponse.json(
            { success: false, error: 'Missing goal ID or achievement data' },
            { status: 400 }
          );
        }
        
        const achievementAdded = budgetManager.addGoalAchievement(
          goal.id,
          expense.amount,
          expense.description || 'Achievement added'
        );
        
        if (!achievementAdded) {
          return NextResponse.json(
            { success: false, error: 'Goal not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Achievement added successfully'
        });
        
      case 'add_expense':
        if (!expense) {
          return NextResponse.json(
            { success: false, error: 'Missing expense data' },
            { status: 400 }
          );
        }
        
        const newExpense = budgetManager.addExpense(expense);
        return NextResponse.json({
          success: true,
          message: 'Expense added successfully',
          data: newExpense
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: create_budget, update_budget, delete_budget, create_goal, update_goal, add_achievement, add_expense' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing budget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage budget' },
      { status: 500 }
    );
  }
}
