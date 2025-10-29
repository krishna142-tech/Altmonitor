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
  'First Interest Payment Date': '2025-06-30',
  'InterestType': 'Floating',
  'Interval Tenor': '12',
  'Scheduled On': 'EOMONTH',
  'Day Count Convention': '365',
  'Interval Rate Type': '',
  'Margin': '',
  'Holiday Adjustment': 'Yes',
  'Holiday Convention': 'Following',
  'Holidays': '',
  'Interest Payment Dates': '30-06,31-12',
};
const mockAdditional = {
  'Different convention Maturity': 'Yes',
  'Holiday Adjustent on Calculation start date': 'Yes',
  'Payment Date': '',
};

const CashTermsPage = () => {
  useParams();
  
  const renderGrid = (data: Record<string, string>) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(data).map(([label, value]) => (
        <div key={label} className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-gray-500 text-sm font-medium mb-1">{label}</div>
          <div className="text-gray-900 font-semibold">{value || 'N/A'}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Cash Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">General Terms</h2>
              {renderGrid(mockGeneral as Record<string, string>)}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Configuration</h2>
              {renderGrid(mockConfig as Record<string, string>)}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Day One Funding Details</h2>
              {renderGrid(mockDayOne as Record<string, string>)}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Default Option</h2>
              {renderGrid(mockDefault as Record<string, string>)}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Additional Option</h2>
              {renderGrid(mockAdditional as Record<string, string>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashTermsPage;