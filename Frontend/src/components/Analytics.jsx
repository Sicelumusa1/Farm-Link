import { useContext, useState } from 'react';
import '../styles/Members.css';
import FinancialSummary from './FinancialSummary';
import ProductionSummary from './ProductionSummary';
import { ThemeContext } from '../contexts/ThemeContext';

export default function Analytics() {
  const [selected, setSelected] = useState('financial');
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`members-container ${theme}`}>
      <div className={`members-wrapper ${theme}`}>
        {/* Title */}
        <div className={`members-title ${theme}`}>
          <h1 className={`members-title-title ${theme}`}>Analytics Dashboard</h1>
        </div>

        {/* Navigation Tabs */}
        <div className={`members-nav-container ${theme}`}>
          <div
            className={
              selected === 'financial'
                ? `recent-container2 ${theme}`
                : `recent-container ${theme}`
            }
            onClick={() => setSelected('financial')}
          >
            <p className={`members-recent-title ${theme}`}>Financial Summary</p>
          </div>

          <div
            className={
              selected === 'production'
                ? `application-container2 ${theme}`
                : `application-container ${theme}`
            }
            onClick={() => setSelected('production')}
          >
            <p className={`members-application-title ${theme}`}>Production Summary</p>
          </div>
        </div>

        {/* Render Analytics Content */}
        {selected === 'financial' && <FinancialSummary />}
        {selected === 'production' && <ProductionSummary />}
      </div>
    </div>
  );
}
