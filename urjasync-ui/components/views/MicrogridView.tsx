'use client';

import React from 'react';
import { MOCK_DATA } from '@/lib/mockData';
import { LeaderboardCategory } from '@/lib/types';
import { useMicrogrid } from '@/lib/hooks/useMicrogrid';

const leaderboardLabels: Record<LeaderboardCategory, string> = {
  surplus: 'Top Surplus Exporters (kWh)',
  peak_cut: 'Peak Shaving Heroes (%)',
};

const badgeColors = ['bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700', 'bg-indigo-100 text-indigo-700'];

const MicrogridView: React.FC = () => {
  const { data, loading, error, refresh } = useMicrogrid({ initialData: MOCK_DATA.microgrid });
  const snapshot = data ?? MOCK_DATA.microgrid;

  const membershipCommunity = snapshot.communities.find(
    (community) => community.id === snapshot.userMembership.communityId,
  );
  const memberProfile = membershipCommunity?.members.find((member) => member.id === snapshot.userMembership.memberId);

  const totalNetFlow = snapshot.communities.reduce((sum, c) => sum + c.netFlow, 0);
  const totalHouseholds = snapshot.communities.reduce((sum, c) => sum + c.households, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Community Energy Mesh</p>
          <h1 className="text-3xl font-bold text-gray-800">Microgrid & Credit Exchange</h1>
          <p className="text-gray-600">Pool surplus, trade credits, and climb the leaderboard.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-emerald-300"
          >
            {loading ? 'Syncing…' : 'Refresh data'}
          </button>
          <button className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600">
            Invite neighbor
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard title="Communities online" value={snapshot.communities.length.toString()} helper={`${totalHouseholds} households`} />
        <SummaryCard
          title="Rewards pool"
          value={`${snapshot.rewardsPool.totalCredits.toLocaleString()} credits`}
          helper={`Next drop ${new Date(snapshot.rewardsPool.nextPayout).toLocaleDateString()}`}
        />
        <SummaryCard
          title="Network net flow"
          value={`${totalNetFlow.toFixed(1)} kWh`}
          helper={totalNetFlow >= 0 ? 'Exporting to neighbors' : 'Importing support'}
          positive={totalNetFlow >= 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">My microgrid</h2>
                <p className="text-sm text-gray-500">{membershipCommunity?.name}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {memberProfile?.tier ?? 'Member'} tier
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <StatBlock label="Surplus shared" value={`${memberProfile?.surplusKwh ?? 0} kWh`} progress={memberProfile?.surplusKwh} />
              <StatBlock
                label="Peak cut"
                value={`${memberProfile?.peakCutPercent ?? 0}%`}
                progress={memberProfile?.peakCutPercent}
                barColor="from-pink-400 to-rose-500"
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {membershipCommunity?.description}
            </div>
            {memberProfile?.badges?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {memberProfile.badges.map((badge, idx) => (
                  <span key={badge} className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColors[idx % badgeColors.length]}`}>
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Communities</h2>
                <p className="text-sm text-gray-500">Tap into neighborhoods sharing energy</p>
              </div>
              <button className="text-sm font-semibold text-blue-600">Browse invites →</button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {snapshot.communities.map((community) => (
                <div key={community.id} className="rounded-2xl border border-gray-100 p-4 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{community.name}</h3>
                      <p className="text-xs text-gray-500">{community.households} households · {community.sharedCapacity} kWh shared</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        community.invitesOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {community.invitesOpen ? 'Open' : 'Private'}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{community.totalGeneration} kWh</p>
                      <p>Gen.</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{community.totalConsumption} kWh</p>
                      <p>Use</p>
                    </div>
                    <div>
                      <p className={`text-lg font-semibold ${community.netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {community.netFlow} kWh
                      </p>
                      <p>Net</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-500 line-clamp-2">{community.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {Object.entries(snapshot.leaderboards).map(([category, entries]) => (
            <section key={category} className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
              <h3 className="text-sm font-semibold text-gray-500">{leaderboardLabels[category as LeaderboardCategory]}</h3>
              <div className="mt-4 space-y-4">
                {entries.map((entry, idx) => (
                  <div key={entry.memberId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-400">{idx + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{entry.household}</p>
                        <p className="text-xs text-gray-500">{entry.tier} tier</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{entry.value}</p>
                      <p className={`text-xs ${entry.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {entry.change >= 0 ? '+' : ''}
                        {entry.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500">Recent trades</h3>
              <button className="text-xs font-semibold text-blue-600">View ledger</button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              {snapshot.recentTrades.map((trade) => (
                <div key={trade.id} className="rounded-xl border border-gray-100 px-3 py-3">
                  <div className="flex items-center justify-between text-gray-800">
                    <p className="font-semibold">{trade.from}</p>
                    <p className="text-xs text-gray-500">→</p>
                    <p className="font-semibold">{trade.to}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{trade.amountKwh} kWh @ ₹{trade.pricePerKwh}/kWh</span>
                    <span className={trade.status === 'Settled' ? 'text-emerald-600' : 'text-amber-600'}>{trade.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  helper,
  positive,
}: {
  title: string;
  value: string;
  helper?: string;
  positive?: boolean;
}) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
    <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    {helper && (
      <p className={`text-sm ${positive === undefined ? 'text-gray-500' : positive ? 'text-emerald-600' : 'text-rose-600'}`}>{helper}</p>
    )}
  </div>
);

const StatBlock = ({
  label,
  value,
  progress = 0,
  barColor = 'from-emerald-400 to-emerald-600',
}: {
  label: string;
  value: string;
  progress?: number;
  barColor?: string;
}) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-xl font-semibold text-gray-900">{value}</p>
    <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  </div>
);

export default MicrogridView;
