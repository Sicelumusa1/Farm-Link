import '../styles/Home.css'
import HeaderSignIn from '../components/HeaderSignIn'
import { useContext, useEffect, useState } from 'react'
import Profile from '../components/Profile'
import SideBarFarmer from '../components/SideBarFarmer'
import Produce from '../components/Produce'
import Settings from '../components/Settings'
import { ThemeContext } from '../contexts/ThemeContext'
import { UserContext } from '../contexts/UserContext'
import { FarmPopUp } from '../components/FarmPopUp'
import { profile } from '../services/ProfileService'
import { allFarmerDatails } from '../services/farmerService'

export default function HomeFarmer() {
  const { theme } = useContext(ThemeContext);
  const [showFarmPopup, setShowFarmPopup] = useState(false);
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [farmerNavItem, setFarmerNavItem] = useState('produce');

  useEffect(() => {
    const checkFarmStatus = async () => {
      try {
        setIsLoading(true);
        
        // Get user profile first
        const userData = await profile();
        // console.log('User profile data:', userData);
        
        // Try to get farm details
        try {
          const farmData = await allFarmerDatails();
          // console.log('Farm data response:', farmData);
          
          // Check if farm data exists and has valid structure
          const hasFarm = farmData.success && farmData.data && farmData.data.ID;
          
          console.log('Has farm:', hasFarm);
          
          if (hasFarm) {
            // console.log('Farm exists, hiding popup');
            setShowFarmPopup(false);
          } else {
            // console.log('Farm missing, showing popup');
            setShowFarmPopup(true);
          }
          
        } catch (farmError) {
          console.log('Farm API error, showing popup');
          setShowFarmPopup(true);
        }
        
      } catch (err) {
        console.error('Error checking farm status:', err);
        setShowFarmPopup(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkFarmStatus();
  }, []);

  // refresh function to re-check status
  const refreshFarmStatus = async () => {
    console.log('Refreshing farm status...');
    setIsLoading(true);
    try {
      const farmData = await allFarmerDatails();
      
      if (farmData.success && farmData.data && farmData.data.ID) {
        setShowFarmPopup(false);
      }
    } catch (error) {
      console.error('Error refreshing farm status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`home-container ${theme}`}>
        <div className="loading">Loading farm information...</div>
      </div>
    );
  }

  return (
    <div className={`home-container ${theme}`}>
      <div className="home-header-container">
        <HeaderSignIn />
      </div>
      <div className="main-content-container">
        {showFarmPopup && (
          <FarmPopUp 
            setPopUp={setShowFarmPopup} 
            onSuccess={refreshFarmStatus}
          />
        )}
        <SideBarFarmer setNavItem={setFarmerNavItem} currentNavItem={farmerNavItem} />
        {farmerNavItem === 'profile' && <Profile />}
        {farmerNavItem === 'produce' && <Produce />}
        {farmerNavItem === 'settings' && <Settings />}
      </div>
    </div>
  );
}