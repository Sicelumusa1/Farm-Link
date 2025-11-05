import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import QuickAddTransaction from './QuickAddTransaction';
import TransactionHistory from './TransactionHistory';
import * as farmerService from '../services/farmerService';
import * as produceService from '../services/ProduceService';
import '../styles/Members.css';

export default function FinancialDashboard() {
  const [selected, setSelected] = useState('quick-add');
  const { theme } = useContext(ThemeContext);
  const [crops, setCrops] = useState([]);
  const [currentFarm, setCurrentFarm] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFarmAndCropsData();
  }, []);

  const loadFarmAndCropsData = async () => {
    try {
      setIsLoading(true);
      const farmData = await farmerService.allFarmerDatails();
      const cropsData = await produceService.getCrops();
      
      setCurrentFarm(farmData.data || farmData);
      setCrops(cropsData.data || cropsData || []); 
    } catch (error) {
      console.error('Error loading farm and crops data:', error);
      setCrops([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionAdded = () => {
    setRefreshTrigger(prev => !prev);
    loadFarmAndCropsData();
  };

  if (isLoading) {
    return (
      <div className={`members-container ${theme}`}>
        <div className="loading">Loading farm data...</div>
      </div>
    );
  }

  return (
    <div className={`members-container ${theme}`}>
      <div className={`members-wrapper ${theme}`}>
        <div className={`members-title ${theme}`}>
          <h1 className={`members-title-title ${theme}`}>Farm Finances</h1>
          <p className="members-subtitle">
            Track money in and out for {currentFarm?.name || 'your farm'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`members-nav-container ${theme}`}>
          <div
            className={
              selected === 'quick-add'
                ? `recent-container2 ${theme}`
                : `recent-container ${theme}`
            }
            onClick={() => setSelected('quick-add')}
          >
            <p className={`members-recent-title ${theme}`}>Quick Add</p>
          </div>

          <div
            className={
              selected === 'history'
                ? `application-container2 ${theme}`
                : `application-container ${theme}`
            }
            onClick={() => setSelected('history')}
          >
            <p className={`members-application-title ${theme}`}>Transaction History</p>
          </div>
        </div>

        {/* Content */}
        {selected === 'quick-add' && (
          <QuickAddTransaction 
            crops={crops}
            onTransactionAdded={handleTransactionAdded} 
          />
        )}

        {selected === 'history' && (
          <TransactionHistory key={refreshTrigger} />
        )}
      </div>
    </div>
  );
}
