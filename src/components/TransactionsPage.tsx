import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Filter, Search, X, ArrowLeft, Menu, Receipt } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSupabaseData } from '@/context/SupabaseDataContext'

// Mocked data for table and dropdowns
const mockTransactions = [
  {
    deal: 'Coyote Infra Project Private Limited',
    issuer: 'Coyote Infra Project Private Limited',
    currency: 'USD',
    countryOfRisk: 'USA',
    collateralDescription: 'Infrastructure development',
    contractDate: '2023-09-15',
    assetManager: 'Global Equity',
    assetManagerName: 'John Doe',
    amount: '$2,500,000',
    status: 'Active'
  },
  {
    deal: 'Angetes S.A.',
    issuer: 'Angetes S.A.',
    currency: 'EUR',
    countryOfRisk: 'Spain',
    collateralDescription: 'Renewable energy project',
    contractDate: '2023-08-20',
    assetManager: 'Renewables Fund',
    assetManagerName: 'Jane Smith',
    amount: '€1,800,000',
    status: 'Pending'
  },
  {
    deal: 'Angeles I',
    issuer: 'Angeles I',
    currency: 'GBP',
    countryOfRisk: 'UK',
    collateralDescription: 'Real estate investment',
    contractDate: '2023-07-10',
    assetManager: 'Property Fund',
    assetManagerName: 'Michael Johnson',
    amount: '£1,200,000',
    status: 'Completed'
  }
];

const dealNames = ['Coyote Infra Project Private Limited', 'Angetes S.A.', 'Angeles I'];
const issuers = ['Coyote Infra Project Private Limited', 'Angetes S.A.', 'Angeles I'];
const currencies = ['USD', 'EUR', 'GBP'];
// Replace the countries array with a full alphabetical list
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

function AddTransactionModal({ isOpen, onClose, onSave, dealNames, addDeal, issuerOptions, addIssuer, sponsorOptions, addSponsor, dealOwner3Options, addDealOwner3, dealTypeOptions, addDealType }) {
  const { register, handleSubmit, reset, watch, setValue, getValues, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div 
        className="bg-background-secondary border border-border rounded-xl shadow-2xl w-[75rem] max-w-3xl mx-auto"        
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Card className="bg-transparent border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl">Add New Transaction</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-h-[70vh] overflow-y-auto p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="dealName" className="text-sm font-medium text-foreground">Deal Name</label>
                    <select
                      {...register('dealName', { required: 'Deal Name is required' })}
                      id="dealName"
                      className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    >
                      <option value="">Select Deal Name</option>
                      {dealNames.map(d => <option key={d} value={d}>{d}</option>)}
                      <option value="__add_new">+ Add new deal</option>
                    </select>
                    {errors.dealName && <p className="text-red-400 text-sm mt-1">{String(errors.dealName?.message)}</p>}

                    {/* Inline add-new field shown when user selects + Add new deal */}
                    {watch('dealName') === '__add_new' && (
                      <div className="mt-3 flex gap-2">
                        <input
                          {...register('newDealName')}
                          placeholder="Enter new deal name"
                          className="flex-1 p-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none"
                        />
                        <Button type="button" onClick={() => {
                          const name = (getValues('newDealName') || '').trim();
                          if (!name) return;
                          addDeal(name);
                          setValue('dealName', name);
                          // clear newDealName so next time user can add another
                          setValue('newDealName', '');
                        }}>
                          Add
                        </Button>
                      </div>
                    )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="issuer" className="text-sm font-medium text-foreground">Issuer</label>
                  <select
                    {...register('issuer', { required: 'Issuer is required' })}
                    id="issuer"
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">Select Issuer</option>
                    {(issuerOptions || issuers).map((i: any) => <option key={i} value={i}>{i}</option>)}
                    <option value="__add_new_issuer">+ Add new issuer</option>
                  </select>
                  {errors.issuer && <p className="text-red-400 text-sm mt-1">{String(errors.issuer?.message)}</p>}
                  {watch('issuer') === '__add_new_issuer' && (
                    <div className="mt-3 flex gap-2">
                      <input
                        {...register('newIssuerName')}
                        placeholder="Enter new issuer"
                        className="flex-1 p-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none"
                      />
                      <Button type="button" onClick={() => {
                        const name = (getValues('newIssuerName') || '').trim();
                        if (!name) return;
                        addIssuer(name);
                        setValue('issuer', name);
                        setValue('newIssuerName', '');
                      }}>
                        Add
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="currency" className="text-sm font-medium text-foreground">Currency</label>
                  <select
                    {...register('currency')}
                    id="currency"
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">Select Currency</option>
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="countryOfRisk" className="text-sm font-medium text-foreground">Country Of Risk</label>
                  <select
                    {...register('countryOfRisk')}
                    id="countryOfRisk"
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">Select Country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="collateralDescription" className="text-sm font-medium text-foreground">Collateral Description</label>
                  <textarea
                    {...register('collateralDescription')}
                    id="collateralDescription"
                    placeholder="Enter collateral description"
                    rows={2}
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contractDate" className="text-sm font-medium text-foreground">Contract Date</label>
                  <input
                    type="date"
                    {...register('contractDate')}
                    id="contractDate"
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="dealOwner1" className="text-sm font-medium text-foreground">Deal Owner 1</label>
                  <input
                    {...register('dealOwner1')}
                    id="dealOwner1"
                    placeholder="Deal Owner"
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="sponsor" className="text-sm font-medium text-foreground">Sponsor</label>
                  <select
                    {...register('sponsor')}
                    id="sponsor"
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    {(sponsorOptions || ['LGIM','Other']).map((s: any) => <option key={s} value={s}>{s}</option>)}
                    <option value="__add_new_sponsor">+ Add new sponsor</option>
                  </select>
                  {watch('sponsor') === '__add_new_sponsor' && (
                    <div className="mt-3 flex gap-2">
                      <input
                        {...register('newSponsorName')}
                        placeholder="Enter new sponsor"
                        className="flex-1 p-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none"
                      />
                      <Button type="button" onClick={() => {
                        const name = (getValues('newSponsorName') || '').trim();
                        if (!name) return;
                        addSponsor(name);
                        setValue('sponsor', name);
                        setValue('newSponsorName', '');
                      }}>
                        Add
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="dealOwner3" className="text-sm font-medium text-foreground">Deal Owner 3</label>
                  <select
                    {...register('dealOwner3')}
                    id="dealOwner3"
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">Select</option>
                    {(dealOwner3Options || ['OwnerA','OwnerB']).map((o: any) => <option key={o} value={o}>{o}</option>)}
                    <option value="__add_new_owner3">+ Add new owner</option>
                  </select>
                  {watch('dealOwner3') === '__add_new_owner3' && (
                    <div className="mt-3 flex gap-2">
                      <input
                        {...register('newOwner3Name')}
                        placeholder="Enter new owner"
                        className="flex-1 p-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none"
                      />
                      <Button type="button" onClick={() => {
                        const name = (getValues('newOwner3Name') || '').trim();
                        if (!name) return;
                        addDealOwner3(name);
                        setValue('dealOwner3', name);
                        setValue('newOwner3Name', '');
                      }}>
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Additional Detail</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input {...register('status')} type="radio" value="On Bordered" name="status" className="mr-2" defaultChecked />
                        <span className="text-foreground-secondary">On Bordered</span>
                      </label>
                      <label className="flex items-center">
                        <input {...register('status')} type="radio" value="UND" name="status" className="mr-2" />
                        <span className="text-foreground-secondary">UND</span>
                      </label>
                    </div>

                    {watch('status') === 'On Bordered' && (
                      <div className="mt-2">
                        <label htmlFor="boardedFlag" className="text-xs text-foreground-secondary">Boarded?</label>
                        <select
                          {...register('boardedFlag')}
                          id="boardedFlag"
                          defaultValue="No"
                          className="w-full mt-1 p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="dealType" className="text-sm font-medium text-foreground">Deal Type</label>
                    <select
                      {...register('dealType')}
                      id="dealType"
                      className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    >
                      <option value="">Select Deal Type</option>
                      {(dealTypeOptions || ['type1','type2']).map((dt: any) => <option key={dt} value={dt}>{dt}</option>)}
                      <option value="__add_new_dealtype">+ Add new deal type</option>
                    </select>
                    {watch('dealType') === '__add_new_dealtype' && (
                      <div className="mt-3 flex gap-2">
                        <input
                          {...register('newDealTypeName')}
                          placeholder="Enter new deal type"
                          className="flex-1 p-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none"
                        />
                        <Button type="button" onClick={() => {
                          const name = (getValues('newDealTypeName') || '').trim();
                          if (!name) return;
                          addDealType(name);
                          setValue('dealType', name);
                          setValue('newDealTypeName', '');
                        }}>
                          Add
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="onboardingDate" className="text-sm font-medium text-foreground">Onboarding Date</label>
                    <input
                      {...register('onboardingDate')}
                      id="onboardingDate"
                      type="date"
                      className="w-full p-3 rounded-xl bg-background border border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="realisationDate" className="text-sm font-medium text-foreground">Realisation Date</label>
                    <input
                      {...register('realisationDate')}
                      id="realisationDate"
                      type="date"
                      className="w-full p-3 rounded-xl bg-background border border-border text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  SAVE
                </Button>
              </div>
            </form>
            </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function ManageTransactionModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div 
  className="bg-background-secondary border border-border rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Card className="bg-transparent border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-2xl">Manage Transaction</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <form className="space-y-6 min-w-[58.333rem]">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="dealName" className="text-sm font-medium text-foreground">Deal Name</label>
                  <select
                    id="dealName"
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">Select Deal Name</option>
                    {dealNames.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="issuer" className="text-sm font-medium text-foreground">Issuer</label>
                  <select 
                    id="issuer"
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">Select Issuer</option>
                    {issuers.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              
              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="currency" className="text-sm font-medium text-foreground">Currency</label>
                  <select
                    id="currency"
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">Select Currency</option>
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="countryOfRisk" className="text-sm font-medium text-foreground">Country Of Risk</label>
                  <select 
                    id="countryOfRisk"
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">Select Country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              {/* Third Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="collateralDescription" className="text-sm font-medium text-foreground">Collateral Description</label>
                  <input
                    id="collateralDescription"
                    type="text"
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Enter collateral description"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contractDate" className="text-sm font-medium text-foreground">Contract Date</label>
                  <input
                    id="contractDate"
                    type="date"
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground"
                  />
                </div>
              </div>
              
              {/* Additional Details Section */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="status" value="on-bordered" className="mr-2" defaultChecked />
                        <span className="text-foreground-secondary">On Bordered</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="status" value="und" className="mr-2" />
                        <span className="text-foreground-secondary">UND</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dealType" className="text-sm font-medium text-foreground">Deal Type</label>
                    <select 
                      id="dealType"
                      className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    >
                      <option value="">Select Deal Type</option>
                      <option value="type1">Type 1</option>
                      <option value="type2">Type 2</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium text-foreground">Amount</label>
                    <input
                      id="amount"
                      type="number"
                      className="w-full p-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <label htmlFor="onboardingDate" className="text-sm font-medium text-foreground">Onboarding Date</label>
                    <select 
                      id="onboardingDate"
                      className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    >
                      <option value="">Select Date</option>
                      <option value="2024-01-01">2024-01-01</option>
                      <option value="2024-02-01">2024-02-01</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="realisationDate" className="text-sm font-medium text-foreground">Realisation Date</label>
                    <input
                      id="realisationDate"
                      type="date"
                      className="w-full p-3 rounded-xl bg-background border border-border text-foreground"
                    />
                  </div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

const TransactionsPage = () => {
  const { transactions, addTransaction, updateTransaction } = useSupabaseData();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ deal: '', issuer: '', currency: '', countryOfRisk: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  // local, stateful deal names so user can add new deals from the modal
  const [localDealNames, setLocalDealNames] = useState(dealNames);
  const [localIssuers, setLocalIssuers] = useState(issuers);
  const [localSponsors, setLocalSponsors] = useState(['LGIM','Other']);
  const [localDealOwner3, setLocalDealOwner3] = useState(['OwnerA','OwnerB']);
  const [localDealTypes, setLocalDealTypes] = useState(['type1','type2']);
  const navigate = useNavigate();
  
  const startEdit = (idx: number, t: any) => {
    setEditingIndex(idx);
    setEditingRow({ ...t });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingRow(null);
  };

  const saveEdit = async (original: any) => {
    if (!editingRow) return;
    try {
      await updateTransaction(original.id, {
        deal: editingRow.deal,
        issuer: editingRow.issuer,
        currency: editingRow.currency,
        countryOfRisk: editingRow.countryOfRisk,
        collateralDescription: editingRow.collateralDescription,
        contractDate: editingRow.contractDate,
        assetManager: editingRow.assetManager,
        assetManagerName: editingRow.assetManagerName,
        amount: editingRow.amount,
        status: editingRow.status,
      });
      setEditingIndex(null);
      setEditingRow(null);
    } catch (e) {
      // no-op, context handles error state
    }
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = !searchTerm || 
      t.deal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.countryOfRisk.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = (
      (!filters.deal || t.deal === filters.deal) &&
      (!filters.issuer || t.issuer === filters.issuer) &&
      (!filters.currency || t.currency === filters.currency) &&
      (!filters.countryOfRisk || t.countryOfRisk === filters.countryOfRisk)
    );
    
    return matchesSearch && matchesFilters;
  });

  const handleAddTransaction = (data) => {
    // Validate and format dates
    const contractDate = data.contractDate && data.contractDate.trim() !== '' 
      ? data.contractDate 
      : new Date().toISOString().split('T')[0]; // Default to today if empty
    
    addTransaction({
      deal: data.dealName || '',
      issuer: data.issuer || '',
      currency: data.currency || '',
      countryOfRisk: data.countryOfRisk || '',
      collateralDescription: data.collateralDescription || '',
      contractDate: contractDate,
      assetManager: 'New Manager',
      assetManagerName: 'New Manager Name',
      amount: data.amount || '',
      status: 'Pending'
    });
  };

  // ...existing code... (status color helper removed since status column is no longer rendered)

  // Filter modal component
  const FilterModal: React.FC<{ isOpen: boolean; onClose: () => void; filters: any; setFilters: React.Dispatch<any>; }> = ({ isOpen, onClose, filters, setFilters }) => {
    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFilters((prev: any) => ({ ...prev, [name]: value }));
    };

    const clearAll = () => {
      setFilters({ deal: '', issuer: '', currency: '', countryOfRisk: '' });
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <motion.div 
          className="bg-background-secondary border border-border rounded-xl shadow-2xl w-[50rem] max-w-full mx-auto p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Filter Transactions</h2>
            <button onClick={onClose} aria-label="Close filter modal" className="text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form className="space-y-4">
            <div>
              <label htmlFor="deal" className="block text-sm font-medium text-foreground mb-1">Deal</label>
              <select
                id="deal"
                name="deal"
                value={filters.deal}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">All Deals</option>
                {dealNames.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="issuer" className="block text-sm font-medium text-foreground mb-1">Issuer</label>
              <select
                id="issuer"
                name="issuer"
                value={filters.issuer}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">All Issuers</option>
                {issuers.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-foreground mb-1">Currency</label>
              <select
                id="currency"
                name="currency"
                value={filters.currency}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">All Currencies</option>
                {currencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="countryOfRisk" className="block text-sm font-medium text-foreground mb-1">Country of Risk</label>
              <select
                id="countryOfRisk"
                name="countryOfRisk"
                value={filters.countryOfRisk}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">All Countries</option>
                {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-between mt-6">
              <button type="button" onClick={clearAll} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-background-tertiary transition">Clear All</button>
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80 transition">Apply Filters</button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Consistent Header */}
      <motion.header 
        className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-3"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to="/main" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
          <div className="size-6">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-foreground">
              <g clipPath="url(#clip0_6_535)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0_6_535">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">AltMonitor</h1>
            <p className="text-foreground-secondary text-xs uppercase tracking-wide">Investment Dashboard</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/main" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Receipt className="w-6 h-6 text-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900">All Transactions</h1>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">{filteredTransactions.length}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </Button>
              <Button
                onClick={() => setFilterOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <Input 
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 text-gray-600"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <Card className="bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Deal</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Issuer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Currency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Country of Risk</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Collateral Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contract Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Asset Manager</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Asset Manager Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {editingIndex === idx ? (
                          <input className="w-full border px-2 py-1 rounded" value={editingRow?.deal || ''} onChange={e => setEditingRow({ ...editingRow, deal: e.target.value })} />
                        ) : (
                          <button
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                            onClick={() => navigate(`/investments/${encodeURIComponent(t.deal)}`)}
                          >
                            {t.deal}
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {editingIndex === idx ? (
                          <input className="w-full border px-2 py-1 rounded" value={editingRow?.issuer || ''} onChange={e => setEditingRow({ ...editingRow, issuer: e.target.value })} />
                        ) : t.issuer}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {editingIndex === idx ? (
                          <input className="w-full border px-2 py-1 rounded" value={editingRow?.currency || ''} onChange={e => setEditingRow({ ...editingRow, currency: e.target.value })} />
                        ) : t.currency}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {editingIndex === idx ? (
                          <input className="w-full border px-2 py-1 rounded" value={editingRow?.countryOfRisk || ''} onChange={e => setEditingRow({ ...editingRow, countryOfRisk: e.target.value })} />
                        ) : t.countryOfRisk}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {editingIndex === idx ? (
                          <input className="w-full border px-2 py-1 rounded" value={editingRow?.collateralDescription || ''} onChange={e => setEditingRow({ ...editingRow, collateralDescription: e.target.value })} />
                        ) : t.collateralDescription}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {editingIndex === idx ? (
                          <input type="date" className="w-full border px-2 py-1 rounded" value={editingRow?.contractDate || ''} onChange={e => setEditingRow({ ...editingRow, contractDate: e.target.value })} />
                        ) : t.contractDate}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {editingIndex === idx ? (
                          <input className="w-full border px-2 py-1 rounded" value={editingRow?.assetManager || ''} onChange={e => setEditingRow({ ...editingRow, assetManager: e.target.value })} />
                        ) : t.assetManager}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {editingIndex === idx ? (
                          <div className="flex items-center gap-2">
                            <input className="flex-1 border px-2 py-1 rounded" value={editingRow?.assetManagerName || ''} onChange={e => setEditingRow({ ...editingRow, assetManagerName: e.target.value })} />
                            <button className="px-2 py-1 bg-green-600 text-white rounded text-xs" onClick={() => saveEdit(t)}>Save</button>
                            <button className="px-2 py-1 bg-gray-400 text-white rounded text-xs" onClick={cancelEdit}>Cancel</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{t.assetManagerName}</span>
                            <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs" onClick={() => startEdit(idx, t)}>Edit</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-6 text-center text-gray-500">
                        No transactions found. Try adjusting your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
      </div>
        
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddTransaction}
        dealNames={localDealNames}
        addDeal={(name: string) => setLocalDealNames(prev => prev.includes(name) ? prev : [...prev, name])}
        issuerOptions={localIssuers}
        addIssuer={(name: string) => setLocalIssuers(prev => prev.includes(name) ? prev : [...prev, name])}
        sponsorOptions={localSponsors}
        addSponsor={(name: string) => setLocalSponsors(prev => prev.includes(name) ? prev : [...prev, name])}
        dealOwner3Options={localDealOwner3}
        addDealOwner3={(name: string) => setLocalDealOwner3(prev => prev.includes(name) ? prev : [...prev, name])}
        dealTypeOptions={localDealTypes}
        addDealType={(name: string) => setLocalDealTypes(prev => prev.includes(name) ? prev : [...prev, name])}
      />
      
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setFilterOpen(false)} 
        filters={filters} 
        setFilters={setFilters} 
      />
    </div>
  );
};

export default TransactionsPage;
