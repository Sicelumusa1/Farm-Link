import React, { useState, useEffect, useContext } from 'react';
import * as financialService from '../services/financialService';
import '../styles/TransactionHistory.css';
import { ThemeContext } from '../contexts/ThemeContext';

const TransactionHistory = () => {
  const { theme } = useContext(ThemeContext);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    crop_id: '',
    start_date: '',
    end_date: '',
    category: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await financialService.getTransactions(filters);
      const transactionsData = response.data?.transactions || response.transactions || [];
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError(error.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      crop_id: '',
      start_date: '',
      end_date: '',
      category: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getTypeDisplay = (type) => {
    return type === 'income' ? 'Income' : 'Expense';
  };

  const getTypeClass = (type) => {
    return type === 'income' ? 'type-income' : 'type-expense';
  };

  if (loading) {
    return (
      <div className={`transaction-history ${theme}`}>
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`transaction-history ${theme}`}>
        <div className="error-state">
          <h3>Unable to Load Transactions</h3>
          <p>{error}</p>
          <button onClick={loadTransactions} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`transaction-history ${theme}`}>
      <div className="transaction-header">
        <h5>View and manage all your financial transactions</h5>
      </div>

      {/* Filters */}
      <div className="transaction-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Type</label>
            <select 
              value={filters.type} 
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select 
              value={filters.category} 
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Seeds">Seeds</option>
              <option value="Fertilizers">Fertilizers</option>
              <option value="Pesticides">Pesticides</option>
              <option value="Irrigation">Irrigation</option>
              <option value="Labor - Planting">Labor - Planting</option>
              <option value="Labor - Harvesting">Labor - Harvesting</option>
              <option value="Fuel">Fuel</option>
              <option value="Equipment Repair">Equipment Repair</option>
              <option value="Crop Sales">Crop Sales</option>
              <option value="Order Payment">Order Payment</option>
              <option value="Government Subsidies">Government Subsidies</option>
            </select>
          </div>

          <div className="filter-group">
            <label>From Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>To Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {transactions.length > 0 ? (
        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Crop</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.ID || transaction.id}>
                  <td>{formatDate(transaction.TRANSACTION_DATE || transaction.transaction_date)}</td>
                  <td>
                    <span className={getTypeClass(transaction.TYPE || transaction.type)}>
                      {getTypeDisplay(transaction.TYPE || transaction.type)}
                    </span>
                  </td>
                  <td>{transaction.CATEGORY || transaction.category}</td>
                  <td className="description-cell">
                    {transaction.DESCRIPTION || transaction.description}
                  </td>
                  <td>
                    {transaction.CROP_NAME || transaction.crop_name || 'N/A'}
                  </td>
                  <td className="amount-cell">
                    {formatAmount(transaction.AMOUNT || transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="transaction-summary">
            <p>
              Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Transactions Found</h3>
          <p>
            {Object.values(filters).some(filter => filter !== '') 
              ? 'No transactions match your current filters. Try adjusting your search criteria.'
              : 'No transactions recorded yet. Start by adding your first transaction in the Quick Add tab.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;