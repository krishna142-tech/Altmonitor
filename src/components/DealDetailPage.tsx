import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Mock data for demonstration
const mockDealDetails = {
  'Coyote Infra Project Private Limited': {
    general: {
      'Deal Name': 'Coyote Infra Project Private Limited',
      'Issuer': 'Coyote Infra Project Private Limited',
      'Currency': 'USD',
      'Country of Risk': 'USA',
      'Status': 'Active',
    },
    investorShare: {
      'Investor': 'LGIM',
      'Share %': '60%',
      'Amount': '100,000,000',
    },
    commitmentTerms: {
      'Commitment Date': '2024-01-01',
      'Tenor': '5',
      'Interest Type': 'Fixed',
    },
    covenantSummary: {
      'Covenant Heavy': 'Yes',
      'Allows Assignment': 'Yes',
    },
    reportingTracker: {
      'Last Reported': '2024-05-01',
      'Next Due': '2024-08-01',
    },
  },
  // Add more mock deals as needed
};

const tabList = [
  { key: 'general', label: 'General Information' },
  { key: 'investorShare', label: 'Investor Share' },
  { key: 'commitmentTerms', label: 'Commitment Terms' },
  { key: 'covenantSummary', label: 'Covenant Summary' },
  { key: 'reportingTracker', label: 'Reporting Tracker' },
];

const DealDetailPage = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const decodedDealId = dealId ? decodeURIComponent(dealId) : '';
  const deal = mockDealDetails[decodedDealId] || mockDealDetails['Coyote Infra Project Private Limited'];
  const [activeTab, setActiveTab] = React.useState('general');

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-50 to-amber-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light text-stone-900 tracking-tight">Deal Detail: <span className="font-semibold">{decodedDealId}</span></h1>
          <div className="flex gap-3">
            <button className="bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 text-white px-6 py-3 rounded-full shadow-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl">Edit Deal</button>
            <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-full shadow-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl" onClick={() => navigate('/facilities/add')}>Add Facility</button>
            <button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-3 rounded-full shadow-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl">Export</button>
          </div>
        </div>
        <div className="mb-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-stone-200/30">
          <div className="flex">
            {tabList.map(tab => (
              <button
                key={tab.key}
                className={`px-8 py-4 text-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border-b-2 border-amber-600 shadow-sm' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/30'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-10 bg-gradient-to-br from-stone-50/30 to-amber-50/20">
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(deal.general).map(([label, value]) => (
                  <div key={label} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200/30 hover:shadow-md transition-all duration-300">
                    <div className="text-stone-600 text-sm font-medium mb-2">{label}</div>
                    <div className={`text-lg font-semibold ${
                      label === 'Currency' ? 'text-green-700' :
                      label === 'Status' ? (value === 'Active' ? 'text-green-700' : 'text-red-700') :
                      label === 'Country of Risk' ? 'text-red-700' :
                      'text-stone-900'
                    }`}>{value || 'N/A'}</div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'investorShare' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(deal.investorShare).map(([label, value]) => (
                  <div key={label} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200/30 hover:shadow-md transition-all duration-300">
                    <div className="text-stone-600 text-sm font-medium mb-2">{label}</div>
                    <div className={`text-lg font-semibold ${
                      label === 'Share %' ? 'text-blue-700' :
                      label === 'Amount' ? 'text-green-700' :
                      'text-stone-900'
                    }`}>{value || 'N/A'}</div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'commitmentTerms' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(deal.commitmentTerms).map(([label, value]) => (
                  <div key={label} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200/30 hover:shadow-md transition-all duration-300">
                    <div className="text-stone-600 text-sm font-medium mb-2">{label}</div>
                    <div className={`text-lg font-semibold ${
                      label === 'Commitment Date' ? 'text-amber-700' :
                      label === 'Tenor' ? 'text-blue-700' :
                      label === 'Interest Type' ? 'text-green-700' :
                      'text-stone-900'
                    }`}>{value || 'N/A'}</div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'covenantSummary' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(deal.covenantSummary).map(([label, value]) => (
                  <div key={label} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200/30 hover:shadow-md transition-all duration-300">
                    <div className="text-stone-600 text-sm font-medium mb-2">{label}</div>
                    <div className="text-stone-900 text-lg font-semibold">{value || 'N/A'}</div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reportingTracker' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(deal.reportingTracker).map(([label, value]) => (
                  <div key={label} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200/30 hover:shadow-md transition-all duration-300">
                    <div className="text-stone-600 text-sm font-medium mb-2">{label}</div>
                    <div className="text-stone-900 text-lg font-semibold">{value || 'N/A'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetailPage; 