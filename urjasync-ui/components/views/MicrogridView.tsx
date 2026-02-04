'use client';
 
import React, { useState, useEffect } from 'react';
import { LeaderboardCategory } from '@/lib/types';
import { MicrogridSnapshot } from '@/lib/types';

// Custom SVG Icons
const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const leaderboardLabels: Record<LeaderboardCategory, string> = {
  surplus: 'Top Surplus Exporters (kWh)',
  peak_cut: 'Peak Shaving Heroes (%)',
};

// Join Community Modal Component
const JoinCommunityModal: React.FC<{ isOpen: boolean; onClose: () => void; communities: any[] }> = ({ 
  isOpen, onClose, communities 
}) => {
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinCommunity = async () => {
    if (!selectedCommunity) {
      alert('Please select a community to join');
      return;
    }

    setIsLoading(true);
    try {
      // Here you would normally make an API call
      console.log('Joining community:', selectedCommunity);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Successfully joined the community!');
      onClose();
    } catch (error) {
      alert('Failed to join community. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Join a Community</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600">Select a community to join and start participating in energy sharing:</p>
          
          {communities.map((community) => (
            <div
              key={community.id}
              onClick={() => setSelectedCommunity(community.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedCommunity === community.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{community.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{community.description}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <span className="text-gray-500">
                      <UsersIcon className="w-4 h-4 inline mr-1" />
                      {community.households} households
                    </span>
                    <span className="text-gray-500">
                      <ZapIcon className="w-4 h-4 inline mr-1" />
                      {community.netFlow > 0 ? '+' : ''}{community.netFlow} kWh net flow
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  community.invitesOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {community.invitesOpen ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleJoinCommunity}
            disabled={isLoading || !selectedCommunity}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Joining...' : 'Join Community'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Find Communities Modal Component
const FindCommunitiesModal: React.FC<{ isOpen: boolean; onClose: () => void; communities: any[] }> = ({ 
  isOpen, onClose, communities 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Find Communities</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCommunities.map((community) => (
              <div key={community.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{community.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    community.invitesOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {community.invitesOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{community.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Households:</span>
                    <span className="font-medium">{community.households}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Net Flow:</span>
                    <span className={`font-medium ${community.netFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {community.netFlow > 0 ? '+' : ''}{community.netFlow} kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shared Capacity:</span>
                    <span className="font-medium">{community.sharedCapacity} kW</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const MicrogridView: React.FC = () => {
  const [data, setData] = useState<MicrogridSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isFindModalOpen, setIsFindModalOpen] = useState(false);

  useEffect(() => {
    fetchMicrogridData();
  }, []);

  const fetchMicrogridData = async () => {
    try {
      const response = await fetch('/api/microgrid');
      const microgridData = await response.json();
      setData(microgridData);
    } catch (error) {
      console.error('Failed to fetch microgrid data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading microgrid data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load microgrid data</div>
      </div>
    );
  }

  const { communities, leaderboards, rewardsPool, userMembership } = data;
  const totalNetFlow = communities.reduce((sum, c) => sum + (c?.netFlow || 0), 0);
  const totalHouseholds = communities.reduce((sum, c) => sum + (c?.households || 0), 0);

  const userCommunity = communities.find(c => c.id === userMembership?.communityId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Microgrid Community</h1>
          <p className="text-gray-600 mt-1">
            Connect, share, and trade energy with your neighbors.
          </p>
        </div>
        <button 
          onClick={() => setIsJoinModalOpen(true)}
          className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Join Community
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Active Communities</h3>
            <UsersIcon className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{communities.length}</p>
          <p className="text-gray-600 text-sm mt-1">{totalHouseholds} households</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Net Energy Flow</h3>
            <ZapIcon className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{totalNetFlow.toFixed(1)} kWh</p>
          <p className="text-gray-600 text-sm mt-1">Community total</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Rewards Pool</h3>
            <TrophyIcon className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{rewardsPool.totalCredits}</p>
          <p className="text-gray-600 text-sm mt-1">Credits available</p>
        </div>
      </div>

      {/* Community Status */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Community Status</h2>
        {userCommunity ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg text-blue-900">{userCommunity.name}</h3>
              <p className="text-blue-700 mt-1">{userCommunity.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-sm text-blue-600">Households</p>
                  <p className="font-semibold">{userCommunity.households}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Net Flow</p>
                  <p className="font-semibold">{userCommunity.netFlow} kWh</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Your Credits</p>
                  <p className="font-semibold">124</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Tier</p>
                  <p className="font-semibold">Gold</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">You haven't joined any community yet</p>
            <button 
              onClick={() => setIsFindModalOpen(true)}
              className="mt-4 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Find Communities
            </button>
          </div>
        )}
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(leaderboards).map(([category, entries]) => (
          <div key={category} className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {leaderboardLabels[category as LeaderboardCategory]}
            </h3>
            <div className="space-y-3">
              {entries.length > 0 ? (
                entries.map((entry, index) => (
                  <div key={entry.memberId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{entry.household}</p>
                        <p className="text-sm text-gray-500">{entry.tier} Tier</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{entry.value}</p>
                      <p className={`text-sm ${entry.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.change > 0 ? '+' : ''}{entry.change}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No data available</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <JoinCommunityModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
        communities={communities.filter(c => c.invitesOpen)}
      />
      <FindCommunitiesModal 
        isOpen={isFindModalOpen} 
        onClose={() => setIsFindModalOpen(false)} 
        communities={communities}
      />
    </div>
  );
};
 
export default MicrogridView;