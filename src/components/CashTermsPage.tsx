import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const mockGeneral = {
  'Calculation Start Date': '11-02-2025',
  'Agreement Date': '11-02-2025',
  'Maturity Date': '31-12-2029',
  'S&P': '',
  'Fitch': '',
  'Moody\'s': '',
  'Others': '',
};
const mockConfig = {
  'Extension Option': 'No',
  'Commitment Fee': 'No',
  'Amortisation': 'No',
  'Fee and Expenses': 'Yes',
  'Interest Type': 'Cash Interest',
  'Revolving Facility': 'No',
};
const mockDayOne = {
  'Initial Commitment': '100000000',
  'Price': '',
  'Ratings Agency': 'Fitch, S&P, Moody\'s, Others',
  'Ratings': 'AA, AA, Aa, ',
};
const mockDefault = {
  'First Interest Payment Date': '31/06/2025',
  'InterestType': 'Floating',
  'Interval Tenor': '12',
  'Scheduled On': 'Edate',
  'Day Count Convention': '365',
  'Day of Month': '',
  'Interval Rate Type': '',
  'Margin': '',
  'Default Rate': '',
  'Holiday Adjustment': 'Yes',
  'Holiday Convention': 'Following',
  'Holidays': '',
  'Interest Payment Dates': '30-Jun,31-Dec',
};
const mockAdditional = {
  'Different convention Maturity': 'Yes',
  'Holiday Adjustent on Calculation start date': 'Yes',
  'Payment Date': '',
};

const CashTermsPage = () => {
  useParams();
  
  return (
<Card className="min-h-screen bg-[#121516] p-6" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
<CardContent className="max-w-7xl mx-auto">
<CardContent className="bg-[#1e2124] border border-[#40484f] rounded-xl shadow-xl p-10 pb-16">
<CardHeader><CardTitle className="text-3xl font-bold text-white mb-10 tracking-tight border-b border-[#2c3135] pb-4">Cash Terms</CardTitle></CardHeader>
          
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight border-b border-[#2c3135] pb-3">General Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(mockGeneral).map(([label, value]) => (
                <div key={label} className="bg-[#2c3135] rounded-xl p-6 shadow-sm border border-[#40484f] hover:border-[#c5daeb]/50 transition-all duration-300">
                  <div className="text-[#a2acb3] text-sm font-medium mb-2">{label}</div>
                  <div className={`text-lg font-semibold ${
                    label.includes('Date') ? 'text-amber-400' :
                    label.includes('Rating') ? 'text-blue-400' :
                    label.includes('Commitment') || label.includes('Price') ? 'text-green-400' :
                    label.includes('Interest') ? 'text-green-400' :
                    label.includes('Rate') ? 'text-red-400' :
                    label.includes('Convention') ? 'text-amber-400' :
                    label.includes('Fee') ? 'text-red-400' :
                    label.includes('Margin') ? 'text-red-400' :
                    label.includes('Tenor') ? 'text-blue-400' :
                    label.includes('Adjustment') ? 'text-amber-400' :
                    value === 'Yes' ? 'text-green-400' :
                    value === 'No' ? 'text-red-400' :
                    value === 'Floating' ? 'text-green-400' :
                    value === 'Fixed' ? 'text-blue-400' :
                    'text-white'
                  }`}>{value || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight border-b border-[#2c3135] pb-3">Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(mockConfig).map(([label, value]) => (
                <div key={label} className="bg-[#2c3135] rounded-xl p-6 shadow-sm border border-[#40484f] hover:border-[#c5daeb]/50 transition-all duration-300">
                  <div className="text-[#a2acb3] text-sm font-medium mb-2">{label}</div>
                  <div className={`text-lg font-semibold ${
                    label.includes('Date') ? 'text-amber-400' :
                    label.includes('Rating') ? 'text-blue-400' :
                    label.includes('Commitment') || label.includes('Price') ? 'text-green-400' :
                    label.includes('Interest') ? 'text-green-400' :
                    label.includes('Rate') ? 'text-red-400' :
                    label.includes('Convention') ? 'text-amber-400' :
                    label.includes('Fee') ? 'text-red-400' :
                    label.includes('Margin') ? 'text-red-400' :
                    label.includes('Tenor') ? 'text-blue-400' :
                    label.includes('Adjustment') ? 'text-amber-400' :
                    value === 'Yes' ? 'text-green-400' :
                    value === 'No' ? 'text-red-400' :
                    value === 'Floating' ? 'text-green-400' :
                    value === 'Fixed' ? 'text-blue-400' :
                    'text-white'
                  }`}>{value || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight border-b border-[#2c3135] pb-3">Day One Funding Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(mockDayOne).map(([label, value]) => (
                <div key={label} className="bg-[#2c3135] rounded-xl p-6 shadow-sm border border-[#40484f] hover:border-[#c5daeb]/50 transition-all duration-300">
                  <div className="text-[#a2acb3] text-sm font-medium mb-2">{label}</div>
                  <div className={`text-lg font-semibold ${
                    label.includes('Date') ? 'text-amber-400' :
                    label.includes('Rating') ? 'text-blue-400' :
                    label.includes('Commitment') || label.includes('Price') ? 'text-green-400' :
                    label.includes('Interest') ? 'text-green-400' :
                    label.includes('Rate') ? 'text-red-400' :
                    label.includes('Convention') ? 'text-amber-400' :
                    label.includes('Fee') ? 'text-red-400' :
                    label.includes('Margin') ? 'text-red-400' :
                    label.includes('Tenor') ? 'text-blue-400' :
                    label.includes('Adjustment') ? 'text-amber-400' :
                    value === 'Yes' ? 'text-green-400' :
                    value === 'No' ? 'text-red-400' :
                    value === 'Floating' ? 'text-green-400' :
                    value === 'Fixed' ? 'text-blue-400' :
                    'text-white'
                  }`}>{value || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight border-b border-[#2c3135] pb-3">Default Option</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(mockDefault).map(([label, value]) => (
                <div key={label} className="bg-[#2c3135] rounded-xl p-6 shadow-sm border border-[#40484f] hover:border-[#c5daeb]/50 transition-all duration-300">
                  <div className="text-[#a2acb3] text-sm font-medium mb-2">{label}</div>
                  <div className={`text-lg font-semibold ${
                    label.includes('Date') ? 'text-amber-400' :
                    label.includes('Rating') ? 'text-blue-400' :
                    label.includes('Commitment') || label.includes('Price') ? 'text-green-400' :
                    label.includes('Interest') ? 'text-green-400' :
                    label.includes('Rate') ? 'text-red-400' :
                    label.includes('Convention') ? 'text-amber-400' :
                    label.includes('Fee') ? 'text-red-400' :
                    label.includes('Margin') ? 'text-red-400' :
                    label.includes('Tenor') ? 'text-blue-400' :
                    label.includes('Adjustment') ? 'text-amber-400' :
                    value === 'Yes' ? 'text-green-400' :
                    value === 'No' ? 'text-red-400' :
                    value === 'Floating' ? 'text-green-400' :
                    value === 'Fixed' ? 'text-blue-400' :
                    'text-white'
                  }`}>{value || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight border-b border-[#2c3135] pb-3">Additional Option</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(mockAdditional).map(([label, value]) => (
                <div key={label} className="bg-[#2c3135] rounded-xl p-6 shadow-sm border border-[#40484f] hover:border-[#c5daeb]/50 transition-all duration-300">
                  <div className="text-[#a2acb3] text-sm font-medium mb-2">{label}</div>
                  <div className={`text-lg font-semibold ${
                    label.includes('Date') ? 'text-amber-400' :
                    label.includes('Rating') ? 'text-blue-400' :
                    label.includes('Commitment') || label.includes('Price') ? 'text-green-400' :
                    label.includes('Interest') ? 'text-green-400' :
                    label.includes('Rate') ? 'text-red-400' :
                    label.includes('Convention') ? 'text-amber-400' :
                    label.includes('Fee') ? 'text-red-400' :
                    label.includes('Margin') ? 'text-red-400' :
                    label.includes('Tenor') ? 'text-blue-400' :
                    label.includes('Adjustment') ? 'text-amber-400' :
                    value === 'Yes' ? 'text-green-400' :
                    value === 'No' ? 'text-red-400' :
                    value === 'Floating' ? 'text-green-400' :
                    value === 'Fixed' ? 'text-blue-400' :
                    'text-white'
                  }`}>{value || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end mt-8 mb-4">
            {/* Cashflow schedule feature removed */}
          </div>
        </CardContent>
      </CardContent>
    </Card>
  );
};

export default CashTermsPage;