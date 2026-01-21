import { NextRequest, NextResponse } from 'next/server';
import { loadMicrogridState, saveMicrogridState } from '../../../../lib/server/microgridStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('communityId');
    const memberId = searchParams.get('memberId');
    const type = searchParams.get('type');
    
    const snapshot = await loadMicrogridState();
    
    if (communityId) {
      // Get specific community data
      const community = snapshot.communities.find(c => c.id === communityId);
      if (!community) {
        return NextResponse.json(
          { success: false, error: 'Community not found' },
          { status: 404 }
        );
      }
      
      if (type === 'members') {
        return NextResponse.json({
          success: true,
          data: community.members
        });
      }
      
      if (type === 'stats') {
        const stats = getCommunityStats(community);
        return NextResponse.json({
          success: true,
          data: stats
        });
      }
      
      return NextResponse.json({
        success: true,
        data: community
      });
    }
    
    if (memberId) {
      // Get member's community data
      const memberCommunities = snapshot.communities.filter(community =>
        community.members.some(member => member.id === memberId)
      );
      
      return NextResponse.json({
        success: true,
        data: memberCommunities
      });
    }
    
    // Get all communities
    if (type === 'leaderboard') {
      return NextResponse.json({
        success: true,
        data: snapshot.leaderboards
      });
    }
    
    if (type === 'summary') {
      const summary = getCommunitiesSummary(snapshot.communities);
      return NextResponse.json({
        success: true,
        data: summary
      });
    }
    
    return NextResponse.json({
      success: true,
      data: snapshot.communities
    });
  } catch (error) {
    console.error('Error fetching community data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch community data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, community, member } = body;
    
    const snapshot = await loadMicrogridState();
    
    switch (action) {
      case 'create_community':
        if (!community) {
          return NextResponse.json(
            { success: false, error: 'Missing community data' },
            { status: 400 }
          );
        }
        
        const newCommunity = createCommunity(snapshot, community);
        await saveMicrogridState(snapshot);
        
        return NextResponse.json({
          success: true,
          data: newCommunity,
          message: 'Community created successfully'
        });
        
      case 'join_community':
        if (!community || !member) {
          return NextResponse.json(
            { success: false, error: 'Missing community or member data' },
            { status: 400 }
          );
        }
        
        const updatedCommunity = joinCommunity(snapshot, community.id, member);
        await saveMicrogridState(snapshot);
        
        return NextResponse.json({
          success: true,
          data: updatedCommunity,
          message: 'Member joined community successfully'
        });
        
      case 'leave_community':
        if (!community || !member) {
          return NextResponse.json(
            { success: false, error: 'Missing community or member data' },
            { status: 400 }
          );
        }
        
        const leftCommunity = leaveCommunity(snapshot, community.id, member.id);
        await saveMicrogridState(snapshot);
        
        return NextResponse.json({
          success: true,
          data: leftCommunity,
          message: 'Member left community successfully'
        });
        
      case 'update_member':
        if (!community || !member) {
          return NextResponse.json(
            { success: false, error: 'Missing community or member data' },
            { status: 400 }
          );
        }
        
        const updatedMember = updateMember(snapshot, community.id, member);
        await saveMicrogridState(snapshot);
        
        return NextResponse.json({
          success: true,
          data: updatedMember,
          message: 'Member updated successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: create_community, join_community, leave_community, update_member' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing community:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage community' },
      { status: 500 }
    );
  }
}

function getCommunityStats(community: any): any {
  const totalMembers = community.members.length;
  const activeMembers = community.members.filter((member: any) => member.status === 'Active').length;
  const totalSurplus = community.members.reduce((sum: number, member: any) => sum + member.surplusKwh, 0);
  const averagePeakCut = community.members.reduce((sum: number, member: any) => sum + member.peakCutPercent, 0) / totalMembers;
  
  return {
    totalMembers,
    activeMembers,
    totalSurplus: Number(totalSurplus.toFixed(2)),
    averagePeakCut: Number(averagePeakCut.toFixed(1)),
    netFlow: community.netFlow,
    totalGeneration: community.totalGeneration,
    totalConsumption: community.totalConsumption,
    efficiency: community.totalGeneration > 0 ? Number((community.totalConsumption / community.totalGeneration * 100).toFixed(1)) : 0
  };
}

function getCommunitiesSummary(communities: any[]): any {
  const totalCommunities = communities.length;
  const totalMembers = communities.reduce((sum, community) => sum + community.members.length, 0);
  const totalGeneration = communities.reduce((sum, community) => sum + community.totalGeneration, 0);
  const totalConsumption = communities.reduce((sum, community) => sum + community.totalConsumption, 0);
  const totalSurplus = communities.reduce((sum, community) => 
    sum + community.members.reduce((memberSum: number, member: any) => memberSum + member.surplusKwh, 0), 0
  );
  
  return {
    totalCommunities,
    totalMembers,
    totalGeneration: Number(totalGeneration.toFixed(2)),
    totalConsumption: Number(totalConsumption.toFixed(2)),
    totalSurplus: Number(totalSurplus.toFixed(2)),
    netFlow: Number((totalGeneration - totalConsumption).toFixed(2)),
    averageEfficiency: totalGeneration > 0 ? Number((totalConsumption / totalGeneration * 100).toFixed(1)) : 0
  };
}

function createCommunity(snapshot: any, communityData: any): any {
  const newCommunity = {
    id: `community_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: communityData.name,
    description: communityData.description || '',
    location: communityData.location || '',
    createdAt: new Date().toISOString(),
    members: [],
    netFlow: 0,
    totalGeneration: 0,
    totalConsumption: 0,
    status: 'Active'
  };
  
  snapshot.communities.push(newCommunity);
  return newCommunity;
}

function joinCommunity(snapshot: any, communityId: string, memberData: any): any {
  const community = snapshot.communities.find((c: any) => c.id === communityId);
  if (!community) {
    throw new Error('Community not found');
  }
  
  // Check if member already exists
  if (community.members.some((member: any) => member.id === memberData.id)) {
    throw new Error('Member already exists in community');
  }
  
  const newMember = {
    id: memberData.id,
    name: memberData.name,
    role: memberData.role || 'Member',
    status: 'Active',
    joinedAt: new Date().toISOString(),
    surplusKwh: memberData.surplusKwh || 0,
    peakCutPercent: memberData.peakCutPercent || 0,
    contributionScore: memberData.contributionScore || 0
  };
  
  community.members.push(newMember);
  return community;
}

function leaveCommunity(snapshot: any, communityId: string, memberId: string): any {
  const community = snapshot.communities.find((c: any) => c.id === communityId);
  if (!community) {
    throw new Error('Community not found');
  }
  
  const memberIndex = community.members.findIndex((member: any) => member.id === memberId);
  if (memberIndex === -1) {
    throw new Error('Member not found in community');
  }
  
  community.members.splice(memberIndex, 1);
  return community;
}

function updateMember(snapshot: any, communityId: string, memberData: any): any {
  const community = snapshot.communities.find((c: any) => c.id === communityId);
  if (!community) {
    throw new Error('Community not found');
  }
  
  const memberIndex = community.members.findIndex((member: any) => member.id === memberData.id);
  if (memberIndex === -1) {
    throw new Error('Member not found in community');
  }
  
  // Update member data
  Object.assign(community.members[memberIndex], memberData);
  return community.members[memberIndex];
}
