import { useContext, useState } from 'react'
import '../styles/Members.css'
import Farmers from './Farmers';
import Farmer from './Farmer';
import Orders from './Orders';
import { ThemeContext } from '../contexts/ThemeContext';
import { useSelectedFarmer } from '../contexts/SelectedFarmerContext';

export default function Members() {
  const [selected, setSelected] = useState('farmers');
  const { theme } = useContext(ThemeContext);
  const { selectedFarmer, setSelectedFarmer, showOrderForm, setShowOrderForm } = useSelectedFarmer();

  const handleOrderClose = () => {
    setShowOrderForm(false);
    setSelectedFarmer(null);
  }

  return (
    <div className={`members-container ${theme}`}>
      <div className={`members-wrapper  ${theme}`}>
        <div className={`members-title ${theme}`}>
          <h1 className={`members-title-title ${theme}`}>Members</h1>
        </div>
        <div className={`members-nav-container ${theme}`}>
          <div className={selected ? (`farmers-container2 ${theme}`) : (`farmers-container ${theme}`)} onClick={() => setSelected('farmers')}>
            <p className={`members-farmers-title ${theme}`}>Farmers</p>
          </div>
        </div>
        {selectedFarmer && showOrderForm && (
          <Orders user={selectedFarmer} handleOrderClose={handleOrderClose} />
        )}
        {selectedFarmer && !showOrderForm && (
          <Farmer
            selectedFarmer={selectedFarmer}
            setSelectedFarmer={setSelectedFarmer}
            onOrderClick={() => setShowOrderForm(true)}
          />
        )}
        {(!selectedFarmer && <Farmers />)}
      </div>
    </div>
  )
}