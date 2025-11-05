import React, { useState, useEffect } from 'react';
import TimeframeSelector from './Production/TimeframeSelector';
import SummaryCards from './Production/SummaryCards';
import CropGrowthStageChart from './Production/CropGrowthStageChart';
import CropYieldChart from './Production/CropYieldChart';
import FarmProductivityChart from './Production/FarmProductivityChart';
import RecentProductionTable from './Production/RecentProductionTable';
import ProductionInsightPanel from './Production/ProductionInsightPanel';
import './Production/index.css';

const ProductionDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('this-month');

  useEffect(() => {
    // Simulate API call with mock data
    setLoading(true);
    setTimeout(() => {
      setSummary({
        totalCrops: 25,
        harvestedCrops: 8,
        activeCrops: 17,
        averageYield: 1250.5,
        totalYield: 10200,
        cropsByStage: [
          { stage: "Seedling", count: 5 },
          { stage: "Vegetative", count: 6 },
          { stage: "Flowering", count: 3 },
          { stage: "Harvested", count: 8 }
        ],
        yieldByCrop: [
          { cropName: "Spinach", yield: 2500 },
          { cropName: "Maize", yield: 1800 },
          { cropName: "Butternut", yield: 3500 },
        ],
        productivityByFarm: [
          { farmName: "Green Valley", totalYield: 4200 },
          { farmName: "Sunrise Farm", totalYield: 2800 },
          { farmName: "Riverbend", totalYield: 3200 }
        ],
        recentProduction: [
          { cropName: "Spinach", type: "Organic", growthStage: "Harvested", yield: 300 },
          { cropName: "Tomato", type: "Hybrid", growthStage: "Flowering", yield: null },
          { cropName: "Cabbage", type: "Organic", growthStage: "Vegetative", yield: null },
        ],
        insights: [
          "Spinach performed 15% above average yield this season.",
          "3 crops are near harvesting stage — monitor closely.",
          "Sunrise Farm yield improved 12% compared to last month."
        ]
      });
      setLoading(false);
    }, 1000);
  }, [timeframe]);

  if (loading) return <div className="loading">Loading production data...</div>;

  if (!summary)
    return <div className="empty">No production data available</div>;

  return (
    <div className="production-dashboard">
      <TimeframeSelector timeframe={timeframe} onChange={setTimeframe} />
      <SummaryCards summary={summary} />

      <div className="charts-grid">
        <CropGrowthStageChart data={summary.cropsByStage} />
        <CropYieldChart data={summary.yieldByCrop} />
        <FarmProductivityChart data={summary.productivityByFarm} />
      </div>

      <RecentProductionTable data={summary.recentProduction} />
      <ProductionInsightPanel insights={summary.insights} />
    </div>
  );
};

export default ProductionDashboard;
