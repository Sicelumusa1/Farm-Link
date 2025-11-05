// import React, { useState } from 'react';
// import * as financialService from '../services/financialService';
// import '../styles/Financial.css'

// const QuickAddTransaction = ({ crops, onTransactionAdded }) => {
//   const [formData, setFormData] = useState({
//     type: 'expense',
//     crop_id: '',
//     category: '',
//     amount: '',
//     description: '',
//     transaction_date: new Date().toISOString().split('T')[0]
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const commonExpenses = [
//     { label: '🌱 Seeds', value: 'Seeds' },
//     { label: '🧪 Fertilizers', value: 'Fertilizers' },
//     { label: '🐛 Pesticides', value: 'Pesticides' },
//     { label: '💧 Irrigation', value: 'Irrigation' },
//     { label: '👨‍🌾 Labor - Planting', value: 'Labor - Planting' },
//     { label: '👨‍🌾 Labor - Harvesting', value: 'Labor - Harvesting' },
//     { label: '⛽ Fuel', value: 'Fuel' },
//     { label: '🔧 Equipment Repair', value: 'Equipment Repair' },
//     { label: '🚜 Equipment Maintenance', value: 'Equipment Maintenance' },
//     { label: '🏠 Land Rent', value: 'Land Rent' },
//     { label: '📄 Insurance', value: 'Insurance' },
//     { label: '🚚 Transport', value: 'Transport' },
//     { label: '⚡ Utilities', value: 'Utilities' }
//   ];

//   const commonIncome = [
//     { label: '💰 Crop Sale', value: 'Crop Sales' },
//     { label: '📦 Order Payment', value: 'Order Payment' },
//     { label: '🏛️ Government Subsidies', value: 'Government Subsidies' },
//     { label: '🔧 Equipment Sales', value: 'Equipment Sales' },
//     { label: '🎁 Other Income', value: 'Other Income' }
//   ];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validation
//     if (!formData.amount || formData.amount <= 0) {
//       alert('Please enter a valid amount');
//       return;
//     }
    
//     if (!formData.category) {
//       alert('Please select a category');
//       return;
//     }
    
//     if (!formData.description.trim()) {
//       alert('Please enter a description');
//       return;
//     }

//     setIsSubmitting(true);
    
//     try {
//       await financialService.recordTransaction(formData);
      
//       // Reset form
//       setFormData({
//         type: 'expense',
//         crop_id: '',
//         category: '',
//         amount: '',
//         description: '',
//         transaction_date: new Date().toISOString().split('T')[0]
//       });
      
//       // Notify parent component
//       if (onTransactionAdded) {
//         onTransactionAdded();
//       }
      
//       // Show success message
//       alert('Transaction recorded successfully!');
      
//     } catch (error) {
//       console.error('Error recording transaction:', error);
//       alert(error.message || 'Error recording transaction. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // Helper to get crop display name
//   const getCropDisplayName = (crop) => {
//     // Handle different response formats from your API
//     if (crop.CROP_NAME) return crop.CROP_NAME;
//     if (crop.crop_name) return crop.crop_name;
//     if (crop.name) return crop.name;
//     return 'Unknown Crop';
//   };

//   // Helper to get crop ID
//   const getCropId = (crop) => {
//     // Handle different ID field names
//     return crop.ID || crop.id || crop.crop_id;
//   };

//   return (
//     <div className="quick-transaction-form">
//       <div className="transaction-header">
//         <h5>Record your transactions as they happen</h5>
//       </div>
//       <form onSubmit={handleSubmit}>
//         {/* Type Selection */}
//         <div className="type-selection">
//           <button
//             type="button"
//             className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
//             onClick={() => handleInputChange('type', 'expense')}
//           >
//             💸 Expense
//           </button>
//           <button
//             type="button"
//             className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
//             onClick={() => handleInputChange('type', 'income')}
//           >
//             💰 Income
//           </button>
//         </div>

//         {/* Amount Input */}
//         <div className="amount-input">
//           <label>Amount (R)</label>
//           <input
//             type="number"
//             step="0.01"
//             min="0.01"
//             placeholder="0.00"
//             value={formData.amount}
//             onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || '')}
//             required
//           />
//         </div>

//         {/* Crop Selection */}
//         <div className="crop-selection">
//           <label>Linked to Crop (Optional)</label>
//           <select 
//             value={formData.crop_id} 
//             onChange={(e) => handleInputChange('crop_id', e.target.value)}
//           >
//             <option value="">Select Crop (Optional)</option>
//             {crops.map(crop => (
//               <option key={getCropId(crop)} value={getCropId(crop)}>
//                 {getCropDisplayName(crop)}
//                 {crop.variety ? ` - ${crop.variety}` : ''}
//                 {crop.PRODUCE_YIELD ? ` (${crop.PRODUCE_YIELD} available)` : ''}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Quick Categories */}
//         <div className="quick-categories">
//           <label>Category *</label>
//           <div className="category-buttons">
//             {(formData.type === 'expense' ? commonExpenses : commonIncome).map(item => (
//               <button
//                 key={item.value}
//                 type="button"
//                 className={`category-btn ${formData.category === item.value ? 'active' : ''}`}
//                 onClick={() => handleInputChange('category', item.value)}
//               >
//                 {item.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Description */}
//         <div className="description-input">
//           <label>Description *</label>
//           <input
//             type="text"
//             placeholder="What was this for? e.g., Bought seeds for corn planting"
//             value={formData.description}
//             onChange={(e) => handleInputChange('description', e.target.value)}
//             required
//           />
//         </div>

//         {/* Date */}
//         <div className="date-input">
//           <label>Date *</label>
//           <input
//             type="date"
//             value={formData.transaction_date}
//             onChange={(e) => handleInputChange('transaction_date', e.target.value)}
//             required
//           />
//         </div>

//         <button 
//           type="submit" 
//           className="submit-btn"
//           disabled={isSubmitting || !formData.category || !formData.amount || !formData.description}
//         >
//           {isSubmitting ? 'Recording...' : 'Record Transaction'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default QuickAddTransaction;

import React, { useState, useContext } from 'react';
import * as financialService from '../services/financialService';
import { ThemeContext } from '../contexts/ThemeContext';
import '../styles/Financial.css';

const QuickAddTransaction = ({ crops, onTransactionAdded }) => {
  const { theme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    type: 'expense',
    crop_id: '',
    category: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commonExpenses = [
    { label: '🌱 Seeds', value: 'Seeds' },
    { label: '🧪 Fertilizers', value: 'Fertilizers' },
    { label: '🐛 Pesticides', value: 'Pesticides' },
    { label: '💧 Irrigation', value: 'Irrigation' },
    { label: '👨‍🌾 Labor - Planting', value: 'Labor - Planting' },
    { label: '👨‍🌾 Labor - Harvesting', value: 'Labor - Harvesting' },
    { label: '⛽ Fuel', value: 'Fuel' },
    { label: '🔧 Equipment Repair', value: 'Equipment Repair' },
    { label: '🚜 Equipment Maintenance', value: 'Equipment Maintenance' },
    { label: '🏠 Land Rent', value: 'Land Rent' },
    { label: '📄 Insurance', value: 'Insurance' },
    { label: '🚚 Transport', value: 'Transport' },
    { label: '⚡ Utilities', value: 'Utilities' }
  ];

  const commonIncome = [
    { label: '💰 Crop Sale', value: 'Crop Sales' },
    { label: '📦 Order Payment', value: 'Order Payment' },
    { label: '🏛️ Government Subsidies', value: 'Government Subsidies' },
    { label: '🔧 Equipment Sales', value: 'Equipment Sales' },
    { label: '🎁 Other Income', value: 'Other Income' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || formData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await financialService.recordTransaction(formData);
      
      // Reset form
      setFormData({
        type: 'expense',
        crop_id: '',
        category: '',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      
      // Notify parent component
      if (onTransactionAdded) {
        onTransactionAdded();
      }
      
      // Show success message
      alert('Transaction recorded successfully!');
      
    } catch (error) {
      console.error('Error recording transaction:', error);
      alert(error.message || 'Error recording transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper to get crop display name
  const getCropDisplayName = (crop) => {
    if (crop.CROP_NAME) return crop.CROP_NAME;
    if (crop.crop_name) return crop.crop_name;
    if (crop.name) return crop.name;
    return 'Unknown Crop';
  };

  // Helper to get crop ID
  const getCropId = (crop) => {
    return crop.ID || crop.id || crop.crop_id;
  };

  return (
    <div className={`quick-transaction-form ${theme}`}>
      <div className="transaction-header">
        <h5>Record your transactions as they happen</h5>
      </div>
      <form onSubmit={handleSubmit}>
        {/* Type Selection */}
        <div className="type-selection">
          <button
            type="button"
            className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
            onClick={() => handleInputChange('type', 'expense')}
          >
            💸 Expense
          </button>
          <button
            type="button"
            className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
            onClick={() => handleInputChange('type', 'income')}
          >
            💰 Income
          </button>
        </div>

        {/* Amount Input */}
        <div className="amount-input">
          <label>Amount (R)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || '')}
            required
          />
        </div>

        {/* Crop Selection */}
        <div className="crop-selection">
          <label>Linked to Crop (Optional)</label>
          <select 
            value={formData.crop_id} 
            onChange={(e) => handleInputChange('crop_id', e.target.value)}
          >
            <option value="">Select Crop (Optional)</option>
            {crops.map(crop => (
              <option key={getCropId(crop)} value={getCropId(crop)}>
                {getCropDisplayName(crop)}
                {crop.variety ? ` - ${crop.variety}` : ''}
                {crop.PRODUCE_YIELD ? ` (${crop.PRODUCE_YIELD} available)` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Categories */}
        <div className="quick-categories">
          <label>Category *</label>
          <div className="category-buttons">
            {(formData.type === 'expense' ? commonExpenses : commonIncome).map(item => (
              <button
                key={item.value}
                type="button"
                className={`category-btn ${formData.category === item.value ? 'active' : ''}`}
                onClick={() => handleInputChange('category', item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="description-input">
          <label>Description *</label>
          <input
            type="text"
            placeholder="What was this for? e.g., Bought seeds for corn planting"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            required
          />
        </div>

        {/* Date */}
        <div className="date-input">
          <label>Date *</label>
          <input
            type="date"
            value={formData.transaction_date}
            onChange={(e) => handleInputChange('transaction_date', e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting || !formData.category || !formData.amount || !formData.description}
        >
          {isSubmitting ? 'Recording...' : 'Record Transaction'}
        </button>
      </form>
    </div>
  );
};

export default QuickAddTransaction;