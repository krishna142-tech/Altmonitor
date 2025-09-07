import React, { useState } from 'react';
import { useSupabaseData } from '@/context/SupabaseDataContext';
import { testSupabaseConnection, testFacilityCreation, testDatabaseSchema } from '@/lib/testSupabase';
import { migrateDatabase, testFacilityCreationWithoutTransaction } from '@/lib/migrateDatabase';

const FacilityDebug = ({ currentInvestmentName }: { currentInvestmentName: string }) => {
  const { facilities, addFacility, addTransaction, transactions, loading, error } = useSupabaseData();
  const [testResult, setTestResult] = useState('');
  
  // Filter facilities for current investment
  const filteredFacilities = facilities.filter(f => {
    const facilityInvestmentName = (f.investmentName || '').toString().trim();
    const currentName = currentInvestmentName.toString().trim();
    
    // Primary filter: match by investment name
    const matchesInvestmentName = facilityInvestmentName === currentName;
    
    return matchesInvestmentName;
  });

  const testFacilityCreation = async () => {
    try {
      setTestResult('Creating test facility...');
      
      // First, create or find a transaction
      let existingTransaction = transactions.find(t => 
        t.deal === currentInvestmentName || 
        t.issuer === currentInvestmentName
      );
      
      let transactionId;
      
      if (existingTransaction) {
        transactionId = existingTransaction.id;
      } else {
        // Create a new transaction
        const newTransaction = await addTransaction({
          deal: currentInvestmentName,
          issuer: currentInvestmentName,
          currency: 'USD',
          countryOfRisk: 'USA',
          collateralDescription: 'Test facility transaction',
          contractDate: new Date().toISOString().split('T')[0],
          assetManager: 'Test Manager',
          assetManagerName: 'Test Manager Name',
          amount: '0',
          status: 'Active',
          transactionType: 'investment',
          notes: `Test transaction for: ${currentInvestmentName}`
        });
        transactionId = newTransaction.id;
      }
      
      const testFacility = {
        transactionId: transactionId,
        investmentName: currentInvestmentName,
        facilityType: 'Debt',
        paymentRank: 'Senior Secured',
        seniority: 'First Lien',
        currency: 'USD',
        fromDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        investmentType: 'Debt',
        hasTranche: 'No',
        isin: 'TEST123456789',
        cusip: 'TEST123',
        bbgId: 'TEST_BBG_123',
        fisn: 'TEST_FISN_123',
        internalDealId: 'INT_123',
        loanReferenceNumber: 'LOAN_123',
        fundId: 'FUND_123',
        covenantId: 'COV_123',
        assetClassification: 'Loan',
        assetTag: 'TAG_123',
        sector: 'Technology',
        subSector: 'Software',
        instrumentType: 'Note',
        countryOfRisk: 'United States of America',
      };

      await addFacility(testFacility);
      setTestResult('✅ Test facility created successfully!');
    } catch (err) {
      setTestResult(`❌ Error creating test facility: ${err}`);
      console.error('Test facility creation error:', err);
    }
  };

  const testFacilityRetrieval = () => {
    setTestResult(`📊 Total facilities: ${facilities.length}, Filtered: ${filteredFacilities.length}`);
    console.log('All facilities:', facilities);
    console.log('Filtered facilities:', filteredFacilities);
  };

  const createTestFacilityForCurrentInvestment = async () => {
    try {
      setTestResult(`Creating test facility for: ${currentInvestmentName}`);
      
      // First, create or find a transaction
      let existingTransaction = transactions.find(t => 
        t.deal === currentInvestmentName || 
        t.issuer === currentInvestmentName
      );
      
      let transactionId;
      
      if (existingTransaction) {
        transactionId = existingTransaction.id;
      } else {
        // Create a new transaction
        const newTransaction = await addTransaction({
          deal: currentInvestmentName,
          issuer: currentInvestmentName,
          currency: 'USD',
          countryOfRisk: 'USA',
          collateralDescription: 'Test facility transaction',
          contractDate: new Date().toISOString().split('T')[0],
          assetManager: 'Test Manager',
          assetManagerName: 'Test Manager Name',
          amount: '0',
          status: 'Active',
          transactionType: 'investment',
          notes: `Test transaction for: ${currentInvestmentName}`
        });
        transactionId = newTransaction.id;
      }
      
      const testFacility = {
        transactionId: transactionId,
        investmentName: currentInvestmentName,
        facilityType: 'Test Facility',
        paymentRank: 'Senior Secured',
        seniority: 'First Lien',
        currency: 'USD',
        fromDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        investmentType: 'Debt',
        hasTranche: 'No',
        isin: 'TEST123456789',
        cusip: 'TEST123',
        bbgId: 'TEST_BBG_123',
        fisn: 'TEST_FISN_123',
        internalDealId: 'INT_123',
        loanReferenceNumber: 'LOAN_123',
        fundId: 'FUND_123',
        covenantId: 'COV_123',
        assetClassification: 'Loan',
        assetTag: 'TAG_123',
        sector: 'Technology',
        subSector: 'Software',
        instrumentType: 'Note',
        countryOfRisk: 'United States of America',
      };

      await addFacility(testFacility);
      setTestResult(`✅ Test facility created for ${currentInvestmentName}!`);
    } catch (err) {
      setTestResult(`❌ Error creating test facility: ${err}`);
      console.error('Test facility creation error:', err);
    }
  };

  const testDirectSupabase = async () => {
    try {
      setTestResult('Testing direct Supabase connection...');
      const result = await testSupabaseConnection();
      setTestResult(`Direct Supabase test: ${result.success ? '✅ Success' : '❌ Failed - ' + result.error}`);
    } catch (err) {
      setTestResult(`❌ Direct Supabase test error: ${err}`);
    }
  };

  const testDirectFacilityCreation = async () => {
    try {
      setTestResult('Testing direct facility creation...');
      const result = await testFacilityCreation();
      setTestResult(`Direct facility creation: ${result.success ? '✅ Success' : '❌ Failed - ' + result.error}`);
    } catch (err) {
      setTestResult(`❌ Direct facility creation error: ${err}`);
    }
  };

  const testDatabaseSchema = async () => {
    try {
      setTestResult('Testing database schema...');
      const result = await testDatabaseSchema();
      setTestResult(`Database schema test: ${result.success ? '✅ Success' : '❌ Failed - ' + result.error}`);
    } catch (err) {
      setTestResult(`❌ Database schema test error: ${err}`);
    }
  };

  const runMigration = async () => {
    try {
      setTestResult('Running database migration...');
      const result = await migrateDatabase();
      setTestResult(`Migration: ${result.success ? '✅ Success' : '❌ Failed - ' + result.error}${result.sql ? '\n\nSQL to run:\n' + result.sql : ''}`);
    } catch (err) {
      setTestResult(`❌ Migration error: ${err}`);
    }
  };

  const testFacilityWithoutTransaction = async () => {
    try {
      setTestResult('Testing facility creation without transaction...');
      const result = await testFacilityCreationWithoutTransaction();
      setTestResult(`Test without transaction: ${result.success ? '✅ Success' : '❌ Failed - ' + result.error}`);
    } catch (err) {
      setTestResult(`❌ Test error: ${err}`);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Facility Debug Panel</h3>
      
      <div className="space-y-4">
        <div>
          <p><strong>Total Facilities:</strong> {facilities.length}</p>
          <p><strong>Current Investment:</strong> {currentInvestmentName}</p>
          <p><strong>Filtered Facilities:</strong> {filteredFacilities.length}</p>
        </div>
        
        <div className="space-x-2 space-y-2">
          <button
            onClick={testFacilityCreation}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Create Facility (Context)
          </button>
          <button
            onClick={testFacilityRetrieval}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Retrieve Facilities
          </button>
          <button
            onClick={testDirectSupabase}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test Direct Supabase
          </button>
          <button
            onClick={testDirectFacilityCreation}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Test Direct Facility Creation
          </button>
          <button
            onClick={createTestFacilityForCurrentInvestment}
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
          >
            Create Test Facility for Current Investment
          </button>
          <button
            onClick={testDatabaseSchema}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Test Database Schema
          </button>
          <button
            onClick={runMigration}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Run Migration
          </button>
          <button
            onClick={testFacilityWithoutTransaction}
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            Test Facility Without Transaction
          </button>
        </div>
        
        {testResult && (
          <div className="p-3 bg-white rounded border">
            <pre>{testResult}</pre>
          </div>
        )}
        
        <div>
          <h4 className="font-semibold">All Facilities:</h4>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
            {JSON.stringify(facilities, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-semibold">Filtered Facilities for Current Investment:</h4>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
            {JSON.stringify(filteredFacilities, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FacilityDebug;