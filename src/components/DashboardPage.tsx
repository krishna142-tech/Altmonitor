import React from 'react';
import Sidebar from './Sidebar';
import { TrendingUp, DollarSign, Users, Activity } from 'lucide-react';

const DashboardPage = () => {
  const stats = [
    {
      title: 'Total Investments',
      value: '$2.4M',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Clients',
      value: '24',
      change: '+3 this month',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Performance',
      value: '18.2%',
      change: '+2.1% vs last quarter',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Transactions',
      value: '156',
      change: '+23 this week',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#121516] overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-[#a2acb3]">Welcome back! Here's your investment overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const getFinancialColor = (title) => {
              switch (title) {
                case 'Total Investments':
                  return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' };
                case 'Active Clients':
                  return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
                case 'Performance':
                  return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' };
                case 'Transactions':
                  return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
                default:
                  return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
              }
            };
            const colors = getFinancialColor(stat.title);
            return (
              <div
                key={index}
                className="bg-[#1e2124] border border-[#40484f] rounded-xl p-6 hover:border-[#c5daeb]/50 transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${colors.bg} border ${colors.border} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-[#a2acb3] mb-2">{stat.title}</p>
                <p className={`text-sm ${colors.text} font-medium`}>{stat.change}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1e2124] border border-[#40484f] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { client: 'Apex Capital', type: 'Purchase', amount: '$125,000', date: '2 hours ago' },
              { client: 'Silver Creek Fund', type: 'Redemption', amount: '$75,000', date: '1 day ago' },
              { client: 'Mountain View Partners', type: 'Transfer', amount: '$200,000', date: '2 days ago' },
              { client: 'Pacific Ventures', type: 'Purchase', amount: '$300,000', date: '3 days ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-[#2c3135]/50 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mr-4">
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{activity.client}</p>
                    <p className="text-sm text-[#a2acb3]">{activity.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-400">{activity.amount}</p>
                  <p className="text-sm text-[#a2acb3]">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;