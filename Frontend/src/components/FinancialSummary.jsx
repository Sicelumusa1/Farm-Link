import React, { useState, useEffect, useContext } from 'react';
import * as financialService from '../services/financialService';
import { ThemeContext } from '../contexts/ThemeContext';
import '../styles/FinancialSummary.css';
import TimeframeSelector from './Finance/TimeframeSelector';
import SummaryCards from './Finance/SummaryCards';
import IncomeExpenseChart from './Finance/IncomeExpenseChart';
import ExpenseCategoryChart from './Finance/ExpenseCategoryChart';
import CropPerformanceTable from './Finance/CropPerformanceTable';
import GrowthStageTracker from './Finance/GrowthStageTracker';
import InsightPanel from './Finance/InsightPanel';

const FinancialSummary = () => {
  const { theme } = useContext(ThemeContext);
  const [summary, setSummary] = useState(null);
  const [timeframe, setTimeframe] = useState('this-month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSummary();
  }, [timeframe]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await financialService.getFinancialSummary(timeframe);
      const summaryData = response.data || response;
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className={`financial-summary loading ${theme}`}>
        Loading financial summary...
      </div>
    );

  if (error)
    return (
      <div className={`financial-summary error ${theme}`}>
        <h3>{error}</h3>
        <button onClick={loadSummary}>Retry</button>
      </div>
    );

  if (!summary)
    return (
      <div className={`financial-summary empty ${theme}`}>
        <h3>No Financial Data</h3>
        <p>Record transactions to view your financial dashboard.</p>
      </div>
    );

  const {
    totalIncome = 0,
    totalExpenses = 0,
    netProfit = 0,
    cropBreakdown = [],
    categoryBreakdown = [],
    growthStages = [],
    insights = [],
  } = summary;

  return (
    <div className={`financial-summary ${theme}`}>
      <TimeframeSelector timeframe={timeframe} onChange={setTimeframe} />

      <SummaryCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
      />

      <div className="charts-section">
        <IncomeExpenseChart summary={summary} />
        <ExpenseCategoryChart categoryData={categoryBreakdown} />
      </div>

      <CropPerformanceTable crops={cropBreakdown} />

      <GrowthStageTracker stages={growthStages} />

      <InsightPanel insights={insights} />
    </div>
  );
};

export default FinancialSummary;