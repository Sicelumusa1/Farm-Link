import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faTractor, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import '../../styles/SummaryCards.css';

const SummaryCards = ({ totalIncome, totalExpenses, netProfit }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`summary-cards ${theme}`}>
      <div className="summary-card income-card">
        <FontAwesomeIcon icon={faMoneyBillWave} />
        <div className="summary-card-content">
          <h3>Money In</h3>
          <div className="amount">R{totalIncome.toFixed(2)}</div>
        </div>
      </div>

      <div className="summary-card expense-card">
        <FontAwesomeIcon icon={faTractor} />
        <div className="summary-card-content">
          <h3>Money Out</h3>
          <div className="amount">R{totalExpenses.toFixed(2)}</div>
        </div>
      </div>

      <div className="summary-card net-card">
        <FontAwesomeIcon icon={netProfit >= 0 ? faArrowUp : faArrowDown} />
        <div className="summary-card-content">
          <h3>Net Profit</h3>
          <div className={`amount ${netProfit >= 0 ? 'positive' : 'negative'}`}>
            R{Math.abs(netProfit).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;