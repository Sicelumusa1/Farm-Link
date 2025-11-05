import React, { createContext, useState, useContext } from 'react';

const SelectedFarmerContext = createContext();

export const SelectedFarmerProvider = ({ children }) => {
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);

  return (
    <SelectedFarmerContext.Provider value={{
      selectedFarmer,
      setSelectedFarmer,
      showOrderForm, 
      setShowOrderForm
    }}>
      {children}
    </SelectedFarmerContext.Provider>
  );
};

export const useSelectedFarmer = () => {
  const context = useContext(SelectedFarmerContext);
  if (!context) {
    throw new Error('useSelectedFarmer must be used within a SelectedFarmerProvider');
  }
  return context;
};

export default SelectedFarmerContext;
  
